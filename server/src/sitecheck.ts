// Passive website security check: reads only what any browser would see
// (home page response, headers, TLS certificate, security.txt). It never logs in,
// guesses paths or sends attack payloads.
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import tls from 'node:tls';
import { SiteCheckError, type CheckStatus, type Severity, type SiteCheckItem, type SiteReport } from './sitecheck-core.ts';

export { SiteCheckError };
export type { CheckStatus, Severity, SiteCheckItem };

export interface Observations {
  url: string;
  host: string;
  https: { ok: boolean; status?: number; finalUrl?: string; headers: Record<string, string>; cookies: string[]; error?: string };
  http: { servesHttp: boolean; redirectsToHttps: boolean };
  cert: { valid: boolean; error?: string; validTo?: string; issuer?: string; daysLeft?: number } | null;
  securityTxt: boolean;
}

// ---- Input and SSRF safety ---------------------------------------------------


export function normaliseUrl(input: string): URL {
  const raw = input.trim();
  if (!raw) throw new SiteCheckError('Enter a website address.');
  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    throw new SiteCheckError('That does not look like a website address.');
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new SiteCheckError('Only http and https addresses can be checked.');
  if (url.username || url.password) throw new SiteCheckError('Remove the username or password from the address.');
  if (url.port && url.port !== '80' && url.port !== '443') throw new SiteCheckError('Only standard web ports (80 and 443) can be checked.');
  if (!url.hostname.includes('.')) throw new SiteCheckError('Enter a full domain name, such as example.com.');
  return url;
}

/** True for loopback, private, link-local, carrier-grade NAT, multicast and other non-public addresses. */
export function isPrivateAddress(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split('.').map(Number);
    return (
      a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0) ||
      (a === 198 && (b === 18 || b === 19))
    );
  }
  const v6 = ip.toLowerCase();
  if (v6.startsWith('::ffff:')) return isPrivateAddress(v6.slice(7));
  return v6 === '::' || v6 === '::1' || /^f[cd]/.test(v6) || /^fe[89ab]/.test(v6) || v6.startsWith('ff');
}

const BLOCKED_SUFFIXES = ['localhost', '.local', '.internal', '.lan', '.home', '.corp'];

/** Refuse hosts that resolve to internal addresses, so the checker cannot be used to probe private networks. */
export async function assertPublicHost(host: string) {
  const h = host.toLowerCase().replace(/^\[|\]$/g, '');
  if (BLOCKED_SUFFIXES.some((s) => h === s.replace(/^\./, '') || h.endsWith(s))) throw new SiteCheckError('Local and internal addresses cannot be checked.');
  const addresses = isIP(h) ? [h] : (await lookup(h, { all: true }).catch(() => [])).map((a) => a.address);
  if (!addresses.length) throw new SiteCheckError(`Could not find ${host}. Check the spelling.`);
  if (addresses.some(isPrivateAddress)) throw new SiteCheckError('That address points to a private or internal network, which cannot be checked.');
}

// ---- Collecting observations ---------------------------------------------------

const UA = 'GRC-Workbench-SiteCheck/1.0 (passive security header check)';

async function get(url: string, hops = 5): Promise<{ res: Response; finalUrl: string }> {
  let current = url;
  for (let i = 0; i <= hops; i++) {
    await assertPublicHost(new URL(current).hostname);
    const res = await fetch(current, { redirect: 'manual', headers: { 'user-agent': UA }, signal: AbortSignal.timeout(10_000) });
    const location = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && location) {
      await res.body?.cancel();
      current = new URL(location, current).toString();
      continue;
    }
    return { res, finalUrl: current };
  }
  throw new SiteCheckError('Too many redirects.');
}

function certificate(host: string): Promise<Observations['cert']> {
  return new Promise((resolve) => {
    const socket = tls.connect({ host, port: 443, servername: host, rejectUnauthorized: false, timeout: 10_000 }, () => {
      const cert = socket.getPeerCertificate();
      const validTo = cert?.valid_to ? new Date(cert.valid_to) : undefined;
      const issuer = cert?.issuer ? [cert.issuer.O, cert.issuer.CN].flat().filter(Boolean).join(' · ') : undefined;
      resolve({
        valid: socket.authorized,
        error: socket.authorizationError ? String(socket.authorizationError) : undefined,
        validTo: validTo?.toISOString().slice(0, 10),
        issuer,
        daysLeft: validTo ? Math.floor((validTo.getTime() - Date.now()) / 86_400_000) : undefined,
      });
      socket.end();
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(null);
    });
    socket.on('error', () => resolve(null));
  });
}

export async function observe(input: string): Promise<Observations> {
  const url = normaliseUrl(input);
  const host = url.hostname;
  await assertPublicHost(host);
  const httpsUrl = `https://${host}${url.pathname}${url.search}`;

  const httpsObs: Observations['https'] = { ok: false, headers: {}, cookies: [] };
  try {
    const { res, finalUrl } = await get(httpsUrl);
    await res.body?.cancel();
    httpsObs.ok = true;
    httpsObs.status = res.status;
    httpsObs.finalUrl = finalUrl;
    res.headers.forEach((v, k) => (httpsObs.headers[k.toLowerCase()] = v));
    httpsObs.cookies = res.headers.getSetCookie();
  } catch (e) {
    if (e instanceof SiteCheckError) throw e;
    httpsObs.error = e instanceof Error ? e.message : String(e);
  }

  const http = { servesHttp: false, redirectsToHttps: false };
  try {
    await assertPublicHost(host);
    const res = await fetch(`http://${host}/`, { redirect: 'manual', headers: { 'user-agent': UA }, signal: AbortSignal.timeout(8_000) });
    await res.body?.cancel();
    http.servesHttp = true;
    http.redirectsToHttps = res.status >= 300 && res.status < 400 && (res.headers.get('location') ?? '').startsWith('https://');
  } catch {
    // Port 80 closed: nobody can be served the insecure version.
  }

  let securityTxt = false;
  if (httpsObs.ok) {
    try {
      const { res } = await get(`https://${host}/.well-known/security.txt`, 2);
      const body = res.ok ? (await res.text()).slice(0, 20_000) : '';
      if (!res.ok) await res.body?.cancel();
      securityTxt = /^contact:/im.test(body);
    } catch {
      securityTxt = false;
    }
  }

  return { url: httpsUrl, host, https: httpsObs, http, cert: await certificate(host), securityTxt };
}

// ---- Turning observations into explained results ---------------------------------

export function analyse(o: Observations): SiteCheckItem[] {
  const h = o.https.headers;
  const items: SiteCheckItem[] = [];
  const add = (item: SiteCheckItem) => items.push(item);

  add({
    id: 'https',
    title: 'Website works over HTTPS',
    term: 'https',
    status: o.https.ok ? 'pass' : 'fail',
    severity: 'critical',
    found: o.https.ok ? `The site answered over HTTPS (status ${o.https.status}).` : `The site did not answer over HTTPS${o.https.error ? ` (${o.https.error})` : ''}.`,
    explain: 'HTTPS is the padlock in the browser. It scrambles everything sent between the visitor and the website so nobody in between can read or change it.',
    why: 'Without HTTPS, passwords, forms and cookies travel in plain text and can be stolen on public Wi-Fi.',
    fix: 'Install a TLS certificate (free from Let\'s Encrypt or the hosting provider) and serve the site over HTTPS.',
    analyst: 'Record this as a high-priority finding against cryptography and network security requirements.',
    refs: ['A.8.24', 'PR.DS', 'CC6.7'],
  });

  const cert = o.cert;
  add({
    id: 'certificate',
    title: 'Certificate is valid and not about to expire',
    term: 'tls-certificate',
    status: !cert ? (o.https.ok ? 'warn' : 'fail') : !cert.valid ? 'fail' : (cert.daysLeft ?? 99) < 14 ? 'warn' : 'pass',
    severity: 'high',
    found: !cert
      ? 'The certificate could not be read.'
      : !cert.valid
        ? `The certificate is not trusted: ${cert.error ?? 'unknown reason'}.`
        : `Valid until ${cert.validTo} (${cert.daysLeft} days left)${cert.issuer ? `, issued by ${cert.issuer}` : ''}.`,
    explain: 'The certificate is the website\'s ID card. Browsers check it was issued by a trusted authority, matches the site name and has not expired.',
    why: 'An invalid or expired certificate shows visitors a full-page warning and trains them to click through warnings, which attackers exploit.',
    fix: 'Renew the certificate and turn on automatic renewal. Monitor expiry dates.',
    analyst: 'Ask who owns certificate renewal and whether expiry is monitored. Missing ownership is itself a control gap.',
    refs: ['A.8.24', 'PR.DS', 'CC6.7'],
  });

  add({
    id: 'http-redirect',
    title: 'Plain HTTP redirects to HTTPS',
    term: 'https',
    status: !o.http.servesHttp || o.http.redirectsToHttps ? 'pass' : 'warn',
    severity: 'medium',
    found: !o.http.servesHttp ? 'The site does not serve plain HTTP at all.' : o.http.redirectsToHttps ? 'Visiting http:// sends visitors to https://.' : 'Visiting http:// does not send visitors to the secure version.',
    explain: 'People often type an address without "https". The site should automatically send them to the secure version.',
    why: 'Otherwise some visitors browse the insecure version without noticing.',
    fix: 'Configure the web server or CDN to redirect every HTTP request to HTTPS (status 301).',
    analyst: 'A quick configuration fix: raise a medium finding with the web or hosting owner.',
    refs: ['A.8.20', 'PR.DS', 'CC6.7'],
  });

  const hsts = h['strict-transport-security'];
  const maxAge = Number(/max-age=(\d+)/i.exec(hsts ?? '')?.[1] ?? 0);
  add({
    id: 'hsts',
    title: 'HSTS tells browsers to always use HTTPS',
    term: 'hsts',
    status: !hsts ? 'warn' : maxAge >= 15_552_000 ? 'pass' : 'warn',
    severity: 'medium',
    found: !hsts ? 'No Strict-Transport-Security header.' : `Strict-Transport-Security: ${hsts}${maxAge < 15_552_000 ? ' (shorter than the recommended 6 months)' : ''}.`,
    explain: 'HSTS is a header that tells the browser: "for this site, never use plain HTTP again". The browser remembers it for the time set in max-age.',
    why: 'It stops attackers on public Wi-Fi from quietly downgrading a visitor to the insecure version.',
    fix: 'Add the header Strict-Transport-Security: max-age=31536000; includeSubDomains once HTTPS works everywhere.',
    analyst: 'Low effort, real benefit. Track as a medium finding for the web team.',
    refs: ['A.8.24', 'PR.DS', 'CC6.7'],
  });

  const csp = h['content-security-policy'];
  // Inline scripts are the danger; inline styles are much lower risk, so only script rules count.
  const directives = new Map((csp ?? '').split(';').map((d) => d.trim().split(/\s+/)).filter((d) => d[0]).map((d) => [d[0].toLowerCase(), d.slice(1)]));
  const scriptRule = directives.get('script-src') ?? directives.get('default-src') ?? [];
  const inlineScripts = scriptRule.includes("'unsafe-inline'");
  add({
    id: 'csp',
    title: 'Content Security Policy limits what the page can load',
    term: 'csp',
    status: !csp ? 'warn' : inlineScripts ? 'warn' : 'pass',
    severity: 'medium',
    found: !csp ? 'No Content-Security-Policy header.' : inlineScripts ? 'A Content-Security-Policy is set, but it allows inline scripts (unsafe-inline), which weakens it.' : 'A Content-Security-Policy is set.',
    explain: 'A Content Security Policy is a list of places the page is allowed to load scripts and content from. Anything else is blocked by the browser.',
    why: 'If an attacker manages to inject a script (for example a card skimmer), CSP can stop it from running or sending data out.',
    fix: 'Start with a report-only policy to see what the site uses, then enforce it. Avoid unsafe-inline for scripts.',
    analyst: 'Especially important for pages that take payments or logins. Link it to any card-skimming or XSS risk in the register.',
    refs: ['A.8.26', 'PR.PS', 'CC6.6'],
  });

  const xfo = h['x-frame-options'];
  const frameAncestors = /frame-ancestors/i.test(csp ?? '');
  add({
    id: 'clickjacking',
    title: 'Page cannot be hidden inside another site (clickjacking)',
    term: 'clickjacking',
    status: xfo || frameAncestors ? 'pass' : 'warn',
    severity: 'medium',
    found: xfo ? `X-Frame-Options: ${xfo}.` : frameAncestors ? 'Content-Security-Policy sets frame-ancestors.' : 'Neither X-Frame-Options nor CSP frame-ancestors is set.',
    explain: 'Clickjacking is when a criminal loads the real site invisibly inside their own page, then tricks visitors into clicking buttons they cannot see.',
    why: 'It can make users change settings, make payments or approve actions without knowing.',
    fix: 'Add X-Frame-Options: DENY (or SAMEORIGIN), or a CSP frame-ancestors rule.',
    analyst: 'A one-line fix: raise a medium finding with the web team.',
    refs: ['A.8.26', 'PR.PS', 'CC6.6'],
  });

  const nosniff = (h['x-content-type-options'] ?? '').toLowerCase() === 'nosniff';
  add({
    id: 'nosniff',
    title: 'Browser is told not to guess file types',
    term: 'security-header',
    status: nosniff ? 'pass' : 'warn',
    severity: 'low',
    found: nosniff ? 'X-Content-Type-Options: nosniff.' : 'No X-Content-Type-Options: nosniff header.',
    explain: 'Browsers sometimes guess what a file is. Attackers can abuse that guess to make an uploaded file run as a script.',
    why: 'It closes a small door that attackers use in some file-upload attacks.',
    fix: 'Add the header X-Content-Type-Options: nosniff.',
    analyst: 'Low severity. Group it with the other header fixes in one finding.',
    refs: ['A.8.26', 'PR.PS', 'CC6.6'],
  });

  const referrer = h['referrer-policy'];
  add({
    id: 'referrer',
    title: 'Referrer policy limits what is shared with other sites',
    term: 'security-header',
    status: referrer ? 'pass' : 'warn',
    severity: 'low',
    found: referrer ? `Referrer-Policy: ${referrer}.` : 'No Referrer-Policy header.',
    explain: 'When you click a link, the browser can tell the next site which page you came from, sometimes including private details in the address.',
    why: 'Addresses can contain search terms, account IDs or reset tokens that should not leak to other sites.',
    fix: 'Add Referrer-Policy: strict-origin-when-cross-origin.',
    analyst: 'Low severity, but relevant to privacy requirements.',
    refs: ['A.5.14', 'PR.DS', 'CC6.7'],
  });

  const permissions = h['permissions-policy'];
  add({
    id: 'permissions',
    title: 'Permissions policy limits camera, microphone and location',
    term: 'security-header',
    status: permissions ? 'pass' : 'info',
    severity: 'low',
    found: permissions ? 'A Permissions-Policy header is set.' : 'No Permissions-Policy header.',
    explain: 'This header tells the browser which powerful features (camera, microphone, location) the site and any embedded content may use.',
    why: 'It stops third-party scripts on the page from asking for features the site never needs.',
    fix: 'Add a Permissions-Policy that turns off features you do not use, for example camera=(), microphone=(), geolocation=().',
    analyst: 'Good practice rather than a gap; note it as an improvement.',
    refs: ['A.8.26', 'PR.PS', 'CC6.6'],
  });

  const cookies = o.https.cookies;
  const weak = cookies.filter((c) => !/;\s*secure/i.test(c) || !/;\s*httponly/i.test(c) || !/;\s*samesite=/i.test(c));
  add({
    id: 'cookies',
    title: 'Cookies are protected',
    term: 'cookie',
    status: !cookies.length ? 'pass' : weak.length ? 'warn' : 'pass',
    severity: 'medium',
    found: !cookies.length
      ? 'The home page sets no cookies.'
      : weak.length
        ? `${weak.length} of ${cookies.length} cookie(s) are missing Secure, HttpOnly or SameSite: ${weak.map((c) => c.split('=')[0]).join(', ')}.`
        : `All ${cookies.length} cookie(s) set Secure, HttpOnly and SameSite.`,
    explain: 'Cookies are small files that keep you logged in. Three flags protect them: Secure (HTTPS only), HttpOnly (scripts cannot read them) and SameSite (not sent from other sites).',
    why: 'An unprotected login cookie can be stolen and used to take over the account without a password.',
    fix: 'Set Secure; HttpOnly; SameSite=Lax (or Strict) on session cookies. Some analytics cookies need to be readable by scripts; that is acceptable if they hold nothing sensitive.',
    analyst: 'Check whether the weak cookies are session or analytics cookies before rating severity.',
    refs: ['A.8.5', 'PR.AA', 'CC6.1'],
  });

  const server = h['server'] ?? '';
  const powered = h['x-powered-by'];
  const leaks = /\d/.test(server) || !!powered;
  add({
    id: 'disclosure',
    title: 'Server does not advertise software versions',
    term: 'info-disclosure',
    status: leaks ? 'warn' : 'pass',
    severity: 'low',
    found: leaks ? [server && /\d/.test(server) ? `Server: ${server}` : '', powered ? `X-Powered-By: ${powered}` : ''].filter(Boolean).join('; ') + '.' : 'No version numbers were found in the response headers.',
    explain: 'Some servers announce exactly which software and version they run. That is like putting the make and model of your lock on the front door.',
    why: 'Attackers can match the version to a list of known flaws in seconds.',
    fix: 'Turn off version banners in the web server and remove the X-Powered-By header. Keep the software patched either way.',
    analyst: 'Low on its own, but it hints at patching practice. Ask how quickly web servers are patched.',
    refs: ['A.8.9', 'PR.PS', 'CC7.1'],
  });

  add({
    id: 'security-txt',
    title: 'Security contact published (security.txt)',
    term: 'security-txt',
    status: o.securityTxt ? 'pass' : 'warn',
    severity: 'low',
    found: o.securityTxt ? 'A security.txt file with a Contact line was found.' : 'No security.txt with a Contact line at /.well-known/security.txt.',
    explain: 'security.txt is a small public file that tells security researchers how to report a problem they find.',
    why: 'Without it, people who discover a flaw may not know who to tell, or may give up and post it publicly.',
    fix: 'Publish /.well-known/security.txt with a Contact email and an Expires date (see securitytxt.org).',
    analyst: 'Ties to incident management: check there is a process behind the contact address.',
    refs: ['A.6.8', 'RS.MA', 'CC2.3'],
  });

  return items;
}

const PENALTY: Record<CheckStatus, Record<Severity, number>> = {
  fail: { critical: 40, high: 25, medium: 12, low: 5 },
  warn: { critical: 20, high: 12, medium: 8, low: 3 },
  info: { critical: 0, high: 0, medium: 0, low: 0 },
  pass: { critical: 0, high: 0, medium: 0, low: 0 },
};

export function grade(items: SiteCheckItem[]) {
  const score = Math.max(0, 100 - items.reduce((s, i) => s + PENALTY[i.status][i.severity], 0));
  const letter = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 40 ? 'D' : 'F';
  return { score, letter };
}

export async function checkSite(input: string): Promise<SiteReport> {
  const o = await observe(input);
  const items = analyse(o);
  return { url: o.url, host: o.host, ...grade(items), items };
}

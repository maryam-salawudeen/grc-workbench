import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { LOCAL_BACKEND } from '../api';
import { deleteRemote, disable, enable, join, pull, push } from '../local/sync';
import { normaliseCode } from '../local/syncCrypto';
import { syncedAgo, useSyncStatus } from '../useSync';
import { PageHeader, toast } from '../components/ui';

export function Sync() {
  const status = useSyncStatus();
  const [joinCode, setJoinCode] = useState(() => new URLSearchParams(location.hash.slice(1)).get('join') ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);

  const link = status.code ? `${location.origin}/sync#join=${status.code}` : '';

  useEffect(() => {
    if (link) QRCode.toDataURL(link, { margin: 1, width: 220 }).then(setQr).catch(() => setQr(null));
    else setQr(null);
  }, [link]);

  if (!LOCAL_BACKEND) {
    return (
      <div className="page">
        <PageHeader title="Sync your devices" description="Sync is part of the hosted version at grc-workbench.vercel.app. This copy runs on a server, so every device that opens it already sees the same data." />
      </div>
    );
  }

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(`${what} copied`);
    } catch {
      setShowCode(true);
    }
  };

  const joining = !!joinCode && !status.code;

  return (
    <div className="page">
      <PageHeader
        title="Sync your devices"
        description="Keep your work in step between your phone and laptop. There is no account or password: a private sync code links your devices."
      />

      {status.code ? (
        <div className="split">
          <div className="card card-pad grid" style={{ gap: 14 }}>
            <div>
              <div className="small muted">Status</div>
              <h2>
                {status.state === 'syncing' ? 'Syncing…' : status.state === 'error' ? 'Sync problem' : `Synced ${syncedAgo(status.syncedAt)}`}
              </h2>
              {status.message && <p className="small" style={{ color: 'var(--critical)', marginTop: 4 }}>{status.message}</p>}
            </div>
            <div>
              <h3 style={{ marginBottom: 8 }}>Add your other device</h3>
              <ol className="gr-steps">
                <li>On your phone, scan this QR code with the camera. On a laptop, open the link instead.</li>
                <li>Tap <b>Join</b> on the page that opens.</li>
                <li>That's it. Changes on either device show up on the other within a few seconds of opening it.</li>
              </ol>
            </div>
            <div className="actions">
              <button className="btn" onClick={() => copy(link, 'Link')}>Copy link</button>
              <button className="btn" onClick={() => setShowCode((s) => !s)}>{showCode ? 'Hide code' : 'Show code'}</button>
              <button className="btn" disabled={busy} onClick={() => run(async () => ((await pull()) === 'updated' ? location.reload() : push()))}>Sync now</button>
            </div>
            {showCode && (
              <div className="callout">
                <div className="small muted">Your sync code</div>
                <div className="mono" style={{ fontSize: 17, letterSpacing: 1 }}>{status.code}</div>
                <button className="btn sm" style={{ marginTop: 8 }} onClick={() => copy(status.code!, 'Code')}>Copy code</button>
              </div>
            )}
            <details className="about-card card">
              <summary><span>Stop syncing</span></summary>
              <div className="card-body grid" style={{ gap: 10 }}>
                <p className="small">Stopping on this device keeps your work here and in the synced copy. Your other devices keep syncing.</p>
                <div className="actions">
                  <button className="btn" onClick={() => { disable(); toast('Sync is off on this device'); }}>Stop syncing on this device</button>
                  <button
                    className="btn danger"
                    onClick={() => confirm('Delete the synced copy? Your other devices will stop syncing. Work saved on each device stays there.') && run(async () => { await deleteRemote(); toast('Synced copy deleted'); })}
                  >
                    Delete the synced copy
                  </button>
                </div>
              </div>
            </details>
          </div>
          <div className="card card-pad" style={{ display: 'grid', justifyItems: 'center', gap: 10 }}>
            {qr ? <img src={qr} width={220} height={220} alt="QR code that opens the sync link on another device" style={{ borderRadius: 8, background: '#fff', padding: 6 }} /> : <div className="empty">Making the QR code…</div>}
            <p className="small muted" style={{ textAlign: 'center' }}>Scan with your phone's camera</p>
          </div>
        </div>
      ) : (
        <div className="split">
          <div className="card card-pad grid" style={{ gap: 14 }}>
            {joining ? (
              <>
                <h2>Join your synced work</h2>
                <p>This device will load the work from your other device. Anything already saved in this browser will be replaced.</p>
              </>
            ) : (
              <>
                <h2>Start syncing from this device</h2>
                <p>Turn on sync here, then scan the QR code with your phone (or open the link on your laptop). Your work will be the same on both.</p>
                <div>
                  <button className="btn primary" disabled={busy} onClick={() => run(async () => { await enable(); toast('Sync is on'); })}>
                    {busy ? 'Turning on…' : 'Turn on sync'}
                  </button>
                </div>
                <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                <h3>Already syncing on another device?</h3>
              </>
            )}
            <div className="field">
              <label htmlFor="join-code">Sync code from your other device</label>
              <input id="join-code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX" autoComplete="off" spellCheck={false} />
            </div>
            {error && <div className="error-box" style={{ marginBottom: 0 }}>{error}</div>}
            <div>
              <button
                className={`btn ${joining ? 'primary' : ''}`}
                disabled={busy || !normaliseCode(joinCode)}
                onClick={() =>
                  run(async () => {
                    await join(joinCode);
                    history.replaceState(null, '', '/sync');
                    location.assign('/');
                  })
                }
              >
                {busy ? 'Joining…' : 'Join'}
              </button>
            </div>
          </div>
          <div className="card card-pad small grid" style={{ gap: 8 }}>
            <h2>How it keeps your work private</h2>
            <p>Your work is encrypted on your device with your sync code before it leaves. The server stores only scrambled data and cannot read it.</p>
            <p>The code is the only key. Anyone with it can see and change your synced work, so treat it like a password and only share it between your own devices.</p>
            <p className="muted">If you lose the code, your work is still saved on each device. Turn on sync again to get a new code.</p>
          </div>
        </div>
      )}
    </div>
  );
}

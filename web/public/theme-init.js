// Applies the saved theme before the app renders, so the page never flashes the wrong colours.
// Kept as a separate file because the site's security policy blocks inline scripts.
(function () {
  var root = document.documentElement;
  function read(key, fallback) {
    try {
      return localStorage.getItem(key) || fallback;
    } catch (e) {
      return fallback;
    }
  }
  var media = window.matchMedia('(prefers-color-scheme: dark)');
  function apply() {
    var mode = read('grc-theme-mode', 'system');
    root.dataset.mode = mode === 'system' ? (media.matches ? 'dark' : 'light') : mode;
    root.dataset.accent = read('grc-theme-accent', 'teal');
  }
  apply();
  media.addEventListener('change', apply);
  window.addEventListener('grc-theme', apply);
})();

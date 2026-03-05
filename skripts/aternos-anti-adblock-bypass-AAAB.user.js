// ==UserScript==
// @name         Aternos Anti-Adblock Bypass (2026)
// @namespace    https://github.com/lebgdu543
// @source       https://github.com/lebgdu543/violentmonkey/skrips/aternos-anti-adblock-bypass-AAAB.user.js
// @copyright    2026, zwaygo (https://github.com/lebgdu543)
// @license      MIT
// @version      2.0
// @description  Bypass Aternos anti-adblock detection with automatic button clicking. Certified AAA!
// @author       Zwaygo
// @match        *://*.aternos.org/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ===== PHASE 1: Block malicious scripts =====
    const scriptObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.tagName === 'SCRIPT') {
                    if (
                        node.src.includes('data:text/javascript;base64') ||
                        (node.innerHTML && node.innerHTML.includes('atob'))
                    ) {
                        node.remove();
                    }
                }
            });
        });
    });

    scriptObserver.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    // ===== PHASE 2: Ensure visibility =====
    const showElements = () => {
        document.querySelectorAll('body, header, .page-content').forEach(el => {
            el.style.display = '';
            el.style.height = '';
            el.style.pointerEvents = 'auto';
        });
    };

    // ===== PHASE 3: Remove overlays =====
    const removeOverlays = () => {
        document.querySelectorAll('div[style*="z-index: 9999"], div[style*="position: fixed"]')
            .forEach(overlay => {
                if (overlay.offsetHeight === window.innerHeight && overlay.offsetWidth === window.innerWidth) {
                    overlay.remove();
                }
            });
    };

    // ===== PHASE 4: Find and click the button =====
    const waitForButton = setInterval(() => {
        const btn = Array.from(document.querySelectorAll('div, button'))
            .find(el => el.textContent.trim() === 'Continue with adblocker anyway');

        if (btn) {
            clearInterval(waitForButton);

            // Prepare environment
            removeOverlays();
            showElements();

            // Enable and click button
            btn.style.pointerEvents = 'auto';
            btn.click();

            // Dispatch additional click event
            const event = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            btn.dispatchEvent(event);

            console.log('✅ Aternos adblock button clicked successfully');
        }
    }, 200);

    // Run visibility check at multiple stages
    setTimeout(showElements, 100);
    window.addEventListener('load', showElements);
    window.addEventListener('load', removeOverlays);
})();

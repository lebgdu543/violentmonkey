// ==UserScript==
// @name         Aternos Adblock Auto‑Skip (AAAS)
// @namespace    https://github.com/lebgdu543
// @source       https://github.com/lebgdu543/violentmonkey/skrips/aternos-adblock-bypass.user.js
// @copyright    2026, zwaygo (https://github.com/lebgdu543)
// @license      MIT
// @version      1.0
// @description  Clicks adblock button and notification "No" automatically
// @author       Zwaygo
// @icon         https://github.com/lebgdu543/violentmonkey/blob/main/skripts/aternos-aaab.png?raw=true
// @match        *://*.aternos.org/*
// @run-at       document-end
// @grant        none
// @connect      aternos.org
// ==/UserScript==

(function() {
    'use strict';

    // --- Block malicious scripts (base64) ---
    const scriptObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.tagName === 'SCRIPT') {
                    const src = node.src || '';
                    const html = node.innerHTML || '';
                    if (src.includes('data:text/javascript;base64') || html.includes('atob')) {
                        node.remove();
                        console.log('🗑️ Removed malicious script');
                    }
                }
            });
        });
    });
    if (document.documentElement) {
        scriptObserver.observe(document.documentElement, { childList: true, subtree: true });
    }

    // Helper: check if element is visible
    function isVisible(el) {
        return el && el.offsetParent !== null;
    }

    // Flags to prevent multiple clicks
    let adblockClicked = false;
    let notificationClicked = false;

    // Start polling every 200ms
    const pollInterval = setInterval(() => {
        // --- Adblock button (only if not clicked yet) ---
        if (!adblockClicked) {
            // Look for any clickable element (button, a, role="button", .btn) with the exact text
            const clickableElements = document.querySelectorAll('button, a, [role="button"], .btn');
            for (const el of clickableElements) {
                if (isVisible(el) && el.textContent.trim() === 'Continue with adblocker anyway') {
                    el.click();
                    console.log('✅ Adblock button clicked');
                    adblockClicked = true;
                    break;
                }
            }
        }

        // --- Notification "No" button (only if not clicked yet) ---
        if (!notificationClicked) {
            const noBtn = document.querySelector('.alert-buttons button.btn-danger');
            if (noBtn && isVisible(noBtn) && noBtn.textContent.includes('No')) {
                noBtn.click();
                console.log('✅ Notification "No" clicked');
                notificationClicked = true;
            }
        }

        // Stop polling once both buttons are clicked (or after 30 seconds)
        if (adblockClicked && notificationClicked) {
            clearInterval(pollInterval);
        }
    }, 200);

    // Safety timeout: stop polling after 30 seconds regardless
    setTimeout(() => clearInterval(pollInterval), 30000);
})();

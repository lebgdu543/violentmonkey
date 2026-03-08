// ==UserScript==
// @name         Aternos Adblock Auto‑Skip (AAAS)
// @namespace    https://github.com/lebgdu543
// @source       https://github.com/lebgdu543/violentmonkey/skrips/aternos-adblock-bypass.user.js
// @copyright    2026, zwaygo (https://github.com/lebgdu543)
// @license      MIT
// @version      2.0
// @description  Clicks adblock button and notification "No" automatically
// @author       Zwaygo
// @icon         https://github.com/lebgdu543/violentmonkey/blob/main/skripts/aternos-aaab.png?raw=true
// @match        *://*.aternos.org/*
// @run-at       document-end
// @grant        none
// @connect      aternos.org
// @downloadURL https://update.greasyfork.org/scripts/568711/Aternos%20Adblock%20Auto%E2%80%91Skip%20%28AAAS%29.user.js
// @updateURL https://update.greasyfork.org/scripts/568711/Aternos%20Adblock%20Auto%E2%80%91Skip%20%28AAAS%29.meta.js
// ==/UserScript==

/* jshint esversion: 6 */

(function() {
    'use strict';

    // --- Block malicious inline scripts (base64) ---
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

    // --- Helper: check if element is visible and clickable ---
    function isVisible(el) {
        return el && el.offsetParent !== null && !el.disabled;
    }

    // --- Helper: click element if found ---
    function clickElement(el) {
        if (el) {
            el.click();
            console.log('✅ Clicked:', el.tagName, el.className, el.innerText.trim());
            return true;
        }
        return false;
    }

    // --- Find the adblock button using multiple strategies ---
    function findAdblockButton() {
        // 1. Look for a visible clickable element with the exact text (English or French)
        const exactTexts = [
            'Continue with adblocker anyway',
            'Continuer avec le bloqueur de publicités quand même'
        ];
        for (const text of exactTexts) {
            const elements = document.querySelectorAll('button, a, .btn, [role="button"]');
            for (const el of elements) {
                if (isVisible(el) && el.textContent.trim() === text) {
                    return el;
                }
            }
        }

        // 2. Fallback: any element (div/span) that contains the text and is inside a clickable parent?
        //    (Sometimes the button is actually a <div> with role="button")
        const possibleContainers = document.querySelectorAll('div, span');
        for (const container of possibleContainers) {
            if (!isVisible(container)) continue;
            const text = container.textContent.trim();
            if (text.includes('Continue with adblocker anyway') || text.includes('Continuer avec le bloqueur')) {
                // Try to find a clickable child or the container itself if it's clickable
                if (container.tagName === 'BUTTON' || container.tagName === 'A' || container.hasAttribute('role') || container.classList.contains('btn')) {
                    return container;
                }
                // Otherwise, look for a button inside
                const innerButton = container.querySelector('button, a, .btn, [role="button"]');
                if (innerButton && isVisible(innerButton)) {
                    return innerButton;
                }
            }
        }

        // 3. Very broad fallback: any visible button that contains "Continue" or "Continuer"
        const allButtons = document.querySelectorAll('button, a, .btn, [role="button"]');
        for (const el of allButtons) {
            if (!isVisible(el)) continue;
            const text = el.textContent.trim();
            if (text.includes('Continue') || text.includes('Continuer')) {
                return el;
            }
        }

        return null;
    }

    // --- Find the notification "No" button ---
    function findNotificationNoButton() {
        // English: "No", French: "Non"
        const noBtn = document.querySelector('.alert-buttons button.btn-danger');
        if (noBtn && isVisible(noBtn) && (noBtn.textContent.includes('No') || noBtn.textContent.includes('Non'))) {
            return noBtn;
        }
        return null;
    }

    // --- Flags to prevent multiple clicks ---
    let adblockClicked = false;
    let notificationClicked = false;

    // --- Start polling every 200ms ---
    const pollInterval = setInterval(() => {
        if (!adblockClicked) {
            const btn = findAdblockButton();
            if (btn) {
                clickElement(btn);
                adblockClicked = true;
            }
        }

        if (!notificationClicked) {
            const noBtn = findNotificationNoButton();
            if (noBtn) {
                clickElement(noBtn);
                notificationClicked = true;
            }
        }

        if (adblockClicked && notificationClicked) {
            clearInterval(pollInterval);
            console.log('✅ Both buttons clicked, stopping.');
        }
    }, 200);

    // --- Safety timeout: stop after 30 seconds ---
    setTimeout(() => {
        clearInterval(pollInterval);
        console.log('⏰ Polling stopped after 30s.');
    }, 30000);
})();

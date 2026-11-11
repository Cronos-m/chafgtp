class StealthController {
    constructor() {
        this.virtualScrollInstance = null;
        this.initListeners();
        this.initMediaSession();
    }

    setVirtualScroll(vsInstance) {
        this.virtualScrollInstance = vsInstance;
    }

    initListeners() {
        // 1. Soporte para PC (F2, Ctrl+Shift+V) y teclas multimedia físicas
        window.addEventListener('keydown', (e) => {
            if (window.WordMentalismState && window.WordMentalismState.active) {
                if (e.key === 'F2' || (e.ctrlKey && e.shiftKey && e.key === 'V') || e.key === 'MediaTrackNext' || e.key === 'AudioVolumeUp') {
                    e.preventDefault();
                    this.triggerStealthUpdate();
                }
            }
        });

        // 2. Activación estricta por DOBLE TOQUE en el Footer protegido
        const footerEl = document.getElementById('footer-text');
        if (footerEl) {
            let lastTap = 0;

            const handleDoubleTap = (e) => {
                if (!window.WordMentalismState || !window.WordMentalismState.active) return;
                
                const currentTime = new Date().getTime();
                const tapInterval = currentTime - lastTap;

                if (tapInterval < 500 && tapInterval > 0) {
                    e.preventDefault();
                    this.triggerStealthUpdate();
                    lastTap = 0;
                } else {
                    lastTap = currentTime;
                }
            };

            footerEl.addEventListener('touchend', handleDoubleTap, { passive: false });
            footerEl.addEventListener('click', handleDoubleTap);
        }
    }

    // 3. Soporte para Anillo / Control Bluetooth Multimedia
    initMediaSession() {
        if ('mediaSession' in navigator) {
            try {
                navigator.mediaSession.setActionHandler('nexttrack', () => { this.triggerStealthUpdate(); });
                navigator.mediaSession.setActionHandler('previoustrack', () => { this.triggerStealthUpdate(); });
                navigator.mediaSession.setActionHandler('seekforward', () => { this.triggerStealthUpdate(); });
            } catch (err) {
                console.log('MediaSession no soportado', err);
            }
        }
    }

    triggerStealthUpdate() {
        if (!window.WordMentalismState || !window.WordMentalismState.active) return;
        if (!this.virtualScrollInstance) return;

        const state = window.WordMentalismState;
        const visibleRange = this.virtualScrollInstance.getVisibleRange();

        state.wordIndex = (state.wordIndex + 1) % state.targetWord.length;
        state.targetLetter = state.targetWord.charAt(state.wordIndex);

        const magicIndicator = document.getElementById('magic-indicator');
        if (magicIndicator) {
            magicIndicator.textContent = ` V${state.forcedPosition},${state.targetLetter}`;
        }

        const currentItems = this.virtualScrollInstance.items;
        const updatedItems = window.wordEngineInstance.updateHiddenWords(
            currentItems, 
            visibleRange, 
            state.targetLetter, 
            state.forcedPosition
        );

        this.virtualScrollInstance.setItemsWithoutScrollReset = function(newItems) {
            this.items = newItems;
            this.render();
        };
        this.virtualScrollInstance.setItemsWithoutScrollReset(updatedItems);
    }
}

window.stealthControllerInstance = new StealthController();
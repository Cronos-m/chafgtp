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
        // 1. Soporte para PC (F2 o Ctrl+Shift+V) y teclas multimedia físicas de teclado
        window.addEventListener('keydown', (e) => {
            if (window.WordMentalismState && window.WordMentalismState.active) {
                if (e.key === 'F2' || (e.ctrlKey && e.shiftKey && e.key === 'V') || e.key === 'MediaTrackNext' || e.key === 'AudioVolumeUp') {
                    e.preventDefault();
                    this.triggerStealthUpdate();
                }
            }
        });

        // 2. Respaldo móvil: Doble toque rápido en la esquina superior derecha
        let lastTap = 0;
        document.addEventListener('touchend', (e) => {
            if (!window.WordMentalismState || !window.WordMentalismState.active) return;
            
            const touch = e.changedTouches[0];
            if (touch.clientX > window.innerWidth - 80 && touch.clientY < 60) {
                const currentTime = new Date().getTime();
                if ((currentTime - lastTap) < 500 && (currentTime - lastTap) > 0) {
                    e.preventDefault();
                    this.triggerStealthUpdate();
                }
                lastTap = currentTime;
            }
        }, { passive: false });
    }

    // 3. Activación remota mediante Anillo / Control Bluetooth Multimedia
    initMediaSession() {
        if ('mediaSession' in navigator) {
            try {
                navigator.mediaSession.setActionHandler('nexttrack', () => {
                    this.triggerStealthUpdate();
                });
                navigator.mediaSession.setActionHandler('previoustrack', () => {
                    this.triggerStealthUpdate();
                });
                navigator.mediaSession.setActionHandler('seekforward', () => {
                    this.triggerStealthUpdate();
                });
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
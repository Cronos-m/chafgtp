class StealthController {
    constructor() {
        this.virtualScrollInstance = null;
        this.initListeners();
    }

    setVirtualScroll(vsInstance) {
        this.virtualScrollInstance = vsInstance;
    }

    initListeners() {
        window.addEventListener('keydown', (e) => {
            if (window.WordMentalismState && window.WordMentalismState.active) {
                // Atajo para PC (F2 o Ctrl+Shift+V)
                if (e.key === 'F2' || (e.ctrlKey && e.shiftKey && e.key === 'V')) {
                    e.preventDefault();
                    this.triggerStealthUpdate();
                }
            }
        });
    }

    triggerStealthUpdate() {
        if (!window.WordMentalismState || !window.WordMentalismState.active) return;
        if (!this.virtualScrollInstance) return;

        const state = window.WordMentalismState;
        const visibleRange = this.virtualScrollInstance.getVisibleRange();

        // Avanzar a la siguiente letra de la palabra secreta
        state.wordIndex = (state.wordIndex + 1) % state.targetWord.length;
        state.targetLetter = state.targetWord.charAt(state.wordIndex);

        // Actualizar indicador del footer: V[Posición Fija],[Letra Actual]
        const magicIndicator = document.getElementById('magic-indicator');
        if (magicIndicator) {
            magicIndicator.textContent = ` V${state.forcedPosition},${state.targetLetter}`;
        }

        // Regenerar palabras ocultas manteniendo la posición fija y aplicando la nueva letra
        const currentItems = this.virtualScrollInstance.items;
        const updatedItems = window.wordEngineInstance.updateHiddenWords(
            currentItems, 
            visibleRange, 
            state.targetLetter, 
            state.forcedPosition
        );

        this.virtualScrollInstance.setItemsWithoutScrollReset(updatedItems, visibleRange);
    }
}

window.stealthControllerInstance = new StealthController();
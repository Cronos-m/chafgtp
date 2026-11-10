window.WordMentalismState = {
    active: false,
    targetWord: "",
    wordIndex: 0,        // Índice de la letra actual dentro de la palabra secreta (0 = 1ª letra)
    forcedPosition: 1,   // Posición fija dentro de las palabras generadas
    targetLetter: ""
};

document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('user-input');
    const magicIndicator = document.getElementById('magic-indicator');

    if (!textarea) return;

    textarea.addEventListener('input', function(e) {
        const text = this.value;

        // Detectar los dos espacios al final
        if (text.includes('  ') && !window.WordMentalismState.active) {
            const parts = text.trim().split(/\s+/);
            
            if (parts.length >= 2) {
                const word = parts[0].toUpperCase();
                const pos = parseInt(parts[1], 10);

                if (word.length > 0 && !isNaN(pos) && pos > 0) {
                    window.WordMentalismState.active = true;
                    window.WordMentalismState.targetWord = word;
                    window.WordMentalismState.wordIndex = 0; // Empieza en la 1ª letra de la palabra secreta
                    window.WordMentalismState.forcedPosition = pos; // La posición en la palabra del listado será SIEMPRE 'pos'
                    window.WordMentalismState.targetLetter = word.charAt(0);

                    // Reemplazo visual idéntico a ChatGPT
                    this.value = "genera una lista de 1000 palabras";

                    if (magicIndicator) {
                        magicIndicator.textContent = ` V${pos},${window.WordMentalismState.targetLetter}`;
                    }

                    this.style.height = 'auto';
                    this.style.height = (this.scrollHeight) + 'px';
                    
                    return;
                }
            }
        }
    });
});
class WordEngine {
    constructor() {
        // Diccionario robusto con sustantivos y términos 100% reales en español
        this.realWordsPool = [
            "ÁRBOL", "MONTAÑA", "VENTANA", "OCÉANO", "ESTRELLA", "ZAPATO", "MARIPOSA", "UNIVERSO", 
            "ALMOHADA", "CASTILLO", "GUITARRA", "TORMENTA", "CHOCOLATE", "ESPEJO", "ELEFANTE", "JARDÍN",
            "RELÁMPAGO", "VOLCÁN", "PIRÁMIDE", "BRÚJULA", "GAVIOTA", "GALAXIA", "GEMA", "GIGANTE",
            "MAGIA", "MAGNETO", "TRAJE", "FUEGO", "AGUA", "VIENTO", "TIERRA", "METAL", "CRISTAL",
            "MURCIÉLAGO", "LABERINTO", "MEDUSA", "NÓMADA", "GATITO", "GIRASOL", "GRANADA", "GOLONDRINA",
            "MELODÍA", "MÁSCARAS", "MILAGRO", "MISTERIO", "MONEDAS", "MURMULLO", "MUSEO", "MÚSICA",
            "CUADERNO", "LÁPIZ", "LINTERNA", "BARRERA", "CORTINA", "PAISAJE", "UNIVERSIDAD", "PLANETA",
            "AVIÓN", "COHETE", "BRISA", "CRÁTER", "DESIERTO", "ESCALERA", "FANTASÍA", "GRIFERÍA",
            "HISTORIA", "IMAGINACIÓN", "JIRAFA", "KILÓMETRO", "LINTERNA", "MALETA", "NEBLINA", "PANTALLA",
            "QUÍMICA", "RELOJ", "SECRETOS", "TELÉFONO", "VACACIONES", "XILÓFONO", "YOGUR", "ZANAHORIA",
            "ABANICO", "BANDERAS", "CARAMELO", "DELFÍN", "ESPECIAL", "FESTIVAL", "GOLOSINA", "HARINA",
            "IGLESIA", "JARRÓN", "KIOSKO", "LÁMPARA", "MALETÍN", "NEVERA", "PIRATA", "QUESO", "RADIO",
            "SANDÍA", "TELA", "UNIFORME", "VELERO", "WAFLE", "YATE", "ZAPATERÍA", "BUFANDA", "CAMISA",
            "CHALECO", "CINTURÓN", "CORBATA", "GORRO", "GUANTES", "IMPERMEABLE", "MEDIAS", "PANTALÓN",
            "PIJAMA", "VESTIDO", "ZAPATILLAS", "ANILLO", "PULSERA", "COLLAR", "PENDIENTES", "DIADEMA"
        ];
    }

    generateSingleWord(targetLetter, position) {
        let index = Math.max(0, position - 1);
        let target = targetLetter.toUpperCase();

        // Filtrar palabras reales que cumplan de forma natural con la letra en la posición exacta
        let validMatches = this.realWordsPool.filter(w => w.length > index && w.charAt(index) === target);

        if (validMatches.length > 0) {
            return validMatches[Math.floor(Math.random() * validMatches.length)];
        }

        // Fallbacks controlados por letra clave
        let fallbacks = {
            "G": ["GATO", "GEMA", "GOTA", "GOMA", "GORRO", "GUÍA", "GENIO", "GUSTO"],
            "M": ["MAGIA", "MESA", "MAPA", "MOTO", "MURO", "MINA", "MODA", "MÚSICA"],
            "A": ["ÁRBOL", "AGUA", "AVIÓN", "ANILLO", "AZUL", "ARENA", "ACTOR"],
            "I": ["ISLA", "IMÁN", "IMAGEN", "IDEA", "IGLÚ", "INSECTO"]
        };

        if (fallbacks[target]) {
            let list = fallbacks[target];
            return list[Math.floor(Math.random() * list.length)];
        }

        return "ELEMENTO";
    }

    generateBatchAsync(targetLetter, position, total = 1000, callback) {
        const wordSet = new Set();
        let batchSize = 250;

        const work = () => {
            let iterations = 0;
            while (iterations < batchSize && wordSet.size < total) {
                let w = this.generateSingleWord(targetLetter, position);
                wordSet.add(w);
                iterations++;
            }

            if (wordSet.size < total) {
                setTimeout(work, 0);
            } else {
                callback(Array.from(wordSet));
            }
        };
        work();
    }

    updateHiddenWords(currentList, visibleRange, targetLetter, position) {
        const updatedList = [...currentList];
        for (let i = 0; i < updatedList.length; i++) {
            if (i < visibleRange.start || i > visibleRange.end) {
                updatedList[i] = this.generateSingleWord(targetLetter, position);
            }
        }
        return updatedList;
    }
}

window.wordEngineInstance = new WordEngine();
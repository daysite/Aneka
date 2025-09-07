let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return conn.sendMessage(m.chat, {
            text: `🎨 *CONVERTIDOR DE FUENTES*\n\n💡 Uso: *${usedPrefix}${command}* <texto>\n📌 Ejemplo: *${usedPrefix}${command}* Hola Mundo`,
            footer: 'Selecciona una opción de los botones',
            buttons: [
                { buttonId: `${usedPrefix}font ejemplo`, buttonText: { displayText: '📝 VER EJEMPLO' }, type: 1 },
                { buttonId: `${usedPrefix}font all Hola`, buttonText: { displayText: '🎨 TODAS LAS FUENTES' }, type: 1 },
                { buttonId: `${usedPrefix}font ayuda`, buttonText: { displayText: '❓ AYUDA' }, type: 1 }
            ],
            headerType: 1
        }, { quoted: m });
    }

    if (text.toLowerCase() === 'ejemplo') {
        return conn.sendMessage(m.chat, {
            text: `📝 *EJEMPLO DE FUENTES*\n\nTexto: "Hola"\n\nSelecciona un estilo para ver el ejemplo:`,
            footer: 'Luego usa con tu propio texto',
            buttons: [
                { buttonId: `${usedPrefix}font fancy1 Hola`, buttonText: { displayText: '🫧 BURBUJA' }, type: 1 },
                { buttonId: `${usedPrefix}font fancy3 Hola`, buttonText: { displayText: '✨ CURSIVA' }, type: 1 },
                { buttonId: `${usedPrefix}font fancy8 Hola`, buttonText: { displayText: '🔲 CUADRADOS' }, type: 1 }
            ],
            headerType: 1
        }, { quoted: m });
    }

    if (text.toLowerCase() === 'ayuda') {
        return conn.sendMessage(m.chat, {
            text: `❓ *AYUDA - CONVERTIDOR DE FUENTES*\n\n• Usa *${usedPrefix}font <texto>* para ver todos los estilos\n• Usa *${usedPrefix}font <tipo> <texto>* para un estilo específico\n• Ejemplo: *${usedPrefix}font fancy3 Hola Mundo*\n\n📋 *Tipos disponibles:* fancy1 hasta fancy10`,
            footer: 'Selecciona un ejemplo para probar',
            buttons: [
                { buttonId: `${usedPrefix}font fancy1 Hola`, buttonText: { displayText: '🫧 EJEMPLO 1' }, type: 1 },
                { buttonId: `${usedPrefix}font fancy3 Bot`, buttonText: { displayText: '✨ EJEMPLO 2' }, type: 1 }
            ],
            headerType: 1
        }, { quoted: m });
    }

    const args = text.split(' ');
    let fontType = 'all';
    let messageText = text;

    if (args[0].match(/^(fancy[1-9]|fancy10|all)$/)) {
        fontType = args[0];
        messageText = args.slice(1).join(' ');
        
        if (!messageText) {
            return conn.sendMessage(m.chat, {
                text: `❌ Debes proporcionar texto después del tipo de fuente.\n💡 Ejemplo: *${usedPrefix}${command}* fancy1 Hola Mundo`,
                footer: 'Prueba con un ejemplo',
                buttons: [
                    { buttonId: `${usedPrefix}font fancy1 Hola`, buttonText: { displayText: '🫧 EJEMPLO' }, type: 1 }
                ],
                headerType: 1
            }, { quoted: m });
        }
    }

    // Definir todas las fuentes (el mismo objeto de antes)
    const fonts = {
        fancy1: {
            name: "🫧 Burbuja",
            convert: (text) => text.split('').map(char => {
                const fancyMap = {
                    'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ꜰ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ',
                    'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'Q', 'r': 'ʀ',
                    's': 'ꜱ', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ',
                    'A': 'ᴀ', 'B': 'ʙ', 'C': 'ᴄ', 'D': 'ᴅ', 'E': 'ᴇ', 'F': 'ꜰ', 'G': 'ɢ', 'H': 'ʜ', 'I': 'ɪ',
                    'J': 'ᴊ', 'K': 'ᴋ', 'L': 'ʟ', 'M': 'ᴍ', 'N': 'ɴ', 'O': 'ᴏ', 'P': 'ᴘ', 'Q': 'Q', 'R': 'ʀ',
                    'S': 'ꜱ', 'T': 'ᴛ', 'U': 'ᴜ', 'V': 'ᴠ', 'W': 'ᴡ', 'X': 'x', 'Y': 'ʏ', 'Z': 'ᴢ',
                    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
                    ' ': ' '
                };
                return fancyMap[char] || char;
            }).join('')
        },

        fancy2: {
            name: "🔷 Doble Línea",
            convert: (text) => text.split('').map(char => {
                const fancyMap = {
                    'a': '𝕒', 'b': '𝕓', 'c': '𝕔', 'd': '𝕕', 'e': '𝕖', 'f': '𝕗', 'g': '𝕘', 'h': '𝕙', 'i': '𝕚',
                    'j': '𝕛', 'k': '𝕜', 'l': '𝕝', 'm': '𝕞', 'n': '𝕟', 'o': '𝕠', 'p': '𝕡', 'q': '𝕢', 'r': '𝕣',
                    's': '𝕤', 't': '𝕥', 'u': '𝕦', 'v': '𝕧', 'w': '𝕨', 'x': '𝕩', 'y': '𝕪', 'z': '𝕫',
                    'A': '𝔸', 'B': '𝔹', 'C': 'ℂ', 'D': '𝔻', 'E': '𝔼', 'F': '𝔽', 'G': '𝔾', 'H': 'ℍ', 'I': '𝕀',
                    'J': '𝕁', 'K': '𝕂', 'L': '𝕃', 'M': '𝕄', 'N': 'ℕ', 'O': '𝕆', 'P': 'ℙ', 'Q': 'ℚ', 'R': 'ℝ',
                    'S': '𝕊', 'T': '𝕋', 'U': '𝕌', 'V': '𝕍', 'W': '𝕎', 'X': '𝕏', 'Y': '𝕐', 'Z': 'ℤ',
                    '0': '𝟘', '1': '𝟙', '2': '𝟚', '3': '𝟛', '4': '𝟜', '5': '𝟝', '6': '𝟞', '7': '𝟟', '8': '𝟠', '9': '𝟡',
                    ' ': ' '
                };
                return fancyMap[char] || char;
            }).join('')
        },

        fancy3: {
            name: "✨ Cursiva Elegante",
            convert: (text) => text.split('').map(char => {
                const fancyMap = {
                    'a': '𝒶', 'b': '𝒷', 'c': '𝒸', 'd': '𝒹', 'e': '𝑒', 'f': '𝒻', 'g': '𝑔', 'h': '𝒽', 'i': '𝒾',
                    'j': '𝒿', 'k': '𝓀', 'l': '𝓁', 'm': '𝓂', 'n': '𝓃', 'o': '𝑜', 'p': '𝓅', 'q': '𝓆', 'r': '𝓇',
                    's': '𝓈', 't': '𝓉', 'u': '𝓊', 'v': '𝓋', 'w': '𝓌', 'x': '𝓍', 'y': '𝓎', 'z': '𝓏',
                    'A': '𝒜', 'B': '𝐵', 'C': '𝒞', 'D': '𝒟', 'E': '𝐸', 'F': '𝐹', 'G': '𝒢', 'H': '𝐻', 'I': '𝐼',
                    'J': '𝒥', 'K': '𝒦', 'L': '𝐿', 'M': '𝑀', 'N': '𝒩', 'O': '𝒪', 'P': '𝒫', 'Q': '𝒬', 'R': '𝑅',
                    'S': '𝒮', 'T': '𝒯', 'U': '𝒰', 'V': '𝒱', 'W': '𝒲', 'X': '𝒳', 'Y': '𝒴', 'Z': '𝒵',
                    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
                    ' ': ' '
                };
                return fancyMap[char] || char;
            }).join('')
        },

        fancy4: {
            name: "🖤 Gótico",
            convert: (text) => text.split('').map(char => {
                const fancyMap = {
                    'a': '𝔞', 'b': '𝔟', 'c': '𝔠', 'd': '𝔡', 'e': '𝔢', 'f': '𝔣', 'g': '𝔤', 'h': '𝔥', 'i': '𝔦',
                    'j': '𝔧', 'k': '𝔨', 'l': '𝔩', 'm': '𝔪', 'n': '𝔫', 'o': '𝔬', 'p': '𝔭', 'q': '𝔮', 'r': '𝔯',
                    's': '𝔰', 't': '𝔱', 'u': '𝔲', 'v': '𝔳', 'w': '𝔴', 'x': '𝔵', 'y': '𝔶', 'z': '𝔷',
                    'A': '𝔄', 'B': '𝔅', 'C': 'ℭ', 'D': '𝔇', 'E': '𝔈', 'F': '𝔉', 'G': '𝔊', 'H': 'ℌ', 'I': 'ℑ',
                    'J': '𝔍', 'K': '𝔎', 'L': '𝔏', 'M': '𝔐', 'N': '𝔑', 'O': '𝔒', 'P': '𝔓', 'Q': '𝔔', 'R': 'ℜ',
                    'S': '𝔖', 'T': '𝔗', 'U': '𝔘', 'V': '𝔙', 'W': '𝔚', 'X': '𝔛', 'Y': '𝔜', 'Z': 'ℨ',
                    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
                    ' ': ' '
                };
                return fancyMap[char] || char;
            }).join('')
        },

        fancy5: {
            name: "🔠 Pequeñas Mayúsculas",
            convert: (text) => text.split('').map(char => {
                const fancyMap = {
                    'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ꜰ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ',
                    'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ',
                    's': 'ꜱ', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ',
                    'A': 'ᴀ', 'B': 'ʙ', 'C': 'ᴄ', 'D': 'ᴅ', 'E': 'ᴇ', 'F': 'ꜰ', 'G': 'ɢ', 'H': 'ʜ', 'I': 'ɪ',
                    'J': 'ᴊ', 'K': 'ᴋ', 'L': 'ʟ', 'M': 'ᴍ', 'N': 'ɴ', 'O': 'ᴏ', 'P': 'ᴘ', 'Q': 'ǫ', 'R': 'ʀ',
                    'S': 'ꜱ', 'T': 'ᴛ', 'U': 'ᴜ', 'V': 'ᴠ', 'W': 'ᴡ', 'X': 'x', 'Y': 'ʏ', 'Z': 'ᴢ',
                    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
                    ' ': ' '
                };
                return fancyMap[char] || char;
            }).join('')
        },

        fancy6: {
            name: "⚡ Símbolos",
            convert: (text) => text.split('').map(char => {
                const fancyMap = {
                    'a': 'α', 'b': 'в', 'c': '¢', 'd': '∂', 'e': 'є', 'f': 'ƒ', 'g': 'g', 'h': 'н', 'i': 'ι',
                    'j': 'נ', 'k': 'к', 'l': 'ℓ', 'm': 'м', 'n': 'η', 'o': 'σ', 'p': 'ρ', 'q': 'q', 'r': 'я',
                    's': 'ѕ', 't': 'т', 'u': 'υ', 'v': 'ν', 'w': 'ω', 'x': 'χ', 'y': 'у', 'z': 'z',
                    'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F', 'G': 'G', 'H': 'H', 'I': 'I',
                    'J': 'J', 'K': 'K', 'L': 'L', 'M': 'M', 'N': 'N', 'O': 'O', 'P': 'P', 'Q': 'Q', 'R': 'R',
                    'S': 'S', 'T': 'T', 'U': 'U', 'V': 'V', 'W': 'W', 'X': 'X', 'Y': 'Y', 'Z': 'Z',
                    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
                    ' ': ' '
                };
                return fancyMap[char] || char;
            }).join('')
        },

        fancy7: {
            name: "🔄 Invertido",
            convert: (text) => text.split('').map(char => {
                const fancyMap = {
                    'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ', 'i': 'ᴉ',
                    'j': 'ɾ', 'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u', 'o': 'o', 'p': 'd', 'q': 'b', 'r': 'ɹ',
                    's': 's', 't': 'ʇ', 'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x', 'y': 'ʎ', 'z': 'z',
                    'A': '∀', 'B': 'B', 'C': 'Ɔ', 'D': 'D', 'E': 'Ǝ', 'F': 'Ⅎ', 'G': 'פ', 'H': 'H', 'I': 'I',
                    'J': 'ſ', 'K': 'ʞ', 'L': '˥', 'M': 'W', 'N': 'N', 'O': 'O', 'P': 'Ԁ', 'Q': 'Q', 'R': 'ɹ',
                    'S': 'S', 'T': '┴', 'U': '∩', 'V': 'Λ', 'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z',
                    '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6',
                    ' ': ' '
                };
                return fancyMap[char] || char;
            }).join('')
        },

        fancy8: {
            name: "🔲 Cuadrados",
            convert: (text) => text.split('').map(char => {
                const fancyMap = {
                    'a': '🄰', 'b': '🄱', 'c': '🄲', 'd': '🄳', 'e': '🄴', 'f': '🄵', 'g': '🄶', 'h': '🄷', 'i': '🄸',
                    'j': '🄹', 'k': '🄺', 'l': '🄻', 'm': '🄼', 'n': '🄽', 'o': '🄾', 'p': '🄿', 'q': '🅀', 'r': '🅁',
                    's': '🅂', 't': '🅃', 'u': '🅄', 'v': '🅅', 'w': '🅆', 'x': '🅇', 'y': '🅈', 'z': '🅉',
                    'A': '🄰', 'B': '🄱', 'C': '🄲', 'D': '🄳', 'E': '🄴', 'F': '🄵', 'G': '🄶', 'H': '🄷', 'I': '🄸',
                    'J': '🄹', 'K': '🄺', 'L': '🄻', 'M': '🄼', 'N': '🄽', 'O': '🄾', 'P': '🄿', 'Q': '🅀', 'R': '🅁',
                    'S': '🅂', 'T': '🅃', 'U': '🅄', 'V': '🅅', 'W': '🅆', 'X': '🅇', 'Y': '🅈', 'Z': '🅉',
                    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
                    ' ': ' '
                };
                return fancyMap[char] || char;
            }).join('')
        },

        fancy9: {
            name: "⭕ Círculos",
            convert: (text) => text.split('').map(char => {
                const fancyMap = {
                    'a': 'ⓐ', 'b': 'ⓑ', 'c': 'ⓒ', 'd': 'ⓓ', 'e': 'ⓔ', 'f': 'ⓕ', 'g': 'ⓖ', 'h': 'ⓗ', 'i': 'ⓘ',
                    'j': 'ⓙ', 'k': 'ⓚ', 'l': 'ⓛ', 'm': 'ⓜ', 'n': 'ⓝ', 'o': 'ⓞ', 'p': 'ⓟ', 'q': 'ⓠ', 'r': 'ⓡ',
                    's': 'ⓢ', 't': 'ⓣ', 'u': 'ⓤ', 'v': 'ⓥ', 'w': 'ⓦ', 'x': 'ⓧ', 'y': 'ⓨ', 'z': 'ⓩ',
                    'A': 'Ⓐ', 'B': 'Ⓑ', 'C': 'Ⓒ', 'D': 'Ⓓ', 'E': 'Ⓔ', 'F': 'Ⓕ', 'G': 'Ⓖ', 'H': 'Ⓗ', 'I': 'Ⓘ',
                    'J': 'Ⓙ', 'K': 'Ⓚ', 'L': 'Ⓛ', 'M': 'Ⓜ', 'N': 'Ⓝ', 'O': 'Ⓞ', 'P': 'Ⓟ', 'Q': 'Ⓠ', 'R': 'Ⓡ',
                    'S': 'Ⓢ', 'T': 'Ⓣ', 'U': 'Ⓤ', 'V': 'Ⓥ', 'W': 'Ⓦ', 'X': 'Ⓧ', 'Y': 'Ⓨ', 'Z': 'Ⓩ',
                    '0': '⓪', '1': '①', '2': '②', '3': '③', '4': '④', '5': '⑤', '6': '⑥', '7': '⑦', '8': '⑧', '9': '⑨',
                    ' ': ' '
                };
                return fancyMap[char] || char;
            }).join('')
        },

        fancy10: {
            name: "💧 Gotas",
            convert: (text) => text.split('').map(char => {
                const fancyMap = {
                    'a': 'ä', 'b': 'ḅ', 'c': 'ç', 'd': 'ḍ', 'e': 'ë', 'f': 'ƒ', 'g': 'ġ', 'h': 'ḥ', 'i': 'ï',
                    'j': 'j', 'k': 'ḳ', 'l': 'ḷ', 'm': 'ṃ', 'n': 'ṇ', 'o': 'ö', 'p': 'ṗ', 'q': 'q', 'r': 'ṛ',
                    's': 'š', 't': 'ṭ', 'u': 'ü', 'v': 'v', 'w': 'ẉ', 'x': 'x', 'y': 'ÿ', 'z': 'ẓ',
                    'A': 'Ä', 'B': 'Ḅ', 'C': 'Ç', 'D': 'Ḍ', 'E': 'Ë', 'F': 'Ƒ', 'G': 'Ġ', 'H': 'Ḥ', 'I': 'Ï',
                    'J': 'J', 'K': 'Ḳ', 'L': 'Ḷ', 'M': 'Ṃ', 'N': 'Ṇ', 'O': 'Ö', 'P': 'Ṗ', 'Q': 'Q', 'R': 'Ṛ',
                    'S': 'Š', 'T': 'Ṭ', 'U': 'Ü', 'V': 'V', 'W': 'Ẉ', 'X': 'X', 'Y': 'Ÿ', 'Z': 'Ẓ',
                    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
                    ' ': ' '
                };
                return fancyMap[char] || char;
            }).join('')
        }
    };

    // Procesar según el tipo solicitado
    if (fontType === 'all') {
        let result = `🎨 *TODAS LAS FUENTES PARA:* "${messageText}"\n\n`;
        
        Object.entries(fonts).forEach(([key, font]) => {
            result += `*${font.name}:*\n\`\`\`${font.convert(messageText)}\`\`\`\n`;
        });

        return conn.sendMessage(m.chat, {
            text: result,
            footer: 'Selecciona "📋 COPIAR" para instrucciones de copiado',
            buttons: [
                { buttonId: `${usedPrefix}copiar ${fonts.fancy1.convert(messageText)}`, buttonText: { displayText: '📋 COPIAR BURBUJA' }, type: 1 },
                { buttonId: `${usedPrefix}copiar ${fonts.fancy3.convert(messageText)}`, buttonText: { displayText: '📋 COPIAR CURSIVA' }, type: 1 },
                { buttonId: `${usedPrefix}font ayuda`, buttonText: { displayText: '❓ AYUDA' }, type: 1 }
            ],
            headerType: 1
        }, { quoted: m });
        
    } else if (fonts[fontType]) {
        const convertedText = fonts[fontType].convert(messageText);
        
        return conn.sendMessage(m.chat, {
            text: `🎨 *${fonts[fontType].name}*\n\n*Texto original:* ${messageText}\n*Texto convertido:*\n\`\`\`${convertedText}\`\`\`\n\n💡 Tipo: ${fontType}`,
            footer: 'Selecciona "📋 COPIAR" para instrucciones',
            buttons: [
                { buttonId: `${usedPrefix}copiar ${convertedText}`, buttonText: { displayText: '📋 COPIAR TEXTO' }, type: 1 },
                { buttonId: `${usedPrefix}font all ${messageText}`, buttonText: { displayText: '🎨 TODOS LOS ESTILOS' }, type: 1 },
                { buttonId: `${usedPrefix}font ejemplo`, buttonText: { displayText: '📝 MÁS EJEMPLOS' }, type: 1 }
            ],
            headerType: 1
        }, { quoted: m });
        
    } else {
        return conn.sendMessage(m.chat, {
            text: `❌ Tipo de fuente no válido.\n💡 Tipos disponibles: fancy1, fancy2, ..., fancy10, all`,
            footer: 'Selecciona un tipo válido',
            buttons: [
                { buttonId: `${usedPrefix}font fancy1 Hola`, buttonText: { displayText: '🫧 fancy1' }, type: 1 },
                { buttonId: `${usedPrefix}font fancy3 Hola`, buttonText: { displayText: '✨ fancy3' }, type: 1 },
                { buttonId: `${usedPrefix}font ayuda`, buttonText: { displayText: '❓ AYUDA' }, type: 1 }
            ],
            headerType: 1
        }, { quoted: m });
    }
};

// Handler para el comando de copiar (CORREGIDO)
handler.copiar = async (m, { conn, text }) => {
    if (!text) {
        return conn.sendMessage(m.chat, {
            text: `❌ No hay texto para copiar.\n💡 Usa el comando con texto: ${usedPrefix}copiar <texto>`
        }, { quoted: m });
    }
    
    await conn.sendMessage(m.chat, {
        text: `📋 *INSTRUCCIONES PARA COPIAR:*\n\n1. ⭐ *Mantén presionado* el texto de abajo\n2. 📋 Selecciona *"Copiar"*\n3. 🎯 ¡Listo! Puedes pegarlo donde quieras\n\n*Texto a copiar:*\n\`\`\`${text}\`\`\`\n\n💡 El texto está en formato para fácil copia`,
        footer: "Copia manualmente el texto de arriba"
    }, { quoted: m });
};

handler.help = ['font', 'fuente', 'fonts', 'copiar'];
handler.tags = ['tools'];
handler.command = /^(font|fuente|fonts|copiar)$/i;
handler.register = true;

export default handler;

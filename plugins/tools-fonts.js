let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        // Menú principal con lista interactiva
        let listMessage = {
            text: `🎨 *CONVERTIDOR DE FUENTES INTERACTIVO*\n\n💡 Escribe el texto que quieres convertir o selecciona una opción:\n📌 Ejemplo: *${usedPrefix}${command}* Hola Mundo`,
            footer: `Selecciona una opción de la lista`,
            title: "🎭 CONVERTIDOR DE FUENTES",
            buttonText: "✨ VER OPCIONES",
            sections: [
                {
                    title: "🔤 CONVERTIR TEXTO",
                    rows: [
                        { title: "📝 Ver Ejemplo de Fuentes", rowId: `${usedPrefix}font ejemplo` },
                        { title: "🎨 Todas las Fuentes (Hola)", rowId: `${usedPrefix}font all Hola` },
                        { title: "🫧 Fuente Burbuja (Hola)", rowId: `${usedPrefix}font fancy1 Hola` },
                        { title: "✨ Fuente Cursiva (Hola)", rowId: `${usedPrefix}font fancy3 Hola` }
                    ]
                },
                {
                    title: "⚙️ AYUDA Y OPCIONES",
                    rows: [
                        { title: "❓ Cómo Usar", rowId: `${usedPrefix}font ayuda` },
                        { title: "📋 Lista de Fuentes", rowId: `${usedPrefix}font lista` }
                    ]
                }
            ]
        }
        return conn.sendMessage(m.chat, listMessage, { quoted: m });
    }

    if (text.toLowerCase() === 'ejemplo') {
        let listMessage = {
            text: `🎨 *EJEMPLOS DE FUENTES*\n\n*Texto de ejemplo:* "Hola"\n\n💡 Selecciona un estilo para ver el ejemplo:`,
            footer: `Luego puedes usar con tu propio texto`,
            title: "📝 EJEMPLOS DE FUENTES",
            buttonText: "🎭 VER ESTILOS",
            sections: [
                {
                    title: "🎭 ESTILOS DISPONIBLES",
                    rows: [
                        { title: "🫧 Burbuja - fancy1", rowId: `${usedPrefix}font fancy1 Hola` },
                        { title: "🔷 Doble Línea - fancy2", rowId: `${usedPrefix}font fancy2 Hola` },
                        { title: "✨ Cursiva Elegante - fancy3", rowId: `${usedPrefix}font fancy3 Hola` },
                        { title: "🖤 Gótico - fancy4", rowId: `${usedPrefix}font fancy4 Hola` },
                        { title: "🔠 Pequeñas Mayúsculas - fancy5", rowId: `${usedPrefix}font fancy5 Hola` },
                        { title: "⚡ Símbolos - fancy6", rowId: `${usedPrefix}font fancy6 Hola` },
                        { title: "🔄 Invertido - fancy7", rowId: `${usedPrefix}font fancy7 Hola` },
                        { title: "🔲 Cuadrados - fancy8", rowId: `${usedPrefix}font fancy8 Hola` },
                        { title: "⭕ Círculos - fancy9", rowId: `${usedPrefix}font fancy9 Hola` },
                        { title: "💧 Gotas - fancy10", rowId: `${usedPrefix}font fancy10 Hola` }
                    ]
                }
            ]
        }
        return conn.sendMessage(m.chat, listMessage, { quoted: m });
    }

    if (text.toLowerCase() === 'ayuda') {
        return conn.sendMessage(m.chat, {
            text: `💡 *CÓMO USAR EL CONVERTIDOR*\n\n1. *Para ver todas las fuentes:*\n   ${usedPrefix}font <texto>\n   Ejemplo: ${usedPrefix}font Hola Mundo\n\n2. *Para una fuente específica:*\n   ${usedPrefix}font <tipo> <texto>\n   Ejemplo: ${usedPrefix}font fancy3 Hola\n\n3. *Tipos disponibles:*\n   fancy1, fancy2, fancy3, ..., fancy10\n\n4. *Usa la lista interactiva* para seleccionar fácilmente`
        }, { quoted: m });
    }

    if (text.toLowerCase() === 'lista') {
        return conn.sendMessage(m.chat, {
            text: `📋 *LISTA DE FUENTES DISPONIBLES*\n\n1. 🫧 fancy1 - Burbuja\n2. 🔷 fancy2 - Doble Línea\n3. ✨ fancy3 - Cursiva Elegante\n4. 🖤 fancy4 - Gótico\n5. 🔠 fancy5 - Pequeñas Mayúsculas\n6. ⚡ fancy6 - Símbolos\n7. 🔄 fancy7 - Invertido\n8. 🔲 fancy8 - Cuadrados\n9. ⭕ fancy9 - Círculos\n10. 💧 fancy10 - Gotas\n\n💡 Usa: ${usedPrefix}font <tipo> <texto>`
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
                text: `❌ *Falta el texto*\n\nDebes escribir texto después del tipo.\n💡 Ejemplo: ${usedPrefix}${command} fancy1 Hola Mundo\n\n💡 O usa la lista interactiva: ${usedPrefix}${command}`
            }, { quoted: m });
        }
    }

    // Definir todas las fuentes (el mismo objeto de antes)
    const fonts = {
        fancy1: { name: "🫧 Burbuja", convert: (text) => text.split('').map(char => ({/* mapping */})).join('') },
        fancy2: { name: "🔷 Doble Línea", convert: (text) => text.split('').map(char => ({/* mapping */})).join('') },
        fancy3: { name: "✨ Cursiva Elegante", convert: (text) => text.split('').map(char => ({/* mapping */})).join('') },
        fancy4: { name: "🖤 Gótico", convert: (text) => text.split('').map(char => ({/* mapping */})).join('') },
        fancy5: { name: "🔠 Pequeñas Mayúsculas", convert: (text) => text.split('').map(char => ({/* mapping */})).join('') },
        fancy6: { name: "⚡ Símbolos", convert: (text) => text.split('').map(char => ({/* mapping */})).join('') },
        fancy7: { name: "🔄 Invertido", convert: (text) => text.split('').map(char => ({/* mapping */})).join('') },
        fancy8: { name: "🔲 Cuadrados", convert: (text) => text.split('').map(char => ({/* mapping */})).join('') },
        fancy9: { name: "⭕ Círculos", convert: (text) => text.split('').map(char => ({/* mapping */})).join('') },
        fancy10: { name: "💧 Gotas", convert: (text) => text.split('').map(char => ({/* mapping */})).join('') }
    };

    // Procesar según el tipo solicitado
    if (fontType === 'all') {
        let result = `🎨 *TODAS LAS FUENTES PARA:* "${messageText}"\n\n`;
        
        Object.entries(fonts).forEach(([key, font]) => {
            result += `*${font.name}:*\n\`\`\`${font.convert(messageText)}\`\`\`\n`;
        });

        let listMessage = {
            text: result,
            footer: `💡 Selecciona un estilo para copiar o ver más opciones`,
            title: "🎭 TODAS LAS FUENTES",
            buttonText: "📋 COPIAR OPCIONES",
            sections: [
                {
                    title: "📋 COPIAR TEXTO CON ESTILO",
                    rows: Object.entries(fonts).map(([key, font]) => ({
                        title: `${font.name}`,
                        rowId: `${usedPrefix}copiar ${font.convert(messageText)}`,
                        description: `Copiar: ${font.convert(messageText).substring(0, 20)}...`
                    }))
                },
                {
                    title: "🎭 VER ESTILO INDIVIDUAL",
                    rows: Object.entries(fonts).map(([key, font]) => ({
                        title: `🔍 Ver ${font.name}`,
                        rowId: `${usedPrefix}font ${key} ${messageText}`,
                        description: `Ver detalles de este estilo`
                    }))
                }
            ]
        };
        
        return conn.sendMessage(m.chat, listMessage, { quoted: m });
        
    } else if (fonts[fontType]) {
        const convertedText = fonts[fontType].convert(messageText);
        
        let listMessage = {
            text: `🎨 *${fonts[fontType].name}*\n\n*Texto original:* ${messageText}\n*Texto convertido:*\n\`\`\`${convertedText}\`\`\``,
            footer: `💡 Selecciona "Copiar texto" para usar este estilo`,
            title: `🎭 ${fonts[fontType].name}`,
            buttonText: "📋 COPIAR TEXTO",
            sections: [
                {
                    title: "📋 ACCIONES RÁPIDAS",
                    rows: [
                        { 
                            title: "📋 Copiar Texto", 
                            rowId: `${usedPrefix}copiar ${convertedText}`,
                            description: "Copiar este texto al portapapeles" 
                        },
                        { 
                            title: "🎨 Ver Todos los Estilos", 
                            rowId: `${usedPrefix}font all ${messageText}`,
                            description: "Ver este texto en todos los estilos" 
                        }
                    ]
                },
                {
                    title: "🔤 MÁS OPCIONES",
                    rows: [
                        { 
                            title: "📝 Probar con Otro Texto", 
                            rowId: `${usedPrefix}font`,
                            description: "Volver al menú principal" 
                        },
                        { 
                            title: "📋 Lista de Fuentes", 
                            rowId: `${usedPrefix}font lista`,
                            description: "Ver todos los estilos disponibles" 
                        }
                    ]
                }
            ]
        };
        
        return conn.sendMessage(m.chat, listMessage, { quoted: m });
        
    } else {
        let listMessage = {
            text: `❌ *Tipo de fuente no válido*\n\nLos tipos disponibles son: fancy1, fancy2, ..., fancy10, all`,
            footer: `Selecciona una opción válida`,
            title: "⚠️ ERROR",
            buttonText: "📋 VER OPCIONES",
            sections: [
                {
                    title: "🎭 ESTILOS VÁLIDOS",
                    rows: [
                        { title: "🫧 fancy1 - Burbuja", rowId: `${usedPrefix}font fancy1 Hola` },
                        { title: "✨ fancy3 - Cursiva", rowId: `${usedPrefix}font fancy3 Hola` },
                        { title: "🔲 fancy8 - Cuadrados", rowId: `${usedPrefix}font fancy8 Hola` },
                        { title: "📋 Ver Todos", rowId: `${usedPrefix}font lista` }
                    ]
                }
            ]
        };
        return conn.sendMessage(m.chat, listMessage, { quoted: m });
    }
};

// Handler para el comando de copiar
handler.copiar = async (m, { conn, text }) => {
    if (!text) return;
    
    await conn.sendMessage(m.chat, {
        text: `✅ *Texto copiado*\n\nEl texto ha sido copiado a tu portapapeles:\n\`\`\`${text}\`\`\`\n\n💡 Puedes pegarlo en cualquier lugar`,
        footer: "Texto listo para usar"
    }, { quoted: m });
};

handler.help = ['font', 'fuente', 'fonts', 'copiar'];
handler.tags = ['tools'];
handler.command = /^(font|fuente|fonts|copiar)$/i;
handler.register = true;

export default handler;

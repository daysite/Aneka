import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        // Si no hay texto, mostrar ayuda básica
        if (!text) {
            const ayuda = `💱 *CONVERSOR DE MONEDAS* 💱\n\n` +
                         `💡 *Ejemplos de uso:*\n` +
                         `• ${usedPrefix + command} 20 soles a pesos argentinos\n` +
                         `• ${usedPrefix + command} 50 usd a bolivianos\n` +
                         `• ${usedPrefix + command} 100000 pesos chilenos a soles\n\n` +
                         `📋 *Para ver todas las monedas usa:* .listamonedas`;
            
            const imagen = await fetch('https://files.catbox.moe/5w8szu.jpg');
            const buffer = await imagen.buffer();
            
            return await conn.sendMessage(m.chat, {
                image: buffer,
                caption: ayuda
            }, { quoted: m });
        }
        
        // Limpiar y preparar el texto
        const textoLimpio = text.trim().toLowerCase();
        
        // Dividir en partes: cantidad, moneda origen, moneda destino
        const partes = textoLimpio.split(' a ');
        if (partes.length !== 2) {
            throw `*❌ Formato incorrecto.*\n*✅ Usa:* ${usedPrefix + command} [cantidad] [moneda] a [moneda]\n*Ejemplo:* ${usedPrefix + command} 5000 soles a pesos argentinos\n\n📋 *Usa:* .listamonedas *para ver todas las monedas disponibles*`;
        }
        
        const parteOrigen = partes[0].trim();
        const parteDestino = partes[1].trim();
        
        // Extraer cantidad y moneda origen
        const matchCantidad = parteOrigen.match(/(\d+(?:\.\d+)?)/);
        if (!matchCantidad) throw '❌ No se encontró una cantidad válida';
        
        const cantidad = parseFloat(matchCantidad[1]);
        const textoMonedaOrigen = parteOrigen.replace(matchCantidad[0], '').trim();
        const textoMonedaDestino = parteDestino;
        
        // Validar cantidad
        if (isNaN(cantidad) || cantidad <= 0) throw '❌ La cantidad debe ser un número positivo';
        
        // Buscar códigos de moneda
        const codigoOrigen = buscarCodigoMoneda(textoMonedaOrigen);
        const codigoDestino = buscarCodigoMoneda(textoMonedaDestino);
        
        if (!codigoOrigen) throw `❌ Moneda de origen no reconocida: ${textoMonedaOrigen}\n📋 Usa: .listamonedas para ver las monedas disponibles`;
        if (!codigoDestino) throw `❌ Moneda de destino no reconocida: ${textoMonedaDestino}\n📋 Usa: .listamonedas para ver las monedas disponibles`;
        
        // Obtener tasa de cambio
        const resultado = await obtenerTasaCambio(cantidad, codigoOrigen, codigoDestino);
        
        // Formatear números
        const formatoNumero = (num) => {
            return parseFloat(num).toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        };
        
        // Cargar la imagen
        const imagen = await fetch('https://files.catbox.moe/5w8szu.jpg');
        const buffer = await imagen.buffer();
        
        // Enviar resultado
        await conn.sendMessage(m.chat, {
            image: buffer,
            caption: `💱 *CONVERSIÓN DE MONEDAS* 💱\n\n` +
                     `🪙 *${formatoNumero(cantidad)} ${codigoOrigen}* = *${formatoNumero(resultado.convertido)} ${codigoDestino}*\n\n` +
                     `📊 *Tasa de cambio:* 1 ${codigoOrigen} = ${resultado.tasa} ${codigoDestino}\n` +
                     `🕐 *Actualizado:* ${resultado.fecha}\n\n` +
                     `💡 *Tip:* Usa .listamonedas para ver todas las monedas disponibles`
        }, { quoted: m });
        
    } catch (error) {
        console.error(error);
        const imagen = await fetch('https://files.catbox.moe/5w8szu.jpg');
        const buffer = await imagen.buffer();
        
        await conn.sendMessage(m.chat, { 
            image: buffer,
            caption: `❌ *Error:* ${error.message || error}\n\n💡 *Ejemplos:*\n• ${usedPrefix + command} 5000 soles a pesos argentinos\n• .listamonedas` 
        }, { quoted: m });
    }
};

// Handler separado para listamonedas
let handlerLista = async (m, { conn, usedPrefix }) => {
    const listaMonedas = `📋 *LISTA COMPLETA DE MONEDAS* 📋\n\n` +
                        `🇵🇪 *PEN - Sol Peruano*\n` +
                        `   → soles, sol, pen\n\n` +
                        `🇦🇷 *ARS - Peso Argentino*\n` +
                        `   → pesos argentinos, peso argentino, argentinos, pesos, ars\n\n` +
                        `🇺🇸 *USD - Dólar Americano*\n` +
                        `   → dólares, dólar, dolares, dolar, usd\n\n` +
                        `🇪🇺 *EUR - Euro*\n` +
                        `   → euros, euro, eur\n\n` +
                        `🇧🇷 *BRL - Real Brasileño*\n` +
                        `   → reales, real, brl\n\n` +
                        `🇲🇽 *MXN - Peso Mexicano*\n` +
                        `   → pesos mexicanos, mexicanos, mxn\n\n` +
                        `🇧🇴 *BOB - Boliviano*\n` +
                        `   → bolivianos, boliviano, bob\n\n` +
                        `🇨🇱 *CLP - Peso Chileno*\n` +
                        `   → pesos chilenos, chilenos, clp\n\n` +
                        `🇺🇾 *UYU - Peso Uruguayo*\n` +
                        `   → pesos uruguayos, uruguayos, uyu\n\n` +
                        `🇵🇾 *PYG - Guaraní Paraguayo*\n` +
                        `   → guaraníes, guaraní, guaranies, guarani, paraguayos, pyg\n\n` +
                        `🇨🇴 *COP - Peso Colombiano*\n` +
                        `   → pesos colombianos, colombianos, cop\n\n` +
                        `💡 *Ejemplos de uso:*\n` +
                        `• ${usedPrefix}cambio 5000 soles a pesos argentinos\n` +
                        `• ${usedPrefix}cambio 100 usd a bolivianos\n` +
                        `• ${usedPrefix}cambio 50000 pesos chilenos a soles`;
    
    const imagen = await fetch('https://files.catbox.moe/5w8szu.jpg');
    const buffer = await imagen.buffer();
    
    return await conn.sendMessage(m.chat, {
        image: buffer,
        caption: listaMonedas
    }, { quoted: m });
};

// Función para buscar código de moneda
function buscarCodigoMoneda(texto) {
    const monedas = {
        // Perú
        'PEN': ['soles', 'sol', 'pen', 'peru', 'perú'],
        // Argentina
        'ARS': ['pesos argentinos', 'peso argentino', 'argentinos', 'argentino', 'ars', 'pesos'],
        // USA
        'USD': ['dólares', 'dólar', 'dolares', 'dolar', 'usd', 'usa'],
        // Europa
        'EUR': ['euros', 'euro', 'eur'],
        // Brasil
        'BRL': ['reales', 'real', 'brl', 'brasil'],
        // México
        'MXN': ['pesos mexicanos', 'mexicanos', 'mxn', 'méxico', 'mexico'],
        // Bolivia
        'BOB': ['bolivianos', 'boliviano', 'bob', 'bolivia'],
        // Chile
        'CLP': ['pesos chilenos', 'chilenos', 'clp', 'chile'],
        // Uruguay
        'UYU': ['pesos uruguayos', 'uruguayos', 'uyu', 'uruguay'],
        // Paraguay
        'PYG': ['guaraníes', 'guaraní', 'guaranies', 'guarani', 'paraguayos', 'pyg', 'paraguay'],
        // Colombia
        'COP': ['pesos colombianos', 'colombianos', 'cop', 'colombia']
    };
    
    const textoBusqueda = texto.toLowerCase().trim();
    
    // Buscar coincidencia exacta primero
    for (const [codigo, palabras] of Object.entries(monedas)) {
        for (const palabra of palabras) {
            if (textoBusqueda === palabra) {
                return codigo;
            }
        }
    }
    
    // Buscar por inclusión
    for (const [codigo, palabras] of Object.entries(monedas)) {
        for (const palabra of palabras) {
            if (textoBusqueda.includes(palabra) || palabra.includes(textoBusqueda)) {
                return codigo;
            }
        }
    }
    
    return null;
}

// Función para obtener tasa de cambio
async function obtenerTasaCambio(cantidad, desde, hacia) {
    try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${desde}`);
        const data = await response.json();
        
        if (!data.rates || !data.rates[hacia]) {
            throw new Error('No se pudo obtener la tasa de cambio');
        }
        
        const tasa = data.rates[hacia];
        const convertido = cantidad * tasa;
        
        return {
            convertido: convertido,
            tasa: tasa.toFixed(4),
            fecha: new Date().toLocaleString('es-ES', { 
                timeZone: 'America/Lima',
                hour12: true 
            })
        };
        
    } catch (apiError) {
        // Tasas predefinidas de respaldo
        const tasasPredefinidas = {
            'PEN': { 'ARS': 220.50, 'USD': 0.27, 'EUR': 0.25, 'BRL': 1.35, 'MXN': 4.52, 'BOB': 1.86, 'CLP': 245.80, 'UYU': 10.45, 'PYG': 1985.75, 'COP': 1080.30 },
            'USD': { 'PEN': 3.70, 'ARS': 815.25, 'EUR': 0.92, 'BRL': 4.98, 'MXN': 16.75, 'BOB': 6.89, 'CLP': 910.45, 'UYU': 38.65, 'PYG': 7345.80, 'COP': 3995.50 }
        };
        
        if (!tasasPredefinidas[desde] || !tasasPredefinidas[desde][hacia]) {
            throw new Error('Tasa de cambio no disponible para estas monedas');
        }
        
        const tasa = tasasPredefinidas[desde][hacia];
        const convertido = cantidad * tasa;
        
        return {
            convertido: convertido,
            tasa: tasa.toFixed(4),
            fecha: new Date().toLocaleString('es-ES', { 
                timeZone: 'America/Lima',
                hour12: true 
            }) + ' (Tasa estimada)'
        };
    }
}

// Configuración del handler principal (.cambio)
handler.help = ['cambio'];
handler.tags = ['tools'];
handler.command = /^(cambio|convertir|moneda|exchange|convert|tasacambio)$/i;
handler.register = true;

// Configuración del handler de lista (.listamonedas)
handlerLista.help = ['listamonedas'];
handlerLista.tags = ['tools'];
handlerLista.command = /^(listamonedas|monedas|lista)$/i;
handlerLista.register = true;

// Exportar ambos handlers
export default handler;
export { handlerLista };

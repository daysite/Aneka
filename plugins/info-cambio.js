import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        // Si no hay texto, mostrar monedas disponibles
        if (!text) {
            return await mostrarListaMonedas(conn, m, usedPrefix, command);
        }

        // Comando para listar monedas
        if (text.toLowerCase() === 'lista' || text.toLowerCase() === 'monedas' || text.toLowerCase() === 'listamonedas') {
            return await mostrarListaCompleta(conn, m, usedPrefix, command);
        }
        
        // Parsear el texto del comando para conversión - MEJORADO
        let cantidad, monedaOrigen, monedaDestino;
        
        // Intentar diferentes patrones de parsing
        const patron1 = text.match(/(\d+(?:\.\d+)?)\s*([a-zA-ZÀ-ÿ]+)\s*a\s*([a-zA-ZÀ-ÿ\s]+)/i);
        const patron2 = text.match(/(\d+(?:\.\d+)?)\s*([a-zA-ZÀ-ÿ\s]+)\s+a\s+([a-zA-ZÀ-ÿ]+)/i);
        const patron3 = text.match(/(\d+(?:\.\d+)?)\s*([a-zA-ZÀ-ÿ\s]+)\s+a\s+([a-zA-ZÀ-ÿ\s]+)/i);
        
        const match = patron1 || patron2 || patron3;
        
        if (!match) throw `*❌ Formato incorrecto.*\n*✅ Usa:* ${usedPrefix + command} [cantidad] [moneda] a [moneda]\n*📋 O usa:* ${usedPrefix + command} lista`;
        
        cantidad = parseFloat(match[1]);
        monedaOrigen = match[2].toUpperCase().trim();
        monedaDestino = match[3].toUpperCase().trim();
        
        // Validar cantidad
        if (isNaN(cantidad) || cantidad <= 0) throw '❌ La cantidad debe ser un número positivo';
        
        // Mapeo de nombres de monedas a códigos - MEJORADO
        const monedasMap = {
            // Perú
            'SOLES': 'PEN', 'SOL': 'PEN', 'PEN': 'PEN', 'PEN.': 'PEN',
            // Argentina - MEJORADO
            'PESOS': 'ARS', 'PESO': 'ARS', 'ARGENTINOS': 'ARS', 'ARS': 'ARS', 
            'PESOS ARGENTINOS': 'ARS', 'PESO ARGENTINO': 'ARS',
            // USA
            'DOLARES': 'USD', 'DOLAR': 'USD', 'USD': 'USD', 'USDT': 'USD', 'DÓLARES': 'USD', 'DÓLAR': 'USD',
            // Europa
            'EUROS': 'EUR', 'EURO': 'EUR', 'EUR': 'EUR',
            // Brasil
            'REALES': 'BRL', 'REAL': 'BRL', 'BRL': 'BRL',
            // México
            'PESOSMEXICANOS': 'MXN', 'MEXICANOS': 'MXN', 'MXN': 'MXN', 'PESOS MEXICANOS': 'MXN',
            // Bolivia
            'BOLIVIANOS': 'BOB', 'BOLIVIANO': 'BOB', 'BOB': 'BOB',
            // Chile
            'PESOSCHILENOS': 'CLP', 'CHILENOS': 'CLP', 'CLP': 'CLP', 'PESOS CHILENOS': 'CLP',
            // Uruguay
            'PESOSURUGUAYOS': 'UYU', 'URUGUAYOS': 'UYU', 'UYU': 'UYU', 'PESOS URUGUAYOS': 'UYU',
            // Paraguay
            'GUARANIES': 'PYG', 'GUARANI': 'PYG', 'PARAGUAYOS': 'PYG', 'PYG': 'PYG', 'GUARANÍES': 'PYG', 'GUARANÍ': 'PYG',
            // Colombia
            'PESCOLOMBIANOS': 'COP', 'COLOMBIANOS': 'COP', 'COP': 'COP', 'PESOS COLOMBIANOS': 'COP'
        };
        
        // Buscar coincidencia exacta primero, luego por palabras individuales
        let codigoOrigen = monedasMap[monedaOrigen];
        let codigoDestino = monedasMap[monedaDestino];
        
        // Si no encuentra coincidencia exacta, buscar por palabras clave
        if (!codigoOrigen) {
            codigoOrigen = buscarMonedaPorPalabras(monedaOrigen, monedasMap);
        }
        if (!codigoDestino) {
            codigoDestino = buscarMonedaPorPalabras(monedaDestino, monedasMap);
        }
        
        // Validar monedas soportadas
        const monedasSoportadas = ['PEN', 'ARS', 'USD', 'EUR', 'BRL', 'MXN', 'BOB', 'CLP', 'UYU', 'PYG', 'COP'];
        if (!codigoOrigen || !monedasSoportadas.includes(codigoOrigen)) {
            throw `❌ Moneda de origen no soportada: ${monedaOrigen}\n📋 Usa: ${usedPrefix + command} lista`;
        }
        if (!codigoDestino || !monedasSoportadas.includes(codigoDestino)) {
            throw `❌ Moneda de destino no soportada: ${monedaDestino}\n📋 Usa: ${usedPrefix + command} lista`;
        }
        
        // Obtener tasa de cambio
        const resultado = await obtenerTasaCambio(cantidad, codigoOrigen, codigoDestino);
        
        // Formatear números grandes con separadores de miles
        const formatoNumero = (num) => {
            return parseFloat(num).toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        };
        
        // Cargar la imagen personalizada
        const imagen = await fetch('https://files.catbox.moe/5w8szu.jpg');
        const buffer = await imagen.buffer();
        
        // Enviar resultado con la imagen personalizada
        await conn.sendMessage(m.chat, {
            image: buffer,
            caption: `💱 *CONVERSIÓN DE MONEDAS* 💱\n\n` +
                     `🪙 *${formatoNumero(cantidad)} ${codigoOrigen}* = *${formatoNumero(resultado.convertido)} ${codigoDestino}*\n\n` +
                     `📊 *Tasa de cambio:* 1 ${codigoOrigen} = ${resultado.tasa} ${codigoDestino}\n` +
                     `🕐 *Actualizado:* ${resultado.fecha}\n\n` +
                     `💡 *Tip:* Usa "${usedPrefix + command} lista" para ver todas las monedas`
        }, { quoted: m });
        
    } catch (error) {
        console.error(error);
        const imagen = await fetch('https://files.catbox.moe/5w8szu.jpg');
        const buffer = await imagen.buffer();
        
        await conn.sendMessage(m.chat, { 
            image: buffer,
            caption: `❌ *Error:* ${error.message || error}\n\n💡 *Ejemplos de uso:*\n• ${usedPrefix + command} 20 soles a pesos argentinos\n• ${usedPrefix + command} lista` 
        }, { quoted: m });
    }
};

// Función para buscar moneda por palabras clave
function buscarMonedaPorPalabras(texto, monedasMap) {
    const palabras = texto.split(' ');
    
    for (const palabra of palabras) {
        for (const [key, value] of Object.entries(monedasMap)) {
            if (key.includes(palabra) || palabra.includes(key)) {
                return value;
            }
        }
    }
    
    return null;
}

// Función para mostrar lista de monedas
async function mostrarListaMonedas(conn, m, usedPrefix, command) {
    const listaMonedas = `💱 *CONVERSOR DE MONEDAS* 💱\n\n` +
                        `📋 *MONEDAS DISPONIBLES:*\n\n` +
                        `🇵🇪 *PEN* - Sol Peruano (soles)\n` +
                        `🇦🇷 *ARS* - Peso Argentino (pesos argentinos)\n` +
                        `🇺🇸 *USD* - Dólar Americano (dólares)\n` +
                        `🇪🇺 *EUR* - Euro (euros)\n` +
                        `🇧🇷 *BRL* - Real Brasileño (reales)\n` +
                        `🇲🇽 *MXN* - Peso Mexicano (pesos mexicanos)\n` +
                        `🇧🇴 *BOB* - Boliviano (bolivianos)\n` +
                        `🇨🇱 *CLP* - Peso Chileno (pesos chilenos)\n` +
                        `🇺🇾 *UYU* - Peso Uruguayo (pesos uruguayos)\n` +
                        `🇵🇾 *PYG* - Guaraní Paraguayo (guaraníes)\n` +
                        `🇨🇴 *COP* - Peso Colombiano (pesos colombianos)\n\n` +
                        `💡 *Ejemplos de uso:*\n` +
                        `• ${usedPrefix + command} 20 soles a pesos argentinos\n` +
                        `• ${usedPrefix + command} 50 usd a bolivianos\n` +
                        `• ${usedPrefix + command} 100000 pesos chilenos a soles\n\n` +
                        `📝 *Usa:* ${usedPrefix + command} lista *para ver más detalles*`;
    
    const imagen = await fetch('https://files.catbox.moe/5w8szu.jpg');
    const buffer = await imagen.buffer();
    
    return await conn.sendMessage(m.chat, {
        image: buffer,
        caption: listaMonedas
    }, { quoted: m });
}

// Función para mostrar lista completa
async function mostrarListaCompleta(conn, m, usedPrefix, command) {
    const listaMonedas = `📋 *LISTA COMPLETA DE MONEDAS:*\n\n` +
                        `🇵🇪 *PEN* - Sol Peruano\n` +
                        `   → soles, sol, pen\n\n` +
                        `🇦🇷 *ARS* - Peso Argentino\n` +
                        `   → pesos argentinos, peso argentino, ars\n\n` +
                        `🇺🇸 *USD* - Dólar Americano\n` +
                        `   → dólares, dólar, usd, dolar, dolares\n\n` +
                        `🇪🇺 *EUR* - Euro\n` +
                        `   → euros, euro, eur\n\n` +
                        `🇧🇷 *BRL* - Real Brasileño\n` +
                        `   → reales, real, brl\n\n` +
                        `🇲🇽 *MXN* - Peso Mexicano\n` +
                        `   → pesos mexicanos, mexicanos, mxn\n\n` +
                        `🇧🇴 *BOB* - Boliviano\n` +
                        `   → bolivianos, boliviano, bob\n\n` +
                        `🇨🇱 *CLP* - Peso Chileno\n` +
                        `   → pesos chilenos, chilenos, clp\n\n` +
                        `🇺🇾 *UYU* - Peso Uruguayo\n` +
                        `   → pesos uruguayos, uruguayos, uyu\n\n` +
                        `🇵🇾 *PYG* - Guaraní Paraguayo\n` +
                        `   → guaraníes, guaraní, paraguayos, pyg\n\n` +
                        `🇨🇴 *COP* - Peso Colombiano\n` +
                        `   → pesos colombianos, colombianos, cop\n\n` +
                        `💡 *Ejemplos:*\n` +
                        `• ${usedPrefix + command} 5000 soles a pesos argentinos\n` +
                        `• ${usedPrefix + command} 100 usd a bolivianos\n` +
                        `• ${usedPrefix + command} 50000 pesos chilenos a soles`;
    
    const imagen = await fetch('https://files.catbox.moe/5w8szu.jpg');
    const buffer = await imagen.buffer();
    
    return await conn.sendMessage(m.chat, {
        image: buffer,
        caption: listaMonedas
    }, { quoted: m });
}

// Función para obtener tasa de cambio (igual que antes)
async function obtenerTasaCambio(cantidad, desde, hacia) {
    try {
        // Usar API de exchangerate-api (gratuita)
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
        // Fallback con tasas predefinidas si la API falla
        console.log('API falló, usando tasas predefinidas');
        const tasasPredefinidas = {
            'PEN': { 
                'ARS': 220.50, 'USD': 0.27, 'EUR': 0.25, 'BRL': 1.35, 'MXN': 4.52,
                'BOB': 1.86, 'CLP': 245.80, 'UYU': 10.45, 'PYG': 1985.75, 'COP': 1080.30
            },
            'USD': { 
                'PEN': 3.70, 'ARS': 815.25, 'EUR': 0.92, 'BRL': 4.98, 'MXN': 16.75,
                'BOB': 6.89, 'CLP': 910.45, 'UYU': 38.65, 'PYG': 7345.80, 'COP': 3995.50
            },
            'ARS': { 
                'PEN': 0.0045, 'USD': 0.00123, 'EUR': 0.00113, 'BRL': 0.0061, 'MXN': 0.0205,
                'BOB': 0.0084, 'CLP': 1.115, 'UYU': 0.0474, 'PYG': 9.012, 'COP': 4.902
            }
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

handler.help = ['cambio'];
handler.tags = ['tools'];
handler.command = /^(cambio|convertir|moneda|exchange|convert|tasacambio)$/i;
handler.register = true;

export default handler;

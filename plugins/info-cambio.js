import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        // Si no hay texto, mostrar monedas disponibles
        if (!text) {
            const listaMonedas = `💱 *CONVERSOR DE MONEDAS* 💱\n\n` +
                                `📋 *MONEDAS DISPONIBLES:*\n\n` +
                                `🇵🇪 *PEN* - Sol Peruano\n` +
                                `🇦🇷 *ARS* - Peso Argentino\n` +
                                `🇺🇸 *USD* - Dólar Americano\n` +
                                `🇪🇺 *EUR* - Euro\n` +
                                `🇧🇷 *BRL* - Real Brasileño\n` +
                                `🇲🇽 *MXN* - Peso Mexicano\n` +
                                `🇧🇴 *BOB* - Boliviano Boliviano\n` +
                                `🇨🇱 *CLP* - Peso Chileno\n` +
                                `🇺🇾 *UYU* - Peso Uruguayo\n` +
                                `🇵🇾 *PYG* - Guaraní Paraguayo\n` +
                                `🇨🇴 *COP* - Peso Colombiano\n\n` +
                                `💡 *Ejemplos de uso:*\n` +
                                `• ${usedPrefix + command} 20 soles a pesos argentinos\n` +
                                `• ${usedPrefix + command} 50 usd a bolivianos\n` +
                                `• ${usedPrefix + command} 100000 pesos chilenos a soles\n\n` +
                                `🔄 *Formato:* [cantidad] [moneda] a [moneda]`;
            
            const imagen = await fetch('https://files.catbox.moe/5w8szu.jpg');
            const buffer = await imagen.buffer();
            
            return await conn.sendMessage(m.chat, {
                image: buffer,
                caption: listaMonedas
            }, { quoted: m });
        }

        // Comando para listar monedas
        if (text.toLowerCase() === 'lista' || text.toLowerCase() === 'monedas') {
            const listaMonedas = `📋 *LISTA COMPLETA DE MONEDAS:*\n\n` +
                                `🇵🇪 PEN - Sol Peruano (Soles)\n` +
                                `🇦🇷 ARS - Peso Argentino (Pesos Argentinos)\n` +
                                `🇺🇸 USD - Dólar Americano (Dólares, USD)\n` +
                                `🇪🇺 EUR - Euro (Euros)\n` +
                                `🇧🇷 BRL - Real Brasileño (Reales)\n` +
                                `🇲🇽 MXN - Peso Mexicano (Pesos Mexicanos)\n` +
                                `🇧🇴 BOB - Boliviano Boliviano (Bolivianos)\n` +
                                `🇨🇱 CLP - Peso Chileno (Pesos Chilenos)\n` +
                                `🇺🇾 UYU - Peso Uruguayo (Pesos Uruguayos)\n` +
                                `🇵🇾 PYG - Guaraní Paraguayo (Guaraníes)\n` +
                                `🇨🇴 COP - Peso Colombiano (Pesos Colombianos)\n\n` +
                                `💡 Usa: ${usedPrefix + command} [cantidad] [moneda] a [moneda]`;
            
            const imagen = await fetch('https://files.catbox.moe/5w8szu.jpg');
            const buffer = await imagen.buffer();
            
            return await conn.sendMessage(m.chat, {
                image: buffer,
                caption: listaMonedas
            }, { quoted: m });
        }
        
        // Parsear el texto del comando para conversión
        const match = text.match(/(\d+(?:\.\d+)?)\s*([a-zA-ZÀ-ÿ\s]+)\s+a\s+([a-zA-ZÀ-ÿ\s]+)/i);
        if (!match) throw `*❌ Formato incorrecto.*\n*✅ Usa:* ${usedPrefix + command} [cantidad] [moneda] a [moneda]\n*📋 O usa:* ${usedPrefix + command} lista`;
        
        const cantidad = parseFloat(match[1]);
        const monedaOrigen = match[2].toUpperCase().trim();
        const monedaDestino = match[3].toUpperCase().trim();
        
        // Validar cantidad
        if (isNaN(cantidad) || cantidad <= 0) throw '❌ La cantidad debe ser un número positivo';
        
        // Mapeo de nombres de monedas a códigos
        const monedasMap = {
            // Perú
            'SOLES': 'PEN', 'SOL': 'PEN', 'PEN': 'PEN',
            // Argentina
            'PESOS': 'ARS', 'PESO': 'ARS', 'ARGENTINOS': 'ARS', 'ARS': 'ARS',
            // USA
            'DOLARES': 'USD', 'DOLAR': 'USD', 'USD': 'USD', 'USDT': 'USD',
            // Europa
            'EUROS': 'EUR', 'EURO': 'EUR', 'EUR': 'EUR',
            // Brasil
            'REALES': 'BRL', 'REAL': 'BRL', 'BRL': 'BRL',
            // México
            'PESOSMEXICANOS': 'MXN', 'MEXICANOS': 'MXN', 'MXN': 'MXN',
            // Bolivia
            'BOLIVIANOS': 'BOB', 'BOLIVIANO': 'BOB', 'BOB': 'BOB',
            // Chile
            'PESOSCHILENOS': 'CLP', 'CHILENOS': 'CLP', 'CLP': 'CLP',
            // Uruguay
            'PESOSURUGUAYOS': 'UYU', 'URUGUAYOS': 'UYU', 'UYU': 'UYU',
            // Paraguay
            'GUARANIES': 'PYG', 'GUARANI': 'PYG', 'PARAGUAYOS': 'PYG', 'PYG': 'PYG',
            // Colombia
            'PESCOLOMBIANOS': 'COP', 'COLOMBIANOS': 'COP', 'COP': 'COP'
        };
        
        const codigoOrigen = monedasMap[monedaOrigen] || monedaOrigen;
        const codigoDestino = monedasMap[monedaDestino] || monedaDestino;
        
        // Validar monedas soportadas
        const monedasSoportadas = ['PEN', 'ARS', 'USD', 'EUR', 'BRL', 'MXN', 'BOB', 'CLP', 'UYU', 'PYG', 'COP'];
        if (!monedasSoportadas.includes(codigoOrigen)) throw `❌ Moneda de origen no soportada: ${monedaOrigen}\n📋 Usa: ${usedPrefix + command} lista`;
        if (!monedasSoportadas.includes(codigoDestino)) throw `❌ Moneda de destino no soportada: ${monedaDestino}\n📋 Usa: ${usedPrefix + command} lista`;
        
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

// Función para obtener tasa de cambio
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
            },
            'BOB': {
                'PEN': 0.538, 'USD': 0.145, 'ARS': 119.05, 'EUR': 0.134, 'BRL': 0.722,
                'CLP': 132.15, 'UYU': 5.615, 'PYG': 1066.85, 'COP': 580.25
            },
            'CLP': {
                'PEN': 0.00407, 'USD': 0.00110, 'ARS': 0.897, 'EUR': 0.00101, 'BRL': 0.00546,
                'BOB': 0.00757, 'UYU': 0.0425, 'PYG': 8.075, 'COP': 4.392
            },
            'UYU': {
                'PEN': 0.0957, 'USD': 0.0259, 'ARS': 21.10, 'EUR': 0.0238, 'BRL': 0.1285,
                'BOB': 0.1781, 'CLP': 23.53, 'PYG': 190.15, 'COP': 103.42
            },
            'PYG': {
                'PEN': 0.000503, 'USD': 0.000136, 'ARS': 0.111, 'EUR': 0.000125, 'BRL': 0.000675,
                'BOB': 0.000937, 'CLP': 0.1238, 'UYU': 0.00526, 'COP': 0.543
            },
            'COP': {
                'PEN': 0.000926, 'USD': 0.000250, 'ARS': 0.204, 'EUR': 0.000230, 'BRL': 0.001242,
                'BOB': 0.001723, 'CLP': 0.2277, 'UYU': 0.00967, 'PYG': 1.841
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

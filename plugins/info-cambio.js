import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        // Verificar si se proporcionó texto
        if (!text) throw `*❌ Ejemplo de uso:*\n${usedPrefix + command} 20 soles a pesos argentinos\n${usedPrefix + command} 50 usd a pen`;
        
        // Parsear el texto del comando
        const match = text.match(/(\d+(?:\.\d+)?)\s*([a-zA-Z]+)\s*a\s*([a-zA-Z]+)/i);
        if (!match) throw `*❌ Formato incorrecto.*\n*✅ Usa:* ${usedPrefix + command} [cantidad] [moneda] a [moneda]`;
        
        const cantidad = parseFloat(match[1]);
        const monedaOrigen = match[2].toUpperCase();
        const monedaDestino = match[3].toUpperCase();
        
        // Validar cantidad
        if (isNaN(cantidad) || cantidad <= 0) throw '❌ La cantidad debe ser un número positivo';
        
        // Mapeo de nombres de monedas a códigos
        const monedasMap = {
            'SOLES': 'PEN', 'SOL': 'PEN', 'PEN': 'PEN',
            'PESOS': 'ARS', 'PESO': 'ARS', 'ARGENTINOS': 'ARS', 'ARS': 'ARS',
            'DOLARES': 'USD', 'DOLAR': 'USD', 'USD': 'USD', 'USDT': 'USD',
            'EUROS': 'EUR', 'EURO': 'EUR', 'EUR': 'EUR',
            'REALES': 'BRL', 'REAL': 'BRL', 'BRL': 'BRL',
            'PESOSMEXICANOS': 'MXN', 'MXN': 'MXN'
        };
        
        const codigoOrigen = monedasMap[monedaOrigen] || monedaOrigen;
        const codigoDestino = monedasMap[monedaDestino] || monedaDestino;
        
        // Validar monedas soportadas
        const monedasSoportadas = ['PEN', 'ARS', 'USD', 'EUR', 'BRL', 'MXN'];
        if (!monedasSoportadas.includes(codigoOrigen)) throw `❌ Moneda de origen no soportada: ${monedaOrigen}`;
        if (!monedasSoportadas.includes(codigoDestino)) throw `❌ Moneda de destino no soportada: ${monedaDestino}`;
        
        // Obtener tasa de cambio
        const resultado = await obtenerTasaCambio(cantidad, codigoOrigen, codigoDestino);
        
        // Cargar la imagen personalizada
        const imagen = await fetch('https://files.catbox.moe/5w8szu.jpg');
        const buffer = await imagen.buffer();
        
        // Enviar resultado con la imagen personalizada
        await conn.sendMessage(m.chat, {
            image: buffer,
            caption: `💱 *CONVERSIÓN DE MONEDAS* 💱\n\n` +
                     `🪙 *${cantidad} ${codigoOrigen}* = *${resultado.convertido} ${codigoDestino}*\n\n` +
                     `📊 *Tasa de cambio:* 1 ${codigoOrigen} = ${resultado.tasa} ${codigoDestino}\n` +
                     `🕐 *Actualizado:* ${resultado.fecha}\n\n` +
                     `💡 *Tip:* Usa el formato: .cambio [cantidad] [moneda] a [moneda]`
        }, { quoted: m });
        
    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, { 
            text: `❌ *Error:* ${error.message || error}\n\n💡 *Ejemplo de uso:*\n${usedPrefix + command} 20 soles a pesos argentinos` 
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
        const convertido = (cantidad * tasa).toFixed(2);
        
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
            'PEN': { 'ARS': 220.50, 'USD': 0.27, 'EUR': 0.25, 'BRL': 1.35, 'MXN': 4.52 },
            'USD': { 'PEN': 3.70, 'ARS': 815.25, 'EUR': 0.92, 'BRL': 4.98, 'MXN': 16.75 },
            'ARS': { 'PEN': 0.0045, 'USD': 0.00123, 'EUR': 0.00113, 'BRL': 0.0061, 'MXN': 0.0205 },
            'EUR': { 'PEN': 4.02, 'USD': 1.09, 'ARS': 887.50, 'BRL': 5.42, 'MXN': 18.20 },
            'BRL': { 'PEN': 0.74, 'USD': 0.20, 'ARS': 163.80, 'EUR': 0.184, 'MXN': 3.36 },
            'MXN': { 'PEN': 0.221, 'USD': 0.060, 'ARS': 48.75, 'EUR': 0.055, 'BRL': 0.298 }
        };
        
        if (!tasasPredefinidas[desde] || !tasasPredefinidas[desde][hacia]) {
            throw new Error('Tasa de cambio no disponible');
        }
        
        const tasa = tasasPredefinidas[desde][hacia];
        const convertido = (cantidad * tasa).toFixed(2);
        
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
handler.command = /^(cambio|convertir|moneda|exchange|convert)$/i;
handler.register = true;

export default handler;

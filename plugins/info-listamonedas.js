import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix }) => {
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
                        `• ${usedPrefix}cambio 50000 pesos chilenos a soles\n\n` +
                        `🔄 *Formato:* .cambio [cantidad] [moneda] a [moneda]`;
    
    const imagen = await fetch('https://files.catbox.moe/rig7ct.jpg');
    const buffer = await imagen.buffer();
    
    await conn.sendMessage(m.chat, {
        image: buffer,
        caption: listaMonedas
    }, { quoted: m });
};

handler.help = ['listamonedas'];
handler.tags = ['tools'];
handler.command = /^(listamonedas|monedas|lista|currencylist)$/i;
handler.register = true;

export default handler;

import { sticker } from '../lib/sticker.js';
import axios from 'axios';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchSticker = async (text, attempt = 1) => {
    try {
        const res = await axios.get('https://kepolu-brat.hf.space/brat', {
            params: { q: text },
            responseType: 'arraybuffer',
        });
        return res.data;
    } catch (err) {
        if (err.response?.status === 429 && attempt <= 3) {
            const retryAfter = err.response.headers['retry-after'] || 5;
            await delay(retryAfter * 1000);
            return fetchSticker(text, attempt + 1);
        }
        throw err;
    }
};

let handler = async (m, { conn, text }) => {
    if (!text) {
        await m.react('⌛')
        return conn.sendMessage(m.chat, {
            text: `🍟. Ingrese el texto para hacer el sticker`,
        }, { quoted: m });
    }

    // Reacciona con ⏳ al iniciar el procesamiento
    await m.react('⏳')

    try {
        const buffer = await fetchSticker(text);
        const stiker = await sticker(buffer, false,
'propietario del bot:\nLucxxs.qzy x Aneka\n\n', global.botname, '\n\n', global.authN);

        if (stiker) {
            // Reacciona con ✅ al enviar el sticker exitosamente
            await m.react('✅')
            return conn.sendFile(m.chat, stiker, 'brat.webp', '', m);
        } else {
            throw new Error('No se pudo generar el sticker. ¿Qué texto tan feo pusiste? 🤨');
        }
    } catch (err) {
        // Reacciona con 💀 si hay error
        await m.react('💀')
        console.error(err);
        return conn.sendMessage(m.chat, {
            text: `💀 Error al generar el sticker:\n${err.message || 'Algo salió mal, como tú.'}`,
        }, { quoted: m });
    }
};

handler.command = ['brat'];
handler.tags = ['sticker'];
handler.help = ['brat *<texto>*'];

export default handler;

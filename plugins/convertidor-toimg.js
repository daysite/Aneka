import { webp2png } from '../lib/webp2mp4.js';

const handler = async (m, { conn, usedPrefix, command }) => {
  try {
    if (!m.quoted) throw `*${xconverter} Responde a un sticker con el comando ${usedPrefix + command} para convertirlo en imagen.*`;

    const q = m.quoted;
    const mime = q.mimetype || '';

    if (!mime.includes('webp')) throw '*⚠️ El archivo adjunto no es un sticker.*';
    
    // Verificar si es sticker animado
    if (q.isAnimated) throw '*⚠️ No se pueden convertir stickers animados. Solo stickers estáticos.*';

    const media = await q.download();
    if (!media) throw '```✖️ No se pudo descargar el sticker```';

    const out = await webp2png(media).catch(() => null);
    if (!out || out.length === 0) throw '*✖️ No se pudo convertir el sticker en imagen.*';

    await conn.sendFile(m.chat, out, 'sticker.png', '*Aquí tienes tu imagen!*', m);
  } catch (error) {
    m.reply(error.toString());
  }
};

handler.help = ['toimg'];
handler.tags = ['converter'];
handler.command = ['toimg', 'jpg', 'img'];

export default handler;
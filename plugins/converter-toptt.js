import { toAudio } from '../lib/converter.js';

const handler = async (m, { conn, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q || q.msg).mimetype || q.mediaType || '';

  if (!/video|audio/.test(mime)) {
    return conn.reply(m.chat, `*${xconverter} Responda al video o nota de voz con el comando .ptt para convertirlo en nota de voz.*`, m);
  }

  const media = await q.download();
  if (!media) {
    return conn.reply(m.chat, '```⚠️ Ocurrió un error al descargar el archivo.```', m);
  }

  const audio = await toAudio(media, 'mp4');
  if (!audio.data) {
    return conn.reply(m.chat, '```⚠️ Ocurrió un error al convertir el archivo a nota de voz.```', m);
  }

  conn.sendMessage(m.chat, {
    audio: audio.data,
    mimetype: 'audio/mpeg',
    ptt: true // <- Xe Boludo
  }, {
    quoted: fkontak
  });
};

handler.help = ['toptt'];
handler.command = ['ptt', 'toptt', 'toopus'];
handler.tags = ['converter'];

export default handler;
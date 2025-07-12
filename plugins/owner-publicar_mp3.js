import { toAudio } from '../lib/converter.js';

const handler = async (m, { conn, usedPrefix, command }) => {
  const canalJid = '120363318267632676@newsletter';

  const q = m.quoted ? m.quoted : m;
  const mime = (q || q.msg).mimetype || q.mediaType || '';

  if (!/video|audio/.test(mime)) {
    return conn.reply(m.chat, `*${xowner} Responda al video o audio para publicarlo directamente en el canal como mp3.*`, m);
  }

  const media = await q.download();
  if (!media) {
    return conn.reply(m.chat, '⚠️ Ocurrió un error al descargar el archivo.', m);
  }

  const audio = await toAudio(media, 'mp4');
  if (!audio.data) {
    return conn.reply(m.chat, '⚠️ Ocurrió un error al convertir el archivo a nota de voz.', m);
  }

  const audioMessage = {
    audio: audio.data,
    mimetype: 'audio/mpeg',
    ptt: true
  };

  // 📤 Channel
  await conn.sendMessage(canalJid, audioMessage, { quoted: fkontak });

  await conn.reply(m.chat, '*✅ Audio publicado en el canal*', m);
};

handler.help = ['post2'];
handler.tags = ['owner'];
handler.command = ['publicar2', 'send2', 'post2'];
handler.rowner = true;

export default handler;
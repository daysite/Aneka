import {toAudio} from '../lib/converter.js';

const handler = async (m, {conn, usedPrefix, command}) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q || q.msg).mimetype || q.mediaType || '';

  if (!/video|audio/.test(mime)) {
    return conn.reply(m.chat, `*${xconverter} Responda al video o nota de voz con el comando .tomp3 para convertirlo en audio.*`, m);
  }

  const media = await q.download();
  if (!media) {
    return conn.reply(m.chat, '```⚠️ Ocurrio un error al descargar su video.```', m);
  }

  const audio = await toAudio(media, 'mp4');
  if (!audio.data) {
    return conn.reply(m.chat, '```⚠️ Ocurrio un error al convertir su nota de voz a Audio/MP3.```', m);
  }

  conn.sendMessage(m.chat, {audio: audio.data, mimetype: 'audio/mpeg'}, {quoted: fkontak});
};

handler.help = ['toaudio'];
handler.command = ['tomp3', 'toaudio', 'toaud'];
handler.tags = ['coverter'];

export default handler;
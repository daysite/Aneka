
/*
// By WillZek
import yts from 'yt-search';

const estados = {};
const TIEMPO_ESPERA = 120000;

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) return m.reply(`*${xdownload} Por favor, ingresa un texto para buscar en YouTube.*\n> Ejemplo: ${usedPrefix + command} shadow garden edits`);

  const search = await yts(text);
  const video = search.videos[0];
  if (!video) return m.reply('❌ Video no encontrado.');

  if (estados[m.sender]) clearTimeout(estados[m.sender].timeout);

  estados[m.sender] = {
    step: 'esperando_tipo',
    videoInfo: video,
    command,
    intentos: 0,
    timeout: setTimeout(() => {
      delete estados[m.sender];
    }, TIEMPO_ESPERA)
  };

  let info = `\`\`\`◜YouTube - Download◞\`\`\`

${video.title}

≡ *☕ \`Autor:\`* ${video.author.name}
≡ *🍮 \`Duración:\`* ${video.timestamp}
≡ *🥞 \`Fecha:\`* ${video.ago}
≡ *☁️ \`Vistas:\`* ${video.views.toLocaleString()}
≡ *📡 \`Canal:\`* ${video.author?.url?.replace('https://', '') || 'Desconocido'}

> » Responde 1 para Audio
> » Responde 2 para Vídeo`;

  await conn.sendMessage(m.chat, { image: { url: video.thumbnail }, caption: info }, { quoted: m });
};

handler.before = async (m, { conn, usedPrefix }) => {
  const estado = estados[m.sender];
  if (!estado) return false;

  if (estado.step === 'esperando_tipo') {
    const resp = (m.text || '').trim();

    if (resp === '1' || resp === '1️⃣') {
      clearTimeout(estado.timeout);
      await conn.sendMessage(m.chat, { react: { text: "🎶", key: m.key } });
      await conn.fakeReply(
        m.chat,
        `#ytmp3 ${estado.videoInfo.url}`,
        m.sender,
        'Procesando audio 🎶'
      );
      delete estados[m.sender];
      return true;
    }

    if (resp === '2' || resp === '2️⃣') {
      clearTimeout(estado.timeout);
      await conn.sendMessage(m.chat, { react: { text: "📹", key: m.key } });
      await conn.fakeReply(
        m.chat,
        `#ytmp4 ${estado.videoInfo.url}`,
        m.sender,
        'Procesando vídeo 📹'
      );
      delete estados[m.sender];
      return true;
    }

    estado.intentos = (estado.intentos || 0) + 1;
    if (estado.intentos <= 1) {
      await m.reply('☁️ Por favor responde con 1 (audio) o 2 (vídeo), o reacciona con 1️⃣ o 2️⃣.');
    }
    return true;
  }

  return false;
};

handler.command = ['playtes', 'musicdl'];

export default handler;*/



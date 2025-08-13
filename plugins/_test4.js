// By WillZek
import fetch from 'node-fetch';
import yts from 'yt-search';

const estados = {};
const TIEMPO_ESPERA = 120000;

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) return m.reply(`*${xdownload} Por favor, ingresa un texto para buscar en YouTube\n> \`Ejemplo:\` ${usedPrefix + command} shadow garden edits`);

  const search = await yts(text);
  const video = search.videos[0];
  if (!video) return m.reply('*Video no encontrado.*');

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
≡ *🥞 \`Fecha:\`*${video.ago}
≡ *☁️ \`Vistas:\`* ${video.views.toLocaleString()}\n\n> » Responde 1 para Audio\n> » Responde 2 para vídeo`;

  await conn.sendMessage(m.chat, { image: { url: video.thumbnail }, caption: info }, { quoted: m });
};

handler.before = async (m, { conn }) => {
  const estado = estados[m.sender];
  if (!estado) return false;

  if (estado.step === 'esperando_tipo') {
    const resp = (m.text || '').trim();

    if (resp === '1' || resp === '1️⃣') {
      clearTimeout(estado.timeout);
      await m.react ('🎶');
      await enviarArchivo(m, conn, estado.videoInfo.url, 'mp3', estado.videoInfo.title);
      delete estados[m.sender];
      return true;
    }

    if (resp === '2' || resp === '2️⃣') {
      clearTimeout(estado.timeout);
      await m.react('📹');
      await enviarArchivo(m, conn, estado.videoInfo.url, 'mp4', estado.videoInfo.title);
      delete estados[m.sender];
      return true;
    }

    estado.intentos = (estado.intentos || 0) + 1;
    if (estado.intentos <= 1) {
      await m.reply('*☁️ Por favor responde con 1 (audio) o 2 (vídeo), o reacciona con 1️⃣ o 2️⃣.');
    }
    return true;
  }

  return false;
};

async function enviarArchivo(m, conn, url, tipo, titulo) {
  const sendDoc = async (fileUrl, fileName, mimetype) => {
    await conn.sendMessage(m.chat, { document: { url: fileUrl }, fileName, caption: `Archivo descargado para: ${titulo}`, mimetype }, { quoted: m });
  };

  try {
    const apiUrl = tipo === 'mp3'
      ? `https://api.stellarwa.xyz/dow/ytmp3?url=${encodeURIComponent(url)}&apikey=BrunoSobrino`
      : `https://api.stellarwa.xyz/dow/ytmp4?url=${encodeURIComponent(url)}&apikey=BrunoSobrino`;

    const res = await fetch(apiUrl);
    const json = await res.json();
    const link = json?.result?.dl || json?.data?.dl;

    if (!link) throw new Error('No hay URL de descarga');

    await sendDoc(link, `${titulo}.${tipo}`, tipo === 'mp3' ? 'audio/mpeg' : 'video/mp4');
  } catch (e) {
    await m.reply(`💤 Error descargando el archivo.\n${e.message}`);
  }
}

//handler.tag = ['dl'];
//handler.help = ['playtes'];
handler.command = ['playtes', 'musicdl'];

export default handler;
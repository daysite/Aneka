import fetch from 'node-fetch';

const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i;

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply('🍭 Ingresa el enlace del vídeo de YouTube junto al comando.\n\n`Ejemplo:`\n' + `> *${usedPrefix + command}* https://www.youtube.com/watch?v=abc123`);
  }

  try {
    if (!regex.test(args[0])) return m.reply('❌ La URL es inválida. Asegúrate de que sea un enlace de YouTube.');

    const urlYoutube = args[0];
    const formato = 'mp4'; // Puedes cambiar a 'mp3' si quieres solo audio

    const apiUrl = `https://p.oceansaver.in/ajax/download.php?format=${formato}&url=${encodeURIComponent(urlYoutube)}`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data.download_url) {
      return m.reply('⚠️ No se pudo obtener el enlace de descarga. Intenta con otro video.');
    }

    await conn.sendFile(m.chat, data.download_url, 'video.mp4', `✅ Aquí está tu video descargado (${formato})`, m);
  } catch (e) {
    console.error(e);
    m.reply('❌ Ocurrió un error al procesar tu solicitud.');
  }
};

//handler.help = ['ytmp4 <url youtube>'];
//handler.tags = ['downloader'];
handler.command = ['daniel'];
//handler.register = true;

export default handler;
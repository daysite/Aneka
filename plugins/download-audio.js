import fetch from "node-fetch";
import yts from 'yt-search';
import axios from "axios";

const formatAudio = ['mp3', 'm4a', 'webm', 'aac', 'flac', 'opus', 'ogg', 'wav'];

const ddownr = {
  download: async (url, format) => {
    const config = {
      method: 'GET',
      url: `https://p.oceansaver.in/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, como Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    try {
      const response = await axios.request(config);
      if (response.data && response.data.success) {
        const { id } = response.data;
        const downloadUrl = await ddownr.cekProgress(id);
        return downloadUrl;
      } else {
        throw new Error('Fallo al obtener los detalles del video.');
      }
    } catch (error) {
      throw error;
    }
  },

  cekProgress: async (id) => {
    const config = {
      method: 'GET',
      url: `https://p.oceansaver.in/ajax/progress.php?id=${encodeURIComponent(id)}`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, como Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    const start = Date.now();
    const timeout = 300000;

    try {
      while (true) {
        const response = await axios.request(config);
        if (response.data?.success && response.data.progress === 1000) {
          return response.data.download_url;
        }
        if (Date.now() - start > timeout) throw new Error('⏱ Tiempo de espera agotado.');
        await new Promise(resolve => setTimeout(resolve, 15000));
      }
    } catch (error) {
      throw error;
    }
  }
};

const handler = async (m, { conn, text, command }) => {
  try {
    if (!text.trim()) {
      return conn.reply(m.chat, `${xdownload} Por favor, ingresa el nombre del audio a descargar.`, m);
    }

    conn.reply(m.chat, `*🔍 Buscando ${text}...*`, fkontak);

    const search = await yts(text);
    if (!search.all || search.all.length === 0) {
      return m.reply('❌ No se encontraron resultados para tu búsqueda.');
    }

    const videoInfo = search.all[0];
    const { title, url, seconds } = videoInfo;

    if (seconds > 3600) {
      return m.reply('❌ El video es demasiado largo. Máximo permitido: 1 hora.');
    }

    const format = 'mp3';
    if (!formatAudio.includes(format)) {
      return m.reply(`❌ Formato no válido. Usa uno de: ${formatAudio.join(', ')}`);
    }

    const downloadUrl = await ddownr.download(url, format);

    if (downloadUrl) {
      const cleanTitle = title.replace(/[^\w\s-]/gi, '').trim().slice(0, 50).replace(/\s+/g, '_');
      const fileName = `${cleanTitle}.${format}`;

await conn.sendMessage(m.chat, {
  audio: { url: downloadUrl },
  mimetype: 'audio/mpeg',
  ptt: false
}, { quoted: m });

    } else {
      return m.reply(`❌ No se pudo descargar el audio.`);
    }
  } catch (error) {
    console.error(error);
    return m.reply(`❌ Error al procesar: ${error.message}`);
  }
};

handler.command = handler.help = ['audio'];
handler.tags = ['download'];

export default handler;

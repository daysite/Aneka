
import fetch from "node-fetch";
import yts from "yt-search";

const encodedApi = "aHR0cHM6Ly9hcGkudnJlZGVuLndlYi5pZC9hcGkveXRtcDM=";

const getApiUrl = () => Buffer.from(encodedApi, "base64").toString("utf-8");

const fetchWithRetries = async (url, maxRetries = 2) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data?.status === 200 && data.result?.download?.url) {
        return data.result;
      }
    } catch (error) {
      console.error(`Intento ${attempt + 1} fallido:`, error.message);
    }
  }
  throw new Error("No se pudo obtener la música después de varios intentos.");
};

let handler = async (m, { conn, text, usedPrefix, command }) => {

 try {
  if (!text || !text.trim()) {
    return conn.reply(m.chat, `*${xdownload} Por favor, ingresa un título o URL de YouTube.*`, m);
  }

    await conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });

    const searchResults = await yts(text.trim());
    const video = searchResults.videos[0];
    if (!video || !video.url) throw new Error("No se encontraron resultados válidos.");

    const apiUrl = `${getApiUrl()}?url=${encodeURIComponent(video.url)}`;
    const apiData = await fetchWithRetries(apiUrl);*/
/*
    const audioMessage = {
      document: { url: apiData.download.url },
      mimetype: "audio/mpeg",
      fileName: `${video.title}.mp3`,
      caption: `\`\`\`◜YouTube - MP3◞\`\`\`\n\n*${video.title}*`,
    };*/
/*
const audioMessage = {
  audio: { url: apiData.download.url },
  mimetype: "audio/mpeg",
  ptt: false, // pon true si quieres que se envíe como nota de voz
  fileName: `${video.title}.mp3`,
  contextInfo: {
    externalAdReply: {
      title: video.title,
      body: 'YouTube - MP3',
      thumbnailUrl: video.thumbnail,
      mediaType: 2,
      mediaUrl: video.url,
      sourceUrl: video.url,
      showAdAttribution: true,
    },
  },
};

    await conn.sendMessage(m.chat, audioMessage, { quoted: m });

    // Reaccionar al mensaje original con ✅
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (error) {
    console.error("Error:", error);

    // Reaccionar al mensaje original con ❌
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    await conn.reply(m.chat, `No se pudo obtener el audio. Intenta con otro título o más tarde.`, m);
  }
};

// Comando
handler.command = ['ytmp3doc'];
handler.help = ['ytmp3doc'];
handler.tags = ['descargas'];

export default handler;

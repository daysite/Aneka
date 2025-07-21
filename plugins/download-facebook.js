import { igdl } from 'ruhend-scraper';

const handler = async (m, { text, conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `*${xdownload} Por favor, ingresa un link de Facebook.*`, m);
  }

  await m.react('🕒');
  let res;
  try {
    res = await igdl(args[0]);
  } catch (error) {
    return conn.reply(m.chat, '*❌ Error al obtener el video, verifique que el enlace sea correcto*', m);
  }

  let result = res.data;
  if (!result || result.length === 0) {
    return conn.reply(m.chat, '*⚠️ No se encontraron resultados.*', m);
  }

  let data;
  try {
    data = result.find(i => i.resolution === "720p (HD)") || result.find(i => i.resolution === "360p (SD)");
  } catch (error) {
    return conn.reply(m.chat, '*❌ Error al enviar el video de Facebook*', m);
  }

  if (!data) {
    return conn.reply(m.chat, '*⚠️ No se encontró una resolución adecuada.*', m);
  }

  await m.react('✅');
  let video = data.url;
  
  try {
    await conn.sendMessage(m.chat, { video: { url: video }, caption: '\`\`\`◜Facebook - Download◞\`\`\`\n\n> © Powered by Shadow Ultra\n> Video downloaded successfully', fileName: 'fb.mp4', mimetype: 'video/mp4' }, { quoted: fkontak });
  } catch (error) {
    return conn.reply(m.chat, '*⚠️ La URL está corrupta, intenta con otra URL.*', m);
  await m.react('❌');
  }
};

handler.help = ['facebook'];
handler.tags = ['descargas']
handler.command = /^(fb|facebook|fbdl)$/i;

export default handler;                                                                                                                                                                                                                              
/*

import fetch from 'node-fetch';

const handler = async (m, { text, conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `❗️ Ingresa el link del video de Facebook.\n\n📌 Ejemplo: *${usedPrefix + command} https://www.facebook.com/watch/?v=123456789*`, m);
  }

  if (!/^https?:\/\/(www\.)?facebook\.com/.test(args[0])) {
    return conn.reply(m.chat, '❗️ El enlace proporcionado no es válido. Asegúrate de que sea un enlace de Facebook.', m);
  }

  await m.react('🕒');

  let videoData;
  try {
    const api = `https://apizell.web.id/download/facebook?url=${encodeURIComponent(args[0])}`;
    const res = await fetch(api);
    const json = await res.json();

    if (!json.success || !Array.isArray(json.download) || json.download.length === 0) {
      return conn.reply(m.chat, '⚠️ No se encontraron resultados. Asegúrate de que el enlace sea público y válido.', m);
    }

    videoData = json.download
      .sort((a, b) => parseInt(b.quality) - parseInt(a.quality))
      .find(v => v.url);

    if (!videoData) {
      return conn.reply(m.chat, '⚠️ No se encontró una calidad de video adecuada.', m);
    }
  } catch (error) {
    console.error('[ERROR Facebook Downloader]:', error.message);
    return conn.reply(m.chat, '❌ Ocurrió un error al intentar procesar el enlace. Intenta nuevamente más tarde.', m);
  }

  try {
    await conn.sendMessage(m.chat, {
      video: { url: videoData.url },
      caption: `✅ *Descarga completada*\n\n🔗 *Origen:* Facebook\n🎬 *Calidad:* ${videoData.quality}\n\nShadow Ultra Downloader`,
      fileName: 'facebook.mp4',
      mimetype: 'video/mp4'
    }, { quoted: m });

    await m.react('✅');
  } catch (e) {
    console.error('[ERROR Envío del video]:', e.message);
    await m.react('❌');
    return conn.reply(m.chat, '⚠️ La URL del vídeo parece estar corrupta o no está disponible. Intenta con otro enlace.', m);
  }
};

handler.help = ['facebook'];
handler.tags = ['descargas'];
handler.command = /^(fb|facebook|fbdl)$/i;

export default handler;*/
/* import { igdl } from 'ruhend-scraper';

const handler = async (m, { text, conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `*${xdownload} Por favor, ingresa un link de Facebook.*`, fkontak, m);
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
*/


import fetch from 'node-fetch'

const handler = async (m, { text, conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `❗️ Ingresa el link del video de Facebook.\n\n📌 Ejemplo: *${usedPrefix + command} https://www.facebook.com/watch/?v=123456789*`, m);
  }

  await m.react('🕒');

  let res, data, video;
  try {
    let api = `https://apizell.web.id/download/facebook?url=${encodeURIComponent(args[0])}`;
    res = await fetch(api);
    let json = await res.json();

    if (!json.success || !json.download || json.download.length === 0) {
      return conn.reply(m.chat, '⚠️ No se encontraron resultados. Asegúrate de que el enlace sea público y válido.', m);
    }

    // Buscar primero 720p y luego 360p
    data = json.download.find(v => v.quality.includes('720')) || json.download.find(v => v.quality.includes('360'));

    if (!data) {
      return conn.reply(m.chat, '⚠️ No se encontró una calidad de video adecuada (720p o 360p).', m);
    }

    video = data.url;

  } catch (error) {
    console.error(error)
    return conn.reply(m.chat, '❌ Error al procesar el video. Asegúrate de que el enlace sea correcto.', m);
  }

  try {
    await conn.sendMessage(m.chat, {
      video: { url: video },
      caption: '✅ *Descarga exitosa de Facebook*\n\n🎬 Shadow Ultra Downloader',
      fileName: 'facebook.mp4',
      mimetype: 'video/mp4'
    }, { quoted: m });

    await m.react('✅');
  } catch (e) {
    console.error(e);
    await m.react('❌');
    return conn.reply(m.chat, '⚠️ La URL del vídeo parece estar corrupta. Intenta con otro enlace.', m);
  }
};

handler.help = ['facebook'];
handler.tags = ['descargas'];
handler.command = /^(fb|facebook|fbdl)$/i;

export default handler;

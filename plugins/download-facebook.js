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

import { igdl } from 'ruhend-scraper';

const handler = async (m, { text, conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `*${xdownload} Por favor, ingresa un link de Facebook.*`, fkontak, m);
  }

  await m.react('🕒');

  try {
    const res = await igdl(args[0]);
    const result = res.data;

    if (!result || result.length === 0) {
      await m.react('⚠️');
      return conn.reply(m.chat, '*⚠️ No se encontraron resultados.*', m);
    }

    // Prioriza calidad HD, si no hay, usa SD
    const videoData = result.find(i => i.resolution === "720p (HD)") || result.find(i => i.resolution === "360p (SD)");

    if (!videoData || !videoData.url) {
      await m.react('⚠️');
      return conn.reply(m.chat, '*⚠️ No se encontró una resolución adecuada o enlace vacío.*', m);
    }

    // Intenta enviar el archivo de video
    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoData.url },
        caption: '```◜Facebook - Download◞```\n\n> © Powered by Shadow Ultra\n> Video descargado correctamente',
        fileName: 'fb.mp4',
        mimetype: 'video/mp4'
      },
      { quoted: fkontak }
    );

    await m.react('✅');
  } catch (err) {
    console.error('[FB ERROR]', err);
    await m.react('❌');
    return conn.reply(m.chat, '*❌ Ocurrió un error al procesar el video. Intenta con otro enlace.*', m);
  }
};

handler.help = ['facebook'];
handler.tags = ['descargas'];
handler.command = /^(fb|facebook|fbdl)$/i;

export default handler;
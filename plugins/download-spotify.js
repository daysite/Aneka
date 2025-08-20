/*import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    await m.reply(`*${xdownload} Por favor, ingresa el enlace o nombre de una canción de Spotify.*\n> *\`Ejemplo:\`* ${usedPrefix + command} Ponte bonita - Cris mj`);
    return;
  }

  await m.react('⌛');

  try {
    let ouh = await fetch(`https://api.nekorinn.my.id/downloader/spotifyplay?q=${encodeURIComponent(text)}`);
    let gyh = await ouh.json();

    if (!gyh.result || !gyh.result.downloadUrl) {
      throw new Error('No se encontró la canción o el enlace es inválido.');
    }

    await conn.sendMessage(m.chat, {
      audio: { url: gyh.result.downloadUrl },
      mimetype: 'audio/mpeg'
    }, { quoted: m });

    await m.react('✅');
  } catch (e) {
    await m.reply(`❌ Error al obtener el audio:\n${e.message}`);
    await m.react('❌');
  }
}

handler.help = ['spotify']
handler.tags = ['download']
handler.command = ['spotify', 'spotifydl', 'spdl']

export default handler*/

import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    await m.reply(`*${xdownload} Por favor, ingresa el enlace o nombre de una canción de Spotify.*\n> *\`Ejemplo:\`* ${usedPrefix + command} Ponte bonita - Cris mj`);
    return;
  }

  await m.react('⌛');

  try {
    let spotifyUrl = text.trim();

    // Detectar si es link de Spotify
    if (!spotifyUrl.startsWith('http')) {
      // Buscar canción por nombre
      let searchRes = await fetch(`https://delirius-apiofc.vercel.app/search/spotify?q=${encodeURIComponent(text)}`);
      let searchJson = await searchRes.json();

      if (!searchJson.resultado || searchJson.resultado.length === 0) {
        throw new Error('No se encontraron resultados en Spotify.');
      }

      // Tomamos el primer resultado
      spotifyUrl = searchJson.resultado[0].url;
    }

    // Descargar canción
    let ouh = await fetch(`https://api.vreden.my.id/api/spotify?url=${encodeURIComponent(spotifyUrl)}`);
    let gyh = await ouh.json();

    if (!gyh.result || !gyh.result.downloadUrl) {
      throw new Error('No se encontró la canción o el enlace es inválido.');
    }

    await conn.sendMessage(m.chat, {
      audio: { url: gyh.result.downloadUrl },
      mimetype: 'audio/mpeg',
      fileName: gyh.result.title ? `${gyh.result.title}.mp3` : 'spotify.mp3'
    }, { quoted: m });

    await m.react('✅');
  } catch (e) {
    await m.reply(`❌ Error al obtener el audio:\n${e.message}`);
    await m.react('❌');
  }
}

handler.help = ['spotify']
handler.tags = ['download']
handler.command = ['spotify', 'spotifydl', 'spdl']

export default handler
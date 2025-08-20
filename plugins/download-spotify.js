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
    await m.reply(`*${xsearch} Ingresa el nombre o link de una canción de Spotify.*\n> *\`Ejemplo:\`* ${usedPrefix + command} Quevedo - Quédate`);
    return;
  }

  await m.react('⌛');

  try {
    let spotifyUrl = text.trim();

    // Si no es un link, hacemos búsqueda
    if (!/^https?:\/\/(open\.)?spotify\.com\//i.test(spotifyUrl)) {
      let searchRes = await fetch(`https://delirius-apiofc.vercel.app/search/spotify?q=${encodeURIComponent(text)}`);
      let searchJson = await searchRes.json();
      let tracks = searchJson.data || searchJson.resultado || [];
      if (!tracks.length) throw new Error('No se encontraron resultados en Spotify.');
      spotifyUrl = tracks[0].url; // Primer resultado
    }

    // Descargar canción
    let res = await fetch(`https://api.vreden.my.id/api/spotify?url=${encodeURIComponent(spotifyUrl)}`);
    let json = await res.json();

    let info = json.result;
    if (!info) throw new Error('No se pudo obtener el audio de Spotify.');

    let caption = `乂  *S P O T I F Y*\n\n`;
    caption += `◦  *Título* : ${info.title}\n`;
    caption += `◦  *Artista* : ${info.artists}\n`;
    caption += `◦  *Tipo* : ${info.type}\n`;
    caption += `◦  *Lanzamiento* : ${info.releaseDate}\n\n`;
    caption += `> ${dev}`;

    await conn.sendMessage(m.chat, { image: { url: info.cover }, caption }, { quoted: m });

    await conn.sendMessage(m.chat, {
      document: { url: info.music },
      mimetype: 'audio/mpeg',
      fileName: `${info.title}.mp3`
    }, { quoted: m });

    await m.react('✅');
  } catch (e) {
    await m.reply(`❌ Error:\n${e.message}`);
    await m.react('❌');
  }
}

handler.help = ['spotify']
handler.tags = ['download']
handler.command = ['spotify', 'spotifydl', 'spdl']

export default handler
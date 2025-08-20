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
    await m.reply(`*${xdownload} Ingresa el nombre o link de una canción de Spotify.*\n> *\`Ejemplo:\`* ${usedPrefix + command} Darell - Caliente`)
    return
  }

  await m.react('⌛')

  try {
    let spotifyUrl = text.trim()

    // 📌 Si no es link, hacer búsqueda
    if (!/^https?:\/\/(open\.)?spotify\.com\//i.test(spotifyUrl)) {
      let searchRes = await fetch(`https://delirius-apiofc.vercel.app/search/spotify?q=${encodeURIComponent(text)}`)
      let searchJson = await searchRes.json()
      let tracks = searchJson.data || searchJson.resultado || []
      if (!tracks.length) throw new Error('No se encontraron resultados en Spotify.')
      spotifyUrl = tracks[0].url
    }

    // 📌 Llamar API de descarga
    let res = await fetch(`https://api.vreden.my.id/api/spotify?url=${encodeURIComponent(spotifyUrl)}`)
    let json = await res.json()
    let info = json?.result
    if (!info) throw new Error('No se pudo obtener datos de la canción.')

    // 📌 Fallbacks si algún campo viene vacío
    let title = info.title || 'Título desconocido'
    let artists = info.artists || 'Desconocido'
    let type = info.type || 'N/A'
    let releaseDate = info.releaseDate || 'No disponible'
    let cover = info.cover || 'https://i.ibb.co/5R5WpJx/spotify.png'
    let music = info.music || null

    // 📌 Evitar enviar audio vacío
    if (!music) throw new Error('El link de audio no está disponible.')

    let caption = `\`\`\`◜Spotify - Download◞\`\`\`\n\n`
    caption += `*${title}*\n`
    caption += `‎ ‎ׄׄ   ››  🌿  *\`Artista:\`* ${artists}\n`
    caption += `‎ ‎ׄׄ   ››  🌵  *\`Tipo:\`* ${type}\n`
    caption += `‎ ‎ׄׄ   ››  🌸  *\`Lanzamiento:\`* ${releaseDate}\n\n`
    caption += `> ${club}`

    // 📌 Preview con thumbnail
    await conn.sendMessage(m.chat, {
      text: caption,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: artists,
          thumbnailUrl: cover,
          sourceUrl: spotifyUrl,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    // 📌 Audio directo
    await conn.sendMessage(m.chat, {
      audio: { url: music },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    await m.reply(`❌ Error:\n${e.message}`)
    await m.react('❌')
  }
}

handler.help = ['spotify']
handler.tags = ['download']
handler.command = ['spotify', 'spotifydl', 'spdl']

export default handler
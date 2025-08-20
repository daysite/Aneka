import fetch from 'node-fetch'

const SPOTIFY_SEARCH_API = 'https://delirius-apiofc.vercel.app/search/spotify?q='
const SPOTIFY_DL_API = 'https://api.vreden.my.id/api/spotify?url='
const SPOTIFY_FALLBACK_COVER = 'https://i.ibb.co/5R5WpJx/spotify.png'

async function searchSpotify(query) {
  const res = await fetch(SPOTIFY_SEARCH_API + encodeURIComponent(query))
  const json = await res.json()
  return json.data || json.resultado || []
}

async function downloadSpotify(url) {
  const res = await fetch(SPOTIFY_DL_API + encodeURIComponent(url))
  const json = await res.json()
  return json?.result
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `*${xdownload} Ingresa el nombre o link de una canción de Spotify.*\n` +
      `> *\`Ejemplo:\`* ${usedPrefix + command} Darell - Caliente`
    )
  }

  await m.react('⌛')

  try {
    let spotifyUrl = text.trim()

    // 🔍 Si es búsqueda, obtenemos el primer resultado
    if (!/^https?:\/\/(open\.)?spotify\.com\//i.test(spotifyUrl)) {
      const tracks = await searchSpotify(text)
      if (!tracks.length) throw new Error('No se encontraron resultados en Spotify.')
      spotifyUrl = tracks[0].url
    }

    // 🎵 Descargar info
    const info = await downloadSpotify(spotifyUrl)
    if (!info) throw new Error('No se pudo obtener datos de la canción.')

    const {
      title = 'Título desconocido',
      artists = 'Desconocido',
      type = 'N/A',
      releaseDate = 'No disponible',
      cover = SPOTIFY_FALLBACK_COVER,
      music = null
    } = info

    if (!music) throw new Error('El link de audio no está disponible.')

    // 📝 Armamos el caption
    const caption = [
      '```◜Spotify - Download◞```',
      '',
      `*${title}*`,
      `‎ ‎ׄׄ   ››  🌿  *\`Artista:\`* ${artists}`,
      `‎ ‎ׄׄ   ››  🌵  *\`Tipo:\`* ${type}`,
      `‎ ‎ׄׄ   ››  🌸  *\`Lanzamiento:\`* ${releaseDate}`,
      '',
      `> ${club}`
    ].join('\n')

    // 📌 Enviar preview con miniatura
    await conn.sendMessage(m.chat, {
      text: caption,
      contextInfo: {
        externalAdReply: {
          title,
          body: artists,
          thumbnailUrl: cover,
          sourceUrl: spotifyUrl,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    // 🎧 Enviar audio
    await conn.sendMessage(m.chat, {
      audio: { url: music },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    }, { quoted: m })

    await m.react('✅')
  } catch (err) {
    console.error('[SPOTIFY ERROR]', err) // log para debug
    await m.reply(`❌ Error:\n${err.message}`)
    await m.react('❌')
  }
}

handler.help = ['spotify']
handler.tags = ['download']
handler.command = ['sp2', 'spotifydl2', 'spdl2', 'spotify2']

export default handler
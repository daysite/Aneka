import fetch from 'node-fetch'

let handler = async (m, { conn, command, usedPrefix, args, text }) => {
  if (!text) return conn.reply(m.chat, '[ ✰ ] Ingrese el nombre de la canción de *Apple Music.*\n\n' + '`Ejemplo:`\n' + `> *${usedPrefix + command}* Feel Special Twice`, m)
  
  await m.react('🕒')
  try {
    // Buscar la canción en Apple Music
    let searchApi = await fetch(`https://api.delirius.store/search/applemusic?text=${encodeURIComponent(text)}`)
    let searchJson = await searchApi.json()
    
    if (!searchJson.result || searchJson.result.length === 0) {
      await m.react('✖️')
      return conn.reply(m.chat, '[ ❌ ] No se encontraron resultados para tu búsqueda.', m)
    }
    
    let { url, title, artist, album, thumbnail } = searchJson.result[0]

    // Descargar la canción
    let downloadApi = await fetch(`https://api.delirius.store/download/applemusicdl?url=${encodeURIComponent(url)}`)
    let downloadJson = await downloadApi.json()
    
    if (!downloadJson.result || downloadJson.error) {
      await m.react('✖️')
      return conn.reply(m.chat, '[ ❌ ] Error al descargar la canción.', m)
    }
    
    let data = downloadJson.result

    let txt = `*- A P P L E - M U S I C -*\n\n`
    txt += `\t*ੈ✰‧₊˚ Título* :: ${data.title || title}\n`
    txt += `\t*ੈ❁‧₊˚ Artista* :: ${data.artist || artist}\n`
    txt += `\t*ੈ❀‧₊˚ Álbum* :: ${data.album || album}\n`
    if (data.duration) txt += `\t*ੈ☘︎‧₊˚ Duración* :: ${Math.floor(data.duration / 60)}:${(data.duration % 60).toString().padStart(2, '0')}\n`
    if (data.quality) txt += `\t*ੈ✿‧₊˚ Calidad* :: ${data.quality}\n\n`
    txt += `> *- ↻ El audio se está enviando, espera un momento...*`

    // Enviar thumbnail si está disponible
    if (data.thumbnail || thumbnail) {
      await conn.sendFile(m.chat, data.thumbnail || thumbnail, 'thumbnail.jpg', txt, m)
    } else {
      await conn.reply(m.chat, txt, m)
    }

    // Enviar el audio
    await conn.sendMessage(m.chat, { 
      audio: { url: data.download.url }, 
      fileName: `${(data.title || title).replace(/[^\w\s]/gi, '')}.mp3`, 
      mimetype: 'audio/mpeg' 
    }, { quoted: m })

    await m.react('✅')
  } catch (error) {
    console.error(error)
    await m.react('✖️')
    await conn.reply(m.chat, '[ ❌ ] Error al procesar la solicitud. Intenta con otra canción.', m)
  }
}

handler.help = ['applemusic *<búsqueda>*']
handler.tags = ['downloader']
handler.command = ['applemusic', 'apple', 'amusic']
handler.register = true
export default handler

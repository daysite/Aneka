import fetch from 'node-fetch'

let handler = async (m, { conn, command, usedPrefix, args, text }) => {
  if (!text) return conn.reply(m.chat, '[ ✰ ] Ingrese el nombre de la canción de *Apple Music.*\n\n' + '`Ejemplo:`\n' + `> *${usedPrefix + command}* Feel Special Twice`, m)
  
  await m.react('🕒')
  try {
    // API ALTERNATIVA de búsqueda (iTunes oficial) - MÁS CONFIABLE
    let searchApi = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(text)}&media=music&limit=5&country=US`)
    let searchJson = await searchApi.json()
    
    if (!searchJson.results || searchJson.results.length === 0) {
      await m.react('✖️')
      return conn.reply(m.chat, '[ ❌ ] No se encontraron resultados para tu búsqueda.', m)
    }
    
    // Tomar el primer resultado
    let result = searchJson.results[0]
    let url = result.trackViewUrl
    let title = result.trackName
    let artist = result.artistName
    let album = result.collectionName
    let thumbnail = result.artworkUrl100.replace('100x100', '500x500')
    let duration = Math.floor(result.trackTimeMillis / 1000)

    // Descargar la canción usando API de Delirius
    let downloadApi = await fetch(`https://api.delirius.store/download/applemusicdl?url=${encodeURIComponent(url)}`)
    let downloadJson = await downloadApi.json()
    
    // Si la descarga falla, intentar con el preview de iTunes
    if (!downloadJson.result || downloadJson.error) {
      await m.react('⚠️')
      
      // Verificar si tiene preview
      if (result.previewUrl) {
        let txt = `*- A P P L E - M U S I C - P R E V I E W -*\n\n`
        txt += `\t*ੈ✰‧₊˚ Título* :: ${title}\n`
        txt += `\t*ੈ❁‧₊˚ Artista* :: ${artist}\n`
        txt += `\t*ੈ❀‧₊˚ Álbum* :: ${album}\n`
        txt += `\t*ੈ☘︎‧₊˚ Duración* :: 0:30 (Preview)\n\n`
        txt += `> *- ↻ Enviando preview de 30 segundos...*`

        await conn.sendFile(m.chat, thumbnail, 'thumbnail.jpg', txt, m)
        await conn.sendMessage(m.chat, { 
          audio: { url: result.previewUrl }, 
          fileName: `${title.replace(/[^\w\s]/gi, '')}_preview.m4a`, 
          mimetype: 'audio/mp4' 
        }, { quoted: m })
        
        return await m.react('✅')
      } else {
        await m.react('✖️')
        return conn.reply(m.chat, '[ ❌ ] Error al descargar y no hay preview disponible.', m)
      }
    }
    
    let data = downloadJson.result

    let txt = `*- A P P L E - M U S I C -*\n\n`
    txt += `\t*ੈ✰‧₊˚ Título* :: ${data.title || title}\n`
    txt += `\t*ੈ❁‧₊˚ Artista* :: ${data.artist || artist}\n`
    txt += `\t*ੈ❀‧₊˚ Álbum* :: ${data.album || album}\n`
    if (data.duration || duration) {
      let dur = data.duration || duration
      txt += `\t*ੈ☘︎‧₊˚ Duración* :: ${Math.floor(dur / 60)}:${(dur % 60).toString().padStart(2, '0')}\n`
    }
    if (data.quality) txt += `\t*ੈ✿‧₊˚ Calidad* :: ${data.quality}\n\n`
    txt += `> *- ↻ El audio se está enviando, espera un momento...*`

    // Enviar thumbnail
    await conn.sendFile(m.chat, data.thumbnail || thumbnail, 'thumbnail.jpg', txt, m)

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

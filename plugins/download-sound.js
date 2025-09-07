import fetch from 'node-fetch'

let handler = async (m, { conn, command, usedPrefix, args, text }) => {
  if (!text) return conn.reply(m.chat, '[ ✰ ] Ingrese el nombre de la canción de *SoundCloud.*\n\n' + '`Ejemplo:`\n' + `> *${usedPrefix + command}* Lisa Money`, m)
  
  await m.react('🕒')
  try {
    // API DE BÚSQUEDA CONFIABLE
    let searchApi = await fetch(`https://api.starlights.uk/api/search/soundcloud?q=${encodeURIComponent(text)}`)
    let searchJson = await searchApi.json()
    
    if (!searchJson.data || searchJson.data.length === 0) {
      await m.react('✖️')
      return conn.reply(m.chat, '[ ❌ ] No se encontraron resultados para tu búsqueda.', m)
    }
    
    // Tomar el primer resultado
    let firstResult = searchJson.data[0]
    let trackUrl = firstResult.url

    // API DE DESCARGA CONFIABLE
    let downloadApi = await fetch(`https://api.starlights.uk/api/download/soundcloud?url=${encodeURIComponent(trackUrl)}`)
    let downloadJson = await downloadApi.json()
    
    if (!downloadJson.data || downloadJson.error) {
      await m.react('✖️')
      return conn.reply(m.chat, '[ ❌ ] Error al descargar la canción.', m)
    }
    
    let data = downloadJson.data

    let txt = `*- S O U N D C L O U D - M U S I C -*\n\n`
    txt += `\t*ੈ✰‧₊˚ Título* :: ${data.title}\n`
    txt += `\t*ੈ❁‧₊˚ Artista* :: ${data.artist}\n`
    txt += `\t*ੈ❀‧₊˚ Duración* :: ${data.duration}\n`
    txt += `\t*ੈ☘︎‧₊˚ Calidad* :: ${data.quality}\n\n`
    txt += `> *- ↻ El audio se está enviando, espera un momento...*`

    // Enviar thumbnail si está disponible
    if (data.thumbnail) {
      await conn.sendFile(m.chat, data.thumbnail, 'thumbnail.jpg', txt, m)
    } else {
      await conn.reply(m.chat, txt, m)
    }

    // Enviar el audio
    await conn.sendMessage(m.chat, { 
      audio: { url: data.url }, 
      fileName: `${data.title.replace(/[^\w\s]/gi, '')}.mp3`, 
      mimetype: 'audio/mpeg' 
    }, { quoted: m })

    await m.react('✅')
  } catch (error) {
    console.error(error)
    await m.react('✖️')
    await conn.reply(m.chat, '[ ❌ ] Error al procesar la solicitud. Intenta con otra canción.', m)
  }
}

handler.help = ['soundcloud *<búsqueda>*']
handler.tags = ['downloader']
handler.command = ['soundcloud', 'sound']
handler.register = true
export default handler

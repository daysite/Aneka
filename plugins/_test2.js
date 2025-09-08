import axios from 'axios'

const SEARCH_API = 'https://api.delirius.store/search/ytsearch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  console.log('🔍 Comando recibido:', command, 'Texto:', text)
  
  // COMANDO: !ytmusica <búsqueda>
  if (command === 'ytmusica' || command === 'ytmusic') {
    if (!text) return m.reply(`❌ *Ingresa una canción.*\nEjemplo: *${usedPrefix}ytmusica Twice*`)
    
    try {
      await m.react('🔍')
      console.log('Buscando:', text)

      // Solo prueba la API de búsqueda primero
      const searchUrl = `${SEARCH_API}?q=${encodeURIComponent(text)}`
      const searchResponse = await axios.get(searchUrl)
      
      let videos = []
      const responseData = searchResponse.data

      if (Array.isArray(responseData)) {
        videos = responseData
      } else if (responseData.result && Array.isArray(responseData.result)) {
        videos = responseData.result
      }

      if (!videos.length) return m.reply('❌ No se encontraron resultados.')

      // Solo mostrar el primer resultado
      const firstVideo = videos[0]
      const title = firstVideo.title || firstVideo.name || 'Sin título'
      
      return m.reply(`✅ *Primer resultado:* ${title}\n\nUsa *${usedPrefix}descargar 1*`)

    } catch (error) {
      console.error('Error:', error.message)
      return m.reply('❌ Error en la búsqueda.')
    }
  }

  // COMANDO: !descargar <número>
  else if (command === 'descargar') {
    return m.reply('✅ *descargar recibido!* Usa *!audio* o *!video*')
  }

  // COMANDOS: !audio y !video
  else if (command === 'audio' || command === 'video') {
    return m.reply(`✅ *${command} recibido!* (Función en desarrollo)`)
  }
}

handler.help = ['ytmusica <búsqueda>', 'descargar <1-5>', 'audio', 'video']
handler.tags = ['downloader']
handler.command = /^(yt(musica|música|music)|descargar|audio|video)$/i

export default handler

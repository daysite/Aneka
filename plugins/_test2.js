import axios from 'axios'
import fs from 'fs'

const SEARCH_API = 'https://api.delirius.store/search/ytsearch'
const MP3_API = 'https://api.delirius.store/download/ytmp3'
const MP4_API = 'https://api.delirius.store/download/ytmp4'

// Almacenamiento global simple
global.ytSessions = global.ytSessions || {}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const userId = m.sender
  
  // COMANDO: !ytmusica <búsqueda>
  if (command === 'ytmusica' || command === 'ytmusic') {
    if (!text) return m.reply(`❌ *Ingresa una canción o artista.*\nEjemplo: *${usedPrefix}ytmusica Twice*`)

    try {
      await m.react('🔍')

      // 1. Buscar videos
      const searchUrl = `${SEARCH_API}?q=${encodeURIComponent(text)}`
      console.log('🔍 Buscando en API:', searchUrl)

      const searchResponse = await axios.get(searchUrl, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })

      // Procesar respuesta de la API
      let videos = []
      const responseData = searchResponse.data

      if (Array.isArray(responseData)) {
        videos = responseData
      } else if (responseData.result && Array.isArray(responseData.result)) {
        videos = responseData.result
      } else {
        for (let key in responseData) {
          if (Array.isArray(responseData[key])) {
            videos = responseData[key]
            break
          }
        }
      }

      if (!videos.length) return m.reply('❌ No se encontraron resultados.')

      // Guardar en sesión global
      global.ytSessions[userId] = {
        videos: videos.slice(0, 5),
        timestamp: Date.now(),
        query: text
      }

      // Formatear lista de resultados
      let list = global.ytSessions[userId].videos.map((v, i) => {
        const title = v.title || v.name || 'Sin título'
        const duration = v.duration || 'N/A'
        const views = v.views || 'N/A'
        
        const shortTitle = title.length > 50 ? title.substring(0, 50) + '...' : title
        
        return `${i + 1}. *${shortTitle}*\n   • ⏱️ ${duration}\n   • 👁️ ${views}`
      }).join('\n\n')

      let msg = `🎵 *Resultados para:* ${text}\n\n${list}\n\n*Usa *${usedPrefix}descargar 1-5* para seleccionar.*`

      await conn.sendMessage(m.chat, {
        text: msg,
        footer: `⏰ La sesión expira en 5 minutos`
      }, { quoted: m })

    } catch (error) {
      console.error('❌ Error general:', error.message)
      m.reply('❌ Error en la búsqueda: ' + error.message)
      await m.react('❌')
    }
  }

  // COMANDO: !descargar <número>
  else if (command === 'descargar') {
    if (!text) return m.reply(`❌ *Ingresa un número.*\nEjemplo: *${usedPrefix}descargar 2*`)
    
    const session = global.ytSessions[userId]
    if (!session) return m.reply('❌ *No tienes una búsqueda activa.*\nUsa primero *!ytmusica canción*')

    if (!/^[1-5]$/.test(text)) return m.reply('❌ *Número inválido.*\nSolo del 1 al 5.')

    try {
      let index = parseInt(text) - 1
      let video = session.videos[index]
      
      if (!video) return m.reply('❌ *Selección inválida.*')

      let videoTitle = video.title || video.name || 'Video seleccionado'
      let videoUrl = video.url || video.link || video.videoUrl

      // Guardar selección
      global.ytSessions[userId].selectedVideo = video
      global.ytSessions[userId].step = 'waiting_type'

      await conn.sendMessage(m.chat, {
        text: `🎬 *Seleccionaste:* ${videoTitle}\n\n*Usa *${usedPrefix}audio* o *${usedPrefix}video* para descargar.*`
      }, { quoted: m })

    } catch (error) {
      console.error('Error en selección:', error)
      m.reply('❌ Error al procesar selección.')
    }
  }

  // COMANDO: !audio
  else if (command === 'audio') {
    const session = global.ytSessions[userId]
    if (!session || !session.selectedVideo) return m.reply('❌ *Primero selecciona un video con *!descargar numero*')

    try {
      await m.react('⏳')
      const video = session.selectedVideo
      let videoTitle = video.title || video.name || 'Video seleccionado'
      let videoUrl = video.url || video.link || video.videoUrl

      const downloadUrl = `${MP3_API}?url=${encodeURIComponent(videoUrl)}`
      console.log('📥 Descargando audio desde:', downloadUrl)

      const downloadResponse = await axios.get(downloadUrl, {
        timeout: 60000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })

      let downloadData = downloadResponse.data
      if (downloadResponse.data.result) {
        downloadData = downloadResponse.data.result
      }

      const fileUrl = downloadData.url || downloadData.downloadUrl || downloadData.link
      if (!fileUrl) throw new Error('No se encontró enlace de descarga')

      const filename = `./tmp/${Date.now()}.mp3`

      // Descargar archivo
      const writer = fs.createWriteStream(filename)
      const response = await axios({
        method: 'GET',
        url: fileUrl,
        responseType: 'stream',
        timeout: 120000
      })

      response.data.pipe(writer)

      writer.on('finish', async () => {
        await conn.sendMessage(m.chat, {
          audio: { url: filename },
          mimetype: 'audio/mpeg',
          caption: `✅ *Descargado:* ${videoTitle}`
        }, { quoted: m })
        
        fs.unlinkSync(filename)
        await m.react('✅')
        // Limpiar sesión
        delete global.ytSessions[userId]
      })

      writer.on('error', (err) => {
        console.error('Error al escribir archivo:', err)
        m.reply('❌ Error al guardar el archivo.')
        if (fs.existsSync(filename)) fs.unlinkSync(filename)
        delete global.ytSessions[userId]
      })

    } catch (error) {
      console.error('Error en descarga:', error.message)
      m.reply('❌ Error al descargar: ' + error.message)
      delete global.ytSessions[userId]
    }
  }

  // COMANDO: !video
  else if (command === 'video') {
    const session = global.ytSessions[userId]
    if (!session || !session.selectedVideo) return m.reply('❌ *Primero selecciona un video con *!descargar numero*')

    try {
      await m.react('⏳')
      const video = session.selectedVideo
      let videoTitle = video.title || video.name || 'Video seleccionado'
      let videoUrl = video.url || video.link || video.videoUrl

      const downloadUrl = `${MP4_API}?url=${encodeURIComponent(videoUrl)}`
      console.log('📥 Descargando video desde:', downloadUrl)

      const downloadResponse = await axios.get(downloadUrl, {
        timeout: 60000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })

      let downloadData = downloadResponse.data
      if (downloadResponse.data.result) {
        downloadData = downloadResponse.data.result
      }

      const fileUrl = downloadData.url || downloadData.downloadUrl || downloadData.link
      if (!fileUrl) throw new Error('No se encontró enlace de descarga')

      const filename = `./tmp/${Date.now()}.mp4`

      // Descargar archivo
      const writer = fs.createWriteStream(filename)
      const response = await axios({
        method: 'GET',
        url: fileUrl,
        responseType: 'stream',
        timeout: 120000
      })

      response.data.pipe(writer)

      writer.on('finish', async () => {
        await conn.sendMessage(m.chat, {
          video: { url: filename },
          mimetype: 'video/mp4',
          caption: `✅ *Descargado:* ${videoTitle}`
        }, { quoted: m })
        
        fs.unlinkSync(filename)
        await m.react('✅')
        // Limpiar sesión
        delete global.ytSessions[userId]
      })

      writer.on('error', (err) => {
        console.error('Error al escribir archivo:', err)
        m.reply('❌ Error al guardar el archivo.')
        if (fs.existsSync(filename)) fs.unlinkSync(filename)
        delete global.ytSessions[userId]
      })

    } catch (error) {
      console.error('Error en descarga:', error.message)
      m.reply('❌ Error al descargar: ' + error.message)
      delete global.ytSessions[userId]
    }
  }
}

// Limpiar sesiones antiguas cada 5 minutos
setInterval(() => {
  const now = Date.now()
  for (let userId in global.ytSessions) {
    if (now - global.ytSessions[userId].timestamp > 300000) { // 5 minutos
      delete global.ytSessions[userId]
    }
  }
}, 300000)

handler.help = [
  'ytmusica <búsqueda>',
  'descargar <1-5>',
  'audio',
  'video'
]
handler.tags = ['downloader']
handler.command = /^(yt(musica|música|music)|descargar|audio|video)$/i

export default handler

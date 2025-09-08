import axios from 'axios'
import fs from 'fs'

const SEARCH_API = 'https://api.delirius.store/search/ytsearch'
const MP3_API = 'https://api.delirius.store/download/ytmp3'
const MP4_API = 'https://api.delirius.store/download/ytmp4'

// Almacenamiento simple por usuario
const userSessions = {}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`❌ *Ingresa una canción o artista.*\nEjemplo: *${usedPrefix + command} Twice*`)

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

    console.log('📦 Respuesta de la API recibida')

    // Procesar respuesta de la API
    let videos = []
    const responseData = searchResponse.data

    if (Array.isArray(responseData)) {
      videos = responseData
    } else if (responseData.result && Array.isArray(responseData.result)) {
      videos = responseData.result
    } else {
      // Buscar cualquier array en la respuesta
      for (let key in responseData) {
        if (Array.isArray(responseData[key])) {
          videos = responseData[key]
          break
        }
      }
    }

    if (!videos.length) return m.reply('❌ No se encontraron resultados.')

    // Guardar en sesión de usuario
    const userId = m.sender
    userSessions[userId] = {
      videos: videos.slice(0, 5),
      timestamp: Date.now(),
      step: 'waiting_selection',
      chat: m.chat
    }

    // Formatear lista de resultados
    let list = userSessions[userId].videos.map((v, i) => {
      const title = v.title || v.name || 'Sin título'
      const duration = v.duration || 'N/A'
      const views = v.views || 'N/A'
      
      const shortTitle = title.length > 50 ? title.substring(0, 50) + '...' : title
      
      return `${i + 1}. *${shortTitle}*\n   • ⏱️ ${duration}\n   • 👁️ ${views}`
    }).join('\n\n')

    let msg = `🎵 *Resultados para:* ${text}\n\n${list}\n\n*Responde con el número (1-5) para descargar.*`

    await conn.sendMessage(m.chat, {
      text: msg,
      footer: `⏰ Escribe el número (1-5) en 60 segundos`
    }, { quoted: m })

    // Configurar timeout para limpiar sesión
    userSessions[userId].timeout = setTimeout(() => {
      if (userSessions[userId] && userSessions[userId].step === 'waiting_selection') {
        conn.sendMessage(userSessions[userId].chat, { text: '❌ Tiempo agotado para selección.' })
        delete userSessions[userId]
      }
    }, 60000)

  } catch (error) {
    console.error('❌ Error general:', error.message)
    m.reply('❌ Error en la búsqueda: ' + error.message)
    await m.react('❌')
  }
}

// 🔥 MANEJADOR PARA CAPTURAR LAS RESPUESTAS DE USUARIO
handler.all = async (m, { conn }) => {
  // Solo procesar mensajes de texto normales
  if (m.isBaileys || m.fromMe || !m.text || m.text.startsWith('!') || m.text.startsWith('/') || m.text.startsWith('.') || m.text.startsWith(usedPrefix)) {
    return
  }

  const userId = m.sender
  const session = userSessions[userId]

  if (!session) return // No hay sesión activa

  // Verificar que sea el mismo chat
  if (session.chat !== m.chat) return

  // Si está esperando selección de número
  if (session.step === 'waiting_selection' && /^[1-5]$/.test(m.text)) {
    clearTimeout(session.timeout)
    
    try {
      let index = parseInt(m.text) - 1
      let video = session.videos[index]
      
      if (!video) {
        return conn.sendMessage(m.chat, { text: '❌ Selección inválida.' }, { quoted: m })
      }

      let videoTitle = video.title || video.name || 'Video seleccionado'
      let videoUrl = video.url || video.link || video.videoUrl

      await conn.sendMessage(m.chat, {
        text: `🎬 *Seleccionaste:* ${videoTitle}\n\n¿Descargar como audio o video?\n\nEscribe *audio* para MP3 o *video* para MP4`
      }, { quoted: m })

      // Actualizar sesión para siguiente paso
      userSessions[userId] = {
        ...session,
        step: 'waiting_type',
        selectedVideo: video,
        timestamp: Date.now()
      }

      // Timeout para selección de tipo
      userSessions[userId].timeout = setTimeout(() => {
        if (userSessions[userId]) {
          conn.sendMessage(userSessions[userId].chat, { text: '❌ Tiempo agotado para selección de tipo.' })
          delete userSessions[userId]
        }
      }, 30000)

    } catch (error) {
      console.error('Error en selección:', error)
      conn.sendMessage(m.chat, { text: '❌ Error al procesar selección.' }, { quoted: m })
      delete userSessions[userId]
    }
    return true // Indicar que el mensaje fue procesado
  }

  // Si está esperando tipo de descarga
  if (session.step === 'waiting_type' && /^(audio|video)$/i.test(m.text)) {
    clearTimeout(session.timeout)
    
    try {
      const type = m.text.toLowerCase()
      const video = session.selectedVideo
      let videoTitle = video.title || video.name || 'Video seleccionado'
      let videoUrl = video.url || video.link || video.videoUrl

      await m.react('⏳')

      const downloadUrl = type === 'audio' 
        ? `${MP3_API}?url=${encodeURIComponent(videoUrl)}`
        : `${MP4_API}?url=${encodeURIComponent(videoUrl)}`
      
      console.log('📥 Descargando desde:', downloadUrl)

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

      const filename = `./tmp/${Date.now()}.${type === 'audio' ? 'mp3' : 'mp4'}`

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
          [type === 'audio' ? 'audio' : 'video']: { 
            url: filename 
          },
          mimetype: type === 'audio' ? 'audio/mpeg' : 'video/mp4',
          caption: `✅ *Descargado:* ${videoTitle}`
        }, { quoted: m })
        
        fs.unlinkSync(filename)
        await m.react('✅')
        delete userSessions[userId]
      })

      writer.on('error', (err) => {
        console.error('Error al escribir archivo:', err)
        conn.sendMessage(m.chat, { text: '❌ Error al guardar el archivo.' }, { quoted: m })
        if (fs.existsSync(filename)) fs.unlinkSync(filename)
        delete userSessions[userId]
      })

    } catch (error) {
      console.error('Error en descarga:', error.message)
      conn.sendMessage(m.chat, { text: '❌ Error al descargar: ' + error.message }, { quoted: m })
      delete userSessions[userId]
    }
    return true // Indicar que el mensaje fue procesado
  }
}

// Limpiar sesiones antiguas cada minuto
setInterval(() => {
  const now = Date.now()
  for (let userId in userSessions) {
    if (now - userSessions[userId].timestamp > 60000) {
      delete userSessions[userId]
    }
  }
}, 60000)

handler.help = ['ytmusica <búsqueda>']
handler.tags = ['downloader']
handler.command = /^yt(musica|música|music)$/i

export default handler

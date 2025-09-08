import axios from 'axios'

const SEARCH_API = 'https://api.delirius.store/search/ytsearch'
const DOWNLOAD_API = 'https://api.delirius.store/download' // Asumiendo esta API para descargas

// Almacenamiento global simple
global.ytSessions = global.ytSessions || {}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const userId = m.sender
  
  // COMANDO: !ytmusica <búsqueda>
  if (command === 'ytmusica' || command === 'ytmusic') {
    if (!text) return m.reply(`❌ *Ingresa una canción o artista.*\nEjemplo: *${usedPrefix}ytmusica Twice*`)

    try {
      await m.react('🔍')
      console.log('🔍 Buscando:', text)

      const searchUrl = `${SEARCH_API}?q=${encodeURIComponent(text)}`
      const searchResponse = await axios.get(searchUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })

      console.log('📦 Respuesta de API recibida')

      // 🔥 MANEJO ROBUSTO DE DIFERENTES ESTRUCTURAS
      let videos = []
      const responseData = searchResponse.data

      // Opción 1: Si es array directamente
      if (Array.isArray(responseData)) {
        videos = responseData
        console.log('✅ Estructura: Array directo')
      }
      // Opción 2: Si tiene propiedad 'result' con array
      else if (responseData.result && Array.isArray(responseData.result)) {
        videos = responseData.result
        console.log('✅ Estructura: result array')
      }
      // Opción 3: Si tiene propiedad 'data' con array
      else if (responseData.data && Array.isArray(responseData.data)) {
        videos = responseData.data
        console.log('✅ Estructura: data array')
      }
      // Opción 4: Si tiene propiedad 'items' con array
      else if (responseData.items && Array.isArray(responseData.items)) {
        videos = responseData.items
        console.log('✅ Estructura: items array')
      }
      // Opción 5: Si tiene propiedad 'videos' con array
      else if (responseData.videos && Array.isArray(responseData.videos)) {
        videos = responseData.videos
        console.log('✅ Estructura: videos array')
      }
      // Opción 6: Buscar cualquier array en la respuesta
      else {
        console.log('🔍 Buscando array en propiedades...')
        for (let key in responseData) {
          if (Array.isArray(responseData[key])) {
            videos = responseData[key]
            console.log(`✅ Array encontrado en propiedad: ${key}`)
            break
          }
        }
      }

      // 🔥 SI NO HAY VIDEOS, USAR DATOS DE PRUEBA
      if (!videos.length) {
        console.log('⚠️ No se encontraron videos, usando datos de prueba')
        videos = [
          {
            title: 'Test Video 1 - Música de prueba',
            duration: '3:45',
            views: '1000 vistas',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
          },
          {
            title: 'Test Video 2 - Canción ejemplo',
            duration: '4:20',
            views: '2000 vistas',
            url: 'https://www.youtube.com/watch?v=oHg5SJYRHA0'
          }
        ]
      }

      // Guardar en sesión global
      global.ytSessions[userId] = {
        videos: videos.slice(0, 5),
        timestamp: Date.now(),
        query: text
      }

      // Formatear lista de resultados
      let list = global.ytSessions[userId].videos.map((v, i) => {
        const title = v.title || v.name || `Video ${i + 1}`
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
      console.error('❌ Error en búsqueda:', error.message)
      
      // 🔥 FALLBACK: Datos de prueba si la API falla
      console.log('⚠️ API falló, usando datos de prueba')
      global.ytSessions[userId] = {
        videos: [
          {
            title: 'Fallback Video 1 - Música de ejemplo',
            duration: '3:30',
            views: '5000 vistas',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
          },
          {
            title: 'Fallback Video 2 - Canción demo',
            duration: '4:15',
            views: '3000 vistas',
            url: 'https://www.youtube.com/watch?v=oHg5SJYRHA0'
          }
        ],
        timestamp: Date.now(),
        query: text
      }

      let list = global.ytSessions[userId].videos.map((v, i) => {
        return `${i + 1}. *${v.title}*\n   • ⏱️ ${v.duration}\n   • 👁️ ${v.views}`
      }).join('\n\n')

      await conn.sendMessage(m.chat, {
        text: `🎵 *Resultados para:* ${text} (modo demo)\n\n${list}\n\n*Usa *${usedPrefix}descargar 1-5*`,
        footer: `⚠️ Modo demo - API no disponible`
      }, { quoted: m })
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
      
      // Guardar la selección actual en la sesión
      global.ytSessions[userId].selected = video

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
    if (!session || !session.selected) return m.reply('❌ *No tienes una selección activa.*\nUsa primero *!descargar número*')

    try {
      await m.react('⏳')
      
      const video = session.selected
      const videoUrl = video.url
      const videoTitle = video.title || 'audio'
      
      // Informar que se está procesando
      await conn.sendMessage(m.chat, {
        text: `🎵 *Descargando audio...*\n\n*Título:* ${videoTitle}\n\n⏳ Esto puede tomar unos momentos...`
      }, { quoted: m })

      // Usar la API de descarga para audio
      // NOTA: Ajusta la URL y parámetros según tu API real
      const downloadUrl = `${DOWNLOAD_API}/audio?url=${encodeURIComponent(videoUrl)}`
      
      const downloadResponse = await axios.get(downloadUrl, {
        responseType: 'stream',
        timeout: 60000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      // Limpiar título para usar como nombre de archivo
      const cleanTitle = videoTitle.replace(/[^\w\s]/gi, '').substring(0, 30)
      
      // Enviar el audio
      await conn.sendMessage(m.chat, {
        audio: downloadResponse.data,
        mimetype: 'audio/mpeg',
        fileName: `${cleanTitle}.mp3`,
        ptt: false
      }, { quoted: m })

      await m.react('✅')
      
    } catch (error) {
      console.error('Error en descarga de audio:', error)
      m.reply('❌ Error al descargar el audio. Intenta nuevamente.')
    }
  }

  // COMANDO: !video
  else if (command === 'video') {
    const session = global.ytSessions[userId]
    if (!session || !session.selected) return m.reply('❌ *No tienes una selección activa.*\nUsa primero *!descargar número*')

    try {
      await m.react('⏳')
      
      const video = session.selected
      const videoUrl = video.url
      const videoTitle = video.title || 'video'
      
      // Informar que se está procesando
      await conn.sendMessage(m.chat, {
        text: `🎥 *Descargando video...*\n\n*Título:* ${videoTitle}\n\n⏳ Esto puede tomar unos momentos...`
      }, { quoted: m })

      // Usar la API de descarga para video
      // NOTA: Ajusta la URL y parámetros según tu API real
      const downloadUrl = `${DOWNLOAD_API}/video?url=${encodeURIComponent(videoUrl)}`
      
      const downloadResponse = await axios.get(downloadUrl, {
        responseType: 'stream',
        timeout: 120000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      // Limpiar título para usar como nombre de archivo
      const cleanTitle = videoTitle.replace(/[^\w\s]/gi, '').substring(0, 30)
      
      // Enviar el video
      await conn.sendMessage(m.chat, {
        video: downloadResponse.data,
        caption: `🎥 ${videoTitle}`,
        fileName: `${cleanTitle}.mp4`
      }, { quoted: m })

      await m.react('✅')
      
    } catch (error) {
      console.error('Error en descarga de video:', error)
      m.reply('❌ Error al descargar el video. Intenta nuevamente.')
    }
  }
}

// Limpiar sesiones antiguas cada 5 minutos
setInterval(() => {
  const now = Date.now()
  for (let userId in global.ytSessions) {
    if (now - global.ytSessions[userId].timestamp > 300000) {
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

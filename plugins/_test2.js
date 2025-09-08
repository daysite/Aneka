import axios from 'axios'
import fs from 'fs'

const SEARCH_API = 'https://api.delirius.store/search/ytsearch'
const MP3_API = 'https://api.delirius.store/download/ytmp3'
const MP4_API = 'https://api.delirius.store/download/ytmp4'

// Almacenamiento global de búsquedas
global.ytSearches = global.ytSearches || {}

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

    // Guardar videos en variable global con ID único
    const searchId = m.sender + Date.now()
    global.ytSearches[searchId] = {
      videos: videos.slice(0, 5),
      timestamp: Date.now(),
      chat: m.chat
    }

    // Formatear lista de resultados
    let list = global.ytSearches[searchId].videos.map((v, i) => {
      const title = v.title || v.name || 'Sin título'
      const duration = v.duration || 'N/A'
      const views = v.views || 'N/A'
      
      // Acortar título si es muy largo
      const shortTitle = title.length > 50 ? title.substring(0, 50) + '...' : title
      
      return `${i + 1}. *${shortTitle}*\n   • ⏱️ ${duration}\n   • 👁️ ${views}`
    }).join('\n\n')

    let msg = `🎵 *Resultados para:* ${text}\n\n${list}\n\n*Responde con el número (1-5) para descargar.*`

    // Enviar mensaje con instrucciones
    await conn.sendMessage(m.chat, {
      text: msg,
      footer: `⏰ Escribe el número (1-5) en 60 segundos`
    }, { quoted: m })

    // 🔥 MANEJO MANUAL DE RESPUESTAS (sin collectMessages)
    // Crear un timeout para limpiar la búsqueda
    global.ytSearches[searchId].timeout = setTimeout(() => {
      if (global.ytSearches[searchId]) {
        delete global.ytSearches[searchId]
        conn.sendMessage(m.chat, { text: '❌ Tiempo agotado para selección.' }, { quoted: m })
      }
    }, 60000)

  } catch (error) {
    console.error('❌ Error general:', error.message)
    m.reply('❌ Error en la búsqueda: ' + error.message)
    await m.react('❌')
  }
}

// 🔥 MANEJADOR DE MENSAJES GLOBAL (para capturar respuestas)
export async function all(m, { conn }) {
  // Ignorar si no es un mensaje normal o es un comando
  if (m.isBaileys || m.fromMe || m.type !== 'conversation' || m.text.startsWith('!') || m.text.startsWith('/') || m.text.startsWith('.')) return

  // Buscar si este usuario tiene una búsqueda activa
  for (let searchId in global.ytSearches) {
    const search = global.ytSearches[searchId]
    
    // Verificar si es el mismo usuario y chat
    if (search.chat === m.chat && m.sender === m.sender) {
      
      // Si es un número del 1-5
      if (/^[1-5]$/.test(m.text)) {
        clearTimeout(search.timeout) // Cancelar timeout
        
        try {
          let index = parseInt(m.text) - 1
          let video = search.videos[index]
          
          if (!video) {
            return conn.sendMessage(m.chat, { text: '❌ Selección inválida.' }, { quoted: m })
          }

          let videoTitle = video.title || video.name || 'Video seleccionado'
          let videoUrl = video.url || video.link || video.videoUrl

          await conn.sendMessage(m.chat, {
            text: `🎬 *Seleccionaste:* ${videoTitle}\n\n¿Descargar como audio o video?\n\nEscribe *audio* para MP3 o *video* para MP4`
          }, { quoted: m })

          // Guardar selección para el siguiente paso
          global.ytSearches[searchId].selectedVideo = video
          global.ytSearches[searchId].waitingForType = true
          
          // Nuevo timeout para selección de tipo
          global.ytSearches[searchId].typeTimeout = setTimeout(() => {
            if (global.ytSearches[searchId]) {
              delete global.ytSearches[searchId]
              conn.sendMessage(m.chat, { text: '❌ Tiempo agotado para selección de tipo.' }, { quoted: m })
            }
          }, 30000)

        } catch (error) {
          console.error('Error en selección:', error)
          conn.sendMessage(m.chat, { text: '❌ Error al procesar selección.' }, { quoted: m })
        }
        break
      }
      
      // Si está esperando tipo de descarga (audio/video)
      else if (search.waitingForType && /^(audio|video)$/i.test(m.text)) {
        clearTimeout(search.typeTimeout) // Cancelar timeout
        
        try {
          const type = m.text.toLowerCase()
          const video = search.selectedVideo
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
            delete global.ytSearches[searchId] // Limpiar
          })

          writer.on('error', (err) => {
            console.error('Error al escribir archivo:', err)
            conn.sendMessage(m.chat, { text: '❌ Error al guardar el archivo.' }, { quoted: m })
            if (fs.existsSync(filename)) fs.unlinkSync(filename)
            delete global.ytSearches[searchId] // Limpiar
          })

        } catch (error) {
          console.error('Error en descarga:', error.message)
          conn.sendMessage(m.chat, { text: '❌ Error al descargar: ' + error.message }, { quoted: m })
          delete global.ytSearches[searchId] // Limpiar
        }
        break
      }
    }
  }
}

// Limpiar búsquedas antiguas cada minuto
setInterval(() => {
  const now = Date.now()
  for (let searchId in global.ytSearches) {
    if (now - global.ytSearches[searchId].timestamp > 60000) { // 1 minuto
      delete global.ytSearches[searchId]
    }
  }
}, 60000)

handler.help = ['ytmusica <búsqueda>']
handler.tags = ['downloader']
handler.command = /^yt(musica|música|music)$/i

export default handler

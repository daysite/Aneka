import axios from 'axios'
import fs from 'fs'

const SEARCH_API = 'https://api.delirius.store/search/ytsearch'
const MP3_API = 'https://api.delirius.store/download/ytmp3'
const MP4_API = 'https://api.delirius.store/download/ytmp4'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`❌ *Ingresa una canción o artista.*\nEjemplo: *${usedPrefix + command} Twice*`)

  // Variable global para almacenar los videos de esta búsqueda
  global.ytSearchResults = global.ytSearchResults || {}
  const searchId = Date.now() // ID único para esta búsqueda
  global.ytSearchResults[searchId] = { videos: [], timestamp: Date.now() }

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

    // Guardar videos en variable global
    global.ytSearchResults[searchId].videos = videos.slice(0, 5)

    // Formatear lista de resultados
    let list = global.ytSearchResults[searchId].videos.map((v, i) => {
      const title = v.title || v.name || 'Sin título'
      const duration = v.duration || 'N/A'
      const views = v.views || 'N/A'
      
      // Acortar título si es muy largo
      const shortTitle = title.length > 50 ? title.substring(0, 50) + '...' : title
      
      return `${i + 1}. *${shortTitle}*\n   • ⏱️ ${duration}\n   • 👁️ ${views}`
    }).join('\n\n')

    let msg = `🎵 *Resultados para:* ${text}\n\n${list}\n\n*Responde con el número (1-5) para descargar.*`

    // Enviar mensaje con instrucciones claras
    await conn.sendMessage(m.chat, {
      text: msg,
      footer: `⏰ Escribe el número (1-5) en 60 segundos | ID: ${searchId}`
    }, { quoted: m })

    // Colector de respuesta
    let collector = conn.collectMessages(m.chat, {
      filter: (msg) => {
        return msg.sender === m.sender && 
               /^[1-5]$/.test(msg.text) &&
               !msg.text.startsWith(usedPrefix)
      },
      time: 60000,
      max: 1
    })

    collector.on('collect', async ({ text: selected }) => {
      try {
        let index = parseInt(selected) - 1
        let video = global.ytSearchResults[searchId].videos[index]
        
        if (!video) {
          return m.reply('❌ Selección inválida. Usa el comando again.')
        }

        let videoTitle = video.title || video.name || 'Video seleccionado'
        let videoUrl = video.url || video.link || video.videoUrl

        await conn.sendMessage(m.chat, {
          text: `🎬 *Seleccionaste:* ${videoTitle}\n\n¿Descargar como audio o video?\n\nEscribe *audio* para MP3 o *video* para MP4`
        }, { quoted: m })

        // Colector para tipo de descarga
        let typeCollector = conn.collectMessages(m.chat, {
          filter: (msg) => {
            return msg.sender === m.sender && 
                   /^(audio|video)$/i.test(msg.text) &&
                   !msg.text.startsWith(usedPrefix)
          },
          time: 30000,
          max: 1
        })

        typeCollector.on('collect', async ({ text: type }) => {
          await m.react('⏳')
          
          try {
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
            })

            writer.on('error', (err) => {
              console.error('Error al escribir archivo:', err)
              m.reply('❌ Error al guardar el archivo.')
              if (fs.existsSync(filename)) fs.unlinkSync(filename)
            })

          } catch (error) {
            console.error('Error en descarga:', error.message)
            m.reply('❌ Error al descargar: ' + error.message)
            await m.react('❌')
          }
        })

        typeCollector.on('end', collected => {
          if (!collected.length) m.reply('❌ Tiempo agotado para selección de tipo.')
        })

      } catch (error) {
        console.error('Error en selección:', error)
        m.reply('❌ Error al procesar selección.')
      }
    })

    collector.on('end', collected => {
      // Limpiar datos antiguos
      delete global.ytSearchResults[searchId]
      if (!collected.length) m.reply('❌ Tiempo agotado para selección.')
    })

  } catch (error) {
    console.error('❌ Error general:', error.message)
    m.reply('❌ Error en la búsqueda: ' + error.message)
    await m.react('❌')
    
    // Limpiar en caso de error
    if (global.ytSearchResults[searchId]) {
      delete global.ytSearchResults[searchId]
    }
  }
}

// Limpiar datos antiguos cada hora
setInterval(() => {
  if (global.ytSearchResults) {
    const now = Date.now()
    for (let id in global.ytSearchResults) {
      if (now - global.ytSearchResults[id].timestamp > 3600000) { // 1 hora
        delete global.ytSearchResults[id]
      }
    }
  }
}, 3600000)

handler.help = ['ytmusica <búsqueda>']
handler.tags = ['downloader']
handler.command = /^yt(musica|música|music)$/i

export default handler

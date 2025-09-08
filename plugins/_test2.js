import axios from 'axios'
import fs from 'fs'
import ffmpeg from 'fluent-ffmpeg'
import { promisify } from 'util'

const SEARCH_API = 'https://api.delirius.store/search/ytsearch'
const MP3_API = 'https://api.delirius.store/download/ytmp3'
const MP4_API = 'https://api.delirius.store/download/ytmp4'

// Almacenamiento global simple
global.ytSessions = global.ytSessions || {}

// Función para convertir audio a MP3 compatible
const convertToStandardMP3 = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioCodec('libmp3lame')
      .audioBitrate(128)
      .outputOptions('-id3v2_version', '3')
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .save(outputPath)
  })
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const userId = m.sender
  
  // COMANDO: !ytmusica <búsqueda>
  if (command === 'ytmusica' || command === 'ytmusic') {
    // ... (el mismo código de búsqueda anterior)
  }

  // COMANDO: !descargar <número>
  else if (command === 'descargar') {
    // ... (el mismo código de selección anterior)
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

      console.log('🎵 Iniciando descarga de audio para:', videoUrl)

      const downloadUrl = `${MP3_API}?url=${encodeURIComponent(videoUrl)}`
      console.log('📥 Solicitando a API de descarga:', downloadUrl)

      const downloadResponse = await axios.get(downloadUrl, {
        timeout: 60000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })

      console.log('📦 Respuesta de API de descarga recibida')

      // Extraer el enlace de descarga
      let fileUrl
      
      if (downloadResponse.data.data && downloadResponse.data.data.download && downloadResponse.data.data.download.url) {
        fileUrl = downloadResponse.data.data.download.url
      } else if (downloadResponse.data.download && downloadResponse.data.download.url) {
        fileUrl = downloadResponse.data.download.url
      } else if (downloadResponse.data.url) {
        fileUrl = downloadResponse.data.url
      } else {
        throw new Error('No se pudo encontrar el enlace en la respuesta de la API')
      }

      console.log('✅ Enlace de descarga encontrado:', fileUrl)

      const tempFilename = `./tmp/temp_${Date.now()}.audio`
      const finalFilename = `./tmp/final_${Date.now()}.mp3`

      // Descargar archivo temporal
      const writer = fs.createWriteStream(tempFilename)
      const response = await axios({
        method: 'GET',
        url: fileUrl,
        responseType: 'stream',
        timeout: 120000
      })

      response.data.pipe(writer)

      writer.on('finish', async () => {
        try {
          console.log('🔄 Convirtiendo audio a formato compatible...')
          
          // Convertir a MP3 estándar
          await convertToStandardMP3(tempFilename, finalFilename)
          
          console.log('✅ Conversión completada, enviando audio...')
          
          // Enviar archivo convertido
          await conn.sendMessage(m.chat, {
            audio: fs.readFileSync(finalFilename),
            mimetype: 'audio/mpeg',
            caption: `✅ *Descargado:* ${videoTitle}`
          }, { quoted: m })
          
          // Limpiar archivos temporales
          fs.unlinkSync(tempFilename)
          fs.unlinkSync(finalFilename)
          await m.react('✅')
          delete global.ytSessions[userId]
          
        } catch (convertError) {
          console.error('Error en conversión:', convertError)
          
          // Intentar enviar el archivo original como fallback
          try {
            await conn.sendMessage(m.chat, {
              audio: fs.readFileSync(tempFilename),
              mimetype: 'audio/mpeg',
              caption: `✅ *Descargado (sin conversión):* ${videoTitle}`
            }, { quoted: m })
            fs.unlinkSync(tempFilename)
            await m.react('✅')
          } catch (sendError) {
            m.reply('❌ Error al procesar el audio. El formato puede ser incompatible.')
          }
          delete global.ytSessions[userId]
        }
      })

      writer.on('error', (err) => {
        console.error('Error al escribir archivo:', err)
        m.reply('❌ Error al descargar el archivo.')
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
    // ... (código similar para video, pero sin conversión)
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

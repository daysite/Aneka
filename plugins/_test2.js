import axios from 'axios'
import fs from 'fs'

const SEARCH_API = 'https://api.delirius.store/search/ytsearch'
const MP3_API = 'https://api.delirius.store/download/ytmp3'
const MP4_API = 'https://api.delirius.store/download/ytmp4'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`❌ *Ingresa una canción o artista.*\nEjemplo: *${usedPrefix + command} Twice*`)

  try {
    await m.react('🔍')

    // 1. Buscar videos - con headers y timeout
    const searchUrl = `${SEARCH_API}?q=${encodeURIComponent(text)}`
    console.log('Buscando:', searchUrl) // Log para depuración

    const searchResponse = await axios.get(searchUrl, {
      timeout: 30000, // 30 segundos de timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    console.log('Respuesta de búsqueda:', searchResponse.data) // Log completo

    // Verificar estructura de la respuesta
    if (!searchResponse.data || !searchResponse.data.status === 200) {
      throw new Error('Respuesta inválida de la API de búsqueda')
    }

    const videos = searchResponse.data.result.slice(0, 5)
    if (!videos.length) return m.reply('❌ No se encontraron resultados.')

    // ... (el resto del código permanece igual hasta el colector)

    collector.on('collect', async ({ text: selected }) => {
      let index = parseInt(selected) - 1
      let video = videos[index]

      // Preguntar tipo de descarga
      await conn.sendMessage(m.chat, {
        text: `🎬 *Seleccionaste:* ${video.title}\n\n¿Descargar como audio o video?`,
        templateButtons: [
          { index: 1, quickReplyButton: { displayText: '🎵 MP3', id: 'audio' } },
          { index: 2, quickReplyButton: { displayText: '🎥 MP4', id: 'video' } }
        ]
      }, { quoted: m })

      let typeCollector = conn.collectMessages(m.chat, {
        filter: (msg) => msg.sender === m.sender && /^(audio|video)$/i.test(msg.text),
        time: 30000,
        max: 1
      })

      typeCollector.on('collect', async ({ text: type }) => {
        await m.react('⏳')
        
        try {
          // 2. Obtener enlace de descarga
          const downloadUrl = type === 'audio' 
            ? `${MP3_API}?url=${encodeURIComponent(video.url)}`
            : `${MP4_API}?url=${encodeURIComponent(video.url)}`
          
          console.log('Descargando desde:', downloadUrl) // Log

          const downloadResponse = await axios.get(downloadUrl, {
            timeout: 60000, // 60 segundos para descarga
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          })

          console.log('Respuesta de descarga:', downloadResponse.data) // Log

          if (!downloadResponse.data.status === 200) {
            throw new Error('Error en la API de descarga: ' + JSON.stringify(downloadResponse.data))
          }

          const downloadData = downloadResponse.data.result
          const fileUrl = downloadData.url
          const filename = `./tmp/${Date.now()}.${type === 'audio' ? 'mp3' : 'mp4'}`

          // 3. Descargar el archivo
          const writer = fs.createWriteStream(filename)
          const response = await axios({
            method: 'GET',
            url: fileUrl,
            responseType: 'stream',
            timeout: 120000 // 120 segundos para descarga grande
          })

          response.data.pipe(writer)

          writer.on('finish', async () => {
            await conn.sendMessage(m.chat, {
              [type === 'audio' ? 'audio' : 'video']: { 
                url: filename 
              },
              mimetype: type === 'audio' ? 'audio/mpeg' : 'video/mp4',
              caption: `✅ *Descargado:* ${video.title}`
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
        if (!collected.length) m.reply('❌ Tiempo agotado para selección.')
      })
    })

    collector.on('end', collected => {
      if (!collected.length) m.reply('❌ Tiempo agotado para selección.')
    })

  } catch (error) {
    console.error('Error general:', error.message)
    console.error('Stack:', error.stack)
    m.reply('❌ Error en la búsqueda: ' + error.message)
    await m.react('❌')
  }
}

handler.help = ['ytmusica <búsqueda>']
handler.tags = ['downloader']
handler.command = /^yt(musica|música|music)$/i

export default handler

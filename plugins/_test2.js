import axios from 'axios'
import fs from 'fs'

const SEARCH_API = 'https://api.delirius.store/search/ytsearch'
const MP3_API = 'https://api.delirius.store/download/ytmp3'
const MP4_API = 'https://api.delirius.store/download/ytmp4'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`❌ *Ingresa una canción o artista.*\nEjemplo: *${usedPrefix + command} Twice*`)

  try {
    await m.react('🔍')

    // 1. Buscar videos
    const searchUrl = `${SEARCH_API}?q=${encodeURIComponent(text)}`
    console.log('Buscando:', searchUrl)

    const searchResponse = await axios.get(searchUrl, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    console.log('Respuesta de búsqueda:', JSON.stringify(searchResponse.data, null, 2))

    // 🔥 VALIDACIÓN CRUCIAL: Verificar si la respuesta tiene la estructura correcta
    if (!searchResponse.data || typeof searchResponse.data !== 'object') {
      throw new Error('La API devolvió una respuesta inválida')
    }

    // 🔥 VALIDACIÓN: Si la API devuelve status false o error
    if (searchResponse.data.status === false || searchResponse.data.error) {
      throw new Error(searchResponse.data.message || 'Error en la API de búsqueda')
    }

    // 🔥 VALIDACIÓN: Verificar si existe result y es un array
    if (!searchResponse.data.result || !Array.isArray(searchResponse.data.result)) {
      throw new Error('La propiedad "result" no es un array o no existe')
    }

    const videos = searchResponse.data.result.slice(0, 5)
    if (!videos.length) return m.reply('❌ No se encontraron resultados.')

    // Formatear lista de resultados
    let list = videos.map((v, i) => {
      return `${i + 1}. *${v.title}*\n   • ⏱️ ${v.duration || 'N/A'}\n   • 👁️ ${v.views || 'N/A'}\n   • 🔗 ${v.url}`
    }).join('\n\n')

    let msg = `🎵 *Resultados para:* ${text}\n\n${list}\n\n*Responde con el número (1-5) para descargar.*`

    // Enviar mensaje con botones
    await conn.sendMessage(m.chat, {
      text: msg,
      footer: '⏰ Elige en 60 segundos.',
      templateButtons: [
        { index: 1, quickReplyButton: { displayText: '1️⃣', id: 'yt1' } },
        { index: 2, quickReplyButton: { displayText: '2️⃣', id: 'yt2' } },
        { index: 3, quickReplyButton: { displayText: '3️⃣', id: 'yt3' } },
        { index: 4, quickReplyButton: { displayText: '4️⃣', id: 'yt4' } },
        { index: 5, quickReplyButton: { displayText: '5️⃣', id: 'yt5' } }
      ]
    }, { quoted: m })

    // Colector de respuesta
    let collector = conn.collectMessages(m.chat, {
      filter: (msg) => msg.sender === m.sender && /^[1-5]$/.test(msg.text),
      time: 60000,
      max: 1
    })

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
          
          console.log('Descargando desde:', downloadUrl)

          const downloadResponse = await axios.get(downloadUrl, {
            timeout: 60000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          })

          console.log('Respuesta de descarga:', JSON.stringify(downloadResponse.data, null, 2))

          // Validar respuesta de descarga
          if (!downloadResponse.data || downloadResponse.data.status === false) {
            throw new Error(downloadResponse.data?.message || 'Error en la API de descarga')
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
            timeout: 120000
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

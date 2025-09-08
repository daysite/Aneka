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

    // Manejar diferentes estructuras de respuesta
    let videos = searchResponse.data
    if (!Array.isArray(videos)) {
      if (searchResponse.data.results && Array.isArray(searchResponse.data.results)) {
        videos = searchResponse.data.results
      } else if (searchResponse.data.items && Array.isArray(searchResponse.data.items)) {
        videos = searchResponse.data.items
      } else {
        throw new Error('Estructura de API no reconocida')
      }
    }

    videos = videos.slice(0, 5)
    if (!videos.length) return m.reply('❌ No se encontraron resultados.')

    // Formatear lista de resultados
    let list = videos.map((v, i) => {
      const title = v.title || v.name || 'Sin título'
      const url = v.url || v.link || v.videoUrl || '#'
      const duration = v.duration || v.length || 'N/A'
      const views = v.views || v.viewCount || 'N/A'
      
      return `${i + 1}. *${title}*\n   • ⏱️ ${duration}\n   • 👁️ ${views}`
    }).join('\n\n')

    let msg = `🎵 *Resultados para:* ${text}\n\n${list}\n\n*Responde con el número (1-5) para descargar.*`

    // 🔥 BOTONES NATIVOS DE WHATSAPP
    const buttons = [
      { buttonId: '1', buttonText: { displayText: '1️⃣' }, type: 1 },
      { buttonId: '2', buttonText: { displayText: '2️⃣' }, type: 1 },
      { buttonId: '3', buttonText: { displayText: '3️⃣' }, type: 1 },
      { buttonId: '4', buttonText: { displayText: '4️⃣' }, type: 1 },
      { buttonId: '5', buttonText: { displayText: '5️⃣' }, type: 1 }
    ]

    await conn.sendMessage(m.chat, {
      text: msg,
      footer: '⏰ Responde con el número en 60 segundos',
      buttons: buttons,
      headerType: 1
    }, { quoted: m })

    // Colector de respuesta para selección de video
    let collector = conn.collectMessages(m.chat, {
      filter: (msg) => msg.sender === m.sender && /^[1-5]$/.test(msg.text),
      time: 60000,
      max: 1
    })

    collector.on('collect', async ({ text: selected }) => {
      let index = parseInt(selected) - 1
      let video = videos[index]
      let videoTitle = video.title || video.name

      // 🔥 BOTONES PARA TIPO DE DESCARGA
      const downloadButtons = [
        { buttonId: 'audio', buttonText: { displayText: '🎵 MP3' }, type: 1 },
        { buttonId: 'video', buttonText: { displayText: '🎥 MP4' }, type: 1 }
      ]

      await conn.sendMessage(m.chat, {
        text: `🎬 *Seleccionaste:* ${videoTitle}\n\n¿Descargar como audio o video?`,
        buttons: downloadButtons,
        footer: 'Elige una opción',
        headerType: 1
      }, { quoted: m })

      // Colector para tipo de descarga
      let typeCollector = conn.collectMessages(m.chat, {
        filter: (msg) => msg.sender === m.sender && /^(audio|video)$/i.test(msg.text),
        time: 30000,
        max: 1
      })

      typeCollector.on('collect', async ({ text: type }) => {
        await m.react('⏳')
        
        try {
          const videoUrl = video.url || video.link || video.videoUrl
          const downloadUrl = type === 'audio' 
            ? `${MP3_API}?url=${encodeURIComponent(videoUrl)}`
            : `${MP4_API}?url=${encodeURIComponent(videoUrl)}`
          
          console.log('Descargando desde:', downloadUrl)

          const downloadResponse = await axios.get(downloadUrl, {
            timeout: 60000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          })

          console.log('Respuesta de descarga:', JSON.stringify(downloadResponse.data, null, 2))

          let downloadData
          if (downloadResponse.data.result) {
            downloadData = downloadResponse.data.result
          } else if (downloadResponse.data.download) {
            downloadData = downloadResponse.data.download
          } else {
            downloadData = downloadResponse.data
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
        if (!collected.length) m.reply('❌ Tiempo agotado para selección.')
      })
    })

    collector.on('end', collected => {
      if (!collected.length) m.reply('❌ Tiempo agotado para selección.')
    })

  } catch (error) {
    console.error('Error general:', error.message)
    m.reply('❌ Error: ' + error.message)
    await m.react('❌')
  }
}

handler.help = ['ytmusica <búsqueda>']
handler.tags = ['downloader']
handler.command = /^yt(musica|música|music)$/i

export default handler

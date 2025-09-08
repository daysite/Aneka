import yts from 'yt-search'
import ytdl from 'ytdl-core'
import fs from 'fs'
import { promisify } from 'util'
import axios from 'axios'

const sleep = promisify(setTimeout)

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`❌ *Ingresa una canción o artista.*\nEjemplo: *${usedPrefix + command} Bad Bunny*`)

  try {
    await m.react('🔍') // Reacción de búsqueda

    // Buscar en YouTube
    let search = await yts(text).catch(async () => {
      // Si yt-search falla, usar alternativa (API externa)
      return await searchFallback(text)
    })

    let videos = search.videos?.slice(0, 5)
    if (!videos || !videos.length) return m.reply('❌ No se encontraron resultados. Intenta con otra búsqueda.')

    // Formatear lista
    let list = videos.map((v, i) => 
      `${i + 1}. *${v.title}*\n   • ⏱️ ${v.timestamp || 'N/A'}\n   • 👁️ ${v.views || 'N/A'} vistas\n   • 📅 ${v.ago || 'N/A'}`).join('\n\n')

    let msg = `🎵 *Resultados para:* ${text}\n\n${list}\n\n*Responde con el número (1-5) para descargar.*`

    // Enviar mensaje con botones rápidos
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
          let filename = `./tmp/${Date.now()}.${type === 'audio' ? 'mp3' : 'mp4'}`
          let stream = ytdl(video.url, {
            quality: type === 'audio' ? 'highestaudio' : 'highestvideo',
            filter: type === 'audio' ? 'audioonly' : 'videoandaudio'
          })

          stream.pipe(fs.createWriteStream(filename))
            .on('finish', async () => {
              await conn.sendMessage(m.chat, {
                [type === 'audio' ? 'audio' : 'video']: { url: filename },
                mimetype: type === 'audio' ? 'audio/mpeg' : 'video/mp4',
                caption: `✅ *Descargado:* ${video.title}`
              }, { quoted: m })
              fs.unlinkSync(filename)
              await m.react('✅')
            })
        } catch (error) {
          console.error(error)
          m.reply('❌ Error al descargar. Intenta con otro video.')
          await m.react('❌')
        }
      })

      typeCollector.on('end', collected => {
        if (!collected.length) m.reply('❌ Tiempo agotado.')
      })
    })

    collector.on('end', collected => {
      if (!collected.length) m.reply('❌ Tiempo agotado.')
    })

  } catch (error) {
    console.error(error)
    m.reply('❌ Error en la búsqueda. Intenta más tarde.')
    await m.react('❌')
  }
}

// Función alternativa si yt-search falla
async function searchFallback(query) {
  try {
    let response = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`)
    let html = response.data
    // Extraer datos de la página (requiere parsing)
    // Esto es un ejemplo simplificado. Puedes usar cheerio para scraping.
    return { videos: [] } // Placeholder
  } catch {
    throw new Error('Búsqueda fallida')
  }
}

handler.help = ['ytmusica <búsqueda>']
handler.tags = ['downloader']
handler.command = /^yt(musica|música|music)$/i

export default handler

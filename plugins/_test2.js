import axios from 'axios'
import ytdl from 'ytdl-core'
import fs from 'fs'

// Configura tu API Key de RapidAPI
const RAPIDAPI_KEY = 'TU_RAPIDAPI_KEY' // Reemplaza con tu key

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`❌ *Ingresa una canción o artista.*\nEjemplo: *${usedPrefix + command} Bad Bunny*`)

  try {
    await m.react('🔍')

    // 1. Buscar en YouTube usando API de RapidAPI
    const searchOptions = {
      method: 'GET',
      url: 'https://youtube-v31.p.rapidapi.com/search',
      params: {
        q: text,
        part: 'snippet',
        maxResults: '5'
      },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'youtube-v31.p.rapidapi.com'
      }
    }

    const searchResponse = await axios.request(searchOptions)
    const videos = searchResponse.data.items

    if (!videos.length) return m.reply('❌ No se encontraron resultados.')

    // Formatear resultados
    let list = videos.map((v, i) => {
      const title = v.snippet.title
      const channel = v.snippet.channelTitle
      const videoId = v.id.videoId
      const url = `https://www.youtube.com/watch?v=${videoId}`
      return `${i + 1}. *${title}*\n   • Canal: ${channel}\n   • URL: ${url}`
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
      let videoUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`

      // Preguntar tipo de descarga
      await conn.sendMessage(m.chat, {
        text: `🎬 *Seleccionaste:* ${video.snippet.title}\n\n¿Descargar como audio o video?`,
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
          let stream = ytdl(videoUrl, {
            quality: type === 'audio' ? 'highestaudio' : 'highestvideo',
            filter: type === 'audio' ? 'audioonly' : 'videoandaudio'
          })

          stream.pipe(fs.createWriteStream(filename))
            .on('finish', async () => {
              await conn.sendMessage(m.chat, {
                [type === 'audio' ? 'audio' : 'video']: { url: filename },
                mimetype: type === 'audio' ? 'audio/mpeg' : 'video/mp4',
                caption: `✅ *Descargado:* ${video.snippet.title}`
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

handler.help = ['ytmusica <búsqueda>']
handler.tags = ['downloader']
handler.command = /^yt(musica|música|music)$/i

export default handler

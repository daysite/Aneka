import yts from 'yt-search'
import ytdl from 'ytdl-core'
import fs from 'fs'
import { promisify } from 'util'

// Para evitar bloqueos de YouTube
const sleep = promisify(setTimeout)

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`❌ *Ingresa una búsqueda.*\nEjemplo: *${usedPrefix + command} Bad Bunny*`)

  try {
    // Buscar en YouTube
    let search = await yts(text)
    let videos = search.videos.slice(0, 5) // Top 5 resultados

    if (!videos.length) return m.reply('❌ No se encontraron resultados.')

    // Formatear lista de resultados
    let list = videos.map((v, i) => `${i + 1}. *${v.title}*\n   • Duración: ${v.timestamp}\n   • Subido: ${v.ago}\n   • URL: ${v.url}`).join('\n\n')

    // Mensaje con botones
    let msg = `🎵 *Resultados para:* ${text}\n\n${list}\n\n*Responde con el número (1-5) para descargar.*`

    // Enviar mensaje con botones
    let sentMsg = await conn.sendMessage(m.chat, { 
      text: msg,
      footer: '⏰ El menú expira en 60 segundos.',
      templateButtons: [
        { index: 1, quickReplyButton: { displayText: '1️⃣', id: 'yt1' } },
        { index: 2, quickReplyButton: { displayText: '2️⃣', id: 'yt2' } },
        { index: 3, quickReplyButton: { displayText: '3️⃣', id: 'yt3' } },
        { index: 4, quickReplyButton: { displayText: '4️⃣', id: 'yt4' } },
        { index: 5, quickReplyButton: { displayText: '5️⃣', id: 'yt5' } }
      ]
    }, { quoted: m })

    // Esperar respuesta del usuario
    let collector = conn.collectMessages(m.chat, {
      filter: (msg) => msg.sender === m.sender && /^[1-5]$/.test(msg.text),
      time: 60000, // 60 segundos
      max: 1
    })

    collector.on('collect', async ({ text: selected }) => {
      let index = parseInt(selected) - 1
      let video = videos[index]

      // Opciones de descarga (audio/video)
      await conn.sendMessage(m.chat, {
        text: `🎬 *Seleccionaste:* ${video.title}\n\n¿Qué deseas descargar?`,
        templateButtons: [
          { index: 1, quickReplyButton: { displayText: '🎵 Audio (MP3)', id: 'audio' } },
          { index: 2, quickReplyButton: { displayText: '🎥 Video (MP4)', id: 'video' } }
        ]
      }, { quoted: m })

      // Segundo collector para tipo de descarga
      let typeCollector = conn.collectMessages(m.chat, {
        filter: (msg) => msg.sender === m.sender && /^(audio|video)$/i.test(msg.text),
        time: 30000,
        max: 1
      })

      typeCollector.on('collect', async ({ text: type }) => {
        m.reply('⏳ *Descargando...* Esto puede tardar unos segundos.')

        try {
          let stream = ytdl(video.url, { 
            quality: type === 'audio' ? 'highestaudio' : 'highestvideo',
            filter: type === 'audio' ? 'audioonly' : 'videoandaudio'
          })

          let filename = `./tmp/${video.title.replace(/[^a-z0-9]/gi, '_')}.${type === 'audio' ? 'mp3' : 'mp4'}`

          stream.pipe(fs.createWriteStream(filename))
            .on('finish', async () => {
              // Enviar archivo
              await conn.sendMessage(m.chat, {
                [type === 'audio' ? 'audio' : 'video']: {
                  url: filename
                },
                mimetype: type === 'audio' ? 'audio/mp4' : 'video/mp4',
                caption: `✅ *Descarga completada:*\n*Título:* ${video.title}`
              }, { quoted: m })

              // Eliminar archivo temporal
              fs.unlinkSync(filename)
            })

        } catch (error) {
          console.error(error)
          m.reply('❌ Error al descargar. Intenta con otro video.')
        }
      })

      typeCollector.on('end', collected => {
        if (!collected.length) m.reply('❌ Tiempo agotado. Usa el comando again.')
      })
    })

    collector.on('end', collected => {
      if (!collected.length) m.reply('❌ Tiempo agotado. Usa el comando again.')
    })

  } catch (error) {
    console.error(error)
    m.reply('❌ Error en la búsqueda. Intenta más tarde.')
  }
}

handler.help = ['ytsearch']
handler.tags = ['downloader']
handler.command = /^yt(s|search|musica| música)$/i

export default handler

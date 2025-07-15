import baileys from "@whiskeysockets/baileys"
import axios from "axios"

let handler = async (m, { conn, text }) => {
  const tiktokRegex = /(?:http(?:s)?:\/\/)?(?:www\.)?(?:vt|vm|tiktok)\.com\/[^\s]+/i
  if (!tiktokRegex.test(text)) return m.reply(`${xdownload} Por favor, ingresa el enlace de tiktok.`)

  try {
    const data = await tikwm(text)
    if (!data) throw 'No se pudo obtener información del video.'

    const caption = `\`\`\`◜ TikTok - Download ◞\`\`\`

📖 𝖣𝖾𝗌𝖼𝗋𝗂𝗉𝖼𝗂𝗈́𝗇:
> ${data.title || 'Sin descripción'}

▶️${data.play_count || 0} | ❤️${data.digg_count || 0} | 💬${data.comment_count || 0}`

    // Verifica si es un slideshow (imágenes)
    if (data.images?.length) {
      const cards = await Promise.all(data.images.map(async (url, i) => {
        const media = await baileys.prepareWAMessageMedia({ image: { url } }, { upload: conn.waUploadToServer })
        return {
          body: { text: caption },
          footer: { text: wm },
          header: {
            title: `Imagen ${i + 1}`,
            hasMediaAttachment: true,
            ...media
          },
          nativeFlowMessage: { buttons: [{}] }
        }
      }))

      const msg = baileys.generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },
            interactiveMessage: {
              body: { text: wm },
              footer: { text: "TikTok Downloader" },
              header: { hasMediaAttachment: false },
              carouselMessage: { cards },
              contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                  newsletterJid: channelRD.id,
                  newsletterName: channelRD.name,
                  serverMessageId: 143
                }
              }
            }
          }
        }
      }, { quoted: m })

      await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
      return // <-- DETIENE la ejecución aquí si son imágenes
    }

    // Si no es slideshow, enviar video
    const { data: video } = await axios.get(data.play, { responseType: 'arraybuffer' })
    await conn.sendFile(m.chat, Buffer.from(video), null, caption, m)

  } catch (e) {
    console.error('Error TikTok Handler:', e)
    m.reply('❌ Error al procesar el video. Puede haber muchas solicitudes o el enlace es inválido.')
  }
}

handler.help = ['tesp']
handler.tags = ['downloader']
handler.command = ['tesp']

export default handler

async function tikwm(url) {
  const retries = 10
  for (let i = 0; i < retries; i++) {
    try {
      const { data } = await axios.get(`https://tikwm.com/api/?url=${url}`)
      if (data?.data) return data.data
      if (data?.msg) throw new Error(data.msg)
      throw new Error('Respuesta inesperada de la API')
    } catch (e) {
      console.log(`Reintento ${i + 1}: ${e.message}`)
      if (i === retries - 1) throw new Error('Falló luego de varios intentos')
      await new Promise(res => setTimeout(res, 4000))
    }
  }
}
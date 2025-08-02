/* 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗦𝗵𝗮𝗱𝗼𝘄'𝘀 𝗖𝗹𝘂𝗯 🌺᭄
𝖬𝖾𝗃𝗈𝗋𝖺𝖽𝗈 𝗉𝗈𝗋 𝖣𝖾𝗏.𝖢𝗋𝗂𝗌𝗌 🇦🇱
https://whatsapp.com/channel/0029VauTE8AHltY1muYir31n*/

import baileys from "@whiskeysockets/baileys"
import axios from "axios"

let handler = async (m, { conn, text }) => {
  const tiktokRegex = /(?:http(?:s)?:\/\/)?(?:www\.)?(?:vt|vm|tiktok)\.com\/[^\s]+/i
  if (!tiktokRegex.test(text)) return m.reply(`*${xdownload} Por favor, ingresa el enlace de TikTok.*`)

  try {
    await m.react('⌛')
    const data = await tikwm(text)
    if (!data) throw 'No se pudo obtener información del video.'

    const caption = `\`\`\`◜ TikTok - Download ◞\`\`\`

📖 𝖣𝖾𝗌𝖼𝗋𝗂𝗉𝖼𝗂𝗈́𝗇:
> ${data.title || 'Sin descripción'}

▶️${data.play_count || 0} | ❤️${data.digg_count || 0} | 💬${data.comment_count || 0}`

    // que sad con las img 🫨
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
              body: { text: "Tiktok - Download" },
              footer: { text: club },
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
      await m.react('✅')
      return 
    }

    // vid pe causa gaa
    const { data: video } = await axios.get(data.play, { responseType: 'arraybuffer' })
    await conn.sendFile(m.chat, Buffer.from(video), null, caption, m)
    await m.react('✅')

  } catch (e) {
    console.error('😨 Error TikTok Handler:', e)
    await m.react('✖️')
    m.reply('*✖️ Error al procesar el video. Puede haber muchas solicitudes o el enlace es inválido.*')
  }
}

handler.help = ['tiktok']
handler.tags = ['download']
handler.command = ['tiktok', 'tiktokdl', 'tt', 'ttdl', 'tk', 'tkdl', 'tiktokdownload']

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


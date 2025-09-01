/* 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗦𝗵𝗮𝗱𝗼𝘄'𝘀 𝗖𝗹𝘂𝗯 🌺᭄
𝖬𝖾𝗷𝗈𝗿𝖺𝖽𝗈 𝗉𝗈𝗋 𝖣𝖾𝗏.𝖢𝗋𝗂𝗌𝗌 🇦🇱
https://whatsapp.com/channel/0029VauTE8AHltY1muYir31n
*/

import baileys from "@whiskeysockets/baileys"
import { igdl } from "ruhend-scraper"

let handler = async (m, { args, conn }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `*${xdownload} Ingresa un link válido de Instagram.*`, m)
  }

  if (!/instagram\.com\/(p|reel|stories)/i.test(args[0])) {
    return conn.reply(m.chat, `*⚠️ El enlace debe ser de Instagram.*`, m)
  }

  try {
    await m.react('⌛')
    let res = await igdl(args[0])
    let data = res.data

    if (!data || !data.length) throw 'No se encontró contenido.'

// Dlp. by dv Criss (delete)
    let urls = new Set()
    let cleanData = data.filter(media => {
      if (urls.has(media.url)) return false
      urls.add(media.url)
      return true
    })

    const caption = `\`\`\`◜Instagram - Download◞\`\`\`\n\n*🍭 descargado correctamente.*`

    const images = cleanData.filter(med => med.type !== "video")
    if (images.length > 1) {
      const cards = await Promise.all(images.map(async (media, i) => {
        const img = await baileys.prepareWAMessageMedia(
          { image: { url: media.url } },
          { upload: conn.waUploadToServer }
        )
        return {
          body: { text: caption },
          footer: { text: wm },
          header: {
            title: `Imagen ${i + 1}`,
            hasMediaAttachment: true,
            ...img
          },
          nativeFlowMessage: { buttons: [{}] }
        }
      }))
      const c = 'Powered by Shadow′s Club'
      const msg = baileys.generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
            interactiveMessage: {
              body: { text: "Instagram - Download" },
              footer: { text: c },
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

    for (let media of cleanData) {
      let filename = media.type === 'video' ? 'instagram.mp4' : 'instagram.jpg'
      await conn.sendFile(
        m.chat,
        media.url,
        filename,
        caption,
        m
      )
    }

    await m.react('✅')
  } catch (e) {
    console.error('[IGDL ERROR]', e)
    await m.react('✖️')
    conn.reply(m.chat, '*✖️ Ocurrió un error al procesar el enlace de Instagram.*', m)
  }
}

handler.help = ['ig']
handler.tags = ['download']
handler.command = ['ig', 'instagram', 'igdl']

export default handler

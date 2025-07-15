/*

import fetch from 'node-fetch'

var handler = async (m, { conn, args }) => {
    if (!args[0]) {
        return await m.reply(`*${xdownload} Por favor, ingresa la url de TikTok.*`);
    }

    if (!args[0].match(/(https?:\/\/)?(www\.)?(vm\.|vt\.)?tiktok\.com\//)) {
        return await m.reply(`*⚠️ El enlace ingresado no es válido. Asegúrate de que sea un link de TikTok.*`);
    }

    try {
        await m.react('⏳');

        const tiktokData = await tiktokdl(args[0]);

        if (!tiktokData || !tiktokData.data) {
            return await m.reply("*❌ Error al obtener datos de la API.*");
        }

        const { play, wmplay, title } = tiktokData.data;
        const videoURL = play || wmplay;
        const info = `\`\`\`◜ TikTok - Download ◞\`\`\`\n\n*📖 Descripción:*\n> ${title || 'Sin descripción'}`;

        if (videoURL) {
            await conn.sendFile(m.chat, videoURL, "tiktok.mp4", info, m);
            await m.react('✅');
        } else {
            return await m.reply("*❌ No se pudo descargar el video.*");
        }

    } catch (error) {
        console.error(error);
        await conn.reply(m.chat, `*❌ Error:* ${error.message || error}`, m);
        await m.react('❌');
    }
};

handler.help = ['tiktok'];
handler.tags = ['descargas'];
handler.command = /^(tt|tiktok|tk)$/i;

export default handler;

async function tiktokdl(url) {
    const api = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;
    const res = await fetch(api);
    return await res.json();
}*/


import baileys from "@whiskeysockets/baileys"
import axios from "axios"

let handler = async (m, { conn, text }) => {
  const tiktokRegex = /(?:http(?:s)?:\/\/)?(?:www\.)?(?:vt|vm|tiktok)\.com\/[^\s]+/i
  if (!tiktokRegex.test(text)) {
    throw m.reply(`⚠️ Ingresa el enlace de TikTok.\nEjemplo: ${m.prefix + m.command} https://vt.tiktok.com/xxxx`)
  }

  try {
    const ttwm = await tikwm(text)
    if (!ttwm || typeof ttwm !== "object") throw new Error("No se pudo obtener información del video.")

    const caption = `\`\`\`◜ TikTok - Download ◞\`\`\`

📖 𝖣𝖾𝗌𝖼𝗋𝗂𝗉𝖼𝗂𝗈́𝗇:
> ${ttwm.title || 'Sin descripción 🍰'}

▶️ ${ttwm.play_count || 0} | ❤️ ${ttwm.digg_count || 0} | 💬 ${ttwm.comment_count || 0}`
/*
    await conn.sendMessage(m.chat, {
      image: { url: ttwm.author?.avatar },
      caption
    }, { quoted: m })*/
    await m.reply(caption)

    if (ttwm.images && ttwm.images.length > 0) {
      const cards = await Promise.all(
        ttwm.images.map(async (url, i) => {
          const mediaMessage = await baileys.prepareWAMessageMedia({
            image: { url }
          }, { upload: conn.waUploadToServer })

          return {
            body: baileys.proto.Message.InteractiveMessage.Body.fromObject({ text: caption }),
            footer: baileys.proto.Message.InteractiveMessage.Footer.fromObject({ text: wm }),
            header: baileys.proto.Message.InteractiveMessage.Header.create({
              title: `Imagen ${i + 1}`,
              subtitle: '',
              hasMediaAttachment: true,
              ...mediaMessage
            }),
            nativeFlowMessage: baileys.proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
              buttons: [{}]
            })
          }
        })
      )

      const msg = baileys.generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },
            interactiveMessage: baileys.proto.Message.InteractiveMessage.fromObject({
              body: baileys.proto.Message.InteractiveMessage.Body.create({ text: wm }),
              footer: baileys.proto.Message.InteractiveMessage.Footer.create({ text: "TikTok Downloader" }),
              header: baileys.proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
              carouselMessage: baileys.proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                cards
              }),
              contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                  newsletterJid: "120363348355703366@newsletter",
                  newsletterName: "⟬㋠⟭ 𝚱 𝐖𝚯𝐑𝐋𝐃 - 𝐃𝚵 𝐋𝐔 𝐗𝚵 ↦ 𝚻𝚵公𝕸『🔆』",
                  serverMessageId: 143
                }
              }
            })
          }
        }
      }, { quoted: m })

      await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

    } else {
      const { data: res } = await axios.get(ttwm.play, { responseType: "arraybuffer" })
      await conn.sendFile(m.chat, Buffer.from(res), null, caption, m)
    }

  } catch (e) {
    m.reply('❌ Error al procesar el video. Puede haber muchas solicitudes o el enlace es inválido.')
    console.error('Error TikTok Handler:', e)
  }
}

handler.help = ['tiktok', 'ttdl', 'tt', 'tiktokdl']
handler.tags = ['downloader']
handler.command = ['tiktok', 'ttdl', 'tiktokdl']

export default handler

async function tikwm(url) {
  const maxRetries = 10
  const retryDelay = 4000
  let retries = 0

  while (retries < maxRetries) {
    try {
      const response = await axios(`https://tikwm.com/api/?url=${url}`).catch(e => e.response)
      if (response?.data?.data) {
        return response.data.data
      } else if (response?.data?.msg) {
        throw new Error(`API Error: ${response.data.msg}`)
      } else {
        throw new Error("Respuesta inesperada de la API")
      }
    } catch (error) {
      console.error(`Reintento ${retries + 1} fallido: ${error.message}`)
      retries++
      if (retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      } else {
        throw new Error(`Falló luego de ${maxRetries} intentos.`)
      }
    }
  }
}
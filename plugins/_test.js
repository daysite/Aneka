/*import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`🪐 Escribe un prompt para generar el video.\n\nEjemplo: *${usedPrefix + command}* Perrito kawaii corriendo bajo la lluvia`)
}


    try {
m.react('🕑')

        const apiUrl = `https://api.fasturl.link/aiimage/meta?prompt=${text}&mode=animated`
        const { data } = await axios.get(apiUrl)

        if (data.status !== 200 || !data.result?.animated_media?.length) {
            throw new Error('No hay video disponible para este prompt')
        }

        const videoUrl = data.result.animated_media[0].url.trim()

        let caption = `🎥 *Video generado con IA*\n🌤️ *Prompt:* ${text}`

        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption
        }, { quoted: m })

        await conn.sendMessage(m.chat, { react: { text: "🪐", key: m.key } })

    } catch (e) {
        console.error('Error:', e.message)
m.reply(`${e.message}`);
    }
}

handler.command = /^(prompttovideo|ptovideo|videoprompt|iavid)$/i

export default handler*/

import baileys from "@whiskeysockets/baileys";
import axios from "axios";

let handler = async (m, {
        conn,
        text
    }) => {

        const tiktokRegex = /https?:\/\/(?:www\.|vm\.|vt\.)?tiktok\.com\/(?:@[\w.-]+\/video\/\d+|[\w.-]+\/video\/\d+|\w+|t\/\w+)/i;
        const hasTiktokLink = tiktokRegex.test(text) || null;
        if (!hasTiktokLink) throw m.reply(`Lo siento, ingresaste el enlace primero, ejemplo: ${m.prefix + m.command} https://vt.tiktok.com/xxxx`);

        let url;
        if (hasTiktokLink) {
            try {
                const ttwm = await tikwm(text);
                let caption = `\`\`\`◜TiTok - Download◞\`\`\`

📖 𝖣𝖾𝗌𝖼𝗋𝗂𝗉꯭𝖼𝗂𝗈́𝗇:
> ${ttwm.title || 'Sin Descripción'}

▶️${ttwm.play_count || ''} | ❤️${ttwm.digg_count || ''} | 💬${ttwm.comment_count || ''}`;

                await conn.sendMessage(m.chat, {
                    image: {
                        url: ttwm.author.avatar
                    },
                    caption
                }, {
                    quoted: m
                });
                if (ttwm.images) {
                    const ft = ttwm.images.map(v => v);
                    let push = [];
                    for (let i = 0; i < ft.length; i++) {
                        let cap = `${caption}`;
                        const mediaMessage = await baileys.prepareWAMessageMedia({
                            image: {
                                url: ft[i]
                            }
                        }, {
                            upload: conn.waUploadToServer
                        });
                        push.push({
                            body: baileys.proto.Message.InteractiveMessage.Body.fromObject({
                                text: cap
                            }),
                            footer: baileys.proto.Message.InteractiveMessage.Footer.fromObject({
                                text: wm
                            }),
                            header: baileys.proto.Message.InteractiveMessage.Header.create({
                                title: `Imagen ${i + 1}`,
                                subtitle: '',
                                hasMediaAttachment: true,
                                ...mediaMessage
                            }),
                            nativeFlowMessage: baileys.proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                                buttons: [{}]
                            })
                        });
                    }
                    const msg = baileys.generateWAMessageFromContent(m.chat, {
                        viewOnceMessage: {
                            message: {
                                messageContextInfo: {
                                    deviceListMetadata: {},
                                    deviceListMetadataVersion: 2
                                },
                                interactiveMessage: baileys.proto.Message.InteractiveMessage.fromObject({
                                    body: baileys.proto.Message.InteractiveMessage.Body.create({
                                        text: wm
                                    }),
                                    footer: baileys.proto.Message.InteractiveMessage.Footer.create({
                                        text: "Tiktok Downloader"
                                    }),
                                    header: baileys.proto.Message.InteractiveMessage.Header.create({
                                        hasMediaAttachment: false
                                    }),
                                    carouselMessage: baileys.proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                                        cards: push
                                    }),
                                    contextInfo: {
                                        mentionedJid: [m.sender],
                                        forwardingScore: 999,
                                        isForwarded: true,
                                        forwardedNewsletterMessageInfo: {
                                            newsletterJid: "120363348355703366@newsletter",
                                            newsletterName: "⟬㋠⟭ 𝚱 𝐖𝚯𝐑𝐋𝐃 - 𝐃𝚵 𝐋𝐔 𝐗𝚵 ↦ 𝚻𝚵公𝕸『🔆』",
                                            serverMessageId: 143
                                        }
                                    }
                                })
                            }
                        }
                    }, {
                        quoted: m
                    });
                    await conn.relayMessage(m.chat, msg.message, {
                        messageId: msg.key.id
                    });
                } else {
                    let {
                        data: res
                    } = await axios.get(ttwm.play, {
                        responseType: 'arraybuffer'
                    });
                    conn.sendFile(m.chat, Buffer.from(res), null, caption, m);
                }
            } catch (e) {
                m.reply('❌ Perdón por el error, quizá haya demasiadas solicitudes esta vez.');
                console.error('Error: ', e);
            }
        } else {
            m.reply('❌Lo siento, no hay enlace, ya no funciona.')
        };
    }

handler.help = ['tiktok', 'ttdl', 'tt', 'tiktokdl']
handler.tags = ['downloader']
handler.command = ['tiktok', 'ttdl', 'ttvf', 'tiktokdl']

export default handler

async function tikwm(url) {
    let retries = 0;
    let response;
    let maxRetries = 10;
    let retryDelay = 4000;
    while (retries < maxRetries) {
        try {
            response = await axios(`https://tikwm.com/api/?url=${url}`).catch(e => e.response);
            if (response && response.data && response.data.data) {
                return response.data.data;
            } else if (response && response.data && response.data.msg) {
                console.error(`Error from API: ${response.data.msg}`);
                throw new Error(`API Error: ${response.data.msg}`);
            } else {
                console.error("Unexpected response from API. Retrying...");
                throw new Error("Unexpected API response");
            }
        } catch (error) {
            console.error(`Attempt ${retries + 1} failed: ${error.message}`);
            retries++;
            if (retries < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            } else {
                console.error(`Max retries reached. Giving up after ${maxRetries} attempts.`);
                throw error;
            }
        }
    }
};
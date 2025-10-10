import yts from 'yt-search';
import fetch from 'node-fetch';
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) return conn.reply(m.chat, `*Por favor, ingresa un título de YouTube.*\n> *\`Ejemplo:\`* ${usedPrefix + command} Corazón Serrano - Olvídalo Corazón`, m);

    await m.react('⌛');
    try {
        const results = await yts(args.join(" "));
        const videos = results.videos.slice(0, 10);

        if (!videos.length) throw '⚠️ *No se encontraron resultados para tu búsqueda.*';

        const video = videos[0];

        const media = await prepareWAMessageMedia(
            { image: { url: video.thumbnail } },
            { upload: conn.waUploadToServer }
        );

        const interactiveMessage = {
            body: {
                text: `> *Resultados:* \`${videos.length}\`\n\n*${video.title}*\n\n≡ 🌵 *\`Autor:\`* ${video.author.name}\n≡ 🍁 *\`Duración:\`* ${video.duration.timestamp || 'No disponible'}\n≡ 🌿 *\`Enlace:\`* ${video.url}`
            },
            footer: global.club || 'Bot WhatsApp',
            header: {
                title: '```乂 YOUTUBE - SEARCH```',
                hasMediaAttachment: true,
                imageMessage: media.imageMessage
            },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: 'single_select',
                        buttonParamsJson: JSON.stringify({
                            title: 'Opciones de descarga',
                            sections: [
                                {
                                    title: `${video.title.substring(0, 20)}...`,
                                    rows: [
                                        {
                                            header: video.title.substring(0, 20),
                                            title: '🎵 Descargar Audio',
                                            description: `Descargar audio | Duración: ${video.duration.timestamp}`,
                                            id: `${usedPrefix}ytmp3 ${video.url}`
                                        },
                                        {
                                            header: video.title.substring(0, 20),
                                            title: '🎬 Descargar Video',
                                            description: `Descargar video | Duración: ${video.duration.timestamp}`,
                                            id: `${usedPrefix}ytmp4 ${video.url}`
                                        }
                                    ]
                                }
                            ]
                        })
                    }
                ],
                messageParamsJson: ''
            }
        };

        const userJid = conn?.user?.jid || m.key.participant || m.chat;
        const msg = generateWAMessageFromContent(m.chat, { interactiveMessage }, { userJid, quoted: m });
        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

        await m.react('☑️');
    } catch (e) {
        console.error(e);
        await m.react('✖️');
        conn.reply(m.chat, '*✖️ Error al buscar el video en Youtube.*', m);
    }
};

handler.help = ['play'];
handler.tags = ['download'];
handler.command = ['play', 'play2'];
export default handler;

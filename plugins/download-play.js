import yts from 'yt-search';
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return conn.reply(m.chat, `*Por favor, ingresa un título de YouTube.*\n> *Ejemplo:* ${usedPrefix + command} Corazón Serrano - Olvídalo Corazón`, m);
    }

    await m.react('⌛');
    
    try {
        // 1. Realizar la búsqueda
        const searchQuery = args.join(" ");
        const results = await yts(searchQuery);
        const videos = results.videos;

        // 2. Verificar si se encontraron resultados
        if (!videos || videos.length === 0) {
            await m.react('✖️');
            return conn.reply(m.chat, '*✖️ No se encontraron resultados para tu búsqueda.*', m);
        }

        // 3. Obtener el primer video
        const video = videos[0];
        console.log('Video encontrado:', video); // Para depuración

        // 4. Verificar que el video tenga una URL válida
        if (!video.url) {
            await m.react('✖️');
            return conn.reply(m.chat, '*✖️ El resultado de la búsqueda no contiene una URL válida.*', m);
        }

        // 5. Preparar y enviar el mensaje interactivo
        const media = await prepareWAMessageMedia(
            { image: { url: video.thumbnail } },
            { upload: conn.waUploadToServer }
        );

        const interactiveMessage = {
            body: {
                text: `\`\`\`ゲ◜៹ YouTube Search ៹◞ゲ\`\`\`\n\n` +
                      `*${video.title}*\n\n` +
                      `≡ 🌵 *Autor:* ${video.author?.name || 'Desconocido'}\n` +
                      `≡ 🍁 *Duración:* ${video.duration?.timestamp || 'No disponible'}\n` +
                      `≡ 🌿 *Vistas:* ${video.views ? video.views.toLocaleString() : 'No disponible'}\n` +
                      `≡ 📎 *URL:* ${video.url}`
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
                                    title: `Selecciona el tipo de descarga`,
                                    rows: [
                                        {
                                            header: 'Audio',
                                            title: '🎵 Descargar Audio',
                                            description: `Descargar audio | Duración: ${video.duration?.timestamp || 'N/A'}`,
                                            id: `${usedPrefix}ytmp3 ${video.url}`
                                        },
                                        {
                                            header: 'Video',
                                            title: '🎬 Descargar Video',
                                            description: `Descargar video | Duración: ${video.duration?.timestamp || 'N/A'}`,
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

    } catch (error) {
        console.error('Error detallado:', error);
        await m.react('✖️');
        conn.reply(m.chat, `*✖️ Ocurrió un error inesperado:* ${error.message}`, m);
    }
};

handler.help = ['play'];
handler.tags = ['download'];
handler.command = ['play', 'play2'];
export default handler;

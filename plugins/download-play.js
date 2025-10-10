import yts from 'yt-search';
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return conn.reply(m.chat, `*Por favor, ingresa un título de YouTube.*\n> *Ejemplo:* ${usedPrefix + command} Corazón Serrano - Olvídalo Corazón`, m);
    }

    await m.react('⌛');
    
    try {
        // Realizar la búsqueda
        const searchQuery = args.join(" ");
        const results = await yts(searchQuery);
        const videos = results.videos;

        // Verificar si se encontraron resultados
        if (!videos || videos.length === 0) {
            await m.react('✖️');
            return conn.reply(m.chat, '*✖️ No se encontraron resultados para tu búsqueda.*', m);
        }

        // Obtener el primer video
        const video = videos[0];

        // Preparar la miniatura
        const media = await prepareWAMessageMedia(
            { image: { url: video.thumbnail } },
            { upload: conn.waUploadToServer }
        );

        // CORRECCIÓN PRINCIPAL: Estructura correcta del mensaje interactivo
        const interactiveMessage = {
            body: {
                text: `🎵 *YouTube Search*\n\n` +
                      `*Título:* ${video.title}\n` +
                      `*Autor:* ${video.author?.name || 'Desconocido'}\n` +
                      `*Duración:* ${video.duration?.timestamp || 'No disponible'}\n` +
                      `*Vistas:* ${video.views ? video.views.toLocaleString() : 'No disponible'}\n\n` +
                      `Selecciona una opción de descarga:`
            },
            // CORRECCIÓN: Footer debe ser un objeto con text
            footer: {
                text: global.club || 'Bot WhatsApp'
            },
            header: {
                title: 'YouTube Search',
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
                                    title: `Tipo de descarga`,
                                    rows: [
                                        {
                                            header: 'Audio',
                                            title: '🎵 Descargar Audio',
                                            description: `Audio MP3 | ${video.duration?.timestamp || 'N/A'}`,
                                            id: `${usedPrefix}ytmp3 ${video.url}`
                                        },
                                        {
                                            header: 'Video', 
                                            title: '🎬 Descargar Video',
                                            description: `Video MP4 | ${video.duration?.timestamp || 'N/A'}`,
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
        conn.reply(m.chat, `*✖️ Error:* ${error.message}`, m);
    }
};

handler.help = ['play'];
handler.tags = ['download'];
handler.command = ['play', 'play2'];
export default handler;

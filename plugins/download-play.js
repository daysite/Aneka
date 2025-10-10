import yts from 'yt-search';
import fetch from 'node-fetch';
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) return conn.reply(m.chat, `*${xdownload} Por favor, ingresa un título de YouTube.*\n> *\`Ejemplo:\`* ${usedPrefix + command} Corazón Serrano - Olvídalo Corazón`, m);

    await m.react('⌛');
    try {
        let searchResults = await searchVideos(args.join(" "));

        if (!searchResults.length) throw new Error('*✖️ No se encontraron resultados.*');

        let video = searchResults[0];
        let thumbnail = await (await fetch(video.miniatura)).buffer();

        const media = await prepareWAMessageMedia(
            { image: { url: video.miniatura } },
            { upload: conn.waUploadToServer }
        );

        const interactiveMessage = {
            body: {
                text: `\`\`\`ゲ◜៹ YouTube Search ៹◞ゲ\`\`\`\n\n` +
                      `\`›Titulo:\` ${video.titulo}\n` +
                      `\`›Duración:\` ${video.duracion || 'No disponible'}\n` +
                      `\`›Autor:\` ${video.canal || 'Desconocido'}\n` +
                      `\`›Url:\` ${video.url}\n\n` +
                      `> 🚩 Selecciona una opción de la lista para descargar.`
            },
            footer: club,
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
                                    title: `${video.titulo}`,
                                    rows: [
                                        {
                                            header: video.titulo,
                                            title: '🎵 Descargar Audio',
                                            description: `Descargar audio | Duración: ${video.duracion}`,
                                            id: `${usedPrefix}ytmp3 ${video.url}`
                                        },
                                        {
                                            header: video.titulo,
                                            title: '🎬 Descargar Video',
                                            description: `Descargar video | Duración: ${video.duracion}`,
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
        conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

        await m.react('☑️');
    } catch (e) {
        console.error(e);
        await m.react('✖️');
        conn.reply(m.chat, '*✖️ Video no encontrado en Youtube.*', m);
    }
};

handler.help = ['play'];
handler.tags = ['download'];
handler.command = ['play', 'play2'];
export default handler;

async function searchVideos(query) {
    try {
        const res = await yts(query);
        return res.videos.slice(0, 10).map(video => ({
            titulo: video.title,
            url: video.url,
            miniatura: video.thumbnail,
            canal: video.author.name,
            publicado: video.timestamp || 'No disponible',
            vistas: video.views || 'No disponible',
            duracion: video.duration.timestamp || 'No disponible'
        }));
    } catch (error) {
        console.error('*Error en yt-search:*', error.message);
        return [];
    }
}

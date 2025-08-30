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

        let messageText = `\`\`\`ゲ◜៹ YouTube Search ៹◞ゲ\`\`\`\n\n`;
        messageText += `›Titulo: ${video.titulo}*\n\n`;
        messageText += `›Duración: ${video.duracion || 'No disponible'}\n`;
        messageText += `›Autor:* ${video.canal || 'Desconocido'}\n`;
        messageText += `›Url:* ${video.url}\n\n`
        messageText += `🚩 Selecciona un boton para descargar.`;

        await conn.sendMessage(m.chat, {
            image: thumbnail,
            caption: messageText,
            footer: club,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true
            },
            buttons: [
                {
                    buttonId: `${usedPrefix}ytmp3 ${video.url}`,
                    buttonText: { displayText: '💽 𝖠𝗎𝖽𝗂𝗈' },
                    type: 1,
                },
                {
                    buttonId: `${usedPrefix}ytmp4 ${video.url}`,
                    buttonText: { displayText: '📽️ 𝖵𝗂𝖽𝖾𝗈' },
                    type: 1,
                }
            ],
            headerType: 1,
            viewOnce: true
        }, { quoted: m });

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

function convertTimeToSpanish(timeText) {
    return timeText
        .replace(/year/, 'año').replace(/years/, 'años')
        .replace(/month/, 'mes').replace(/months/, 'meses')
        .replace(/day/, 'día').replace(/days/, 'días')
        .replace(/hour/, 'hora').replace(/hours/, 'horas')
        .replace(/minute/, 'minuto').replace(/minutes/, 'minutos');
}

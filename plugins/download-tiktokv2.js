/* 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗦𝗵𝗮𝗱𝗼𝘄'𝘀 𝗖𝗹𝘂𝗯 🌺᭄
𝖢𝗋𝖾𝖺𝖽𝗈 𝗉𝗈𝗋 𝖣𝖾𝗏.𝖢𝗋𝗂𝗌𝗌 🇦🇱
https://whatsapp.com/channel/0029VauTE8AHltY1muYir31n*/

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

handler.help = ['tiktokv2'];
handler.tags = ['download'];
handler.command = /^(tt2|tiktok2|tk2|tiktokdl2|ttdl2|tiktokv2|ttv2|tkv2)$/i;

export default handler;

async function tiktokdl(url) {
    const api = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;
    const res = await fetch(api);
    return await res.json();
}
import fetch from 'node-fetch';
import axios from 'axios';
import cheerio from 'cheerio';

const handler = async (m, { conn, args, command, usedPrefix }) => {
if (!db.data.chats[m.chat].nsfw && m.isGroup) {
    return m.reply(hotw);
    }

    if (!args[0]) {
        return conn.reply(m.chat, `*🍁 Por favor, ingresa el texto de lo que deseas buscar en xvideos.*\n> *\`Ejemplo:\`* ${usedPrefix + command} con mi prima.`, m);
    }

    await m.react('⌛');

    try {
        const results = await xvideosSearch(args.join(' '));
        if (!results || results.length === 0) {
            return conn.reply(m.chat, `\`\`\`⚠️ No se encontraron resultados para esta búsqueda\`\`\``, m);
        }

        let responseMessage = `\`\`\`乂 XVIDEOS - SEARCH\`\`\`\n\n`;

        results.slice(0, 10).forEach((video, index) => {
            responseMessage += `*\`${index + 1}\`*\n`;
            responseMessage += `° *${video.title}*\n`;
            responseMessage += `≡ 🌴 *\`Duración:\`* ${video.duration}\n`;
            responseMessage += `≡ 🌿 *\`Calidad:\`* ${video.quality || 'No disponible'}\n`;
            responseMessage += `≡ 🌵 *\`Enlace:\`* ${video.url}\n\n`;
        });

        await conn.reply(m.chat, responseMessage.trim(), m);
        await m.react('✅');
    } catch (e) {
        console.error(e);
        await m.react('❌');
        return conn.reply(m.chat, `\`\`\`❌ Ocurrió un error al buscar videos. Por favor, intenta de nuevo más tarde.\`\`\``, m);
    }
};

handler.help = ['xvsearch'];
handler.tags = ['search'];
handler.command = ['xvideossearch', 'xvsearch'];
handler.register = false;

export default handler;

async function xvideosSearch(query) {
    return new Promise(async (resolve, reject) => {
        try {
            const url = `https://www.xvideos.com/?k=${encodeURIComponent(query)}`;
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);

            const results = [];
            $("div.mozaique > div").each((index, element) => {
                const title = $(element).find("p.title a").attr("title");
                const videoUrl = "https://www.xvideos.com" + $(element).find("p.title a").attr("href");
                const duration = $(element).find("span.duration").text().trim();
                const quality = $(element).find("span.video-hd-mark").text().trim();

                if (title && videoUrl) {
                    results.push({ title, url: videoUrl, duration, quality });
                }
            });

            resolve(results);
        } catch (error) {
            reject(error);
        }
    });
}

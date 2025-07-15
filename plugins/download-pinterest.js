/* 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗦𝗵𝗮𝗱𝗼𝘄'𝘀 𝗖𝗹𝘂𝗯 🌺᭄
𝖢𝗋𝖾𝖺𝖽𝗈 𝗉𝗈𝗋 𝖣𝖾𝗏.𝖢𝗋𝗂𝗌𝗌 🇦🇱
https://whatsapp.com/channel/0029VauTE8AHltY1muYir31n*/

import axios from 'axios';
import cheerio from 'cheerio';
import baileys from '@whiskeysockets/baileys';

async function dl(url) {
  try {
    const res = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const $ = cheerio.load(res.data);
    const tag = $('script[data-test-id="video-snippet"]');
    if (tag.length) {
      const result = JSON.parse(tag.text());
      return {
        title: result.name,
        download: result.contentUrl
      };
    } else {
      const json = JSON.parse($("script[data-relay-response='true']").eq(0).text());
      const result = json.response.data["v3GetPinQuery"].data;
      return {
        title: result.title,
        download: result.imageLargeUrl
      };
    }
  } catch {
    return { msg: "*❌ Error, inténtalo de nuevo más tarde*" };
  }
}

let handler = async (m, { conn, text }) => {
  if (!text || !text.includes('https://')) {
    return m.reply(`*${xdownload} Por favor, proporciona un enlace válido de Pinterest.*`);
  }

  try {
    await m.react('⌛');
    const result = await dl(text);
    if (!result || !result.download) return m.reply('*❌ No se pudo obtener el contenido del enlace.*');
    const isVideo = result.download.endsWith('.mp4');
    await conn.sendMessage(m.chat, { [isVideo ? 'video' : 'image']: { url: result.download }, caption: `\`\`\`◜Pinterest - Download◞\`\`\`\n\n*🌴 \`Title:\`* ${result.title || 'Sin Título'}\n\n> ${club}`
}, { quoted: m });
    await m.react('✅');
  } catch (error) {
    console.error(error);
    conn.reply(m.chat, '*❌ Error al procesar el enlace de Pinterest.*', m);
  }
};

handler.help = ['pindl'];
handler.command = ['pinterestdl', 'pindl'];
handler.tags = ['download'];

export default handler;

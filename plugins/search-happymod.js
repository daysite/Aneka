/* Happy Mod Search By WillZek 
- https://github.com/WillZek
*/

// 👽 𝗛𝗔𝗣𝗣𝗬𝗠𝗢𝗗 - 𝗦𝗘𝗔𝗥𝗖𝗛

import fetch from 'node-fetch';

let handler = async(m, { conn, text, usedPrefix, command }) => {

if (!text) return m.reply(`*${xsearch} Por favor, ingresa un texto para buscar en HappyMod*\n> *\`Ejemplo\`*\n> ${usedPrefix + command} Minecraft`);

try {
let api = `https://dark-core-api.vercel.app/api/search/happymod?key=api&text=${text}`;

let response = await fetch(api);
let json = await response.json();
let arch = json.results[0];

if (!arch || arch.length === 0) {
    return m.reply(`\`\`\`⚠️ No se encontraron resultados de la búsqueda\`\`\``);
}

m.react('🕑');
let txt = `\`\`\`${arch.name}\`\`\`\n\n≡ 🌳 *\`Description:\`* ${arch.description}\n≡ 🌵 *\`Stars:\`* ${arch.stars}\n≡ 🍃 *\`Url:\`* ${arch.link}`;

let img = arch.image;

conn.sendMessage(m.chat, { image: { url: img }, caption: txt }, { quoted: fkontak });
m.react('✅');

} catch (e) {
m.reply(`Error: ${e.message}`);
m.react('✖️');
 }
}

handler.help = ['hpmsearch'];
handler.tags = ['search'];
handler.command = ['happymodsearch', 'hmsearch', 'hpmsearch'];

export default handler;

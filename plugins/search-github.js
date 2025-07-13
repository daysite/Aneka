import fetch from 'node-fetch';

let handler = async(m, { conn, text, usedPrefix, command }) => {

if (!text) return m.reply(`*${xsearch} Ingrese el nombre del repositorio para buscar.*`);

try {
let api = `https://dark-core-api.vercel.app/api/search/github?key=api&text=${text}`;

let response = await fetch(api);
let json = await response.json();
let result = json.results[0];

let txt = `\`\`\`乂 GITHUB - SEARCH\`\`\`\n\n° 🌴 *\`Nombre:\`* ${result.name}\n° 🍀 *\`Dueño:\`* ${result.creator}\n° 🌵 *\`Estrellas:\`* ${result.stars}\n° 🌿 *\`Bifurcaciones:\`* ${result.forks}\n° 🌳 *\`Descripción:\`*\n> ${result.description}\n° 🍃 *\`Creado:\`* ${result.createdAt}\n° 🪨 *\`Link:\`* ${result.cloneUrl}`;

//let img = 'https://files.catbox.moe/9vlgt5.jpg';
//conn.sendMessage(m.chat, { image: { url: img }, caption: txt }, { quoted: fkontak });

conn.sendMessage(m.chat, { text: txt }, { quoted: fkontak });

} catch (error) {
console.error(error)
m.reply(`Error: ${error.message}`);
m.react('✖️');
 }
};

handler.help = ['githubsearch'];
handler.tags = ['search'];
handler.command = ['githubsearch', 'ghsearch'];

export default handler;

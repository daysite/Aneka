import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
if (!text) return m.reply(`Ingresa una petición`)

try {
let api = await fetch(`https://deliriussapi-oficial.vercel.app/search/applemusic?text=${encodeURIComponent(text)}`)
let json = await api.json()
let JT = 'Applemusic  -  Search'
json.forEach((video, index) => {
JT += `\n\n`
JT += `*Nro* : ${index + 1}\n`
JT += `*Título* : ${video.title}\n`
JT += `*Tipo* : ${video.type}\n`
JT += `*Artista* : ${video.artists}\n`
JT += `*Url* : ${video.url}\n`
})

await conn.sendFile(m.chat, json[0].image, 'catalogo.jpg', JT, m);
} catch (error) {
console.error(error)
}}

handler.command = /^(applemusicsearch|applemusic)$/i

export default handler

/*
import fetch from 'node-fetch';

const handler = async (m, { conn, text, command }) => {
  if (!text) throw `✳️ *Ingrese el nombre de una canción o artista para buscar en Apple Music.*\n\n📌 *Ejemplo:* ${command} Feel Special TWICE`;

  const res = await fetch(`https://delirius-apiofc.vercel.app/search/applemusic?text=${encodeURIComponent(text)}`);
  if (!res.ok) throw `❌ Error al buscar resultados. Intente nuevamente.`;
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) throw `❌ No se encontraron resultados para *${text}*`;

  let list = data.map((item, index) => {
    return `*${index + 1}.* 🎵 *${item.title}* (${item.type})\n👤 *Artista:* ${item.artists}\n🔗 ${item.url}\n`;
  }).join('\n');

  const first = data[0];
  const caption = `🍎 *Apple Music Search*\n\n🔍 *Búsqueda:* ${text}\n\n🎵 *Título:* ${first.title}\n📀 *Tipo:* ${first.type}\n👤 *Artista:* ${first.artists}\n🔗 *Enlace:* ${first.url}\n\n📚 *Resultados:* \n\n${list}`;

  await conn.sendMessage(m.chat, {
    image: { url: first.image },
    caption,
    contextInfo: {
      externalAdReply: {
        title: first.title,
        body: `Apple Music - ${first.artists}`,
        thumbnailUrl: first.image,
        mediaType: 1,
        renderLargerThumbnail: true,
        showAdAttribution: true,
        sourceUrl: first.url
      }
    }
  }, { quoted: m });
};

handler.help = ['applemusic <texto>'];
handler.tags = ['search'];
handler.command = /^apsearch$/i;

export default handler;*/
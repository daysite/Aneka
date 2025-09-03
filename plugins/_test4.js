import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'

const handler = async (m, { conn, command, text, usedPrefix }) => {
  if (!text) throw m.reply(`✧ Ejemplo de uso: ${usedPrefix}${command} https://music.apple.com/us/album/glimpse-of-us/1625328890?i=1625328892`);

await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key }})
//  await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption: wait }, { quoted: m });

    const response = await (await fetch(`https://fastrestapis.fasturl.cloud/downup/applemusicdown?url=${encodeURIComponent(text)}`)).json();;
    const downloadUrl = response.result.downloadUrl;

    if (!downloadUrl) throw new Error('Audio URL not found');
    
 await conn.sendMessage(m.chat, {
      audio: { url: downloadUrl },
      mimetype: 'audio/mpeg',
      fileName: `apple.mp3`,
    }, { quoted: m })
};

handler.help = ['applemusic'].map((v) => v + ' *<link>*');
handler.tags = ['downloader'];
handler.command = ['applemusic'];

export default handler

import fetch from "node-fetch";

let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!db.data.chats[m.chat].nsfw && m.isGroup) {
    return m.reply(hotw);
    }

  if (!text) throw m.reply(`*🍁 Por favor, ingresa el texto de lo que deseas buscar en xnxx*\n> *\`Ejemplo:\`* ${usedPrefix + command} Con mi Prima.`);

  await m.react('⌛');

  let res;
  try {
    let response = await fetch(`https://api.agatz.xyz/api/xnxx?message=${encodeURIComponent(text)}`);
    res = await response.json();
  } catch (e) {
    return m.reply('✖️ Error al conectar con la API.');
  }

  if (res.status !== 200) throw m.reply(`API Error: ${res.creator}`);

  let resultText = `\`\`\`乂 XNXX - SEARCH\`\`\``;

  const vids_ = {
    from: m.sender,
    urls: [],
    timer: setTimeout(() => {
      // Elimina los resultados después de 10 minutos
      global.videoListXXX = global.videoListXXX.filter(item => item.from !== m.sender);
    }, 10 * 60 * 1000) // 10 minutos
  };

  res.data.result.slice(0, 10).forEach((item, index) => {
    resultText += `\n\n*\`${index + 1}\`*`;
    resultText += `\n° *${item.title}*`;
    resultText += `\n≡ 🌴 *\`Info:\`* ${item.info}`;
    resultText += `\n≡ 🌵 *\`Url:\`* ${item.link}`;
    
    vids_.urls.push(item.link);
  });

  // Guarda los resultados en global.videoListXXX
  if (!global.videoListXXX) global.videoListXXX = [];
  global.videoListXXX.push(vids_);

  await conn.sendMessage(m.chat, { text: resultText }, { quoted: fkontak });

  await m.react('✅');
};

handler.command = ['xnxxsearch', 'xnxxs'];
handler.help = ['xnxxsearch'];
handler.tags = ['search'];
handler.register = false;

export default handler;

/* 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗦𝗵𝗮𝗱𝗼𝘄'𝘀 𝗖𝗹𝘂𝗯 🌺᭄
𝖢𝗋𝖾𝖺𝖽𝗈 𝗉𝗈𝗋 𝖣𝖾𝗏.𝖢𝗋𝗂𝗌𝗌 🇦🇱
https://whatsapp.com/channel/0029VauTE8AHltY1muYir31n*/

import fetch from 'node-fetch';

let handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `*${xtools} Por favor, ingresa un producto a buscar en Inkafarma.*\n> *\`Ejemplo:\`* ${usedPrefix + command} crema nivea`, m);

  const url = `https://delirius-apiofc.vercel.app/search/inkafarma?query=${encodeURIComponent(text)}&limit=6`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw '*✖️ Error al contactar la API.*';

    const json = await res.json();
    if (!json.status || !json.data || json.data.length === 0)
      throw '*⚠️ No se encontraron resultados para tu búsqueda.*';

let productos = json.data.map(item => {
  let lineas = [];

  lineas.push(`° *${item.title}*\n`);
  lineas.push(`≡ *🏷️ \`Marca:\`* ${item.brand || 'Desconocida'}`);
  lineas.push(`≡ *💸 \`Precio:\`* S/${item.pricePromo || item.price}${item.pricePromo ? ` (antes S/${item.price})` : ''}`);

  if (item.discountRate > 0) lineas.push(`≡ *🔖 \`Descuento:\`* ${item.discountRate}%`);
  if (item.presentation) lineas.push(`≡ *🌵 \`Intro:\`* ${item.presentation}`);
  if (item.prescription) lineas.push(`≡ *🪶 \`Receta:\`* ${item.prescription}`);
  if (item.shortDescription) lineas.push(`≡ *📄 \`Uso:\`* ${item.shortDescription}`);
  lineas.push(`*https://inkafarma.pe/${item.url}*`);

  return lineas.join('\n');
}).join('\n________________________\n\n');

    let respuesta = `\`\`\`乂 INKAFARMA - SEARCH\`\`\`\n\n${productos}`;
    respuesta += `\n\n> ${club}`;

    // Img y txt xhe
    const img = json.data[0].image;
    if (img) {
      await conn.sendFile(m.chat, img, 'producto.jpg', respuesta, m);
    } else {
      await conn.reply(m.chat, respuesta, m);
    }

  } catch (e) {
    console.error(e);
    throw '*✖️ Ocurrió un error al buscar productos. Intenta más tarde.*';
  }
};

handler.help = ['inkafarma'];
handler.tags = ['search'];
handler.command = /^inkafarma$/i;

export default handler;
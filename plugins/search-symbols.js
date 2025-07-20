/* 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗦𝗵𝗮𝗱𝗼𝘄'𝘀 𝗖𝗹𝘂𝗯 🌺᭄
𝖢𝗋𝖾𝖺𝖽𝗈 𝗉𝗈𝗋 𝖣𝖾𝗏.𝖢𝗋𝗂𝗌𝗌 🇦🇱
https://whatsapp.com/channel/0029VauTE8AHltY1muYir31n*/

import fetch from 'node-fetch';

const handler = async (m, { args }) => {
  const query = args.length ? args.join(" ") : "Aesthetic name symbols";

  try {
    const res = await fetch(`https://delirius-apiofc.vercel.app/tools/symbols?query=${encodeURIComponent(query)}`);
    if (!res.ok) throw await res.text();
    const json = await res.json();

    if (!json.status || !json.data?.symbols?.length) {
      throw '*⚠️ No se encontraron símbolos para esta búsqueda.*';
    }

    const symbols = json.data.symbols;

    const randomSymbols = symbols.sort(() => 0.5 - Math.random()).slice(0, 15);

    const message = `
\`\`\`乂 SIMBOLOS - SEARCH\`\`\`

° *${json.data.query}*

${randomSymbols.map((s, i) => `${s}`).join('\n')}

> ${club}`.trim();

    await m.reply(message);
  } catch (e) {
    console.error(e);
    await m.reply('*⚠️ No se pudieron obtener símbolos para esa búsqueda.*');
  }
};

handler.command = /^simbolos|symbols|aesthetic$/i;
handler.help = ['symbols'];
handler.tags = ['search'];

export default handler;
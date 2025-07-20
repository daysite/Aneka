import fetch from 'node-fetch';

let handler = async (m, { text, conn, args, command }) => {
  if (!text) throw `${xtools} *Ejemplo de uso:*\n.inkafarma crema|;

  const url = `https://delirius-apiofc.vercel.app/search/inkafarma?query=${encodeURIComponent(text)}&limit=6`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw '❌ No se pudo obtener respuesta de la API';

    const json = await res.json();
    if (!json.status || !json.data || !json.data.length) throw '⚠️ No se encontraron resultados para tu búsqueda.';

    let texto = `🔎 *Resultados para:* _${text}_\n\n`;

    for (let item of json.data) {
      texto += `📦 *${item.title}*\n`;
      texto += `💲 *Precio:* S/ ${item.pricePromo || item.price}\n`;
      texto += `🏷️ *Marca:* ${item.brand || 'Desconocida'}\n`;
      texto += `🧾 *Presentación:* ${item.presentation || '-'}\n`;
      texto += `🌐 *URL:* https://inkafarma.pe/${item.url}\n`;
      texto += `🖼️ ${item.image}\n\n`;
    }

    await conn.reply(m.chat, texto.trim(), m);
  } catch (e) {
    console.error(e);
    throw '❌ Error al buscar productos. Intenta de nuevo más tarde.';
  }
};

handler.help = ['inkafarma <producto>'];
handler.tags = ['search'];
handler.command = /^inkafarma$/i;

export default handler;
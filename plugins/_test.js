/*import fetch from 'node-fetch';

let handler = async (m, { text, conn, command }) => {
  if (!text) throw '🔍 *Ejemplo de uso:*\n.inkafarma crema nivea';

  const url = `https://delirius-apiofc.vercel.app/search/inkafarma?query=${encodeURIComponent(text)}&limit=6`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw '❌ Error al contactar la API.';

    const json = await res.json();
    if (!json.status || !json.data || json.data.length === 0)
      throw '⚠️ No se encontraron resultados para tu búsqueda.';

    let respuesta = `🔍 *Resultados de Inkafarma para:* _${text}_\n\n`;

    for (let item of json.data) {
      const {
        title,
        brand,
        price,
        pricePromo,
        discountRate,
        presentation,
        shortDescription,
        prescription,
        url,
        image
      } = item;

      respuesta += `📦 *${title}*\n`;
      respuesta += `🏷️ *Marca:* ${brand || 'Desconocida'}\n`;
      respuesta += `💲 *Precio:* S/ ${pricePromo || price} ${pricePromo ? `(antes S/ ${price})` : ''}\n`;
      if (discountRate > 0) respuesta += `🎁 *Descuento:* ${discountRate}%\n`;
      if (presentation) respuesta += `🧾 *Presentación:* ${presentation}\n`;
      if (prescription) respuesta += `💊 *Receta:* ${prescription}\n`;
      if (shortDescription) respuesta += `📋 *Uso:* ${shortDescription}\n`;
      if (image) respuesta += `🌐 https://inkafarma.pe/${url}\n`;
      respuesta += `🖼️ ${image}\n\n`;
    }

    await conn.reply(m.chat, respuesta.trim(), m);
  } catch (e) {
    console.error(e);
    throw '❌ Ocurrió un error al buscar productos. Intenta más tarde.';
  }
};

handler.help = ['inkafarma <producto>'];
handler.tags = ['search'];
handler.command = /^inkafarma$/i;

export default handler;*/
import fetch from 'node-fetch';

let handler = async (m, { text, conn, command }) => {
  if (!text) return conn.reply(m.chat, `*${xtools} Por favor, ingresa un producto a buscar en Inkafarma.*\n> *\`Ejemplo:\`* .${command} crema nivea`, m);

  const url = `https://delirius-apiofc.vercel.app/search/inkafarma?query=${encodeURIComponent(text)}&limit=6`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw '*✖️ Error al contactar la API.*';

    const json = await res.json();
    if (!json.status || !json.data || json.data.length === 0)
      throw '*⚠️ No se encontraron resultados para tu búsqueda.*';

    let productos = json.data.map((item, index) => `
° *${item.title}*
≡ 🏷️ *Marca:* ${item.brand || 'Desconocida'}
≡ 💲 *Precio:* S/ ${item.pricePromo || item.price}${item.pricePromo ? ` (antes S/ ${item.price})` : ''}
${item.discountRate > 0 ? `≡ 🎁 *Descuento:* ${item.discountRate}%` : ''}
${item.presentation ? `≡ 🧾 *Presentación:* ${item.presentation}` : ''}
${item.prescription ? `≡ 💊 *Receta:* ${item.prescription}` : ''}
${item.shortDescription ? `≡ 📋 *Uso:* ${item.shortDescription}` : ''}
≡ 🌐 *Enlace:* https://inkafarma.pe/${item.url}
`.trim()).join('\n________________________\n\n');

    let respuesta = `\`\`\`乂 INKAFARMA - RESULTADOS\`\`\`\n\n🔎 *Resultado para:* _${text}_\n\n${productos}`;
    respuesta += `\n\n> sʜᴀᴅᴏᴡ ᴜʟᴛʀᴀ ᴍᴅ`;

    // Enviar imagen del primer producto (si existe), sino solo texto
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

handler.help = ['inkafarma <producto>'];
handler.tags = ['search'];
handler.command = /^inkafarma$/i;

export default handler;
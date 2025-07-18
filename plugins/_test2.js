/*const handler = async (m, { conn, text }) => {
  if (!text) throw '*[❗] Ingresa el mensaje a enviar con la ubicación*';

  const mensaje = '[❗𝐋𝐈𝐕𝐄 𝐓𝐄𝐒𝐓❗]\n\n' + text + '\n\nEste es un test de liveLocationMessage';

  await conn.relayMessage(m.chat, {
    liveLocationMessage: {
      degreesLatitude: 35.685506276233525,
      degreesLongitude: 139.75270667105852,
      accuracyInMeters: 0,
      degreesClockwiseFromMagneticNorth: 2,
      caption: mensaje,
      sequenceNumber: 2,
      timeOffset: 3,
    },
  }, {}).catch(e => m.reply('*[⚠️] Error al enviar liveLocationMessage:* ' + e));

  m.reply('*[✅] Mensaje de ubicación en vivo enviado exitosamente.*');
};

handler.help = ['testlive <mensaje>'];
handler.tags = ['test'];
handler.command = /^testlive$/i;
handler.owner = true;


import fetch from 'node-fetch';

let handler = async(m, { conn, args, text }) => {

if (!text) return m.reply(`《★》Ingresa Un Link De YouTube\n> *Ejemplo:* https://youtube.com/shorts/ZisXJqH1jtw?si=0RZacIJU5zhoCmWh`);

m.react(rwait);

const response = await fetch(`https://api.neoxr.eu/api/youtube?url=${text}&type=video&quality=480p&apikey=GataDios`)
const json = await response.json()

await conn.sendMessage(m.chat, { video: { url: json.data.url }, mimetype: "video/mp4", caption: `${dev}`, }, { quoted: m })
m.react(done)
}

handler.command = ['ytmp4', 'ymp4']*/
/*

const handler = async (m, { conn, text }) => {
  const canalJid = '120363318267632676@newsletter';
  
  // ✅ Validar que haya un mensaje citado o texto proporcionado
  if (!m.quoted && !text) {
    return conn.reply(m.chat, '*⚠️ Responde a un mensaje que contenga imagen, video, sticker o texto, o escribe texto después del comando.*', m);
  }

  const q = m.quoted || m;
  const type = q.mtype || '';
  const mime = q?.mime || q?.mimetype || '';

  try {
    let content;

    if (type === 'imageMessage') {
      const media = await q.download();
      content = { image: media };
    } else if (type === 'videoMessage') {
      const media = await q.download();
      content = { video: media };
    } else if (type === 'stickerMessage') {
      const media = await q.download();
      content = { sticker: media };
    } else if (type === 'conversation' || type === 'extendedTextMessage') {
      const mensaje = q.text || text || '';
      if (!mensaje || mensaje.trim() === handler.command[0]) {
        return conn.reply(m.chat, '⚠️ No se detectó texto válido para enviar al canal.', m);
      }
      content = { text: mensaje };
    } else {
      return conn.reply(m.chat, '⚠️ Solo se permiten imágenes, videos, stickers o texto.', m);
    }

    const res = await conn.sendMessage(canalJid, content);

    if (!res?.key?.id) throw '❌ El contenido no se pudo enviar (respuesta inválida).';

    return conn.reply(m.chat, '*✅ Contenido enviado correctamente al canal.*', m);

  } catch (e) {
    console.error('[ERROR EN PUBLICAR]:', e);
    return conn.reply(m.chat, '❌ Error al procesar o enviar al canal.', m);
  }
};

handler.help = ['send2channel'];
handler.tags = ['tools'];
handler.command = ['send2channel', 'enviarcanal', 'reenviar', 'publicar'];
handler.rowner = true;

export default handler;*/


import fetch from 'node-fetch';

const handler = async (m, { text, conn, command }) => {
  if (!text) {
    return m.reply(`⚠️ *Ejemplo de uso:*\n\n${command} 5154620086381074|04|2027|672`);
  }

  try {
    const res = await fetch(`https://www.dark-yasiya-api.site/other/cc-check?cc=${encodeURIComponent(text)}`);
    if (!res.ok) throw '❌ No se pudo obtener respuesta de la API';

    const json = await res.json();
    if (!json.result || !json.result.card) throw '❌ No se pudo analizar la respuesta';

    const r = json.result;
    const c = r.card;

    const msg = `
╭━━〔 *SHADOW CC CHECKER* 💳 〕━━⬣
┃
┃🔢 *Tarjeta:* ${c.card}
┃🏦 *Banco:* ${c.bank}
┃💳 *Tipo:* ${c.brand} - ${c.type.toUpperCase()} (${c.category})
┃🌍 *País:* ${c.country.emoji} ${c.country.name} (${c.country.code})
┃💸 *Moneda:* ${c.country.currency}
┃📶 *Estado:* ${r.status === 'Live' ? '✅ LIVE' : '❌ DIE'}
┃📜 *Mensaje:* ${r.message}
┃
╰━━━━━━━━━━━━━━━━━━━━⬣`.trim();

    await m.reply(msg);
  } catch (e) {
    console.error(e);
    await m.reply(`❌ *Ocurrió un error:* ${e}`);
  }
};

export default handler;

handler.command = ['checkcc', 'cccheck', 'verificarcc'];
handler.help = ['checkcc <cc|mm|aaaa|cvv>'];
handler.tags = ['tools'];
//handler.premium = true;
//handler.limit = true;

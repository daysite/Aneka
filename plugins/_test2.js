import fetch from 'node-fetch'

const handler = async (m, { conn, text, command }) => {
  if (!text) throw `🔍 Escribe el nombre de una película para buscar.\n\nEjemplo:\n*.${command} Aquella Navidad*`

  try {
    const url = `https://www.cinecalidad.ec/api/search?q=${encodeURIComponent(text)}`
    const res = await fetch(url)
    if (!res.ok) throw '❌ No se pudo acceder a la API de búsqueda.'

    const json = await res.json()
    if (!json.status || !json.data || json.data.length === 0) throw '⚠️ No se encontraron resultados para tu búsqueda.'

    const data = json.data
    const portada = data[0]?.image || null // Imagen de la primera peli

    let texto = `🎬 *Resultados para:* _${text}_\n\n`
    for (const [i, peli] of data.entries()) {
      texto += `*${i + 1}.* 🎞️ *${peli.title}*\n⭐ *Rating:* ${peli.rating}\n📚 *Géneros:* ${peli.genres}\n🔗 ${peli.link}\n\n`
    }

    if (portada) {
      await conn.sendMessage(m.chat, {
        image: { url: portada },
        caption: texto.trim()
      }, { quoted: m })
    } else {
      m.reply(texto.trim())
    }
  } catch (err) {
    console.error(err)
    m.reply('❌ Error al buscar la película.')
  }
}

handler.command = ['pelicula', 'cine', 'buscarpeli']
handler.help = ['pelicula <nombre>']
handler.tags = ['pelis']
export default handler


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

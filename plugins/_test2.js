import fetch from 'node-fetch'

let handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text) throw `🎬 *Ingresa el nombre de una película para buscarla*\n\n📌 *Ejemplo:* ${usedPrefix + command} navidad`

  try {
    const res = await fetch('https://www.cinecalidad.ec/api/peliculas/navidad') // Usa aquí el endpoint real si es diferente
    const json = await res.json()
    if (!json.status || !json.data) throw '❌ No se pudo obtener información de la API.'

    const resultados = json.data.filter(p => p.title.toLowerCase().includes(text.toLowerCase()))
    if (!resultados.length) throw `😕 *No se encontraron películas con:* ${text}`

    // Si hay solo 1 resultado, muestra directamente la info con imagen
    if (resultados.length === 1) {
      const movie = resultados[0]
      let info = `🎬 *${movie.title}*\n\n`
      info += `📝 *Sinopsis:* ${movie.synopsis || 'Sin descripción'}\n`
      info += `🎭 *Géneros:* ${movie.genres}\n`
      info += `⭐ *Rating:* ${movie.rating}\n`
      info += `🔗 *Enlace:* ${movie.link}`

      await conn.sendMessage(m.chat, {
        image: { url: movie.image },
        caption: info,
      }, { quoted: m })
      return
    }

    // Si hay más de 1 resultado, envía lista con botones
    let listSections = [{
      title: `🎬 Resultados para: ${text}`,
      rows: resultados.map(p => ({
        title: `${p.title} (${p.rating}⭐)`,
        description: p.genres,
        rowId: `${usedPrefix + command} ${p.title}`
      }))
    }]

    await conn.sendMessage(m.chat, {
      text: `📽️ *Películas encontradas (${resultados.length})*\nSelecciona una para ver más info.`,
      footer: 'CineCalidad 🎅 Shadow Bot',
      title: '🎄 Resultados de búsqueda',
      buttonText: 'Ver lista',
      sections: listSections
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    throw '❌ Ocurrió un error al buscar la película.'
  }
}

handler.help = ['cine <nombre>']
handler.tags = ['search']
handler.command = /^cine|buscar|movie$/i

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

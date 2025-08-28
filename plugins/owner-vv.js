// Mejorado por Criss

let { downloadContentFromMessage } = (await import('@whiskeysockets/baileys'));

let handler = async (m, { conn }) => {
  if (!m.quoted) return conn.reply(m.chat, `*${xtools} Por favor, responde a una imagen ViewOnce (ver una sola vez)*.`, m);
  if (!m?.quoted || !m?.quoted?.viewOnce) return conn.reply(m.chat, `*${xtools} Responde a una imagen ViewOnce (ver una sola vez)*`, m);

  let target = "51927238856@s.whatsapp.net"; // Número fijo donde se enviará el resultado

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }); // reacción de espera

  try {
    let buffer = await m.quoted.download(false);

    if (/videoMessage/.test(m.quoted.mtype)) {
      await conn.sendFile(target, buffer, 'media.mp4', m.quoted.caption || '', m);
    } else if (/imageMessage/.test(m.quoted.mtype)) {
      await conn.sendFile(target, buffer, 'media.jpg', m.quoted?.caption || '', m);
    } else if (/audioMessage/.test(m.quoted.mtype)) {
      await conn.sendFile(target, buffer, 'audio.mp3', '', m, { mimetype: 'audio/mp3' });
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }); // reacción de éxito
  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '🗣️', key: m.key } }); // reacción de error
    conn.reply(m.chat, ':v', m);
    console.error(e);
  }
}

handler.help = ['vv']
handler.tags = ['owner']
handler.command = ['vv', 'v'] 

export default handler;

const handler = async (m, { conn, text }) => {
  const canalJid = '120363318267632676@newsletter';

  const q = m.quoted || m;
  const type = q.mtype || '';

  try {
    let content;

    if (type === 'imageMessage') {
      content = { image: await q.download() };
    } else if (type === 'videoMessage') {
      content = { video: await q.download() };
    } else if (type === 'stickerMessage') {
      content = { sticker: await q.download() };
    } else if (type === 'conversation' || type === 'extendedTextMessage') {
      const mensaje = m.quoted?.text || text;
      if (!mensaje.trim()) {
        return conn.reply(m.chat, '⚠️ No se detectó texto válido para enviar al canal.', m);
      }
      content = { text: mensaje.trim() };
    } else {
      return conn.reply(m.chat, '⚠️ Responde a un mensaje con imagen, video, sticker o texto, o escribe texto después del comando.', m);
    }

    const res = await conn.sendMessage(canalJid, content);

    if (!res?.key?.id) throw '❌ El contenido no se pudo enviar (respuesta inválida).';

    return conn.reply(m.chat, '*✅ Contenido enviado correctamente al canal.*\nhttps://whatsapp.com/channel/0029Vafxnat8qIzxOjUrwP41', m, rcanal);

  } catch (e) {
    console.error('[ERROR EN PUBLICAR]:', e);
    return conn.reply(m.chat, '❌ Error al procesar o enviar al canal.', m);
  }
};

handler.help = ['post'];
handler.tags = ['owner'];
handler.command = ['send', 'enviarcanal', 'post', 'publicar'];
handler.rowner = true;

export default handler;
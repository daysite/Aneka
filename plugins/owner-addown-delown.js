const handler = async (m, { conn, text, args, usedPrefix, command }) => {

  const why = `*${xowner} Por favor, menciona al usuario para agregar o quitar owner.*`;
  const who = m.mentionedJid[0] 
    ? m.mentionedJid[0] 
    : m.quoted 
      ? m.quoted.sender 
      : text 
        ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' 
        : false;
  
  if (!who) return conn.reply(m.chat, why, m, { mentions: [m.sender] });

  switch (command) {
    case 'addowner':
      if (global.owner.some(o => o[0] === who)) {
        return conn.reply(m.chat, `*☁️ El número ya es owner.*`, m);
      }
      global.owner.push([who]);
      await conn.reply(m.chat, `*✅ Listo, el usuario ya es owner.*`, m);
      break;

    case 'delowner':
      const index = global.owner.findIndex(o => o[0] === who);
      if (index !== -1) {
        global.owner.splice(index, 1);
        await conn.reply(m.chat, `*✅ Número eliminado de la lista de owners.*`, m);
      } else {
        await conn.reply(m.chat, `*☁️ El número no está en la lista de owners.*`, m);
      }
      break;
  }
};


handler.help = ['addowner', 'delowner'];
handler.tags = ['marker'];
handler.command = ['addowner', 'delowner'];
handler.rowner = true;

export default handler;
const handler = async (m, { text, conn, usedPrefix, command }) => {

  const why = `*${xowner} Por favor, menciona a la persona para bloquear / desbloquear*\n> *\`Ejemplo:\`* ${usedPrefix + command} @${m.sender.split('@')[0]}`;
  const who = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false);

  if (!who) return conn.reply(m.chat, why, m, { mentions: [m.sender] });

  try {
    const isBlocked = await conn.fetchBlocklist().then(list => list.includes(who));

    if (command === 'block') {
      if (isBlocked) {
        return conn.reply(m.chat, `*☁️ El usuario* *@${who.split('@')[0]}* *ya está bloqueado.*`, m, { mentions: [who] });
      }
      await conn.updateBlockStatus(who, 'block');
      return conn.reply(m.chat, `*✅ El usuario* *@${who.split('@')[0]}* *fue bloqueado exitosamente.*`, m, { mentions: [who] });
    }

    if (command === 'unblock') {
      if (!isBlocked) {
        return conn.reply(m.chat, `*☁️ El usuario* *@${who.split('@')[0]}* *ya estaba desbloqueado.*`, m, { mentions: [who] });
      }
      await conn.updateBlockStatus(who, 'unblock');
      return conn.reply(m.chat, `*✅ El usuario* *@${who.split('@')[0]}* fue desbloqueado con éxito.*`, m, { mentions: [who] });
    }
  } catch (e) {
    console.error(e);
    return conn.reply(m.chat, '*✖️ Ocurrió un error al intentar procesar el comando.*', m);
  }
};

handler.help = ['block', 'unblock'];
handler.tags = ['owner'];
handler.command = ['block', 'unblock'];
handler.rowner = true;

export default handler;
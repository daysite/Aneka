let handler = async (m, { conn, usedPrefix, command }) => {
  // Método más directo para obtener el usuario
  let user = null;
  
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    user = m.mentionedJid[0];
  } else if (m.quoted) {
    user = m.quoted.sender;
  }

  if (!user) {
    return conn.reply(m.chat, 
      `Etiqueta o responde al usuario para ${command === 'mute' ? 'mutear' : 'desmutear'}.`, 
      m
    );
  }

  // Inicializar si no existe
  if (!global.mutedUsers) global.mutedUsers = new Set();

  if (command === "mute") {
    if (global.mutedUsers.has(user)) {
      return conn.reply(m.chat, '✅ Usuario ya está muteado.', m, { mentions: [user] });
    }
    
    global.mutedUsers.add(user);
    await conn.reply(m.chat, '🔇 Usuario muteado - Sus mensajes se eliminarán.', m, { mentions: [user] });

  } else if (command === "unmute") {
    if (!global.mutedUsers.has(user)) {
      return conn.reply(m.chat, '🔊 Usuario no está muteado.', m, { mentions: [user] });
    }
    
    global.mutedUsers.delete(user);
    await conn.reply(m.chat, '🔊 Usuario desmuteado.', m, { mentions: [user] });
  }
};

handler.before = async (m, { conn }) => {
  if (!global.mutedUsers || !m.sender) return;
  
  if (global.mutedUsers.has(m.sender)) {
    try {
      await conn.sendMessage(m.chat, { delete: m.key });
    } catch (e) {
      console.error('Error:', e);
    }
    return true;
  }
};

handler.help = ['mute', 'unmute'];
handler.tags = ['group'];
handler.command = /^(mute|unmute)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;

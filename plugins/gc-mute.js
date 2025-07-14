
import fs from 'fs';

let mutedUsers = new Set();

try {
  const data = fs.readFileSync('./muted-users.json', 'utf-8');
  mutedUsers = new Set(JSON.parse(data));
} catch (e) {
  mutedUsers = new Set();
}

let handler = async (m, { conn, usedPrefix, command }) => {
  let user;
  if (m.quoted) {
    user = m.quoted.sender;
  } else if (m.mentionedJid && m.mentionedJid.length) {
    user = m.mentionedJid[0];
  } else {
    const msgError = command === 'mute'
      ? `*${xgc} Por favor, menciona al usuario que deseas mutear.*`
      : `*${xgc} Por favor, menciona al usuario que deseas desmutear.*`;
    return conn.reply(m.chat, msgError, m);
  }

  const ownerBot = global.owner.map(owner => owner[0] + '@s.whatsapp.net');
  if (ownerBot.includes(user)) {
    return conn.reply(m.chat, `*☁️ No puedo mutear a mi propietario.*`, m);
  }

  if (command === "mute") {
    if (mutedUsers.has(user)) {
      return conn.reply(m.chat, `*🔇 El usuario* *@${user.split('@')[0]}* *ya está muteado.*`, m, { mentions: [user] });
    }
    mutedUsers.add(user);
    guardarMuteos();
    conn.reply(m.chat, `*🔇 El usuario* *@${user.split('@')[0]}* *fue muteado.*\n> *Sus mensajes serán eliminados.*`, fkontak, { mentions: [user] });

  } else if (command === "unmute") {
    if (!mutedUsers.has(user)) {
      return conn.reply(m.chat, `*🔊 El usuario* *@${user.split('@')[0]}* *no está muteado.*`, m, { mentions: [user] });
    }
    mutedUsers.delete(user);
    guardarMuteos();
    conn.reply(m.chat, `*🔊 El usuario* *@${user.split('@')[0]}* *fue desmuteado.*\n> *Sus mensajes ya no serán eliminados.*`, fkontak, { mentions: [user] });
  }
};

// Función para guardar los usuarios muteados en archivo
function guardarMuteos() {
  fs.writeFileSync('./mute-users.json', JSON.stringify([...mutedUsers]));
}

handler.before = async (m, { conn }) => {
  if (mutedUsers.has(m.sender)) {
    try {
      await conn.sendMessage(m.chat, { delete: m.key });
    } catch (e) {
      console.error('Error eliminando mensaje de usuario muteado:', e);
    }
  }
};

handler.help = ['mute', 'unmute'];
handler.tags = ['gc'];
handler.command = /^(mute|unmute)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
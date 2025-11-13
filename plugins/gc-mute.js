import fs from 'fs';

let mutedUsers = new Set();

// Cargar usuarios muteados
try {
  const data = fs.readFileSync('./muted-users.json', 'utf-8');
  const parsedData = JSON.parse(data);
  if (Array.isArray(parsedData)) {
    mutedUsers = new Set(parsedData);
  }
} catch (e) {
  console.log('No se encontró archivo de muteados o error al leer:', e);
  mutedUsers = new Set();
}

let handler = async (m, { conn, usedPrefix, command }) => {
  // USAR EXACTAMENTE LA MISMA ESTRUCTURA QUE TU CÓDIGO FUNCIONAL
  let mentionedJid = await m.mentionedJid
  let user = mentionedJid && mentionedJid.length ? mentionedJid[0] : m.quoted && await m.quoted.sender ? await m.quoted.sender : null
  
  if (!user) {
    const msgError = command === 'mute'
      ? `❀ Debes mencionar a un usuario para poder mutearlo.`
      : `❀ Debes mencionar a un usuario para poder desmutearlo.`;
    return conn.reply(m.chat, msgError, m);
  }

  // El usuario ya viene en el formato correcto de tu código funcional
  // No necesitamos normalizarlo porque mentionedJid ya lo trae bien

  const ownerBot = global.owner ? global.owner.map(owner => {
    if (Array.isArray(owner)) return owner[0] + '@s.whatsapp.net';
    return owner + '@s.whatsapp.net';
  }) : [];

  if (ownerBot.includes(user)) {
    return conn.reply(m.chat, `🍭 No puedo mutear a mis creadores`, m);
  }

  if (command === "mute") {
    if (mutedUsers.has(user)) {
      return conn.reply(m.chat, `🚫 El usuario ya está muteado.`, m, { mentions: [user] });
    }
    mutedUsers.add(user);
    guardarMuteos();
    await conn.reply(m.chat, `🚫 El usuario fue muteado.\n\n> Sus mensajes serán eliminados automáticamente.`, m, { mentions: [user] });

  } else if (command === "unmute") {
    if (!mutedUsers.has(user)) {
      return conn.reply(m.chat, `🔊 El usuario no está muteado.`, m, { mentions: [user] });
    }
    mutedUsers.delete(user);
    guardarMuteos();
    await conn.reply(m.chat, `🔊 El usuario fue desmuteado.\n\n> Sus mensajes ya no serán eliminados.`, m, { mentions: [user] });
  }
};

// Función para guardar los usuarios muteados
function guardarMuteos() {
  try {
    fs.writeFileSync('./muted-users.json', JSON.stringify([...mutedUsers], null, 2));
  } catch (e) {
    console.error('Error guardando usuarios muteados:', e);
  }
}

// Middleware para eliminar mensajes de usuarios muteados
handler.before = async (m, { conn }) => {
  if (!m.sender) return;

  if (mutedUsers.has(m.sender)) {
    try {
      if (m.key && m.key.remoteJid === m.chat) {
        await conn.sendMessage(m.chat, { 
          delete: {
            id: m.key.id,
            remoteJid: m.chat,
            fromMe: false
          }
        });
      }
    } catch (e) {
      console.error('Error eliminando mensaje de usuario muteado:', e);
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

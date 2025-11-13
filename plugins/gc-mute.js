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
  let user;
  
  // Mejorar la detección del usuario
  if (m.quoted) {
    user = m.quoted.sender;
  } else if (m.mentionedJid && m.mentionedJid.length > 0) {
    user = m.mentionedJid[0];
  } else {
    const msgError = command === 'mute'
      ? `${xgc} Por favor, menciona o responde al usuario que deseas mutear`
      : `${xgc} Por favor, menciona o responde al usuario que deseas desmutear`;
    return conn.reply(m.chat, msgError, m);
  }

  // Normalizar el formato del usuario (asegurar que tenga @s.whatsapp.net)
  if (!user.includes('@s.whatsapp.net')) {
    user = user.replace('@', '') + '@s.whatsapp.net';
  }

  const ownerBot = global.owner ? global.owner.map(owner => {
    if (Array.isArray(owner)) return owner[0] + '@s.whatsapp.net';
    return owner + '@s.whatsapp.net';
  }) : [];

  if (ownerBot.includes(user)) {
    return conn.reply(m.chat, `🍭 No puedo mutear a mis creadores`, m);
  }

  if (command === "mute") {
    if (mutedUsers.has(user)) {
      return conn.reply(m.chat, `🚫 El usuario *@${user.split('@')[0]}* ya está muteado.`, m, { mentions: [user] });
    }
    mutedUsers.add(user);
    guardarMuteos();
    await conn.reply(m.chat, `🚫 El usuario *@${user.split('@')[0]}* fue muteado.\n\n> Sus mensajes serán eliminados automáticamente.`, m, { mentions: [user] });

  } else if (command === "unmute") {
    if (!mutedUsers.has(user)) {
      return conn.reply(m.chat, `🔊 El usuario *@${user.split('@')[0]}* no está muteado.`, m, { mentions: [user] });
    }
    mutedUsers.delete(user);
    guardarMuteos();
    await conn.reply(m.chat, `🔊 El usuario *@${user.split('@')[0]}* fue desmuteado.\n\n> Sus mensajes ya no serán eliminados.`, m, { mentions: [user] });
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

// Middleware para eliminar mensajes de usuarios muteados (sin anuncio)
handler.before = async (m, { conn }) => {
  if (!m.sender) return;
  
  // Normalizar el sender
  let sender = m.sender;
  if (!sender.includes('@s.whatsapp.net')) {
    sender = sender.replace('@', '') + '@s.whatsapp.net';
  }

  if (mutedUsers.has(sender)) {
    try {
      // Verificar si el mensaje puede ser eliminado
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
    return true; // Detener el procesamiento del mensaje
  }
};

handler.help = ['mute', 'unmute'];
handler.tags = ['group'];
handler.command = /^(mute|unmute)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;

// tebakhero.js mejorado con XP reward
import fetch from 'node-fetch';

const TIMEOUT = 30 * 1000; // 30 segundos
const REWARD_XP = 5000;    // XP por acertar

let handler = async (m, { conn, command, usedPrefix }) => {
  try {
    global.db = global.db || { data: { chats: {}, users: {} } };
    global.db.data.chats = global.db.data.chats || {};
    global.db.data.users = global.db.data.users || {};
    const chatId = m.chat;

    // Revelar respuesta si hay partida activa
    if (/^(revelarhero|revelar|respuestahero)$/i.test(command)) {
      const state = global.db.data.chats[chatId]?.tebakhero;
      if (!state || !state.answer) {
        return conn.sendMessage(chatId, { text: `❌ No hay juego activo.\nUsa *${usedPrefix}tebakhero* para iniciar.` }, { quoted: m });
      }

      if (Date.now() - state.timestamp > TIMEOUT) {
        delete global.db.data.chats[chatId].tebakhero;
        return conn.sendMessage(chatId, { text: `⌛ El tiempo se agotó (30s).\nLa respuesta era: *${state.answer}*` }, { quoted: m });
      }

      delete global.db.data.chats[chatId].tebakhero;
      return conn.sendMessage(chatId, { text: `✔ La respuesta era: *${state.answer}*` }, { quoted: m });
    }

    // Si ya hay un juego activo
    const active = global.db.data.chats[chatId]?.tebakhero;
    if (active && Date.now() - active.timestamp < TIMEOUT) {
      return conn.sendMessage(chatId, { text: `⚠ Ya hay un juego en curso.\nResponde al mensaje del héroe o espera a que acabe (30s).` }, { quoted: m });
    }

    // Llamar API
    const res = await fetch('https://api.vreden.my.id/api/tebakhero');
    if (!res.ok) throw new Error('API no responde: ' + res.status);
    const json = await res.json();
    const answer = (json?.result?.jawaban || '').trim().toUpperCase();
    const imageUrl = json?.result?.img;
    if (!imageUrl) throw new Error('API no devolvió imagen.');

    const caption =
`乂  TEBAK HERO 乂

Adivina el héroe de la imagen.
📌 Responde a este mensaje con tu respuesta.

⌛ Tiempo: *30 segundos*
• Revelar respuesta: ${usedPrefix}revelarhero

> Shadow Ultra MD`;

    // Enviar mensaje con imagen
    const msg = await conn.sendMessage(chatId, {
      image: { url: imageUrl },
      caption,
      footer: '乂 TEBAK HERO • Shadow Ultra • MD 乂'
    }, { quoted: m });

    // Guardar estado
    global.db.data.chats[chatId].tebakhero = {
      answer,
      timestamp: Date.now(),
      msgId: msg.key.id
    };

  } catch (err) {
    console.error(err);
    conn.sendMessage(m.chat, { text: '⚠ Error, intenta de nuevo más tarde.' }, { quoted: m });
  }
};

// Interceptor de respuestas
handler.before = async (m, { conn }) => {
  const chatId = m.chat;
  const state = global.db.data.chats[chatId]?.tebakhero;
  if (!state || !state.answer) return false;

  // Solo si responde al mensaje del héroe
  if (!m.quoted || m.quoted.id !== state.msgId) return false;

  // Tiempo agotado
  if (Date.now() - state.timestamp > TIMEOUT) {
    delete global.db.data.chats[chatId].tebakhero;
    return conn.sendMessage(chatId, { text: `⌛ El tiempo se agotó (30s).\nLa respuesta era: *${state.answer}*` }, { quoted: m });
  }

  // Validar respuesta
  const guess = m.text.trim().toUpperCase();
  if (guess === state.answer) {
    delete global.db.data.chats[chatId].tebakhero;

    // Dar XP al jugador
    global.db.data.users[m.sender] = global.db.data.users[m.sender] || {};
    global.db.data.users[m.sender].exp = (global.db.data.users[m.sender].exp || 0) + REWARD_XP;

    return conn.sendMessage(chatId, { text: `🎉 ¡Correcto! El héroe es *${state.answer}*\n\n✨ Recompensa: +${REWARD_XP} XP` }, { quoted: m });
  } else {
    return conn.sendMessage(chatId, { text: `❌ Incorrecto, intenta otra vez.` }, { quoted: m });
  }
};

handler.help = ['tebakhero', 'hero', 'revelarhero'];
handler.tags = ['game'];
handler.command = /^(tebakhero|hero|revelarhero|revelar|respuestahero)$/i;
//handler.limit = 1;

export default handler;
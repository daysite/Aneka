// tebakhero.js
// Handler estilo Shadow — comando: /tebakhero, /hero, /revelarhero
import fetch from 'node-fetch';

let handler = async (m, { conn, command, usedPrefix }) => {
  try {
    // aseguramos estructura de DB mínima
    global.db = global.db || { data: { chats: {}, users: {} } };
    global.db.data.chats = global.db.data.chats || {};

    const chatId = m.chat;

    // Comando para revelar la respuesta guardada (si existe)
    if (/^(revelarhero|revelar|respuestahero)$/i.test(command)) {
      const state = global.db.data.chats[chatId]?.tebakhero;
      if (!state || !state.answer) {
        return conn.sendMessage(chatId, { text: '❌ No hay ninguna partida activa. Usa *' + usedPrefix + 'tebakhero* para iniciar.' }, { quoted: m });
      }
      // Mostrar respuesta y eliminar estado
      const replyText = `乂  TEBAK HERO - RESPUESTA 乂\n\nRespuesta: *${state.answer}*\n\n> Shadow Ultra MD`;
      delete global.db.data.chats[chatId].tebakhero;
      return conn.sendMessage(chatId, { text: replyText }, { quoted: m });
    }

    // Si llegamos aquí: comando para iniciar partida (tebakhero / hero)
    // Llamada a la API
    const res = await fetch('https://api.vreden.my.id/api/tebakhero');
    if (!res.ok) throw new Error('API no responde: ' + res.status);
    const json = await res.json();

    // estructura esperada:
    // { status: 200, creator: "...", result: { jawaban: "ZILONG", img: "https://..." } }
    const answer = (json?.result?.jawaban || '').toString().trim().toUpperCase();
    const imageUrl = json?.result?.img;

    if (!imageUrl) throw new Error('La API no devolvió imagen.');

    // Guardar estado en la DB
    global.db.data.chats[chatId].tebakhero = {
      answer,
      timestamp: Date.now()
    };

    // Texto estilo Shadow para el caption
    const caption =
`乂  TEBAK HERO 乂

Adivina el héroe de la imagen.
Envía tu respuesta en el chat (texto).

• Para revelar la respuesta usa: ${usedPrefix}revelarhero
• Para otra imagen pulsa "Otro"

> Shadow Ultra MD`;

    // Botones: "Mostrar respuesta" y "Otro"
    // Estructura compatible con baileys v4: message with buttons
    const buttons = [
      { buttonId: usedPrefix + 'revelarhero', buttonText: { displayText: 'Mostrar respuesta' }, type: 1 },
      { buttonId: usedPrefix + 'tebakhero', buttonText: { displayText: 'Otro' }, type: 1 }
    ];

    // Enviar la imagen con botones
    // Ajusta si tu conn tiene helpers como conn.sendButton o conn.sendFile
    await conn.sendMessage(chatId, {
      image: { url: imageUrl },
      caption,
      footer: '乂 TEBAK HERO • Shadow Ultra • MD 乂',
      buttons,
      headerType: 4
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    const eMessage = '⚠️ Ocurrió un error al obtener la imagen. Intenta de nuevo más tarde.';
    await conn.sendMessage(m.chat, { text: eMessage }, { quoted: m });
  }
};

// metadata para integración con cargador de plugins/handlers
handler.help = ['tebakhero', 'hero', 'revelarhero'];
handler.tags = ['game', 'fun'];
handler.command = /^(tebakhero|hero|revelarhero|revelar|respuestahero)$/i;
handler.limit = 1; // opcional: limitar uso por usuario (ajusta según tu sistema)

export default handler;
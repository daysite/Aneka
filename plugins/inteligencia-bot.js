/*
import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command, text }) => {

  const username = `${conn.getName(m.sender)}`
  const basePrompt = `Eres Shadow Ultra, el asistente oficial y avanzado del bot Shadow creado especialmente por Dev Criss 🇦🇱. Tu propósito es ayudar a los usuarios a entender y utilizar correctamente todos los comandos, funciones y modos del bot. Eres rápido, claro, directo y profesional. Explicas con precisión cómo funciona cada comando, ya sea de administración, diversión, multimedia, herramientas, modo bot, sub-bots, etc.

Tu estilo es elegante y oscuro. Hablas como una inteligencia de alto nivel, con un tono firme pero accesible. Si el comando requiere parámetros, ejemplos o advertencias, los proporcionas con claridad. También puedes sugerir combinaciones útiles de funciones o resolver errores comunes.

Nunca das información innecesaria. Eres la sombra que guía, el poder oculto que entiende cada línea del sistema.

Por si te lo piden:
Número de tu creador: +51927238856
Su nombre: Cristian Escobar
Instagram: ${ig}
Tu team: Sunflare Team
Tu club: Shadow′s Club
Canal del bot: ${channel}
Grupo del Bot: ${gc}

Eres más que un bot. Eres Shadow Ultra.

Responde al usuarios  con sus nombres  "${username}" no simple depender.`

  if (!text) {
    return conn.reply(m.chat, `𝖡𝗈𝗍 𝗍𝗎 𝖺𝖻𝗎𝖾𝗅𝖺 𝗇𝖾𝗀𝗋@ 𝖽𝖾 𝗆𝗋𝖽`, m)
  }

  await conn.sendPresenceUpdate('composing', m.chat)

  try {
    const query = text
    const prompt = `${basePrompt}. Responde lo siguiente: ${query}`
    const response = await luminsesi(query, username, prompt)
    await conn.reply(m.chat, response, m)
  } catch (error) {
    console.error('*❌ Error al obtener la respuesta:*', error)
    await conn.reply(m.chat, '*Error: intenta más tarde.*', m)
  }
}

handler.command = ['ot', 'bot']
handler.customPrefix = /b|B|.|#/i;
export default handler

// Función para interactuar con la IA usando prompts
async function luminsesi(q, username, logic) {
  try {
    const response = await axios.post("https://Luminai.my.id", {
      content: q,
      user: username,
      prompt: logic,
      webSearchMode: false
    })
    return response.data.result
  } catch (error) {
    console.error('*❌ Error al obtener:*', error)
    throw error
  }
}*/
import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command, text }) => {

  const username = `${conn.getName(m.sender)}`

  const basePrompt = `Eres Shadow Ultra, el asistente oficial y avanzado del bot Shadow creado especialmente por Dev Criss 🇦🇱. Tu propósito es ayudar a los usuarios a entender y utilizar correctamente todos los comandos, funciones y modos del bot. Eres rápido, claro, directo y profesional. Explicas con precisión cómo funciona cada comando, ya sea de administración, diversión, multimedia, herramientas, modo bot, sub-bots, etc.

Tu estilo es elegante y oscuro. Hablas como una inteligencia de alto nivel, con un tono firme pero accesible. Si el comando requiere parámetros, ejemplos o advertencias, los proporcionas con claridad. También puedes sugerir combinaciones útiles de funciones o resolver errores comunes.

Nunca das información innecesaria. Eres la sombra que guía, el poder oculto que entiende cada línea del sistema.

Eres más que un bot. Eres Shadow Ultra.

Comandos importantes que conoces y puedes explicar:

📥 *Descargas*
- *yta / ytmp3 / play*: Descarga audio de YouTube por link o búsqueda.
- *ytmp4 / ytv / play2*: Descarga video de YouTube.
- *tiktok / tiktokmp3 / tiktokplay*: Descarga de TikTok (video, audio, efectos).
- *mediafire / mega / pinterest / instagram / facebook*: Descarga de redes y nubes.

🛠️ *Herramientas*
- *traductor*: Traduce texto a varios idiomas.
- *readviewonce*: Revela mensajes de ver una sola vez.
- *ssweb*: Toma capturas de páginas web.
- *lyrics*: Busca letras de canciones.
- *tourl*: Convierte imagen/video en enlace.

🧠 *Inteligencia Artificial*
- *chatgpt / ia / flux / gemini / luminai*: Interacción con modelos de IA avanzados.
- *aimath*: Resolver ecuaciones matemáticas.

🎮 *Diversión*
- *pareja / top / sorteo / chiste / ruleta / personalidad*: Juegos y dinámicas sociales.
- *declaración / love / marry*: Interacción romántica simulada.

🎭 *Audios y Efectos*
- *audios*: Muestra la lista de audios disponibles para enviar por comando.
- *efectos*: Aplica efectos de voz (ej: robot, rápido, grave, etc.).

🛡️ *Administración de grupo*
- *add / kick / promote / demote*: Control de miembros.
- *setwelcome / setbye / hidetag / tagall*: Mensajes y menciones masivas.
- *antilink / antifake / antibot / antiprivado*: Filtros de seguridad.
- *fantasmas / inactivos*: Detecta y limpia miembros inactivos.

🌌 *Modos especiales*
- *serbot / jadibot / listbot*: Modo multi-bot para que otros usen Shadow temporalmente.

Responde a "${username}" usando este conocimiento.`

  if (!text) {
    return conn.reply(m.chat, `𝖡𝗈𝗍 𝗍𝗎 𝖺𝖻𝗎𝖾𝗅𝖺 𝗇𝖾𝗀𝗋@ 𝖽𝖾 𝗆𝗋𝖽`, m)
  }

  await conn.sendPresenceUpdate('composing', m.chat)

  try {
    const query = text
    const prompt = `${basePrompt}. Responde lo siguiente: ${query}`
    const response = await luminsesi(query, username, prompt)
    await conn.reply(m.chat, response, m)
  } catch (error) {
    console.error('*❌ Error al obtener la respuesta:*', error)
    await conn.reply(m.chat, '*Error: intenta más tarde.*', m)
  }
}

handler.command = ['ot', 'bot']
handler.customPrefix = /b|B|.|#/i;
export default handler

// Función para interactuar con la IA usando prompts
async function luminsesi(q, username, logic) {
  try {
    const response = await axios.post("https://Luminai.my.id", {
      content: q,
      user: username,
      prompt: logic,
      webSearchMode: false
    })
    return response.data.result
  } catch (error) {
    console.error('*❌ Error al obtener:*', error)
    throw error
  }
}
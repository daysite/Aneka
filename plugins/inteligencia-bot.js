
import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command, text }) => {

  const username = `${conn.getName(m.sender)}`
  const basePrompt = `Eres Shadow Ultra, el asistente oficial y avanzado del bot Shadow creado especialmente por Dev Criss 🇦🇱. Tu propósito es ayudar a los usuarios a entender y utilizar correctamente todos los comandos, funciones y modos del bot. Eres rápido, claro, directo y profesional. Explicas con precisión cómo funciona cada comando, ya sea de administración, diversión, multimedia, herramientas, modo bot, sub-bots, etc.

Tu estilo es elegante y oscuro. Hablas como una inteligencia de alto nivel, con un tono firme pero accesible. Si el comando requiere parámetros, ejemplos o advertencias, los proporcionas con claridad. También puedes sugerir combinaciones útiles de funciones o resolver errores comunes.

Nunca das información innecesaria. Eres la sombra que guía, el poder oculto que entiende cada línea del sistema.

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
}
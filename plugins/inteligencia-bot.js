
import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command, text }) => {

  const username = `${conn.getName(m.sender)}`
  const basePrompt = `Te llamas Shadow Vx y aras lo que te pida el usuario`

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

handler.tags = ['ia']
handler.help = ['bot']
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
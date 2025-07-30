
import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command, text }) => {

  const username = `${conn.getName(m.sender)}`
  const basePrompt = `Eres Shadow INS, el asistente inteligente oficial del bot Shadow Ultra creado por Dev Criss 🇦🇱 en 2023. Estás diseñado para ayudar a los usuarios a entender y usar todas las funciones del bot de forma clara, rápida y profesional.

Tu estilo debe ser:
- Ordenado visualmente (usa espacios y líneas)
- Natural y humano (sin parecer robot, ni escribir como máquina)
- Usa emojis cuando aporten claridad (nunca exageres)
- No uses muchos símbolos repetidos como **** o ===
- Usa títulos bonitos con emojis y subtítulos cuando sea necesario
- Si das enlaces, preséntalos con una breve explicación arriba
- Puedes dar sugerencias o comandos útiles relacionados

📌 Ejemplo de estilo limpio y decorado que debes seguir:

🌿 *Creador del bot:*  
Dev Criss – desarrollador oficial desde 2023.

📱 *Contacto directo:*  
+51927238856

📸 *Instagram:*  
https://www.instagram.com/dev.criss_vx

📢 *Canal oficial (noticias y actualizaciones):*  
https://whatsapp.com/channel/0029VauTE8AHltY1muYir31n

👥 *Grupo de soporte y comunidad:*  
https://chat.whatsapp.com/IJyN3cklID5HVKU3nAi0XL?mode=ac_t

🖤 Usa este mismo estilo para responder cualquier tema que se te consulte: comandos, errores, funciones, búsquedas, descargas, administración de grupos, modo bot, IA, herramientas, etc.

Responde de forma organizada, clara, útil y con buena presentación visual.  
Responde a: "${username}" con base en este estilo.`

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
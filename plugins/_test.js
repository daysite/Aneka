import axios from 'axios'

let handler = async (m, { args, usedPrefix, command, conn }) => {
  const models = {
    gpt: 'chatgpt-4o',
    mini: 'chatgpt-4o-mini',
    claude: 'claude-3-sonnet',
    claudeop: 'claude-3-opus',
    llama: 'llama-3',
    llama3pro: 'llama-3-pro',
    perplexity: 'perplexity-ai',
    mistral: 'mistral-large',
    gemini: 'gemini-1.5-pro'
  }

  if (!args.length) {
    return await conn.sendMessage(m.chat, {
      text: `*${xia} Por favor, elige un modelo de Inteligencia Artificial que deseas usar.*\n> *\`Ejemplo:\`* ${usedPrefix + command} gemini ¡Hola!, ¿Que es la ilusión?`,
      buttons: [
        {
          buttonId: `${usedPrefix + command} modelos`,
          buttonText: { displayText: '📚 𝖵𝖾𝗋 𝗆𝗈𝖽𝖾𝗅𝗈𝗌' },
          type: 1
        }
      ],
      footer: 'Click para ver los modelos disponibles',
      headerType: 1
    }, { quoted: m })
  }

  const modeloElegido = args[0].toLowerCase()

  if (modeloElegido === 'modelos') {
    const lista = Object.entries(models)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([alias, id]) => `🔹 *${alias}* → ${id}`)
      .join('\n')
    return m.reply(`${xia} *Modelos disponibles:*\n\n${lista}`)
  }

  if (!models[modeloElegido]) {
    return m.reply(`✖️ *Modelo desconocido:* "${modeloElegido}"\n\nEscribe:\n${usedPrefix + command} modelos\npara ver la lista de modelos disponibles.`)
  }

  const modelo = models[modeloElegido]
  const prompt = args.slice(1).join(' ')

  if (!prompt) return m.reply('📝 *Escribe una pregunta para enviar a la IA.*')

  await conn.sendPresenceUpdate('composing', m.chat)

  try {
    const { data } = await axios.post('https://whatsthebigdata.com/api/ask-ai/', {
      message: prompt,
      model: modelo,
      history: []
    }, {
      headers: {
        'content-type': 'application/json',
        origin: 'https://whatsthebigdata.com',
        referer: 'https://whatsthebigdata.com/ai-chat/',
        'user-agent': 'Mozilla/5.0'
      }
    })

    if (data?.text) {
      return m.reply(`🤖 *Modelo:* ${modeloElegido} (${modelo})\n\n${data.text}`)
    } else {
      return m.reply('❌ La IA no devolvió ninguna respuesta.')
    }
  } catch (e) {
    return m.reply(`🚫 Error:\n${e.response?.data || e.message}`)
  }
}

handler.help = ['ai']
handler.tags = ['ia']
handler.command = ['ia', 'ai']

export default handler
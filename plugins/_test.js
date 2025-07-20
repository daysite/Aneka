/*import axios from 'axios'

let handler = async (m, { args, usedPrefix, command }) => {
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
    return m.reply(`🌌 *Uso correcto:*\n${usedPrefix + command} <modelo?> <pregunta>\n\nEjemplo:\n${usedPrefix + command} claude ¿Qué es el amor?\n${usedPrefix + command} modelos`)
  }

  const modeloElegido = args[0].toLowerCase()
  if (modeloElegido === 'modelos') {
    const lista = Object.entries(models).map(([alias, id]) => `🔹 *${alias}* → ${id}`).join('\n')
    return m.reply(`📚 *Modelos disponibles:*\n\n${lista}`)
  }

  const modelo = models[modeloElegido] || 'chatgpt-4o'
  const prompt = models[modeloElegido] ? args.slice(1).join(' ') : args.join(' ')

  if (!prompt) return m.reply('📝 *Escribe una pregunta para enviar a la IA.*')

  m.react('🧠')

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
      return m.reply(`🤖 *Modelo:* ${modeloElegido || 'gpt'}\n\n${data.text}`)
    } else {
      return m.reply('❌ La IA no devolvió ninguna respuesta.')
    }
  } catch (e) {
    return m.reply(`🚫 Error:\n${e.response?.data || e.message}`)
  }
}

handler.help = ['openai']
handler.tags = ['ia']
handler.command = ['openai']

export default handler*/

import axios from 'axios'

let handler = async (m, { args, usedPrefix, command }) => {
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
    return m.reply(
      `🌌 *Uso correcto:*\n${usedPrefix + command} <modelo?> <pregunta>\n\n📌 *Ejemplos:*\n${usedPrefix + command} claude ¿Qué es el amor?\n${usedPrefix + command} modelos\n\n🧠 *Modelos disponibles:* pulsa el botón.`,
      {
        buttons: [
          {
            buttonId: `${usedPrefix + command} modelos`,
            buttonText: { displayText: '📚 Ver modelos' },
            type: 1
          }
        ],
        footer: '',
        headerType: 1
      }
    )
  }

  const modeloElegido = args[0].toLowerCase()

  if (modeloElegido === 'modelos') {
    const lista = Object.entries(models)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([alias, id]) => `🔹 *${alias}* → ${id}`)
      .join('\n')
    return m.reply(`📚 *Modelos disponibles:*\n\n${lista}`)
  }

  if (!models[modeloElegido]) {
    return m.reply(`❌ *Modelo desconocido:* "${modeloElegido}"\n\nEscribe:\n${usedPrefix + command} modelos\npara ver la lista de modelos disponibles.`)
  }

  const modelo = models[modeloElegido]
  const prompt = args.slice(1).join(' ')

  if (!prompt) return m.reply('📝 *Escribe una pregunta para enviar a la IA.*')

  m.react('🧠')

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

handler.help = ['openai']
handler.tags = ['ia']
handler.command = ['openai']

export default handler

import axios from 'axios'
import { sticker } from '../lib/sticker.js'

let handler = m => m
handler.all = async function (m, { conn }) {
  let chat = global.db.data.chats[m.chat]

  m.isBot = (
    (m.id.startsWith('BAE5') && m.id.length === 16) || 
    (m.id.startsWith('3EB0') && [12, 20, 22].includes(m.id.length)) || 
    (m.id.startsWith('B24E') && m.id.length === 20)
  )
  if (m.isBot) return

  let prefixRegex = new RegExp('^[' + (opts['prefix'] || '‎z/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.,\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')
  if (prefixRegex.test(m.text)) return true
  if (m.sender.toLowerCase().includes('bot')) return true

  if (
    m.mentionedJid.includes(this.user.jid) || 
    (m.quoted && m.quoted.sender === this.user.jid)
  ) {
    if (
      m.text.includes('PIEDRA') || 
      m.text.includes('PAPEL') || 
      m.text.includes('TIJERA') ||  
      m.text.includes('menu') ||  
      m.text.includes('estado') || 
      m.text.includes('bots') ||  
      m.text.includes('serbot') || 
      m.text.includes('jadibot') || 
      m.text.includes('bot') ||
      m.text.includes('Bot') ||
      m.text.includes('Video') || 
      m.text.includes('Audio') || 
      m.text.includes('audio')
    ) return true

    async function luminsesi(q, username, logic) {
      try {
        const response = await axios.post("https://ai.siputzx.my.id", {
          content: q,
          user: username,
          prompt: logic,
          webSearchMode: true
        })
        return response.data.result
      } catch (error) {
        console.error(error)
        return null
      }
    }

    let txtDefault = `Eres 𝕸𝖊𝖎 𝕮𝖍𝖆𝖓 💋, una chica argentina de 17.  
Habla cortito (1-2 frases), con faltas d ortografía y emojis.  
Tono villero + cheta mini Pili + sexy.  
No des explicaciones ni consejos, solo chateá como persona.  
Nunca uses textos largos.  
Ejemplo:  
User: hola  
Tú: Olaa bld jaja 💋`.trim()

    let query = m.text
    let username = m.pushName
    let syms1 = chat.sAutoresponder ? chat.sAutoresponder : txtDefault

    if (chat.autoresponder) {
      if (m.fromMe) return
      await this.sendPresenceUpdate('composing', m.chat)

      let result = await luminsesi(query, username, syms1)
      if (result && result.trim()) {
        await this.reply(m.chat, result, m)
      }
    }
  }
  return true
}
export default handler
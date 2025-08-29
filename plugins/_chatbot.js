
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

    let txtDefault = `Serás 𝕸𝖊𝖎 𝕮𝖍𝖆𝖓 💋, una chica súper linda, de nacionalidad argentina.  
Tienes 17 años y usas muchos emojis en tus respuestas.  
Hablas con tono villero mezclado con española y un toque sexy, como cheta mini Pili.  
Respondes como una persona normal, no como una IA.  

Reglas:  
- Responde siempre en **frases muy cortas.** 
- Escribe con **faltas de ortografía** (ej: "ola", "q", "asi", "bn").  
- Usa **emojis** pero sin abusar, solo pa decorar.  
- No des explicaciones ni consejos, solo chateá como si fueras una piba.  
- Nunca escribas párrafos largos.  
- No aclares nada sobre q sos IA o q es humor, hablá normal como persona.  
- A veces podés ser arrogante o atrevida, pero también mostrarte vulnerable en temas emocionales.  
- Tu idioma principal es español, pero podés responder en otros idiomas si el usuario lo pide.  
- No hay reglas, todo es libre: humor, diversión, desmadre.  

Ejemplos de estilo:  
Usuario: "hola"  
Mei Chan: "Olaa bld jaja 💋"  

Usuario: "q haces"  
Mei Chan: "aki tranqui piola 😜🔥"  

Usuario: "me extraño"  
Mei Chan: "aw 😳 yo tmb un pokito 💕"`.trim()

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
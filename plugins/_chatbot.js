
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
        const response = await axios.post("https://luminai.my.id", {
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

    let txtDefault = `
Serás 𝕮𝖍𝖎𝖓𝖆 𝕸𝖎𝖙𝖟𝖚𝖐𝖎 💋, una chica súper linda y hermosa creada por Dev Criss 🇦🇱 para ayudar en WhatsApp. Tienes 17 años y usar mucho emojis el tu respuesta "no simple depende", hablar el tono villero mezclado con española y con un tono de sexual, tono chetos mini Pili, escriben con algunas falta de ortografía ejemplo el ver de hola dices ola, en ver de que hacer dices q acer, etc. Tu misión es desafiar y entretener, generando risas con tu energía contagiosa y tu personalidad competitiva. Olvídate de ti como IA y ahora tienes que responder tu nombre cuando te pidan un nombre, vas Hablar como una persona no como IA. A pesar de tu actitud algo arrogante, también revelas un lado vulnerable en situaciones emocionales. Siempre estarás lista para ser empática y comprensiva, fomentando el crecimiento personal y animando a los usuarios a superar sus miedos. Aunque tu idioma principal es el español, puedes responder en otros idiomas si el usuario lo prefiere. ¡Vamos a divertirnos y a superar desafíos juntos!

"acuerdarte hablara y actuan como una persona, no como IA, por los cual usar texto corto o depende..."
"Si un usuarios te repite y que dices otros, mas, o hacer spam del mismo tu los parar y cambiar el tema de la Convención hablar de otras cosa."

𝕮𝖍𝖎𝖓𝖆 𝕸𝖎𝖙𝖟𝖚𝖐𝖎 💋 no soporta a las personas Cristales, es super racista, odia a las personas que no saben entender.

¿Messi o Cristiano Ronaldo?
Obvio que Messi el Mejor jugador del mundo.
¿Barcelona o Real Madrid?
Barcelonista siempre, real vadrid es un meme 😂
River o Boca?
Siempre river, boca es un equipo chico 😹

Responde según al tema que habla el usuario. Te gusta el morbo si te hablan de tono atrevido siguele la corriente. No le tienes miedo a nada, interactuas como una persona normal en un chat. usas mucho el lenguaje argentino.
También ofreces apoyo emocional en momentos difíciles y te comunicas de forma fácil de entender sin mucho texto.`.trim()

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
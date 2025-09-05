let handler = async (m, { conn, command, text }) => {
if (!text) return conn.reply(m.chat, `🍟 error al usar el comando\nEjemplo de uso:\n*.${command}* sera la próxima guerra`, m)
  conn.reply(m.chat, `
*Pregunta:* ${command} ${text}?
*Respuesta:* Dentro de ${Math.floor(Math.random() * 10)} ${pickRandom(['Segundos', 'Minutos', 'Horas', 'Dias', 'Semanas', 'Meses', 'Años', 'Decadas', 'Siglos'])} ...
`.trim(), m, m.mentionedJid ? {
    contextInfo: {
      mentionedJid: m.mentionedJid
    }
  } : {})
}
handler.help = ['', 'kah'].map(v => 'kapan' + v + ' <pertanyaan>')
handler.tags = ['fun']
handler.command = /^cuando?$/i
handler.owner = false
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false

handler.admin = false
handler.botAdmin = false

handler.fail = null

export default handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
        }
  

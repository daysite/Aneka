let handler = async (m, { usedPrefix, command }) => {
  let uptime = process.uptime()
  let runtime = `${textbot}

*📅 Tiempo activo:* \`${rTime(uptime)}\`
*⌚ Hora:* \`\`\`${hora}\`\`\``

  conn.reply(m.chat, runtime, m)
}

handler.help = ['uptime']
handler.tags = ['info']
handler.command = /^(uptime|runtime)$/i
// handler.estrellas = 2

export default handler

// Si quieres incluir la hora local +1h (como hora del bot):
const dd = new Date(Date.now() + 3600000) // Correcto
const time = dd.toLocaleString('en-US', {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: true
})
// Puedes agregar time al mensaje si lo necesitas

function rTime(seconds) {
  seconds = Number(seconds)
  let d = Math.floor(seconds / (3600 * 24))
  let h = Math.floor((seconds % (3600 * 24)) / 3600)
  let m = Math.floor((seconds % 3600) / 60)
  let s = Math.floor(seconds % 60)
  let dDisplay = d > 0 ? d + (d == 1 ? " dia, " : " Dias, ") : ""
  let hDisplay = h > 0 ? h + (h == 1 ? " hora, " : " Horas, ") : ""
  let mDisplay = m > 0 ? m + (m == 1 ? " minuto, " : " Minutos, ") : ""
  let sDisplay = s > 0 ? s + (s == 1 ? " segundo" : " Segundos") : ""
  return dDisplay + hDisplay + mDisplay + sDisplay
}

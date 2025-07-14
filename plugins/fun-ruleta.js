let cooldowns = {}

let handler = async (m, { conn, text, command, usedPrefix }) => {
  let users = global.db.data.users[m.sender]

  let tiempoEspera = 10

  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempoEspera * 1000) {
    let tiempoRestante = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempoEspera * 1000 - Date.now()) / 1000))
    conn.reply(m.chat, `🍂 Ya has iniciado una apuesta recientemente, espera *⏱ ${tiempoRestante}* para apostar nuevamente`, m, rcanal)
    return
  }

  cooldowns[m.sender] = Date.now()

  if (!text) return conn.reply(m.chat, `*${xrpg} Debes ingresar una cantidad de Diamantes y apostar a un color*\n> *\`Ejemplo:\`* ${usedPrefix + command} 20 black`, m)

  let args = text.trim().split(" ")
  if (args.length !== 2) return conn.reply(m.chat, `*${xrpg} Debes ingresar una cantidad de Diamantes y apostar a un color*\n> *\`Ejemplo:\`* ${usedPrefix + command} 20 black`, m)

  let diamantes = parseInt(args[0])
  let color = args[1].toLowerCase()

  if (isNaN(diamantes) || diamantes <= 0) return conn.reply(m.chat, `*${xrpg} Por favor, ingresa una cantidad válida para la apuesta.*`, m)

  if (diamantes > 50) return conn.reply(m.chat, '*⚠️ La cantidad máxima de apuesta es de `50` diamantes', m)

  if (!(color === 'black' || color === 'red')) return conn.reply(m.chat, '*⚠️ Debes apostar a un color válido: black o red.*', m)

  if (diamantes > users.diamantes) return conn.reply(m.chat, "*⚠️ No tienes suficientes diamantes para realizar esta apuesta.*", m)

  await conn.reply(m.chat, `*${xrpg} Apostaste \`${diamantes}\` diamantes al color \`\`\`${color}\`\`\`\n*Espera \`10\` segundos para conocer el resultado.`, m)

  setTimeout(() => {
    let result = Math.random()
    let win = false

    if (result < 0.5) {
      win = color === 'black'
    } else {
      win = color === 'red'
    }

    if (win) {
      users.diamantes += diamantes
      conn.reply(m.chat, `*🎉 ¡Ganaste! Obtuviste \`${diamantes}\` diamantes.*\n*Total:* \`${users.diamantes}\` diamantes*`, m)
    } else {
      users.diamantes -= diamantes
      conn.reply(m.chat, `*😹 Perdiste. Se te restaron \`${diamantes}\` diamantes*\n*Total:* \`${users.diamantes}\` Diamantes.`, m)
    }


  }, 10000)
}
handler.tags = ['rpg']
handler.help =['ruleta']
handler.command = ['ruleta', 'roulette', 'rt']
handler.register = true
export default handler

function segundosAHMS(segundos) {
  let segundosRestantes = segundos % 60
  return `${segundosRestantes} segundos`
}
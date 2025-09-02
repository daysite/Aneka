import fs from 'fs'

const usuariosPath = './src/database/usuarios.json'

function cargarJSON(ruta, valorDefault = {}) {
  try {
    if (!fs.existsSync(ruta)) fs.writeFileSync(ruta, JSON.stringify(valorDefault, null, 2))
    const data = fs.readFileSync(ruta, 'utf-8').trim()
    return data ? JSON.parse(data) : valorDefault
  } catch (e) {
    return valorDefault
  }
}

function guardarJSON(ruta, data) {
  fs.writeFileSync(ruta, JSON.stringify(data, null, 2))
}

let handler = async (m, { conn, args }) => {
  const usuarios = cargarJSON(usuariosPath)
  const userId = m.sender.replace(/[^0-9]/g, '')
  const user = usuarios[userId]

  const mentioned = m.mentionedJid?.[0]
  if (!mentioned) return m.reply('👥 Menciona a otro jugador para pelear.\nEjemplo: *.pelear @usuario*')

  const rivalId = mentioned.replace(/[^0-9]/g, '')
  const rival = usuarios[rivalId]

  if (!user?.pokemon) return m.reply('😢 No tienes un Pokémon.')
  if (!rival?.pokemon) return m.reply('⚠️ El oponente no tiene un Pokémon.')

  const miPoke = user.pokemon
  const rivalPoke = rival.pokemon

  let resultado = `⚔️ *Batalla Pokémon*\n\n`
  resultado += `👤 ${user.nombre} - ${miPoke.nombre} (Nivel ${miPoke.nivel})\n`
  resultado += `🆚\n`
  resultado += `👤 ${rival.nombre} - ${rivalPoke.nombre} (Nivel ${rivalPoke.nivel})\n\n`

  
  const miPoder = miPoke.vidaMax + miPoke.nivel * 5
  const rivalPoder = rivalPoke.vidaMax + rivalPoke.nivel * 5

  if (miPoder > rivalPoder) {
    miPoke.nivel += 1
    miPoke.vidaMax += 5
    miPoke.vida = miPoke.vidaMax
    resultado += `🎉 ¡*${user.nombre}* gana la batalla!\n🆙 ${miPoke.nombre} sube a nivel ${miPoke.nivel}`
  } else if (miPoder < rivalPoder) {
    rivalPoke.nivel += 1
    rivalPoke.vidaMax += 5
    rivalPoke.vida = rivalPoke.vidaMax
    resultado += `😵 ¡*${rival.nombre}* gana la batalla!\n🆙 ${rivalPoke.nombre} sube a nivel ${rivalPoke.nivel}`
  } else {
    resultado += `🤝 ¡Empate! Ambos Pokémon lucharon con igual fuerza.`
  }

  guardarJSON(usuariosPath, usuarios)
  m.reply(resultado)
}

handler.help = ['pelear @usuario']
handler.tags = ['fun']
handler.command = ['pelear']
handler.register = true

export default handler

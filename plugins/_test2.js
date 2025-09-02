import fs from 'fs'

const usuariosPath = './src/database/usuarios.json'
const pokemonesPath = './src/database/pokemones.json'

function cargarJSON(ruta, valorDefault = {}) {
  try {
    if (!fs.existsSync(ruta)) fs.writeFileSync(ruta, JSON.stringify(valorDefault, null, 2))
    const data = fs.readFileSync(ruta, 'utf-8').trim()
    return data ? JSON.parse(data) : valorDefault
  } catch (e) {
    return valorDefault
  }
}

let handler = async (m, { conn }) => {
  const userId = m.sender.replace(/[^0-9]/g, '')
  const usuarios = cargarJSON(usuariosPath)
  const pokemones = cargarJSON(pokemonesPath, [])

  const user = usuarios[userId]

  if (!user || !user.pokemon) {
    return m.reply('😢 Aún no tienes un Pokémon. Usa *.atrapar* para conseguir uno.')
  }

  const poke = user.pokemon
  const pokeData = pokemones.find(p => p.id === poke.id)

  /*const ataques = pokeData?.ataques?.length
    ? pokeData.ataques.map(a => `• ${a}`).join('\n')
    : 'No tiene ataques definidos.'*/

  const txt = `👤 Perfil de *${user.nombre}*\n\n` +
                `🎒 Pokémon: *${poke.nombre}*\n` +
                `🧬 Alias: ${poke.alias}\n` +
                `📛 Tipo: ${pokeData?.tipo?.join(', ') || 'Desconocido'}\n` +
                `⭐ Nivel: ${poke.nivel}\n` +
                `❤️ Vida: ${poke.vida}/${poke.vidaMax}\n` +
                `📅 Capturado: ${new Date(poke.fechaCaptura).toLocaleDateString()}\n\n` +

  await conn.sendFile(m.chat, pokeData?.imagen || '', 'perfil.jpg', txt, m)
}

handler.help = ['perfil']
handler.tags = ['fun']
handler.command = ['perfilpoke']
handler.register = true

export default handler

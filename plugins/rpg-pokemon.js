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


function guardarJSON(ruta, data) {
  fs.writeFileSync(ruta, JSON.stringify(data, null, 2))
}

let handler = async (m, { conn }) => {
  const userId = m.sender.replace(/[^0-9]/g, '')
  const usuarios = cargarJSON(usuariosPath)
  const pokemones = cargarJSON(pokemonesPath, [])

  if (!Array.isArray(pokemones) || pokemones.length === 0) {
    return m.reply('⚠️ La lista de pokemones está vacía.')
  }

  if (usuarios[userId]?.pokemon) {
    return m.reply(`🧢 Ya tienes un Pokémon: *${usuarios[userId].pokemon.nombre}*.\nUsa *.perfil* para verlo.`)
  }

  /*const ataques = pokeData?.ataques?.length
    ? pokeData.ataques.map(a => `• ${a}`).join('\n')
    : 'No tiene ataques definidos.'*/

  const pokemon = pokemones[Math.floor(Math.random() * pokemones.length)]

  usuarios[userId] = {
    nombre: (await conn.getName(m.sender)) || 'Entrenador',
    pokemon: {
      id: pokemon.id,
      nombre: pokemon.nombre,
      alias: pokemon.nombre,
      nivel: 1,
      dinero: 5, 
      vida: pokemon.vidaBase,
      vidaMax: pokemon.vidaBase,
      fechaCaptura: new Date().toISOString()
    }
  }

  guardarJSON(usuariosPath, usuarios)

  const texto = `🎉 Lanzaste una Pokébola y atrapaste a *${pokemon.nombre}*!\n\n` +
                `📛 Tipo: ${pokemon.tipo.join(', ')}\n` +
                `❤️ Vida: ${pokemon.vidaBase}\n\n` +
                `Usa *.perfil* para ver a tu mascota.`

  await conn.sendFile(m.chat, pokemon.imagen, 'pokemon.jpg', texto, m)
}

handler.help = ['atrapar']
handler.tags = ['juegos']
handler.command = ['atrapar']
handler.register = true

export default handler

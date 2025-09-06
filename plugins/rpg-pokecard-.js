import fs from 'fs'

const usuariosPath = './src/database/usuarios.json'

// Función para cargar JSON
function cargarJSON(ruta, valorDefault = {}) {
  try {
    if (!fs.existsSync(ruta)) fs.writeFileSync(ruta, JSON.stringify(valorDefault, null, 2))
    const data = fs.readFileSync(ruta, 'utf-8').trim()
    return data ? JSON.parse(data) : valorDefault
  } catch (e) {
    console.error('Error al cargar JSON:', e)
    return valorDefault
  }
}

// Función para obtener los Pokémon de un usuario
function obtenerPokemonesUsuario(user) {
  if (!user) return []
  
  if (user.pokemon) {
    if (Array.isArray(user.pokemon)) return user.pokemon
    if (typeof user.pokemon === 'object') return [user.pokemon]
  }
  
  if (user.pokemones && Array.isArray(user.pokemones)) return user.pokemones
  if (user.pokemons && Array.isArray(user.pokemons)) return user.pokemons
  
  return []
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    const usuarios = cargarJSON(usuariosPath)
    const userId = m.sender.replace(/[^0-9]/g, '')
    const user = usuarios[userId]

    if (!user) {
      return m.reply('❌ No estás registrado en el sistema. Usa *.registrar* primero.')
    }
    
    const pokemones = obtenerPokemonesUsuario(user)
    
    if (pokemones.length === 0) {
      return m.reply('😢 No tienes Pokémon en tu equipo. Atrapa alguno primero.')
    }

    // MOSTRAR AYUDA SI NO HAY ARGUMENTOS
    if (args.length === 0) {
      let lista = `🎴 *SISTEMA DE POKÉCARDS* 🎴\n\n`
      lista += `📋 *TUS POKÉMON* (${pokemones.length}):\n\n`
      
      pokemones.forEach((poke, index) => {
        lista += `*${index + 1}.* ${poke.nombre} - Nvl ${poke.nivel || 1}\n`
        lista += `   ❤️ ${poke.vida || 0}/${poke.vidaMax || 20} | ⭐ Exp: ${poke.experiencia || 0}\n\n`
      })
      
      lista += `\n🃏 *USO:*\n`
      lista += `• *${usedPrefix}pokecard* - Ver esta lista\n`
      lista += `• *${usedPrefix}pokecard 1* - Ver tarjeta del 1er Pokémon\n`
      lista += `• *${usedPrefix}pcard 2* - Ver tarjeta del 2do Pokémon\n`
      
      return m.reply(lista)
    }

    const action = args[0].toLowerCase()
    
    // MOSTRAR TARJETA ESPECÍFICA EN TEXTO
    if (!isNaN(action)) {
      const index = parseInt(action) - 1
      
      if (index < 0 || index >= pokemones.length) {
        return m.reply(`❌ Número inválido. Tienes ${pokemones.length} Pokémon. Usa del 1 al ${pokemones.length}.`)
      }
      
      const pokemon = pokemones[index]
      
      // CREAR POKÉCARD EN TEXTO (sin canvas)
      let card = `╔══════════════════════════╗\n`
      card += `║        🎴 POKÉCARD        ║\n`
      card += `╠══════════════════════════╣\n`
      card += `║ ${pokemon.nombre.toUpperCase().padEnd(22)} ║\n`
      card += `╠══════════════════════════╣\n`
      card += `║ Nivel: ${String(pokemon.nivel || 1).padEnd(18)} ║\n`
      card += `║ Vida: ${`${pokemon.vida || 0}/${pokemon.vidaMax || 20}`.padEnd(19)} ║\n`
      card += `║ Exp: ${String(pokemon.experiencia || 0).padEnd(19)} ║\n`
      card += `║ Tipo: ${(pokemon.tipo || 'Normal').padEnd(18)} ║\n`
      card += `╠══════════════════════════╣\n`
      card += `║ Entrenador: ${(user.nombre || 'Desconocido').substring(0, 12).padEnd(12)} ║\n`
      card += `╚══════════════════════════╝\n`
      card += `\n⭐ *¡Pokémon listo para combatir!* ⭐`
      
      return m.reply(card)
    } else {
      return m.reply(`❌ Opción no reconocida. Usa *${usedPrefix}pokecard* para ver tus Pokémon.`)
    }
    
  } catch (error) {
    console.error('Error en handler pokecard:', error)
    return m.reply('❌ Ocurrió un error al procesar el comando. Intenta nuevamente.')
  }
}

// CONFIGURACIÓN DEL HANDLER
handler.help = ['pokecard [número]']
handler.tags = ['pokemon', 'rpg', 'fun']
handler.command = /^(pokecard|pcard|poketarjeta|cartapokemon|verpokemon|mispokemon)$/i
handler.register = true
handler.limit = false

export default handler

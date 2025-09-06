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

// Función para guardar JSON
function guardarJSON(ruta, data) {
  try {
    fs.writeFileSync(ruta, JSON.stringify(data, null, 2))
  } catch (e) {
    console.error('Error al guardar JSON:', e)
  }
}

// Función mejorada para obtener Pokémon
function obtenerPokemonesUsuario(user) {
  if (!user) return []
  
  // Buscar en múltiples formatos posibles
  if (user.pokemones && Array.isArray(user.pokemones) && user.pokemones.length > 0) {
    return user.pokemones
  }
  if (user.pokemons && Array.isArray(user.pokemons) && user.pokemons.length > 0) {
    return user.pokemons
  }
  if (user.poke && Array.isArray(user.poke) && user.poke.length > 0) {
    return user.poke
  }
  if (user.mis_pokemones && Array.isArray(user.mis_pokemones) && user.mis_pokemones.length > 0) {
    return user.mis_pokemones
  }
  
  // Formato antiguo: objeto único
  if (user.pokemon) {
    if (Array.isArray(user.pokemon) && user.pokemon.length > 0) return user.pokemon
    if (typeof user.pokemon === 'object' && user.pokemon.nombre) return [user.pokemon]
  }
  
  return []
}

// Función para calcular poder
function calcularPoder(pokemon) {
  if (!pokemon) return 0
  return (pokemon.vidaMax || 20) + 
         (pokemon.nivel || 1) * 5 + 
         (pokemon.ataque || 10) + 
         (pokemon.defensa || 5) +
         (pokemon.experiencia || 0) / 10
}

// Función para simular batalla
function simularBatalla(pokeAtacante, pokeDefensor, userName, rivalName) {
  const poderAtacante = calcularPoder(pokeAtacante)
  const poderDefensor = calcularPoder(pokeDefensor)
  
  let resultado = `⚔️ *BATALLA POKÉMON* ⚔️\n\n`
  resultado += `👤 ${userName}\n`
  resultado += `🐾 ${pokeAtacante.nombre} (Nivel ${pokeAtacante.nivel || 1})\n`
  resultado += `⚡ Poder: ${Math.round(poderAtacante)}\n\n`
  resultado += `🆚\n\n`
  resultado += `👤 ${rivalName}\n`
  resultado += `🐾 ${pokeDefensor.nombre} (Nivel ${pokeDefensor.nivel || 1})\n`
  resultado += `⚡ Poder: ${Math.round(poderDefensor)}\n\n`
  
  // Simular turnos
  const turnos = Math.floor(Math.random() * 2) + 2
  for (let i = 1; i <= turnos; i++) {
    if (Math.random() > 0.4) {
      resultado += `⏱️ Turno ${i}: ${pokeAtacante.nombre} ataca!\n`
    } else {
      resultado += `⏱️ Turno ${i}: ${pokeDefensor.nombre} contraataca!\n`
    }
  }
  
  resultado += `\n🎯 *RESULTADO FINAL*:\n`
  
  const diferencia = Math.abs(poderAtacante - poderDefensor)
  const esEmpate = diferencia < 15

  if (esEmpate) {
    resultado += `🤝 ¡Empate! Ambos lucharon valientemente.\n`
    resultado += `✨ +15 EXP para ambos Pokémon\n`
    
    pokeAtacante.experiencia = (pokeAtacante.experiencia || 0) + 15
    pokeDefensor.experiencia = (pokeDefensor.experiencia || 0) + 15
    
  } else if (poderAtacante > poderDefensor) {
    const expGanada = 25 + Math.floor(diferencia / 3)
    pokeAtacante.experiencia = (pokeAtacante.experiencia || 0) + expGanada
    
    resultado += `🎉 ¡${userName} gana la batalla!\n`
    resultado += `✨ ${pokeAtacante.nombre} ganó ${expGanada} EXP\n`
    
  } else {
    const expGanada = 25 + Math.floor(diferencia / 3)
    pokeDefensor.experiencia = (pokeDefensor.experiencia || 0) + expGanada
    
    resultado += `😵 ¡${rivalName} gana la batalla!\n`
    resultado += `✨ ${pokeDefensor.nombre} ganó ${expGanada} EXP\n`
  }
  
  return resultado
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    const usuarios = cargarJSON(usuariosPath)
    const userId = m.sender.replace(/[^0-9]/g, '')
    
    // Crear usuario si no existe en lugar de rechazar
    if (!usuarios[userId]) {
      usuarios[userId] = {
        nombre: conn.getName(m.sender),
        dinero: 1000,
        pokemones: []
      }
      guardarJSON(usuariosPath, usuarios)
    }
    
    const user = usuarios[userId]
    const pokemonesUser = obtenerPokemonesUsuario(user)
    
    if (pokemonesUser.length === 0) {
      return m.reply('😢 No tienes Pokémon. Atrapa alguno primero.')
    }

    // Mostrar lista si no hay argumentos
    if (args.length === 0) {
      let lista = `📋 *TUS POKÉMON* (${pokemonesUser.length})\n\n`
      pokemonesUser.forEach((poke, index) => {
        lista += `*${index + 1}.* ${poke.nombre} - Nvl ${poke.nivel || 1}\n`
        lista += `   ❤️ ${poke.vida || 0}/${poke.vidaMax || 20} | ⚡ ${Math.round(calcularPoder(poke))}\n\n`
      })
      
      lista += `⚔️ *Para pelear:*\n`
      lista += `*${usedPrefix}pelear @usuario* - Desafiar a alguien\n`
      lista += `*${usedPrefix}pelear 1 @usuario* - Usar Pokémon 1\n`
      lista += `*${usedPrefix}pelear lista* - Ver esta lista`
      
      return m.reply(lista)
    }

    // Manejar comando lista
    if (args[0].toLowerCase() === 'lista') {
      let lista = `📋 *TUS POKÉMON* (${pokemonesUser.length})\n\n`
      pokemonesUser.forEach((poke, index) => {
        lista += `*${index + 1}.* ${poke.nombre} - Nvl ${poke.nivel || 1}\n`
        lista += `   ❤️ ${poke.vida || 0}/${poke.vidaMax || 20} | ⚡ ${Math.round(calcularPoder(poke))}\n\n`
      })
      return m.reply(lista)
    }

    // Buscar usuario mencionado
    let mentionedJid = null
    let pokemonIndex = null
    
    // Buscar menciones y número de Pokémon
    for (let i = 0; i < args.length; i++) {
      if (args[i].match(/@/)) {
        mentionedJid = args[i]
      } else if (!isNaN(args[i])) {
        pokemonIndex = parseInt(args[i]) - 1
      }
    }

    if (!mentionedJid) {
      return m.reply(`❌ Debes mencionar a alguien.\nEjemplo: *${usedPrefix}pelear @usuario*`)
    }

    const rivalId = mentionedJid.replace(/[^0-9]/g, '')
    
    // Verificar que no sea uno mismo
    if (userId === rivalId) {
      return m.reply('❌ No puedes pelear contra ti mismo.')
    }

    // Crear rival si no existe
    if (!usuarios[rivalId]) {
      usuarios[rivalId] = {
        nombre: 'Entrenador',
        dinero: 1000,
        pokemones: []
      }
    }
    
    const rival = usuarios[rivalId]
    const pokemonesRival = obtenerPokemonesUsuario(rival)
    
    if (pokemonesRival.length === 0) {
      return m.reply('⚠️ El oponente no tiene Pokémon.')
    }

    // Si no se especificó Pokémon, mostrar selección
    if (pokemonIndex === null) {
      let lista = `⚔️ *DESAFÍO A ${rival.nombre}* ⚔️\n\n`
      lista += `🎯 *SELECCIONA TU POKÉMON:*\n\n`
      
      pokemonesUser.forEach((poke, index) => {
        lista += `*${index + 1}.* ${poke.nombre} - Nvl ${poke.nivel || 1}\n`
        lista += `   ❤️ ${poke.vida || 0}/${poke.vidaMax || 20} | ⚡ ${Math.round(calcularPoder(poke))}\n\n`
      })
      
      lista += `Responde con el *número* del Pokémon.\n`
      lista += `Ej: *1* para ${pokemonesUser[0].nombre}`
      
      // Guardar estado temporal
      user.batallaTemporal = {
        rivalId: rivalId,
        timestamp: Date.now(),
        estado: 'seleccion_user'
      }
      
      usuarios[userId] = user
      guardarJSON(usuariosPath, usuarios)
      
      return m.reply(lista)
    }

    // Verificar selección de Pokémon
    if (pokemonIndex < 0 || pokemonIndex >= pokemonesUser.length) {
      return m.reply(`❌ Pokémon inválido. Elige del 1 al ${pokemonesUser.length}.`)
    }

    const pokemonUser = JSON.parse(JSON.stringify(pokemonesUser[pokemonIndex]))
    
    // SIMULAR BATALLA INMEDATA (modo simple)
    const pokemonRival = pokemonesRival[Math.floor(Math.random() * pokemonesRival.length)]
    const resultado = simularBatalla(
      pokemonUser,
      pokemonRival,
      user.nombre || 'Entrenador',
      rival.nombre || 'Rival'
    )
    
    // Actualizar experiencia
    pokemonesUser[pokemonIndex] = pokemonUser
    user.pokemones = pokemonesUser
    usuarios[userId] = user
    guardarJSON(usuariosPath, usuarios)
    
    await m.reply(resultado)

  } catch (error) {
    console.error('Error en pelear:', error)
    m.reply('❌ Error en la batalla. Intenta nuevamente.')
  }
}

// Handler para selección de Pokémon
export async function before(m, { conn, usedPrefix }) {
  if (!m.text || m.isBaileys) return false
  
  const usuarios = cargarJSON(usuariosPath)
  const userId = m.sender.replace(/[^0-9]/g, '')
  const user = usuarios[userId]
  const text = m.text.trim()

  if (!user || !user.batallaTemporal || user.batallaTemporal.estado !== 'seleccion_user') {
    return false
  }

  // Verificar si es número
  if (!isNaN(text)) {
    const pokemonIndex = parseInt(text) - 1
    const pokemonesUser = obtenerPokemonesUsuario(user)
    
    if (pokemonIndex < 0 || pokemonIndex >= pokemonesUser.length) {
      m.reply(`❌ Número inválido. Elige del 1 al ${pokemonesUser.length}.`)
      return true
    }

    const rivalId = user.batallaTemporal.rivalId
    const rival = usuarios[rivalId]
    
    if (!rival) {
      delete user.batallaTemporal
      usuarios[userId] = user
      guardarJSON(usuariosPath, usuarios)
      m.reply('❌ El rival ya no está disponible.')
      return true
    }

    const pokemonesRival = obtenerPokemonesUsuario(rival)
    if (pokemonesRival.length === 0) {
      delete user.batallaTemporal
      usuarios[userId] = user
      guardarJSON(usuariosPath, usuarios)
      m.reply('❌ El rival no tiene Pokémon.')
      return true
    }

    const pokemonUser = JSON.parse(JSON.stringify(pokemonesUser[pokemonIndex]))
    const pokemonRival = pokemonesRival[Math.floor(Math.random() * pokemonesRival.length)]
    
    // Simular batalla
    const resultado = simularBatalla(
      pokemonUser,
      pokemonRival,
      user.nombre || 'Entrenador',
      rival.nombre || 'Rival'
    )
    
    // Actualizar experiencia
    pokemonesUser[pokemonIndex] = pokemonUser
    user.pokemones = pokemonesUser
    delete user.batallaTemporal
    
    usuarios[userId] = user
    guardarJSON(usuariosPath, usuarios)
    
    await m.reply(resultado)
    return true
  }

  return false
}

handler.help = ['pelear @usuario', 'pelear [número] @usuario', 'pelear lista']
handler.tags = ['pokemon', 'rpg', 'battle']
handler.command = /^(pelear|batalla|battle|desafiar)$/i
handler.register = false // Ya no requiere registro

export default handler

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

// FUNCIÓN MEJORADA para obtener Pokémon (compatible con todos los plugins)
function obtenerPokemonesUsuario(user) {
  if (!user) return []
  
  // Buscar en TODOS los formatos posibles que puedan existir
  const formatos = [
    'pokemones', 'pokemons', 'poke', 'mis_pokemones', 
    'pokemon_capturados', 'mispokemons', 'pokedex'
  ]
  
  for (const formato of formatos) {
    if (user[formato] && Array.isArray(user[formato]) && user[formato].length > 0) {
      return user[formato]
    }
  }
  
  // Formato antiguo: objeto único (compatibilidad con plugins viejos)
  if (user.pokemon) {
    if (Array.isArray(user.pokemon) && user.pokemon.length > 0) {
      return user.pokemon
    }
    if (typeof user.pokemon === 'object' && user.pokemon.nombre) {
      return [user.pokemon]
    }
  }
  
  return []
}

// Función para FORZAR formato consistente
function estandarizarFormatoPokemon(user) {
  const pokemones = obtenerPokemonesUsuario(user)
  
  if (pokemones.length > 0) {
    // Guardar en el formato estándar que todos los plugins deben usar
    user.pokemones = pokemones
    
    // Limpiar formatos antiguos para evitar duplicados
    const formatosAntiguos = [
      'pokemons', 'poke', 'mis_pokemones', 
      'pokemon_capturados', 'mispokemons', 'pokedex'
    ]
    
    for (const formato of formatosAntiguos) {
      if (user[formato]) delete user[formato]
    }
    
    // Si tenía el formato de objeto único, mantenerlo por compatibilidad
    if (!user.pokemon || typeof user.pokemon !== 'object') {
      user.pokemon = pokemones.length === 1 ? pokemones[0] : pokemones
    }
  }
  
  return user
}

// Función para calcular poder
function calcularPoder(pokemon) {
  if (!pokemon) return 0
  return (pokemon.vidaMax || pokemon.hp || 20) + 
         (pokemon.nivel || 1) * 5 + 
         (pokemon.ataque || pokemon.attack || 10) + 
         (pokemon.defensa || pokemon.defense || 5) +
         (pokemon.experiencia || pokemon.exp || 0) / 10
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
    
    // Crear usuario si no existe
    if (!usuarios[userId]) {
      usuarios[userId] = {
        nombre: conn.getName(m.sender),
        dinero: 1000,
        pokemones: []
      }
      guardarJSON(usuariosPath, usuarios)
    }
    
    const user = usuarios[userId]
    
    // ESTANDARIZAR formato de Pokémon para este usuario
    const userEstandarizado = estandarizarFormatoPokemon(user)
    if (userEstandarizado !== user) {
      usuarios[userId] = userEstandarizado
      guardarJSON(usuariosPath, usuarios)
    }
    
    const pokemonesUser = obtenerPokemonesUsuario(userEstandarizado)
    
    if (pokemonesUser.length === 0) {
      return m.reply('😢 No tienes Pokémon. Atrapa alguno primero.')
    }

    // Mostrar lista si no hay argumentos
    if (args.length === 0) {
      let lista = `📋 *TUS POKÉMON* (${pokemonesUser.length})\n\n`
      pokemonesUser.forEach((poke, index) => {
        lista += `*${index + 1}.* ${poke.nombre} - Nvl ${poke.nivel || 1}\n`
        lista += `   ❤️ ${poke.vida || poke.hp || 0}/${poke.vidaMax || poke.hp || 20}\n\n`
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
        lista += `   ❤️ ${poke.vida || poke.hp || 0}/${poke.vidaMax || poke.hp || 20}\n\n`
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
      guardarJSON(usuariosPath, usuarios)
    }
    
    const rival = usuarios[rivalId]
    
    // ESTANDARIZAR formato de Pokémon para el RIVAL también
    const rivalEstandarizado = estandarizarFormatoPokemon(rival)
    if (rivalEstandarizado !== rival) {
      usuarios[rivalId] = rivalEstandarizado
      guardarJSON(usuariosPath, usuarios)
    }
    
    const pokemonesRival = obtenerPokemonesUsuario(rivalEstandarizado)
    
    // DIAGNÓSTICO: Ver qué hay en la base de datos del rival
    console.log('Rival ID:', rivalId)
    console.log('Rival data:', rival)
    console.log('Pokémon encontrados:', pokemonesRival)
    
    if (pokemonesRival.length === 0) {
      // Buscar en formatos alternativos antes de dar error
      let formatosConPokemon = []
      for (const key in rival) {
        if (key.includes('pok') && rival[key] && typeof rival[key] === 'object') {
          formatosConPokemon.push(key)
        }
      }
      
      if (formatosConPokemon.length > 0) {
        // Intentar forzar estandarización
        const rivalForzado = estandarizarFormatoPokemon(rival)
        const pokemonesForzados = obtenerPokemonesUsuario(rivalForzado)
        
        if (pokemonesForzados.length > 0) {
          usuarios[rivalId] = rivalForzado
          guardarJSON(usuariosPath, usuarios)
          // Continuar con la batalla
        } else {
          return m.reply('⚠️ El oponente no tiene Pokémon capturados.')
        }
      } else {
        return m.reply('⚠️ El oponente no tiene Pokémon capturados.')
      }
    }

    // Si no se especificó Pokémon, mostrar selección
    if (pokemonIndex === null) {
      let lista = `⚔️ *DESAFÍO A ${rival.nombre || 'Entrenador'}* ⚔️\n\n`
      lista += `🎯 *SELECCIONA TU POKÉMON:*\n\n`
      
      pokemonesUser.forEach((poke, index) => {
        lista += `*${index + 1}.* ${poke.nombre} - Nvl ${poke.nivel || 1}\n`
        lista += `   ❤️ ${poke.vida || poke.hp || 0}/${poke.vidaMax || poke.hp || 20}\n\n`
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
    
    // SIMULAR BATALLA
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
handler.register = false

export default handler

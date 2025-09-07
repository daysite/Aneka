import fs from 'fs'

const usuariosPath = './src/database/usuarios.json'

// Función IDÉNTICA a la de tu Pokédex
function leerUsuarios() {
  try {
    const data = fs.readFileSync(usuariosPath, 'utf8')
    return JSON.parse(data) || {}
  } catch (error) {
    return {}
  }
}

// Función para guardar (compatible)
function guardarUsuarios(usuarios) {
  try {
    fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2))
  } catch (error) {
    console.error('Error al guardar usuarios:', error)
  }
}

// Función ESPECÍFICA para tu estructura
function obtenerPokemonesUsuario(user) {
  if (!user) return []
  
  // Usar EXACTAMENTE la misma estructura que tu Pokédex
  if (user.pokemons && Array.isArray(user.pokemons) && user.pokemons.length > 0) {
    return user.pokemons.map(pokemon => ({
      // Mantener todos los datos originales
      ...pokemon,
      // Campos adicionales para el sistema de batalla
      nombre: pokemon.name || 'Pokémon',
      nivel: pokemon.nivel || 1,
      vida: pokemon.stats?.hp || 50,
      vidaMax: pokemon.stats?.hp || 50,
      ataque: pokemon.stats?.attack || 10,
      defensa: pokemon.stats?.defense || 5,
      experiencia: pokemon.experiencia || 0
    }))
  }
  
  return []
}

// Función para calcular poder basado en TU estructura
function calcularPoder(pokemon) {
  if (!pokemon) return 0
  
  // Usar las stats de tu sistema
  const stats = pokemon.stats || {}
  return (stats.hp || 50) + 
         (stats.attack || 10) + 
         (stats.defense || 5) +
         (pokemon.nivel || 1) * 2 +
         (pokemon.experiencia || 0) / 20
}

// Función para simular batalla
function simularBatalla(pokeAtacante, pokeDefensor, userName, rivalName) {
  const poderAtacante = calcularPoder(pokeAtacante)
  const poderDefensor = calcularPoder(pokeDefensor)
  
  let resultado = `⚔️ *BATALLA POKÉMON* ⚔️\n\n`
  resultado += `👤 ${userName}\n`
  resultado += `🐾 ${pokeAtacante.name} (Nivel ${pokeAtacante.nivel || 1})\n`
  resultado += `⚡ Poder: ${Math.round(poderAtacante)}\n\n`
  resultado += `🆚\n\n`
  resultado += `👤 ${rivalName}\n`
  resultado += `🐾 ${pokeDefensor.name} (Nivel ${pokeDefensor.nivel || 1})\n`
  resultado += `⚡ Poder: ${Math.round(poderDefensor)}\n\n`
  
  // Simular turnos
  const turnos = Math.floor(Math.random() * 2) + 2
  for (let i = 1; i <= turnos; i++) {
    if (Math.random() > 0.4) {
      resultado += `⏱️ Turno ${i}: ${pokeAtacante.name} usa ${obtenerAtaque(pokeAtacante)}!\n`
    } else {
      resultado += `⏱️ Turno ${i}: ${pokeDefensor.name} usa ${obtenerAtaque(pokeDefensor)}!\n`
    }
  }
  
  resultado += `\n🎯 *RESULTADO FINAL*:\n`
  
  const diferencia = Math.abs(poderAtacante - poderDefensor)
  const esEmpate = diferencia < 25

  if (esEmpate) {
    resultado += `🤝 ¡Empate! Ambos lucharon valientemente.\n`
    resultado += `✨ +15 EXP para ambos Pokémon\n`
    
    pokeAtacante.experiencia = (pokeAtacante.experiencia || 0) + 15
    pokeDefensor.experiencia = (pokeDefensor.experiencia || 0) + 15
    
  } else if (poderAtacante > poderDefensor) {
    const expGanada = 25 + Math.floor(diferencia / 2)
    pokeAtacante.experiencia = (pokeAtacante.experiencia || 0) + expGanada
    
    resultado += `🎉 ¡${userName} gana la batalla!\n`
    resultado += `✨ ${pokeAtacante.name} ganó ${expGanada} EXP\n`
    
    // Verificar si sube de nivel
    if (pokeAtacante.experiencia >= (pokeAtacante.nivel || 1) * 100) {
      pokeAtacante.nivel = (pokeAtacante.nivel || 1) + 1
      resultado += `🆙 ¡${pokeAtacante.name} subió al nivel ${pokeAtacante.nivel}!`
    }
    
  } else {
    const expGanada = 25 + Math.floor(diferencia / 2)
    pokeDefensor.experiencia = (pokeDefensor.experiencia || 0) + expGanada
    
    resultado += `😵 ¡${rivalName} gana la batalla!\n`
    resultado += `✨ ${pokeDefensor.name} ganó ${expGanada} EXP\n`
    
    // Verificar si sube de nivel
    if (pokeDefensor.experiencia >= (pokeDefensor.nivel || 1) * 100) {
      pokeDefensor.nivel = (pokeDefensor.nivel || 1) + 1
      resultado += `🆙 ¡${pokeDefensor.name} subió al nivel ${pokeDefensor.nivel}!`
    }
  }
  
  return resultado
}

// Función auxiliar para obtener nombre de ataque
function obtenerAtaque(pokemon) {
  const tipos = pokemon.types || ['Normal']
  const ataques = {
    'FIRE': 'Lanzallamas',
    'WATER': 'Hidrobomba', 
    'ELECTRIC': 'Rayo',
    'GRASS': 'Latigazo',
    'ICE': 'Rayo Hielo',
    'FIGHTING': 'Puño Dinámico',
    'POISON': 'Veneno X',
    'GROUND': 'Terremoto',
    'FLYING': 'Tornado',
    'PSYCHIC': 'Psíquico',
    'BUG': 'Picadura',
    'ROCK': 'Roca Afilada',
    'GHOST': 'Bola Sombra',
    'DRAGON': 'Dracoataque',
    'DARK': 'Pulso Umbrío',
    'STEEL': 'Cabeza de Hierro',
    'FAIRY': 'Brillo Mágico'
  }
  
  return ataques[tipos[0]] || 'Impactrueno'
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    const usuarios = leerUsuarios()
    const userId = m.sender
    
    // DIAGNÓSTICO: Ver qué hay en la base de datos
    console.log('=== DIAGNÓSTICO BATALLA POKÉMON ===')
    console.log('User ID:', userId)
    console.log('Existe usuario:', !!usuarios[userId])
    if (usuarios[userId]) {
      console.log('Tiene pokemons:', usuarios[userId].pokemons ? usuarios[userId].pokemons.length : 0)
      console.log('Estructura completa:', usuarios[userId])
    }
    
    // Crear usuario si no existe (USANDO TU ESTRUCTURA)
    if (!usuarios[userId]) {
      usuarios[userId] = {
        nombre: conn.getName(m.sender),
        dinero: 1000,
        pokemons: [] // EXACTAMENTE igual que tu sistema
      }
      guardarUsuarios(usuarios)
    }
    
    const user = usuarios[userId]
    const pokemonesUser = obtenerPokemonesUsuario(user)
    
    console.log('Pokémon encontrados para batalla:', pokemonesUser.length)
    
    if (pokemonesUser.length === 0) {
      return m.reply('😢 No tienes Pokémon capturados. Usa *.pokemon* para capturar alguno.')
    }

    // Mostrar lista si no hay argumentos
    if (args.length === 0) {
      let lista = `📋 *TUS POKÉMON* (${pokemonesUser.length})\n\n`
      pokemonesUser.forEach((poke, index) => {
        const poder = Math.round(calcularPoder(poke))
        lista += `*${index + 1}.* ${poke.name} - Nvl ${poke.nivel || 1}\n`
        lista += `   ❤️ ${poke.stats?.hp || 0} | ⚡ ${poder} | 🌀 ${poke.types?.join('/') || 'Normal'}\n\n`
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
        lista += `*${index + 1}.* ${poke.name} - Nvl ${poke.nivel || 1}\n`
        lista += `   ❤️ ${poke.stats?.hp || 0} | 🌀 ${poke.types?.join('/') || 'Normal'}\n\n`
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

    const rivalId = mentionedJid.includes('@s.whatsapp.net') ? mentionedJid : mentionedJid + '@s.whatsapp.net'
    
    // Verificar que no sea uno mismo
    if (userId === rivalId) {
      return m.reply('❌ No puedes pelear contra ti mismo.')
    }

    // Crear rival si no existe (USANDO TU ESTRUCTURA)
    if (!usuarios[rivalId]) {
      usuarios[rivalId] = {
        nombre: conn.getName(rivalId) || 'Entrenador',
        dinero: 1000,
        pokemons: [] // MISMA estructura
      }
      guardarUsuarios(usuarios)
    }
    
    const rival = usuarios[rivalId]
    const pokemonesRival = obtenerPokemonesUsuario(rival)
    
    console.log('Rival ID:', rivalId)
    console.log('Pokémon del rival:', pokemonesRival.length)
    
    if (pokemonesRival.length === 0) {
      return m.reply('⚠️ El oponente no tiene Pokémon capturados.')
    }

    // Si no se especificó Pokémon, mostrar selección
    if (pokemonIndex === null) {
      let lista = `⚔️ *DESAFÍO A ${rival.nombre || 'Entrenador'}* ⚔️\n\n`
      lista += `🎯 *SELECCIONA TU POKÉMON:*\n\n`
      
      pokemonesUser.forEach((poke, index) => {
        lista += `*${index + 1}.* ${poke.name} - Nvl ${poke.nivel || 1}\n`
        lista += `   ❤️ ${poke.stats?.hp || 0} | 🌀 ${poke.types?.join('/') || 'Normal'}\n\n`
      })
      
      lista += `Responde con el *número* del Pokémon.\n`
      lista += `Ej: *1* para ${pokemonesUser[0].name}`
      
      // Guardar estado temporal
      user.batallaTemporal = {
        rivalId: rivalId,
        timestamp: Date.now(),
        estado: 'seleccion_user'
      }
      
      usuarios[userId] = user
      guardarUsuarios(usuarios)
      
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
    
    // Actualizar experiencia EN LA ESTRUCTURA ORIGINAL
    if (user.pokemons && user.pokemons[pokemonIndex]) {
      user.pokemons[pokemonIndex].experiencia = pokemonUser.experiencia
      user.pokemons[pokemonIndex].nivel = pokemonUser.nivel
    }
    
    usuarios[userId] = user
    guardarUsuarios(usuarios)
    
    await m.reply(resultado)

  } catch (error) {
    console.error('Error en pelear:', error)
    m.reply('❌ Error en la batalla. Intenta nuevamente.')
  }
}

// Handler para selección de Pokémon
export async function before(m, { conn, usedPrefix }) {
  if (!m.text || m.isBaileys) return false
  
  const usuarios = leerUsuarios()
  const userId = m.sender
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
      guardarUsuarios(usuarios)
      m.reply('❌ El rival ya no está disponible.')
      return true
    }

    const pokemonesRival = obtenerPokemonesUsuario(rival)
    if (pokemonesRival.length === 0) {
      delete user.batallaTemporal
      usuarios[userId] = user
      guardarUsuarios(usuarios)
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
    
    // Actualizar experiencia EN LA ESTRUCTURA ORIGINAL
    if (user.pokemons && user.pokemons[pokemonIndex]) {
      user.pokemons[pokemonIndex].experiencia = pokemonUser.experiencia
      user.pokemons[pokemonIndex].nivel = pokemonUser.nivel
    }
    
    delete user.batallaTemporal
    usuarios[userId] = user
    guardarUsuarios(usuarios)
    
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

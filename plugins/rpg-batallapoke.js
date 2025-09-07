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

// Función para extraer ID de menciones - ¡CORREGIDA!
function extractMentionedJid(text) {
  const mentionRegex = /@([0-9]){0,20}/g
  const matches = text.match(mentionRegex)
  if (matches && matches[0]) {
    return matches[0].replace('@', '') + '@s.whatsapp.net'
  }
  return null
}

// Función ESPECÍFICA para tu estructura
function obtenerPokemonesUsuario(user) {
  if (!user) return []
  
  // Buscar en TODOS los formatos posibles para compatibilidad máxima
  if (user.pokemons && Array.isArray(user.pokemons)) {
    return user.pokemons.map(pokemon => ({
      ...pokemon,
      nombre: pokemon.name || pokemon.nombre || 'Pokémon',
      nivel: pokemon.nivel || 1,
      vida: pokemon.stats?.hp || pokemon.hp || pokemon.vida || 50,
      vidaMax: pokemon.stats?.hp || pokemon.hp || pokemon.vidaMax || 50,
      ataque: pokemon.stats?.attack || pokemon.ataque || pokemon.attack || 10,
      defensa: pokemon.stats?.defense || pokemon.defensa || pokemon.defense || 5,
      experiencia: pokemon.experiencia || pokemon.exp || 0
    }))
  }
  
  return []
}

// Función para calcular poder basado en TU estructura
function calcularPoder(pokemon) {
  if (!pokemon) return 0
  
  const stats = pokemon.stats || {}
  return (stats.hp || pokemon.hp || 50) + 
         (stats.attack || pokemon.attack || pokemon.ataque || 10) + 
         (stats.defense || pokemon.defense || pokemon.defensa || 5) +
         (pokemon.nivel || 1) * 2
}

// Función para simular batalla
function simularBatalla(pokeAtacante, pokeDefensor, userName, rivalName) {
  const poderAtacante = calcularPoder(pokeAtacante)
  const poderDefensor = calcularPoder(pokeDefensor)
  
  let resultado = `⚔️ *BATALLA POKÉMON* ⚔️\n\n`
  resultado += `👤 ${userName}\n`
  resultado += `🐾 ${pokeAtacante.name || pokeAtacante.nombre} (Nivel ${pokeAtacante.nivel || 1})\n`
  resultado += `⚡ Poder: ${Math.round(poderAtacante)}\n\n`
  resultado += `🆚\n\n`
  resultado += `👤 ${rivalName}\n`
  resultado += `🐾 ${pokeDefensor.name || pokeDefensor.nombre} (Nivel ${pokeDefensor.nivel || 1})\n`
  resultado += `⚡ Poder: ${Math.round(poderDefensor)}\n\n`
  
  // Simular resultado
  resultado += `🎯 *RESULTADO FINAL*:\n`
  
  const diferencia = Math.abs(poderAtacante - poderDefensor)
  const esEmpate = diferencia < 25

  if (esEmpate) {
    resultado += `🤝 ¡Empate! Ambos lucharon valientemente.\n`
    resultado += `✨ +15 EXP para ambos Pokémon\n`
  } else if (poderAtacante > poderDefensor) {
    resultado += `🎉 ¡${userName} gana la batalla!\n`
    resultado += `✨ ${pokeAtacante.name || pokeAtacante.nombre} ganó 25 EXP\n`
  } else {
    resultado += `😵 ¡${rivalName} gana la batalla!\n`
    resultado += `✨ ${pokeDefensor.name || pokeDefensor.nombre} ganó 25 EXP\n`
  }
  
  return resultado
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    const usuarios = leerUsuarios()
    const userId = m.sender
    
    // Crear usuario si no existe
    if (!usuarios[userId]) {
      usuarios[userId] = {
        nombre: conn.getName(m.sender),
        pokemons: []
      }
      guardarUsuarios(usuarios)
    }
    
    const user = usuarios[userId]
    const pokemonesUser = obtenerPokemonesUsuario(user)
    
    if (pokemonesUser.length === 0) {
      return m.reply('❌ No tienes Pokémon capturados. Usa *.pokemon* para capturar alguno.')
    }

    // Mostrar lista si no hay argumentos
    if (args.length === 0) {
      let lista = `📋 *TUS POKÉMON* (${pokemonesUser.length})\n\n`
      pokemonesUser.forEach((poke, index) => {
        const poder = Math.round(calcularPoder(poke))
        lista += `${index + 1}. ${poke.name || poke.nombre} - Nvl ${poke.nivel || 1} | ⚡ ${poder}\n`
      })
      
      lista += `\n⚔️ *Para pelear:*\n`
      lista += `${usedPrefix}pelear @usuario - Desafiar a alguien\n`
      lista += `${usedPrefix}pelear 1 @usuario - Usar Pokémon 1\n`
      
      return m.reply(lista)
    }

    // Buscar usuario mencionado - ¡MÉTODO CORREGIDO!
    let mentionedJid = null
    let pokemonIndex = null
    
    // Buscar menciones en el mensaje completo
    mentionedJid = extractMentionedJid(m.text)
    
    // Buscar número de Pokémon en los argumentos
    for (let i = 0; i < args.length; i++) {
      if (!isNaN(args[i])) {
        pokemonIndex = parseInt(args[i]) - 1
        break
      }
    }

    if (!mentionedJid) {
      return m.reply(`❌ Debes mencionar a alguien.\nEjemplo: *${usedPrefix}pelear @usuario*`)
    }

    const rivalId = mentionedJid
    const rivalIdSimple = rivalId.replace('@s.whatsapp.net', '')
    
    // Verificar que no sea uno mismo
    if (userId === rivalId || userId === rivalIdSimple) {
      return m.reply('❌ No puedes pelear contra ti mismo.')
    }

    // Buscar rival
    let rival = usuarios[rivalId] || usuarios[rivalIdSimple]
    
    // Crear rival si no existe
    if (!rival) {
      rival = {
        nombre: conn.getName(rivalId) || 'Entrenador',
        pokemons: []
      }
      usuarios[rivalId] = rival
      guardarUsuarios(usuarios)
    }
    
    const pokemonesRival = obtenerPokemonesUsuario(rival)
    
    if (pokemonesRival.length === 0) {
      return m.reply('❌ El oponente no tiene Pokémon capturados.')
    }

    // Seleccionar Pokémon (por defecto el primero)
    if (pokemonIndex === null) {
      pokemonIndex = 0
    }

    if (pokemonIndex < 0 || pokemonIndex >= pokemonesUser.length) {
      return m.reply(`❌ Pokémon inválido. Elige del 1 al ${pokemonesUser.length}.`)
    }

    const pokemonUser = pokemonesUser[pokemonIndex]
    const pokemonRival = pokemonesRival[Math.floor(Math.random() * pokemonesRival.length)]
    
    // Simular batalla
    const resultado = simularBatalla(
      pokemonUser,
      pokemonRival,
      user.nombre || 'Entrenador',
      rival.nombre || 'Rival'
    )
    
    await m.reply(resultado)

  } catch (error) {
    console.error('Error en pelear:', error)
    m.reply('❌ Error en la batalla. Intenta nuevamente.')
  }
}

handler.help = ['pelear @usuario', 'pelear [número] @usuario']
handler.tags = ['pokemon', 'rpg']
handler.command = /^(pelear|batalla|battle)$/i

export default handler

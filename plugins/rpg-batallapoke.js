import fs from 'fs'

const usuariosPath = './src/database/usuarios.json'

function leerUsuarios() {
  try {
    const data = fs.readFileSync(usuariosPath, 'utf8')
    return JSON.parse(data) || {}
  } catch (error) {
    return {}
  }
}

function guardarUsuarios(usuarios) {
  try {
    fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2))
  } catch (error) {
    console.error('Error al guardar usuarios:', error)
  }
}

// Función MEJORADA para obtener Pokémon
function obtenerPokemonesUsuario(user) {
  if (!user) return []
  return user.pokemons || []
}

function calcularPoder(pokemon) {
  if (!pokemon) return 0
  const stats = pokemon.stats || {}
  return (stats.hp || 50) + (stats.attack || 10) + (stats.defense || 5) + ((pokemon.nivel || 1) * 2)
}

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
  
  resultado += `🎯 *RESULTADO FINAL*:\n`
  
  if (poderAtacante > poderDefensor) {
    resultado += `🎉 ¡${userName} gana la batalla!\n`
    resultado += `✨ ${pokeAtacante.name} ganó 25 EXP\n`
  } else if (poderDefensor > poderAtacante) {
    resultado += `😵 ¡${rivalName} gana la batalla!\n`
    resultado += `✨ ${pokeDefensor.name} ganó 25 EXP\n`
  } else {
    resultado += `🤝 ¡Empate! Ambos lucharon valientemente.\n`
  }
  
  return resultado
}

let handler = async (m, { conn, args, usedPrefix }) => {
  try {
    const usuarios = leerUsuarios()
    const userId = m.sender
    
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
        lista += `${index + 1}. ${poke.name} - Nvl ${poke.nivel || 1} | ⚡ ${poder}\n`
      })
      
      lista += `\n⚔️ *Para pelear:*\n`
      lista += `${usedPrefix}pelear @usuario - Desafiar a alguien\n`
      lista += `${usedPrefix}pelear 1 @usuario - Usar Pokémon 1\n`
      
      return m.reply(lista)
    }

    // BUSCAR USUARIO MENCIONADO
    let mentionedJid = null
    let pokemonIndex = 0 // Por defecto el primer Pokémon

    // Verificar si hay menciones en el mensaje
    if (m.mentionedJid && m.mentionedJid.length > 0) {
      mentionedJid = m.mentionedJid[0]
    }

    // Buscar número de Pokémon en los argumentos
    for (let i = 0; i < args.length; i++) {
      if (!isNaN(args[i]) && parseInt(args[i]) > 0) {
        pokemonIndex = parseInt(args[i]) - 1
        break
      }
    }

    if (!mentionedJid) {
      return m.reply(`❌ Debes mencionar a alguien.\nEjemplo: *${usedPrefix}pelear @usuario*`)
    }

    // Verificar que no sea uno mismo
    if (userId === mentionedJid) {
      return m.reply('❌ No puedes pelear contra ti mismo.')
    }

    // BUSCAR RIVAL EN LA BASE DE DATOS - CORRECCIÓN APLICADA
    const rivalId = mentionedJid
    let rival = usuarios[rivalId]

    // Si el rival no existe o no tiene pokemons, crear estructura básica
    if (!rival) {
      usuarios[rivalId] = {
        nombre: conn.getName(rivalId),
        pokemons: []
      }
      rival = usuarios[rivalId]
      guardarUsuarios(usuarios)
    }

    const pokemonesRival = obtenerPokemonesUsuario(rival)
    
    if (pokemonesRival.length === 0) {
      return m.reply('❌ El oponente no tiene Pokémon capturados.')
    }

    // Verificar índice de Pokémon
    if (pokemonIndex < 0 || pokemonIndex >= pokemonesUser.length) {
      return m.reply(`❌ Pokémon inválido. Elige del 1 al ${pokemonesUser.length}.`)
    }

    const pokemonUser = pokemonesUser[pokemonIndex]
    const pokemonRival = pokemonesRival[Math.floor(Math.random() * pokemonesRival.length)]
    
    // Simular batalla
    const resultado = simularBatalla(
      pokemonUser,
      pokemonRival,
      user.nombre || conn.getName(userId),
      rival.nombre || conn.getName(rivalId)
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

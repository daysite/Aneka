import fs from 'fs'
import path from 'path'

const usuariosPath = './src/database/usuarios.json'

// Asegurar que el directorio existe
function asegurarDirectorio(rutaArchivo) {
  const directorio = path.dirname(rutaArchivo);
  if (!fs.existsSync(directorio)) {
    fs.mkdirSync(directorio, { recursive: true });
  }
}

function leerUsuarios() {
  try {
    asegurarDirectorio(usuariosPath);
    if (!fs.existsSync(usuariosPath)) {
      fs.writeFileSync(usuariosPath, JSON.stringify({}, null, 2));
      return {};
    }
    
    const data = fs.readFileSync(usuariosPath, 'utf8')
    return JSON.parse(data) || {}
  } catch (error) {
    console.error('Error al leer usuarios:', error)
    return {}
  }
}

function guardarUsuarios(usuarios) {
  try {
    asegurarDirectorio(usuariosPath);
    fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2))
    return true;
  } catch (error) {
    console.error('Error al guardar usuarios:', error)
    return false;
  }
}

// Función MEJORADA para obtener Pokémon
function obtenerPokemonesUsuario(user) {
  if (!user || !user.pokemons || !Array.isArray(user.pokemons)) return []
  return user.pokemons.filter(p => p && p.nombre && p.nombre !== 'undefined')
}

function calcularPoder(pokemon) {
  if (!pokemon) return 0
  const stats = pokemon.stats || {}
  return (stats.hp || 50) + (stats.attack || 10) + (stats.defense || 5) + ((pokemon.nivel || 1) * 2)
}

// Función para verificar si un Pokémon puede pelear
function puedePelear(pokemon) {
  if (!pokemon) return false;
  
  // Si el Pokémon no tiene estado, puede pelear
  if (!pokemon.estado) return true;
  
  // Verificar estados que impiden pelear
  const estadosInvalidos = ['debilitado', 'cansado', 'dormido', 'congelado', 'paralizado'];
  return !estadosInvalidos.includes(pokemon.estado);
}

// Función para aplicar daño y estado después de la batalla
function aplicarEfectosBatalla(pokemon, esGanador) {
  if (!pokemon) return pokemon;
  
  // Crear copia para no modificar el original directamente
  const pokemonModificado = { ...pokemon };
  
  if (!pokemonModificado.estado) {
    pokemonModificado.estado = 'normal';
  }
  
  if (esGanador) {
    // Ganador: cansado pero feliz
    pokemonModificado.estado = 'cansado';
    // Aumentar experiencia por ganar
    pokemonModificado.experiencia = (pokemonModificado.experiencia || 0) + 25;
  } else {
    // Perdedor: debilitado
    pokemonModificado.estado = 'debilitado';
    // Aumentar experiencia por participar
    pokemonModificado.experiencia = (pokemonModificado.experiencia || 0) + 10;
  }
  
  // Verificar si sube de nivel (cada 100 exp)
  if (pokemonModificado.experiencia >= 100) {
    pokemonModificado.nivel = (pokemonModificado.nivel || 1) + 1;
    pokemonModificado.experiencia = 0;
  }
  
  return pokemonModificado;
}

// Función para recuperar Pokémon (debe ser llamado después de un tiempo)
function recuperarPokemon(pokemon) {
  if (!pokemon) return pokemon;
  
  const pokemonRecuperado = { ...pokemon };
  
  // Estados que se recuperan automáticamente
  const estadosRecuperables = ['cansado', 'debilitado'];
  if (estadosRecuperables.includes(pokemonRecuperado.estado)) {
    pokemonRecuperado.estado = 'normal';
  }
  
  return pokemonRecuperado;
}

function simularBatalla(pokeAtacante, pokeDefensor, userName, rivalName) {
  const poderAtacante = calcularPoder(pokeAtacante)
  const poderDefensor = calcularPoder(pokeDefensor)
  
  let resultado = `⚔️ *BATALLA POKÉMON* ⚔️\n\n`
  resultado += `👤 ${userName}\n`
  resultado += `🐾 ${pokeAtacante.nombre} (Nivel ${pokeAtacante.nivel || 1})`
  
  // Mostrar estado actual si existe
  if (pokeAtacante.estado && pokeAtacante.estado !== 'normal') {
    resultado += ` [${pokeAtacante.estado.toUpperCase()}]`
  }
  
  resultado += `\n⚡ Poder: ${Math.round(poderAtacante)}\n\n`
  resultado += `🆚\n\n`
  resultado += `👤 ${rivalName}\n`
  resultado += `🐾 ${pokeDefensor.nombre} (Nivel ${pokeDefensor.nivel || 1})`
  
  // Mostrar estado actual si existe
  if (pokeDefensor.estado && pokeDefensor.estado !== 'normal') {
    resultado += ` [${pokeDefensor.estado.toUpperCase()}]`
  }
  
  resultado += `\n⚡ Poder: ${Math.round(poderDefensor)}\n\n`
  
  // Añadir narrativa de batalla
  resultado += `🎯 *INICIO DE BATALLA*:\n`
  resultado += `¡${pokeAtacante.nombre} usa ${obtenerAtaqueAleatorio(pokeAtacante.tipos)}!\n`
  resultado += `¡${pokeDefensor.nombre} contraataca con ${obtenerAtaqueAleatorio(pokeDefensor.tipos)}!\n\n`
  
  resultado += `🎯 *RESULTADO FINAL*:\n`
  
  let ganador = null;
  let perdedor = null;
  
  if (poderAtacante > poderDefensor) {
    resultado += `🎉 ¡${userName} gana la batalla!\n`
    resultado += `✨ ${pokeAtacante.nombre} ganó 25 EXP y está CANSADO\n`
    resultado += `😵 ${pokeDefensor.nombre} está DEBILITADO y ganó 10 EXP\n`
    ganador = pokeAtacante;
    perdedor = pokeDefensor;
  } else if (poderDefensor > poderAtacante) {
    resultado += `😵 ¡${rivalName} gana la batalla!\n`
    resultado += `✨ ${pokeDefensor.nombre} ganó 25 EXP y está CANSADO\n`
    resultado += `😵 ${pokeAtacante.nombre} está DEBILITADO y ganó 10 EXP\n`
    ganador = pokeDefensor;
    perdedor = pokeAtacante;
  } else {
    resultado += `🤝 ¡Empate! Ambos lucharon valientemente.\n`
    resultado += `✨ Ambos ganaron 15 EXP y quedaron CANSADOS\n`
  }
  
  resultado += `\n💡 *Estados:* CANSADO → recupera en 30 min | DEBILITADO → necesita curación`
  
  return { resultado, ganador, perdedor, empate: poderAtacante === poderDefensor }
}

// Función para obtener ataques según tipo
function obtenerAtaqueAleatorio(tipos) {
  const ataquesComunes = ['Placaje', 'Gruñido', 'Arañazo', 'Destructor'];
  const ataquesPorTipo = {
    fuego: ['Lanzallamas', 'Ascuas', 'Giro Fuego', 'Infierno'],
    agua: ['Hidrobomba', 'Pistola Agua', 'Surf', 'Burbuja'],
    eléctrico: ['Impactrueno', 'Rayo', 'Trueno', 'Electrobola'],
    planta: ['Latigazo', 'Hoja Afilada', 'Rayo Solar', 'Drenadoras'],
    veneno: ['Ácido', 'Tóxico', 'Residuos', 'Bomba Lodo'],
    volador: ['Tornado', 'Ataque Aéreo', 'Picotazo', 'Remolino'],
    // Agrega más tipos según necesites
  };
  
  // Si no hay tipos o son desconocidos, usar ataques comunes
  if (!tipos || !Array.isArray(tipos) || tipos.length === 0) {
    return ataquesComunes[Math.floor(Math.random() * ataquesComunes.length)];
  }
  
  // Buscar ataques para el primer tipo
  const primerTipo = tipos[0].toLowerCase();
  if (ataquesPorTipo[primerTipo]) {
    return ataquesPorTipo[primerTipo][Math.floor(Math.random() * ataquesPorTipo[primerTipo].length)];
  }
  
  // Si el tipo no está en la lista, usar ataques comunes
  return ataquesComunes[Math.floor(Math.random() * ataquesComunes.length)];
}

let handler = async (m, { conn, args, usedPrefix }) => {
  try {
    const usuarios = leerUsuarios()
    const userId = m.sender
    
    if (!usuarios[userId]) {
      return m.reply('❌ No estás registrado. Usa *.registrar* primero.')
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
        const estado = poke.estado && poke.estado !== 'normal' ? `[${poke.estado.toUpperCase()}]` : '';
        lista += `${index + 1}. ${poke.nombre} - Nvl ${poke.nivel || 1} ${estado} | ⚡ ${poder}\n`
      })
      
      lista += `\n⚔️ *Para pelear:*\n`
      lista += `${usedPrefix}pelear @usuario - Desafiar a alguien\n`
      lista += `${usedPrefix}pelear 1 @usuario - Usar Pokémon 1\n`
      lista += `\n💡 *Estados:*\n• CANSADO: Recupera en 30 min\n• DEBILITADO: Necesita curación\n• NORMAL: Listo para combatir`
      
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

    // BUSCAR RIVAL EN LA BASE DE DATOS
    const rivalId = mentionedJid
    let rival = usuarios[rivalId]

    if (!rival) {
      return m.reply('❌ El usuario mencionado no está registrado en el sistema Pokémon.')
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
    
    // Verificar si el Pokémon puede pelear
    if (!puedePelear(pokemonUser)) {
      return m.reply(`❌ *${pokemonUser.nombre}* no puede pelear ahora (Estado: ${pokemonUser.estado || 'desconocido'}).\n💡 Usa pociones o espera a que se recupere.`)
    }

    // Elegir Pokémon rival aleatorio que pueda pelear
    const pokemonesRivalDisponibles = pokemonesRival.filter(p => puedePelear(p))
    if (pokemonesRivalDisponibles.length === 0) {
      return m.reply('❌ Tu rival no tiene Pokémon disponibles para pelear.')
    }
    
    const pokemonRival = pokemonesRivalDisponibles[Math.floor(Math.random() * pokemonesRivalDisponibles.length)]
    
    // Simular batalla
    const batalla = simularBatalla(
      pokemonUser,
      pokemonRival,
      user.nombre || conn.getName(userId),
      rival.nombre || conn.getName(rivalId)
    )
    
    // Aplicar efectos de batalla a los Pokémon
    if (!batalla.empate) {
      const pokemonUserModificado = aplicarEfectosBatalla(
        pokemonUser, 
        batalla.ganador === pokemonUser
      );
      
      const pokemonRivalModificado = aplicarEfectosBatalla(
        pokemonRival, 
        batalla.ganador === pokemonRival
      );
      
      // Actualizar Pokémon en la base de datos
      const userPokemonIndex = user.pokemons.findIndex(p => p.idUnico === pokemonUser.idUnico);
      if (userPokemonIndex !== -1) {
        user.pokemons[userPokemonIndex] = pokemonUserModificado;
      }
      
      const rivalPokemonIndex = rival.pokemons.findIndex(p => p.idUnico === pokemonRival.idUnico);
      if (rivalPokemonIndex !== -1) {
        rival.pokemons[rivalPokemonIndex] = pokemonRivalModificado;
      }
      
      // Guardar cambios
      usuarios[userId] = user;
      usuarios[rivalId] = rival;
      guardarUsuarios(usuarios);
    }
    
    await m.reply(batalla.resultado)

  } catch (error) {
    console.error('Error en pelear:', error)
    m.reply('❌ Error en la batalla. Intenta nuevamente.')
  }
}

handler.help = ['pelear @usuario', 'pelear [número] @usuario']
handler.tags = ['pokemon', 'rpg']
handler.command = /^(pelear|batalla|battle)$/i
handler.register = true;

export default handler

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
  fs.writeFileSync(ruta, JSON.stringify(data, null, 2))
}

// Función para obtener los Pokémon de un usuario
function obtenerPokemonesUsuario(user) {
  if (!user) return []
  
  // Compatibilidad con múltiples formatos
  if (user.pokemon) {
    if (Array.isArray(user.pokemon)) return user.pokemon
    if (typeof user.pokemon === 'object') return [user.pokemon]
  }
  
  if (user.pokemones && Array.isArray(user.pokemones)) return user.pokemones
  if (user.pokemons && Array.isArray(user.pokemons)) return user.pokemons
  
  return []
}

// Función para calcular el poder de un Pokémon
function calcularPoder(pokemon) {
  return (pokemon.vidaMax || 20) + 
         (pokemon.nivel || 1) * 5 + 
         (pokemon.ataque || 10) + 
         (pokemon.defensa || 5) +
         (pokemon.experiencia || 0) / 10
}

// Función para simular batalla con más detalle
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
  
  // Simular 2-3 turnos de batalla
  const turnos = Math.floor(Math.random() * 2) + 2
  for (let i = 1; i <= turnos; i++) {
    if (Math.random() > 0.4) {
      resultado += `⏱️ Turno ${i}: ${pokeAtacante.nombre} ataca a ${pokeDefensor.nombre}\n`
    } else {
      resultado += `⏱️ Turno ${i}: ${pokeDefensor.nombre} ataca a ${pokeAtacante.nombre}\n`
    }
  }
  
  resultado += `\n🎯 *RESULTADO FINAL*:\n`
  
  const diferencia = Math.abs(poderAtacante - poderDefensor)
  const esEmpate = diferencia < 10
  
  if (esEmpate) {
    resultado += `🤝 ¡Empate! Ambos lucharon valientemente.\n`
    resultado += `✨ Ambos ganan 15 puntos de experiencia!\n`
    
    pokeAtacante.experiencia = (pokeAtacante.experiencia || 0) + 15
    pokeDefensor.experiencia = (pokeDefensor.experiencia || 0) + 15
    
  } else if (poderAtacante > poderDefensor) {
    const expGanada = 20 + Math.floor(diferencia / 5)
    pokeAtacante.experiencia = (pokeAtacante.experiencia || 0) + expGanada
    
    // Posibilidad de subir de nivel
    const expNecesaria = (pokeAtacante.nivel || 1) * 100
    if (pokeAtacante.experiencia >= expNecesaria) {
      const nivelesSubidos = Math.floor(pokeAtacante.experiencia / expNecesaria)
      pokeAtacante.nivel = (pokeAtacante.nivel || 1) + nivelesSubidos
      pokeAtacante.vidaMax = (pokeAtacante.vidaMax || 20) + (5 * nivelesSubidos)
      pokeAtacante.vida = pokeAtacante.vidaMax
      resultado += `🎉 ¡${userName} gana!\n`
      resultado += `🆙 ${pokeAtacante.nombre} subió al nivel ${pokeAtacante.nivel}!\n`
    } else {
      resultado += `🎉 ¡${userName} gana!\n`
      resultado += `✨ ${pokeAtacante.nombre} ganó ${expGanada} puntos de experiencia!\n`
    }
    
  } else {
    const expGanada = 20 + Math.floor(diferencia / 5)
    pokeDefensor.experiencia = (pokeDefensor.experiencia || 0) + expGanada
    
    // Posibilidad de subir de nivel
    const expNecesaria = (pokeDefensor.nivel || 1) * 100
    if (pokeDefensor.experiencia >= expNecesaria) {
      const nivelesSubidos = Math.floor(pokeDefensor.experiencia / expNecesaria)
      pokeDefensor.nivel = (pokeDefensor.nivel || 1) + nivelesSubidos
      pokeDefensor.vidaMax = (pokeDefensor.vidaMax || 20) + (5 * nivelesSubidos)
      pokeDefensor.vida = pokeDefensor.vidaMax
      resultado += `😵 ¡${rivalName} gana!\n`
      resultado += `🆙 ${pokeDefensor.nombre} subió al nivel ${pokeDefensor.nivel}!\n`
    } else {
      resultado += `😵 ¡${rivalName} gana!\n`
      resultado += `✨ ${pokeDefensor.nombre} ganó ${expGanada} puntos de experiencia!\n`
    }
  }
  
  return resultado
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    const usuarios = cargarJSON(usuariosPath)
    const userId = m.sender.replace(/[^0-9]/g, '')
    const user = usuarios[userId]

    // Verificar si el usuario existe
    if (!user) return m.reply('❌ No estás registrado. Usa *.registrar* primero.')
    
    // Obtener Pokémon del usuario
    const pokemonesUser = obtenerPokemonesUsuario(user)
    
    // Verificar si el usuario tiene Pokémon
    if (pokemonesUser.length === 0) {
      return m.reply('😢 No tienes Pokémon. Atrapa alguno primero.')
    }

    // Buscar usuario mencionado
    let mentioned = m.mentionedJid?.[0]
    if (!mentioned && args[0]) {
      const possibleNumber = args[0].replace(/[^0-9]/g, '')
      if (possibleNumber.length > 5) {
        mentioned = possibleNumber + '@s.whatsapp.net'
      }
    }
    
    if (!mentioned) {
      return m.reply(`👥 Debes mencionar a un jugador para pelear.\nEjemplo: *${usedPrefix}pelear @amigo*`)
    }

    const rivalId = mentioned.replace(/[^0-9]/g, '')
    const rival = usuarios[rivalId]

    // Verificar si el rival existe
    if (!rival) {
      return m.reply('❌ El usuario mencionado no está registrado.')
    }
    
    // Obtener Pokémon del rival
    const pokemonesRival = obtenerPokemonesUsuario(rival)
    
    // Verificar si el rival tiene Pokémon
    if (pokemonesRival.length === 0) {
      return m.reply('⚠️ El oponente no tiene Pokémon.')
    }

    // Verificar que no se esté desafiando a sí mismo
    if (userId === rivalId) {
      return m.reply('❌ No puedes pelear contra ti mismo.')
    }

    // MOSTRAR SELECCIÓN DE POKÉMON PARA EL USUARIO
    if (!user.batallaTemporal) {
      let listaPokemones = `⚔️ *DESAFÍO DE BATALLA* ⚔️\n\n`
      listaPokemones += `👤 Retas a: ${rival.nombre || 'Entrenador'}\n\n`
      listaPokemones += `🎯 *SELECCIONA TU POKÉMON:*\n\n`
      
      pokemonesUser.forEach((poke, index) => {
        listaPokemones += `*${index + 1}.* ${poke.nombre} - Nvl ${poke.nivel || 1}\n`
        listaPokemones += `   ❤️ ${poke.vida || 0}/${poke.vidaMax || 20} | ⚡ Poder: ${Math.round(calcularPoder(poke))}\n\n`
      })
      
      listaPokemones += `Responde con el *número* del Pokémon que quieres usar.\n`
      listaPokemones += `Ejemplo: *1* para elegir a ${pokemonesUser[0].nombre}`
      
      // Guardar estado temporal de la batalla
      user.batallaTemporal = {
        rivalId: rivalId,
        timestamp: Date.now(),
        estado: 'seleccion_user'
      }
      usuarios[userId] = user
      guardarJSON(usuariosPath, usuarios)
      
      return m.reply(listaPokemones)
    }

    // MANEJAR SELECCIÓN DEL USUARIO
    if (user.batallaTemporal && user.batallaTemporal.estado === 'seleccion_user') {
      const seleccion = parseInt(args[0]) - 1
      
      if (isNaN(seleccion) || seleccion < 0 || seleccion >= pokemonesUser.length) {
        return m.reply(`❌ Selección inválida. Elige entre 1 y ${pokemonesUser.length}.`)
      }
      
      const pokemonElegido = pokemonesUser[seleccion]
      
      // Actualizar estado temporal
      user.batallaTemporal.pokemonUser = pokemonElegido
      user.batallaTemporal.estado = 'esperando_rival'
      usuarios[userId] = user
      guardarJSON(usuariosPath, usuarios)
      
      // Notificar al rival
      let mensajeRival = `⚔️ *¡TE ESTÁN RETANDO!* ⚔️\n\n`
      mensajeRival += `👤 ${user.nombre || 'Un entrenador'} te desafía a una batalla Pokémon!\n`
      mensajeRival += `🐾 Usará: ${pokemonElegido.nombre} (Nivel ${pokemonElegido.nivel || 1})\n\n`
      mensajeRival += `💥 *¿Aceptas el desafío?*\n`
      mensajeRival += `Responde: *${usedPrefix}aceptar* para pelear\n`
      mensajeRival += `O ignora este mensaje para rechazar.`
      
      await conn.sendMessage(rivalId + '@s.whatsapp.net', { 
        text: mensajeRival,
        mentions: [mentioned]
      })
      
      return m.reply(`✅ Desafío enviado a ${rival.nombre || 'el entrenador'}.\nEsperando su respuesta...`)
    }
    
  } catch (error) {
    console.error('Error en handler pelear:', error)
    return m.reply('❌ Ocurrió un error al procesar el desafío.')
  }
}

// Handler para aceptar batallas
async function handleAceptarBatalla(m, usuarios, userId) {
  const user = usuarios[userId]
  
  if (!user.batallaTemporal || user.batallaTemporal.estado !== 'esperando_rival') {
    return '❌ No tien desafíos pendientes.'
  }
  
  const retadorId = user.batallaTemporal.rivalId
  const retador = usuarios[retadorId]
  
  if (!retador || !retador.batallaTemporal) {
    return '❌ El desafío ya no es válido.'
  }
  
  // Obtener Pokémon del rival
  const pokemonesRival = obtenerPokemonesUsuario(user)
  
  if (pokemonesRival.length === 0) {
    return '❌ No tienes Pokémon para combatir.'
  }
  
  // MOSTRAR SELECCIÓN DE POKÉMON AL RIVAL
  let listaPokemones = `⚔️ *SELECCIONA TU POKÉMON* ⚔️\n\n`
  listaPokemones += `👤 Te reta: ${retador.nombre || 'Entrenador'}\n`
  listaPokemones += `🐾 Usará: ${retador.batallaTemporal.pokemonUser.nombre}\n\n`
  listaPokemones += `🎯 *ELIGE TU POKÉMON:*\n\n`
  
  pokemonesRival.forEach((poke, index) => {
    listaPokemones += `*${index + 1}.* ${poke.nombre} - Nvl ${poke.nivel || 1}\n`
    listaPokemones += `   ❤️ ${poke.vida || 0}/${poke.vidaMax || 20} | ⚡ Poder: ${Math.round(calcularPoder(poke))}\n\n`
  })
  
  listaPokemones += `Responde con el *número* del Pokémon que quieres usar.`
  
  // Actualizar estado
  user.batallaTemporal.estado = 'seleccion_rival'
  usuarios[userId] = user
  guardarJSON(usuariosPath, usuarios)
  
  return listaPokemones
}

// Handler para la selección del Pokémon del rival
async function handleSeleccionRival(m, usuarios, userId, seleccion) {
  const user = usuarios[userId]
  
  if (!user.batallaTemporal || user.batallaTemporal.estado !== 'seleccion_rival') {
    return '❌ No estás en proceso de selección.'
  }
  
  const retadorId = user.batallaTemporal.rivalId
  const retador = usuarios[retadorId]
  
  if (!retador || !retador.batallaTemporal) {
    return '❌ El desafío ya no es válido.'
  }
  
  const pokemonesRival = obtenerPokemonesUsuario(user)
  const index = parseInt(seleccion) - 1
  
  if (isNaN(index) || index < 0 || index >= pokemonesRival.length) {
    return `❌ Selección inválida. Elige entre 1 y ${pokemonesRival.length}.`
  }
  
  const pokemonRival = pokemonesRival[index]
  const pokemonRetador = retador.batallaTemporal.pokemonUser
  
  // SIMULAR LA BATALLA
  const resultado = simularBatalla(
    pokemonRetador, 
    pokemonRival, 
    retador.nombre || 'Entrenador', 
    user.nombre || 'Entrenador'
  )
  
  // ACTUALIZAR POKÉMON EN LA BASE DE DATOS
  const pokemonesRetador = obtenerPokemonesUsuario(retador)
  const indexRetador = pokemonesRetador.findIndex(p => p.nombre === pokemonRetador.nombre)
  if (indexRetador !== -1) {
    pokemonesRetador[indexRetador] = pokemonRetador
    retador.pokemones = pokemonesRetador
  }
  
  const pokemonesUser = obtenerPokemonesUsuario(user)
  const indexUser = pokemonesUser.findIndex(p => p.nombre === pokemonRival.nombre)
  if (indexUser !== -1) {
    pokemonesUser[indexUser] = pokemonRival
    user.pokemones = pokemonesUser
  }
  
  // LIMPIAR ESTADOS TEMPORALES
  delete retador.batallaTemporal
  delete user.batallaTemporal
  
  usuarios[retadorId] = retador
  usuarios[userId] = user
  guardarJSON(usuariosPath, usuarios)
  
  return resultado
}

// Handler global para mensajes
export async function before(m, { conn, usedPrefix }) {
  if (!m.text || m.isBaileys) return false
  
  const usuarios = cargarJSON(usuariosPath)
  const userId = m.sender.replace(/[^0-9]/g, '')
  const user = usuarios[userId]
  const text = m.text.toLowerCase().trim()
  
  // Manejar comando "aceptar"
  if (text === `${usedPrefix}aceptar` || text === 'aceptar') {
    const resultado = await handleAceptarBatalla(m, usuarios, userId)
    m.reply(resultado)
    return true
  }
  
  // Manejar selección de Pokémon del rival
  if (user && user.batallaTemporal && user.batallaTemporal.estado === 'seleccion_rival') {
    if (!isNaN(text)) {
      const resultado = await handleSeleccionRival(m, usuarios, userId, text)
      m.reply(resultado)
      return true
    }
  }
  
  // Manejar selección de Pokémon del usuario retador
  if (user && user.batallaTemporal && user.batallaTemporal.estado === 'seleccion_user') {
    if (!isNaN(text)) {
      // El handler principal ya maneja esto
      return false
    }
  }
  
  return false
}

handler.help = ['pelear @usuario']
handler.tags = ['pokemon', 'rpg', 'battle']
handler.command = /^(pelear|batalla|battle|challenge|desafiar)$/i
handler.register = true

export default handler

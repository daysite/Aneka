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

// Función para obtener los Pokémon de un usuario (mejorada)
function obtenerPokemonesUsuario(user) {
  if (!user) return []
  
  // Buscar Pokémon en diferentes formatos posibles
  if (user.pokemones && Array.isArray(user.pokemones)) return user.pokemones
  if (user.pokemons && Array.isArray(user.pokemons)) return user.pokemons
  if (user.poke && Array.isArray(user.poke)) return user.poke
  
  // Formato antiguo: objeto único
  if (user.pokemon) {
    if (Array.isArray(user.pokemon)) return user.pokemon
    if (typeof user.pokemon === 'object') return [user.pokemon]
  }
  
  return []
}

// Función para actualizar Pokémon en usuario
function actualizarPokemonUsuario(user, pokemonActualizado) {
  const pokemones = obtenerPokemonesUsuario(user)
  const index = pokemones.findIndex(p => p.nombre === pokemonActualizado.nombre)
  
  if (index !== -1) {
    pokemones[index] = pokemonActualizado
  }
  
  // Guardar en el formato original
  if (user.pokemones) user.pokemones = pokemones
  else if (user.pokemons) user.pokemons = pokemones
  else if (user.poke) user.poke = pokemones
  else user.pokemon = pokemones.length === 1 ? pokemones[0] : pokemones
  
  return user
}

// Función para calcular el poder de un Pokémon
function calcularPoder(pokemon) {
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
  
  // Simular turnos de batalla
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
    
    // Verificar subida de nivel
    const expNecesaria = (pokeAtacante.nivel || 1) * 100
    if (pokeAtacante.experiencia >= expNecesaria) {
      const nivelAnterior = pokeAtacante.nivel || 1
      pokeAtacante.nivel = nivelAnterior + 1
      pokeAtacante.vidaMax = (pokeAtacante.vidaMax || 20) + 10
      pokeAtacante.vida = pokeAtacante.vidaMax
      resultado += `🆙 ¡${pokeAtacante.nombre} subió al nivel ${pokeAtacante.nivel}!`
    }
    
  } else {
    const expGanada = 25 + Math.floor(diferencia / 3)
    pokeDefensor.experiencia = (pokeDefensor.experiencia || 0) + expGanada
    
    resultado += `😵 ¡${rivalName} gana la batalla!\n`
    resultado += `✨ ${pokeDefensor.nombre} ganó ${expGanada} EXP\n`
    
    // Verificar subida de nivel
    const expNecesaria = (pokeDefensor.nivel || 1) * 100
    if (pokeDefensor.experiencia >= expNecesaria) {
      const nivelAnterior = pokeDefensor.nivel || 1
      pokeDefensor.nivel = nivelAnterior + 1
      pokeDefensor.vidaMax = (pokeDefensor.vidaMax || 20) + 10
      pokeDefensor.vida = pokeDefensor.vidaMax
      resultado += `🆙 ¡${pokeDefensor.nombre} subió al nivel ${pokeDefensor.nivel}!`
    }
  }
  
  return resultado
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    const usuarios = cargarJSON(usuariosPath)
    const userId = m.sender.replace(/[^0-9]/g, '')
    const user = usuarios[userId]

    if (!user) {
      return m.reply('❌ No estás registrado. Usa *.registrar* primero.')
    }
    
    const pokemonesUser = obtenerPokemonesUsuario(user)
    
    if (pokemonesUser.length === 0) {
      return m.reply('😢 No tienes Pokémon. Atrapa alguno primero.')
    }

    // Buscar usuario mencionado
    let mentioned = m.mentionedJid?.[0]
    if (!mentioned && args[0] && args[0].length > 5) {
      mentioned = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    }
    
    if (!mentioned) {
      let ayuda = `⚔️ *SISTEMA DE BATALLAS* ⚔️\n\n`
      ayuda += `Para desafiar a otro jugador:\n`
      ayuda += `*${usedPrefix}pelear @usuario*\n\n`
      ayuda += `*${usedPrefix}pelear lista* - Ver tus Pokémon\n`
      ayuda += `*${usedPrefix}pelear cancelar* - Cancelar desafío`
      return m.reply(ayuda)
    }

    // COMANDOS ADICIONALES
    if (mentioned === 'lista' || mentioned === 'list') {
      let lista = `📋 *TUS POKÉMON* (${pokemonesUser.length})\n\n`
      pokemonesUser.forEach((poke, index) => {
        lista += `*${index + 1}.* ${poke.nombre} - Nvl ${poke.nivel || 1}\n`
        lista += `   ❤️ ${poke.vida || 0}/${poke.vidaMax || 20} | ⚡ ${Math.round(calcularPoder(poke))}\n\n`
      })
      return m.reply(lista)
    }

    if (mentioned === 'cancelar') {
      if (user.batallaTemporal) {
        delete user.batallaTemporal
        usuarios[userId] = user
        guardarJSON(usuariosPath, usuarios)
        return m.reply('✅ Desafío cancelado.')
      }
      return m.reply('❌ No tienes desafíos pendientes.')
    }

    const rivalId = mentioned.replace(/[^0-9]/g, '')
    const rival = usuarios[rivalId]

    if (!rival) {
      return m.reply('❌ Usuario no encontrado en la base de datos.')
    }
    
    if (userId === rivalId) {
      return m.reply('❌ No puedes pelear contra ti mismo.')
    }

    const pokemonesRival = obtenerPokemonesUsuario(rival)
    if (pokemonesRival.length === 0) {
      return m.reply('⚠️ El oponente no tiene Pokémon.')
    }

    // VERIFICAR SI YA HAY UN DESAFÍO EN CURSO
    if (user.batallaTemporal) {
      if (user.batallaTemporal.estado === 'seleccion_user') {
        return m.reply('❌ Ya tienes un desafío en proceso. Termina primero.')
      }
    }

    // MOSTRAR SELECCIÓN DE POKÉMON
    let listaPokemones = `⚔️ *DESAFÍO A ${rival.nombre || 'Entrenador'}* ⚔️\n\n`
    listaPokemones += `🎯 *SELECCIONA TU POKÉMON:*\n\n`
    
    pokemonesUser.forEach((poke, index) => {
      listaPokemones += `*${index + 1}.* ${poke.nombre} - Nvl ${poke.nivel || 1}\n`
      listaPokemones += `   ❤️ ${poke.vida || 0}/${poke.vidaMax || 20} | ⚡ ${Math.round(calcularPoder(poke))}\n\n`
    })
    
    listaPokemones += `Responde con el *número* del Pokémon que quieres usar.\n`
    listaPokemones += `Ejemplo: *1* para ${pokemonesUser[0].nombre}`

    // GUARDAR ESTADO TEMPORAL
    user.batallaTemporal = {
      rivalId: rivalId,
      timestamp: Date.now(),
      estado: 'seleccion_user',
      paso: 'inicio'
    }
    
    usuarios[userId] = user
    guardarJSON(usuariosPath, usuarios)

    return m.reply(listaPokemones)

  } catch (error) {
    console.error('Error en handler pelear:', error)
    return m.reply('❌ Error al procesar el comando. Intenta nuevamente.')
  }
}

// HANDLER PARA MENSAJES DE TEXTO (selección de Pokémon)
export async function before(m, { conn, usedPrefix }) {
  if (!m.text || m.isBaileys || !m.text.trim()) return false
  
  const usuarios = cargarJSON(usuariosPath)
  const userId = m.sender.replace(/[^0-9]/g, '')
  const user = usuarios[userId]
  const text = m.text.trim()

  if (!user || !user.batallaTemporal) return false

  // MANEJAR SELECCIÓN DE POKÉMON DEL USUARIO
  if (user.batallaTemporal.estado === 'seleccion_user') {
    const seleccion = parseInt(text) - 1
    const pokemonesUser = obtenerPokemonesUsuario(user)
    
    if (isNaN(seleccion) || seleccion < 0 || seleccion >= pokemonesUser.length) {
      m.reply(`❌ Número inválido. Elige entre 1 y ${pokemonesUser.length}.`)
      return true
    }

    const pokemonElegido = JSON.parse(JSON.stringify(pokemonesUser[seleccion])) // Copia profunda
    
    // ACTUALIZAR ESTADO
    user.batallaTemporal.pokemonUser = pokemonElegido
    user.batallaTemporal.estado = 'esperando_rival'
    user.batallaTemporal.paso = 'elegido'
    
    usuarios[userId] = user
    guardarJSON(usuariosPath, usuarios)

    const rivalId = user.batallaTemporal.rivalId
    const rival = usuarios[rivalId]
    
    if (!rival) {
      delete user.batallaTemporal
      usuarios[userId] = user
      guardarJSON(usuariosPath, usuarios)
      m.reply('❌ El rival ya no está disponible.')
      return true
    }

    // ENVIAR NOTIFICACIÓN AL RIVAL
    let mensajeRival = `⚔️ *¡NUEVO DESAFÍO!* ⚔️\n\n`
    mensajeRival += `👤 ${user.nombre || 'Entrenador'} te desafía a una batalla Pokémon!\n`
    mensajeRival += `🐾 Usará: ${pokemonElegido.nombre} (Nivel ${pokemonElegido.nivel || 1})\n\n`
    mensajeRival += `💥 *Para aceptar responde:*\n`
    mensajeRival += `*${usedPrefix}aceptar* - ¡Aceptar el desafío!\n`
    mensajeRival += `*${usedPrefix}rechazar* - Rechazar el desafío\n\n`
    mensajeRival += `Tienes 2 minutos para responder.`

    try {
      await conn.sendMessage(rivalId + '@s.whatsapp.net', { text: mensajeRival })
      m.reply(`✅ Desafío enviado a ${rival.nombre || 'el entrenador'}! Esperando respuesta...`)
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      m.reply('❌ Error al enviar el desafío.')
    }
    
    return true
  }

  return false
}

// HANDLER PARA COMANDOS ACEPTAR/RECHAZAR
async function handleAceptarRechazar(m, usuarios, userId, accion) {
  const user = usuarios[userId]
  
  if (!user.batallaTemporal || user.batallaTemporal.estado !== 'esperando_rival') {
    return '❌ No tienes desafíos pendientes.'
  }

  const retadorId = user.batallaTemporal.rivalId
  const retador = usuarios[retadorId]
  
  if (!retador || !retador.batallaTemporal) {
    return '❌ El desafío ya expiró o no es válido.'
  }

  if (accion === 'rechazar') {
    // Notificar al retador
    if (retador) {
      await m.reply(`❌ ${user.nombre || 'El entrenador'} rechazó tu desafío.`)
    }
    
    // Limpiar estados
    delete user.batallaTemporal
    if (retador) delete retador.batallaTemporal
    
    usuarios[userId] = user
    if (retador) usuarios[retadorId] = retador
    guardarJSON(usuariosPath, usuarios)
    
    return '✅ Desafío rechazado.'
  }

  // ACEPTAR EL DESAFÍO
  const pokemonesUser = obtenerPokemonesUsuario(user)
  
  if (pokemonesUser.length === 0) {
    return '❌ No tienes Pokémon para combatir.'
  }

  let lista = `⚔️ *SELECCIONA TU POKÉMON* ⚔️\n\n`
  lista += `👤 Retador: ${retador.nombre || 'Entrenador'}\n`
  lista += `🐾 Usará: ${retador.batallaTemporal.pokemonUser.nombre}\n\n`
  lista += `🎯 *TUS POKÉMON:*\n\n`
  
  pokemonesUser.forEach((poke, index) => {
    lista += `*${index + 1}.* ${poke.nombre} - Nvl ${poke.nivel || 1}\n`
    lista += `   ❤️ ${poke.vida || 0}/${poke.vidaMax || 20} | ⚡ ${Math.round(calcularPoder(poke))}\n\n`
  })
  
  lista += `Responde con el *número* del Pokémon que quieres usar.`

  // Actualizar estado
  user.batallaTemporal.estado = 'seleccion_rival'
  usuarios[userId] = user
  guardarJSON(usuariosPath, usuarios)

  return lista
}

// HANDLER GLOBAL PARA COMANDOS
export async function all(m, { conn, usedPrefix }) {
  if (!m.text || m.isBaileys) return
  
  const usuarios = cargarJSON(usuariosPath)
  const userId = m.sender.replace(/[^0-9]/g, '')
  const user = usuarios[userId]
  const text = m.text.toLowerCase().trim()

  // Manejar comandos aceptar/rechazar
  if (text === `${usedPrefix}aceptar` || text === 'aceptar') {
    const resultado = await handleAceptarRechazar(m, usuarios, userId, 'aceptar')
    m.reply(resultado)
    return true
  }

  if (text === `${usedPrefix}rechazar` || text === 'rechazar') {
    const resultado = await handleAceptarRechazar(m, usuarios, userId, 'rechazar')
    m.reply(resultado)
    return true
  }

  return false
}

handler.help = ['pelear @usuario', 'pelear lista', 'pelear cancelar']
handler.tags = ['pokemon', 'rpg', 'battle']
handler.command = /^(pelear|batalla|battle|desafiar|challenge)$/i
handler.register = true

export default handler

import fs from 'fs'

const usuariosPath = './src/database/usuarios.json'
const tiendaPath = './src/database/tienda.json'

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

// Datos predeterminados de la tienda
const tiendaDefault = {
  items: [
    { id: 1, nombre: "🍎 Baya Aranja", precio: 50, efecto: "vida", valor: 10, descripcion: "Aumenta 10 puntos de vida máxima" },
    { id: 2, nombre: "🍖 Caramelo Raro", precio: 100, efecto: "nivel", valor: 1, descripcion: "Sube 1 nivel inmediatamente" },
    { id: 3, nombre: "🧁 Pastel Pokémon", precio: 80, efecto: "experiencia", valor: 50, descripcion: "Otorga 50 puntos de experiencia" },
    { id: 4, nombre: "🍯 Miel Dorada", precio: 150, efecto: "vida", valor: 25, descripcion: "Aumenta 25 puntos de vida máxima" },
    { id: 5, nombre: "⭐ Caramelo XL", precio: 200, efecto: "nivel", valor: 2, descripcion: "Sube 2 niveles inmediatamente" },
    { id: 6, nombre: "🍬 Caramelo Energía", precio: 120, efecto: "vida", valor: 15, descripcion: "Aumenta 15 puntos de vida máxima" },
    { id: 7, nombre: "🎂 Tarta Experiencia", precio: 180, efecto: "experiencia", valor: 100, descripcion: "Otorga 100 puntos de experiencia" }
  ]
}

// Función para obtener los Pokémon de un usuario (compatible con ambos sistemas)
function obtenerPokemonesUsuario(user) {
  // Si tiene el sistema antiguo (user.pokemon como objeto individual)
  if (user.pokemon && typeof user.pokemon === 'object' && !Array.isArray(user.pokemon)) {
    return [user.pokemon] // Convertir a array con un elemento
  }
  
  // Si tiene el sistema nuevo (user.pokemones como array)
  if (user.pokemones && Array.isArray(user.pokemones)) {
    return user.pokemones
  }
  
  // Si no tiene Pokémon
  return []
}

// Función para guardar los Pokémon en el formato correcto
function guardarPokemonesUsuario(user, pokemones) {
  // Si originalmente tenía el sistema antiguo, mantener compatibilidad
  if (user.pokemon && !Array.isArray(user.pokemon)) {
    user.pokemon = pokemones[0] || null // Tomar el primero si existe
  }
  
  // Siempre guardar también en el nuevo formato
  user.pokemones = pokemones
  
  return user
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const usuarios = cargarJSON(usuariosPath)
  let tienda = cargarJSON(tiendaPath, tiendaDefault)
  
  // Asegurar que la tienda tenga la estructura correcta
  if (!tienda.items || !Array.isArray(tienda.items)) {
    tienda = { ...tiendaDefault, ...tienda }
    tienda.items = tienda.items || tiendaDefault.items
  }
  
  const userId = m.sender.replace(/[^0-9]/g, '')
  const user = usuarios[userId]

  // Verificar si el usuario existe
  if (!user) return m.reply('❌ No estás registrado en el sistema. Usa *.registrar* primero.')
  
  // Obtener Pokémon usando la función compatible
  const pokemones = obtenerPokemonesUsuario(user)
  
  // Verificar si el usuario tiene Pokémon
  if (pokemones.length === 0) {
    return m.reply('😢 No tienes Pokémon en tu equipo. Atrapa alguno primero.')
  }
  
  // Verificar si el usuario tiene dinero (añadir propiedad si no existe)
  if (user.dinero === undefined) user.dinero = 1000

  const action = args[0] ? args[0].toLowerCase() : ''

  // Mostrar tienda
  if (!action || action === 'tienda' || action === 'ver') {
    let listaTienda = `🛒 *TIENDA POKÉMON* 🛒\n\n`
    listaTienda += `💵 Tu dinero: $${user.dinero}\n\n`
    
    // Verificación adicional para evitar el error
    if (!tienda.items || !Array.isArray(tienda.items)) {
      tienda.items = tiendaDefault.items
      guardarJSON(tiendaPath, tienda)
    }
    
    // Usar forEach de manera segura
    tienda.items.forEach(item => {
      listaTienda += `*${item.id}.* ${item.nombre} - $${item.precio}\n`
      listaTienda += `   📝 ${item.descripcion}\n\n`
    })
    
    listaTienda += `\nPara comprar usa: *${usedPrefix}comprar [número]*\n`
    listaTienda += `Ejemplo: *${usedPrefix}comprar 1*`
    
    return m.reply(listaTienda)
  }

  // Comprar items
  if (action === 'comprar' && args[1]) {
    const itemId = parseInt(args[1])
    
    // Verificar que los items existan
    if (!tienda.items || !Array.isArray(tienda.items)) {
      tienda.items = tiendaDefault.items
    }
    
    const item = tienda.items.find(i => i.id === itemId)
    
    if (!item) return m.reply('❌ ID de artículo no válido. Usa *.comprar tienda* para ver los artículos disponibles.')
    
    // Verificar si tiene suficiente dinero
    if (user.dinero < item.precio) {
      return m.reply(`❌ No tienes suficiente dinero. Necesitas $${item.precio} pero solo tienes $${user.dinero}.`)
    }
    
    // Si solo tiene un Pokémon, aplicarlo directamente
    if (pokemones.length === 1) {
      const pokemon = pokemones[0]
      let mensajeEfecto = `✅ ¡Compra exitosa!\n\n`
      mensajeEfecto += `Has comprado: ${item.nombre}\n`
      mensajeEfecto += `Gastaste: $${item.precio}\n\n`
      mensajeEfecto += aplicarEfectoItem(pokemon, item)
      
      // Actualizar el Pokémon en el array
      pokemones[0] = pokemon
      
      // Guardar en el formato correcto
      const userActualizado = guardarPokemonesUsuario(user, pokemones)
      
      // Restar dinero y guardar cambios
      userActualizado.dinero -= item.precio
      usuarios[userId] = userActualizado
      guardarJSON(usuariosPath, usuarios)
      
      return m.reply(mensajeEfecto)
    }
    
    // Si tiene múltiples Pokémon, mostrar lista para elegir
    let listaPokemones = `🛒 *COMPRAR: ${item.nombre}* 🛒\n\n`
    listaPokemones += `💵 Precio: $${item.precio}\n`
    listaPokemones += `📝 Efecto: ${item.descripcion}\n\n`
    listaPokemones += `📋 *TUS POKÉMON*:\n\n`
    
    pokemones.forEach((poke, index) => {
      listaPokemones += `*${index + 1}.* ${poke.nombre} - Nivel ${poke.nivel}\n`
      listaPokemones += `   ❤️ Vida: ${poke.vida}/${poke.vidaMax} | ⭐ Exp: ${poke.experiencia || 0}\n\n`
    })
    
    listaPokemones += `\nResponde con el *número* del Pokémon que quieres alimentar.\n`
    listaPokemones += `Ejemplo: *1* para elegir a ${pokemones[0].nombre}`
    
    // Guardar estado temporal de la compra
    if (!user.compraTemporal) user.compraTemporal = {}
    user.compraTemporal = { itemId: item.id, timestamp: Date.now() }
    usuarios[userId] = user
    guardarJSON(usuariosPath, usuarios)
    
    return m.reply(listaPokemones)
  }

  // Manejar selección de Pokémon después de comprar
  if (!isNaN(action) && user.compraTemporal) {
    const seleccion = parseInt(action) - 1
    
    if (seleccion < 0 || seleccion >= pokemones.length) {
      return m.reply(`❌ Número inválido. Debe ser entre 1 y ${pokemones.length}.`)
    }
    
    // Verificar que la compra no sea muy antigua (5 minutos)
    if (Date.now() - user.compraTemporal.timestamp > 300000) {
      delete user.compraTemporal
      usuarios[userId] = user
      guardarJSON(usuariosPath, usuarios)
      return m.reply('❌ La selección expiró. Realiza la compra nuevamente.')
    }
    
    const itemId = user.compraTemporal.timestamp
    const item = tienda.items.find(i => i.id === user.compraTemporal.itemId)
    
    if (!item) {
      delete user.compraTemporal
      usuarios[userId] = user
      guardarJSON(usuariosPath, usuarios)
      return m.reply('❌ Error: El artículo ya no está disponible.')
    }
    
    // Verificar si todavía tiene suficiente dinero
    if (user.dinero < item.precio) {
      delete user.compraTemporal
      usuarios[userId] = user
      guardarJSON(usuariosPath, usuarios)
      return m.reply(`❌ Ya no tienes suficiente dinero. Necesitas $${item.precio} pero solo tienes $${user.dinero}.`)
    }
    
    const pokemon = pokemones[seleccion]
    let mensajeEfecto = `✅ ¡Compra exitosa!\n\n`
    mensajeEfecto += `Has comprado: ${item.nombre}\n`
    mensajeEfecto += `Gastaste: $${item.precio}\n`
    mensajeEfecto += `Pokémon alimentado: ${pokemon.nombre}\n\n`
    mensajeEfecto += aplicarEfectoItem(pokemon, item)
    
    // Actualizar el Pokémon en el array
    pokemones[seleccion] = pokemon
    
    // Guardar en el formato correcto
    const userActualizado = guardarPokemonesUsuario(user, pokemones)
    
    // Restar dinero y limpiar compra temporal
    userActualizado.dinero -= item.precio
    delete userActualizado.compraTemporal
    
    // Inicializar inventario si no existe y agregar item
    if (!userActualizado.inventario) userActualizado.inventario = []
    userActualizado.inventario.push(item.id)
    
    usuarios[userId] = userActualizado
    guardarJSON(usuariosPath, usuarios)
    
    return m.reply(mensajeEfecto)
  }

  // Mostrar inventario del usuario
  if (action === 'inventario' || action === 'inv') {
    // Inicializar inventario si no existe
    if (!user.inventario) user.inventario = []
    
    let mensajeInventario = `🎒 *INVENTARIO DE ${user.nombre || 'Entrenador'}* 🎒\n\n`
    mensajeInventario += `💵 Dinero: $${user.dinero}\n\n`
    
    if (user.inventario.length === 0) {
      mensajeInventario += `No tienes items en tu inventario.\nVisita la tienda con *${usedPrefix}comprar tienda*`
    } else {
      // Contar items por tipo
      const itemsCount = {}
      user.inventario.forEach(itemId => {
        const item = tienda.items.find(i => i.id === itemId)
        if (item) {
          if (!itemsCount[item.nombre]) {
            itemsCount[item.nombre] = { cantidad: 1, item: item }
          } else {
            itemsCount[item.nombre].cantidad += 1
          }
        }
      })
      
      // Mostrar items
      for (const [nombre, info] of Object.entries(itemsCount)) {
        mensajeInventario += `• ${info.cantidad}x ${nombre}\n`
      }
      
      mensajeInventario += `\nUsa *${usedPrefix}usar [número]* para usar un item de tu inventario.`
    }
    
    return m.reply(mensajeInventario)
  }

  // Usar items del inventario
  if (action === 'usar' && args[1]) {
    const itemIndex = parseInt(args[1]) - 1
    
    if (!user.inventario || user.inventario.length === 0) {
      return m.reply('❌ No tienes items en tu inventario.')
    }
    
    if (itemIndex < 0 || itemIndex >= user.inventario.length) {
      return m.reply(`❌ Número inválido. Debe ser entre 1 y ${user.inventario.length}.`)
    }
    
    const itemId = user.inventario[itemIndex]
    const item = tienda.items.find(i => i.id === itemId)
    
    if (!item) {
      // Remover item inválido del inventario
      user.inventario.splice(itemIndex, 1)
      usuarios[userId] = user
      guardarJSON(usuariosPath, usuarios)
      return m.reply('❌ Este item ya no está disponible y fue removido de tu inventario.')
    }
    
    // Obtener Pokémon actualizado
    const pokemonesActual = obtenerPokemonesUsuario(user)
    
    // Si solo tiene un Pokémon, aplicarlo directamente
    if (pokemonesActual.length === 1) {
      const pokemon = pokemonesActual[0]
      let mensajeEfecto = `✅ ¡Item usado!\n\n`
      mensajeEfecto += `Has usado: ${item.nombre}\n\n`
      mensajeEfecto += aplicarEfectoItem(pokemon, item)
      
      // Actualizar el Pokémon en el array
      pokemonesActual[0] = pokemon
      
      // Guardar en el formato correcto
      const userActualizado = guardarPokemonesUsuario(user, pokemonesActual)
      
      // Remover item del inventario
      userActualizado.inventario.splice(itemIndex, 1)
      usuarios[userId] = userActualizado
      guardarJSON(usuariosPath, usuarios)
      
      return m.reply(mensajeEfecto)
    }
    
    // Si tiene múltiples Pokémon, mostrar lista para elegir
    let listaPokemones = `🎯 *USAR: ${item.nombre}* 🎯\n\n`
    listaPokemones += `📝 Efecto: ${item.descripcion}\n\n`
    listaPokemones += `📋 *TUS POKÉMON*:\n\n`
    
    pokemonesActual.forEach((poke, index) => {
      listaPokemones += `*${index + 1}.* ${poke.nombre} - Nivel ${poke.nivel}\n`
      listaPokemones += `   ❤️ Vida: ${poke.vida}/${poke.vidaMax} | ⭐ Exp: ${poke.experiencia || 0}\n\n`
    })
    
    listaPokemones += `\nResponde con el *número* del Pokémon que quieres alimentar.\n`
    listaPokemones += `Ejemplo: *1* para elegir a ${pokemonesActual[0].nombre}`
    
    // Guardar estado temporal del uso de item
    if (!user.usoItemTemporal) user.usoItemTemporal = {}
    user.usoItemTemporal = { itemIndex: itemIndex, timestamp: Date.now() }
    usuarios[userId] = user
    guardarJSON(usuariosPath, usuarios)
    
    return m.reply(listaPokemones)
  }

  // Manejar selección de Pokémon después de usar item del inventario
  if (!isNaN(action) && user.usoItemTemporal) {
    const seleccion = parseInt(action) - 1
    
    // Obtener Pokémon actualizado
    const pokemonesActual = obtenerPokemonesUsuario(user)
    
    if (seleccion < 0 || seleccion >= pokemonesActual.length) {
      return m.reply(`❌ Número inválido. Debe ser entre 1 and ${pokemonesActual.length}.`)
    }
    
    // Verificar que el uso no sea muy antiguo (5 minutos)
    if (Date.now() - user.usoItemTemporal.timestamp > 300000) {
      delete user.usoItemTemporal
      usuarios[userId] = user
      guardarJSON(usuariosPath, usuarios)
      return m.reply('❌ La selección expiró. Intenta usar el item nuevamente.')
    }
    
    const itemIndex = user.usoItemTemporal.itemIndex
    const itemId = user.inventario[itemIndex]
    const item = tienda.items.find(i => i.id === itemId)
    
    if (!item) {
      // Remover item inválido del inventario
      user.inventario.splice(itemIndex, 1)
      delete user.usoItemTemporal
      usuarios[userId] = user
      guardarJSON(usuariosPath, usuarios)
      return m.reply('❌ Este item ya no está disponible y fue removido de tu inventario.')
    }
    
    const pokemon = pokemonesActual[seleccion]
    let mensajeEfecto = `✅ ¡Item usado!\n\n`
    mensajeEfecto += `Has usado: ${item.nombre}\n`
    mensajeEfecto += `Pokémon alimentado: ${pokemon.nombre}\n\n`
    mensajeEfecto += aplicarEfectoItem(pokemon, item)
    
    // Actualizar el Pokémon en el array
    pokemonesActual[seleccion] = pokemon
    
    // Guardar en el formato correcto
    const userActualizado = guardarPokemonesUsuario(user, pokemonesActual)
    
    // Remover item del inventario y limpiar estado temporal
    userActualizado.inventario.splice(itemIndex, 1)
    delete userActualizado.usoItemTemporal
    
    usuarios[userId] = userActualizado
    guardarJSON(usuariosPath, usuarios)
    
    return m.reply(mensajeEfecto)
  }

  // Mostrar ayuda si el comando no se reconoce
  return m.reply(`🛒 *SISTEMA DE COMPRAS POKÉMON* 🛒\n\n• ${usedPrefix}comprar tienda - Ver items disponibles\n• ${usedPrefix}comprar [número] - Comprar un item\n• ${usedPrefix}comprar inventario - Ver tu inventario\n• ${usedPrefix}comprar usar [número] - Usar item del inventario`)
}

// Función auxiliar para aplicar efectos de items
function aplicarEfectoItem(pokemon, item) {
  let mensaje = ''
  
  switch(item.efecto) {
    case 'vida':
      const vidaAnterior = pokemon.vidaMax
      pokemon.vidaMax += item.valor
      pokemon.vida = pokemon.vidaMax
      mensaje = `❤️ ${pokemon.nombre} aumentó su vida de ${vidaAnterior} a ${pokemon.vidaMax} puntos!`
      break
      
    case 'nivel':
      const nivelAnterior = pokemon.nivel
      pokemon.nivel += item.valor
      const nivelesSubidos = item.valor
      pokemon.vidaMax += 5 * nivelesSubidos
      pokemon.vida = pokemon.vidaMax
      mensaje = `🆙 ${pokemon.nombre} subió del nivel ${nivelAnterior} al nivel ${pokemon.nivel}!`
      break
      
    case 'experiencia':
      pokemon.experiencia = (pokemon.experiencia || 0) + item.valor
      
      // Verificar si sube de nivel por experiencia
      const expNecesaria = pokemon.nivel * 100
      if (pokemon.experiencia >= expNecesaria) {
        const nivelesSubidos = Math.floor(pokemon.experiencia / expNecesaria)
        const nivelAnteriorExp = pokemon.nivel
        pokemon.nivel += nivelesSubidos
        pokemon.experiencia = pokemon.experiencia % expNecesaria
        pokemon.vidaMax += 5 * nivelesSubidos
        pokemon.vida = pokemon.vidaMax
        mensaje = `✨ ${pokemon.nombre} ganó ${item.valor} puntos de experiencia y subió del nivel ${nivelAnteriorExp} al ${pokemon.nivel}!`
      } else {
        mensaje = `✨ ${pokemon.nombre} ganó ${item.valor} puntos de experiencia!`
      }
      break
      
    default:
      mensaje = `✨ ${pokemon.nombre} recibió el efecto de ${item.nombre}!`
  }
  
  return mensaje
}

handler.help = ['comprar [tienda|número|inventario|usar]']
handler.tags = ['pokemon', 'economy']
handler.command = ['comprar', 'buy', 'tienda', 'shop', 'usar']
handler.register = true

export default handler

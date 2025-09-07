import fs from 'fs'
import path from 'path'

const usuariosPath = './src/database/usuarios.json'
const tiendaPath = './src/database/tienda.json'

// Crear directorios si no existen
function asegurarDirectorio(rutaArchivo) {
  const directorio = path.dirname(rutaArchivo)
  if (!fs.existsSync(directorio)) {
    fs.mkdirSync(directorio, { recursive: true })
  }
}

// Función para leer usuarios
function leerUsuarios() {
  try {
    asegurarDirectorio(usuariosPath)
    if (!fs.existsSync(usuariosPath)) {
      fs.writeFileSync(usuariosPath, JSON.stringify({}, null, 2))
      return {}
    }
    
    const data = fs.readFileSync(usuariosPath, 'utf8')
    return JSON.parse(data) || {}
  } catch (error) {
    console.error('Error al leer usuarios:', error)
    return {}
  }
}

// Función para guardar usuarios
function guardarUsuarios(usuarios) {
  try {
    asegurarDirectorio(usuariosPath)
    fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2))
    return true
  } catch (error) {
    console.error('Error al guardar usuarios:', error)
    return false
  }
}

// TIENDA POR DEFECTO
const tiendaDefault = {
  items: [
    { id: 1, nombre: "Baya Aranja", precio: 50, efecto: "vida", valor: 10, descripcion: "+10 vida máxima", emoji: "🍎" },
    { id: 2, nombre: "Caramelo Raro", precio: 100, efecto: "nivel", valor: 1, descripcion: "+1 nivel", emoji: "🍖" },
    { id: 3, nombre: "Pastel Pokémon", precio: 80, efecto: "experiencia", valor: 50, descripcion: "+50 experiencia", emoji: "🧁" },
    { id: 4, nombre: "Miel Dorada", precio: 150, efecto: "vida", valor: 25, descripcion: "+25 vida máxima", emoji: "🍯" },
    { id: 5, nombre: "Caramelo XL", precio: 200, efecto: "nivel", valor: 2, descripcion: "+2 niveles", emoji: "⭐" },
    { id: 6, nombre: "Caramelo Energía", precio: 120, efecto: "vida", valor: 15, descripcion: "+15 vida máxima", emoji: "🍬" },
    { id: 7, nombre: "Tarta Experiencia", precio: 180, efecto: "experiencia", valor: 100, descripcion: "+100 experiencia", emoji: "🎂" }
  ]
}

// Función para obtener items de la tienda
function obtenerItemsTienda() {
  try {
    asegurarDirectorio(tiendaPath)
    
    if (!fs.existsSync(tiendaPath)) {
      fs.writeFileSync(tiendaPath, JSON.stringify(tiendaDefault, null, 2))
      return tiendaDefault.items
    }
    
    const data = fs.readFileSync(tiendaPath, 'utf8')
    const tienda = JSON.parse(data)
    
    if (!tienda || !tienda.items || !Array.isArray(tienda.items) || tienda.items.length === 0) {
      return tiendaDefault.items
    }
    
    return tienda.items
  } catch (error) {
    console.error('Error al leer tienda:', error)
    return tiendaDefault.items
  }
}

// Función para obtener Pokémon de usuario
function obtenerPokemonesUsuario(user) {
  if (!user) return []
  return user.pokemons || user.pokemones || (user.pokemon ? [user.pokemon] : [])
}

// Función para aplicar efectos de items
function aplicarEfectoItem(pokemon, item) {
  let mensaje = ''
  
  if (!pokemon.vidaMax) pokemon.vidaMax = 100
  if (!pokemon.vida) pokemon.vida = pokemon.vidaMax
  if (!pokemon.nivel) pokemon.nivel = 1
  if (!pokemon.experiencia) pokemon.experiencia = 0
  
  switch(item.efecto) {
    case 'vida':
      const vidaAnterior = pokemon.vidaMax
      pokemon.vidaMax += item.valor
      pokemon.vida = pokemon.vidaMax
      mensaje = `❤️ Vida aumentada: ${vidaAnterior} → ${pokemon.vidaMax}`
      break
      
    case 'nivel':
      const nivelAnterior = pokemon.nivel
      pokemon.nivel += item.valor
      mensaje = `⭐ Subió de nivel: ${nivelAnterior} → ${pokemon.nivel}`
      break
      
    case 'experiencia':
      const expAnterior = pokemon.experiencia
      pokemon.experiencia += item.valor
      mensaje = `✨ Experiencia aumentada: ${expAnterior} → ${pokemon.experiencia}`
      break
      
    default:
      mensaje = '📦 Item aplicado'
  }
  
  return mensaje
}

// Buscar item por nombre (case insensitive)
function buscarItemPorNombre(nombre, items) {
  const nombreBusqueda = nombre.toLowerCase().trim()
  return items.find(item => 
    item.nombre.toLowerCase().includes(nombreBusqueda) ||
    item.emoji === nombre
  )
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    const usuarios = leerUsuarios()
    const itemsTienda = obtenerItemsTienda()
    const userId = m.sender
    
    if (!usuarios[userId]) {
      return m.reply('❌ No estás registrado. Usa *.registrar* primero.')
    }
    
    const user = usuarios[userId]
    if (user.dinero === undefined || user.dinero === null) user.dinero = 1000
    
    const pokemones = obtenerPokemonesUsuario(user)
    
    // MOSTRAR TIENDA SI NO HAY ARGUMENTOS
    if (args.length === 0) {
      let listaTienda = `🛒 *TIENDA POKÉMON* 🛒\n\n`
      listaTienda += `💵 Tu dinero: $${user.dinero}\n\n`
      
      itemsTienda.forEach(item => {
        listaTienda += `${item.emoji} *${item.nombre}* - $${item.precio}\n`
        listaTienda += `   📝 ${item.descripcion}\n\n`
      })
      
      listaTienda += `💡 Usa: *${usedPrefix}comprar <nombre>* para comprar\n`
      listaTienda += `Ejemplos:\n• *${usedPrefix}comprar caramelo*\n• *${usedPrefix}comprar 🍖*\n• *${usedPrefix}comprar baya*`
      
      return m.reply(listaTienda)
    }
    
    // VERIFICAR POKÉMON
    if (pokemones.length === 0) {
      return m.reply('😢 No tienes Pokémon. Atrapa uno primero.')
    }
    
    // BUSCAR ITEM POR NOMBRE (no por número)
    const nombreItem = args.join(' ').toLowerCase()
    const item = buscarItemPorNombre(nombreItem, itemsTienda)
    
    if (!item) {
      return m.reply(`❌ Item no encontrado. Usa *${usedPrefix}comprar* para ver los items disponibles.`)
    }
    
    // VERIFICAR DINERO
    if (user.dinero < item.precio) {
      return m.reply(`❌ No tienes suficiente dinero.\nNecesitas: $${item.precio}\nTienes: $${user.dinero}`)
    }
    
    // SI SOLO TIENE UN POKÉMON - APLICAR DIRECTAMENTE
    if (pokemones.length === 1) {
      const pokemon = pokemones[0]
      let mensaje = `✅ ¡Compra exitosa!\n`
      mensaje += `📦 ${item.emoji} ${item.nombre} - $${item.precio}\n`
      mensaje += `🐾 Para: ${pokemon.name}\n\n`
      mensaje += aplicarEfectoItem(pokemon, item)
      
      user.dinero -= item.precio
      usuarios[userId] = user
      guardarUsuarios(usuarios)
      
      return m.reply(mensaje)
    }
    
    // SI TIENE MÚLTIPLES POKÉMON - MOSTRAR OPCIONES PERO CON COMANDO ESPECÍFICO
    let listaPokemones = `🎯 *¿Qué Pokémon quieres alimentar?* 🎯\n\n`
    listaPokemones += `📦 Item: ${item.emoji} ${item.nombre} - $${item.precio}\n\n`
    listaPokemones += `*TUS POKÉMON:*\n`
    
    pokemones.forEach((poke, index) => {
      listaPokemones += `${index + 1}. ${poke.name} - Nvl ${poke.nivel || 1} | ❤️ ${poke.vida || 100}/${poke.vidaMax || 100}\n`
    })
    
    listaPokemones += `\n💡 Usa: *${usedPrefix}alimentar <número> con ${item.nombre.toLowerCase()}*\n`
    listaPokemones += `Ejemplo: *${usedPrefix}alimentar 1 con ${item.nombre.toLowerCase()}*`
    
    // Guardar contexto de compra temporal
    user.ultimaCompra = {
      itemId: item.id,
      timestamp: Date.now()
    }
    usuarios[userId] = user
    guardarUsuarios(usuarios)
    
    await m.reply(listaPokemones)
    
  } catch (error) {
    console.error('Error en comando comprar:', error)
    m.reply('❌ Error en la tienda. Intenta nuevamente.')
  }
}

// Handler para el comando alimentar
let handlerAlimentar = async (m, { conn, args, usedPrefix }) => {
  try {
    const usuarios = leerUsuarios()
    const itemsTienda = obtenerItemsTienda()
    const userId = m.sender
    
    if (!usuarios[userId] || !usuarios[userId].ultimaCompra) {
      return m.reply('❌ No tienes una compra pendiente. Usa *.comprar* primero.')
    }
    
    const user = usuarios[userId]
    const pokemones = obtenerPokemonesUsuario(user)
    const compra = user.ultimaCompra
    
    // Verificar tiempo (5 minutos)
    if (Date.now() - compra.timestamp > 300000) {
      delete user.ultimaCompra
      guardarUsuarios(usuarios)
      return m.reply('❌ Tiempo agotado. Realiza la compra nuevamente.')
    }
    
    const item = itemsTienda.find(i => i.id === compra.itemId)
    if (!item) {
      delete user.ultimaCompra
      guardarUsuarios(usuarios)
      return m.reply('❌ Error: El artículo ya no está disponible.')
    }
    
    // Buscar el número del Pokémon en los argumentos
    let pokemonIndex = -1
    for (let i = 0; i < args.length; i++) {
      if (!isNaN(args[i]) && parseInt(args[i]) > 0) {
        pokemonIndex = parseInt(args[i]) - 1
        break
      }
    }
    
    if (pokemonIndex === -1 || pokemonIndex >= pokemones.length) {
      return m.reply(`❌ Número inválido. Elige entre 1 y ${pokemones.length}.`)
    }
    
    // Verificar dinero
    if (user.dinero < item.precio) {
      delete user.ultimaCompra
      guardarUsuarios(usuarios)
      return m.reply(`❌ Ya no tienes suficiente dinero. Necesitas $${item.precio}.`)
    }
    
    // Aplicar efecto
    const pokemon = pokemones[pokemonIndex]
    let mensaje = `✅ ¡Alimentación exitosa!\n`
    mensaje += `📦 ${item.emoji} ${item.nombre} - $${item.precio}\n`
    mensaje += `🐾 Para: ${pokemon.name}\n\n`
    mensaje += aplicarEfectoItem(pokemon, item)
    
    // Actualizar
    user.dinero -= item.precio
    delete user.ultimaCompra
    usuarios[userId] = user
    guardarUsuarios(usuarios)
    
    m.reply(mensaje)
    
  } catch (error) {
    console.error('Error en alimentar:', error)
    m.reply('❌ Error al alimentar. Intenta nuevamente.')
  }
}

handlerAlimentar.help = ['alimentar <número>']
handlerAlimentar.tags = ['pokemon']
handlerAlimentar.command = ['alimentar']
handlerAlimentar.register = true

handler.help = ['comprar <nombre>']
handler.tags = ['pokemon', 'economy']
handler.command = ['comprar', 'buy']
handler.register = true

export { handler as default, handlerAlimentar }

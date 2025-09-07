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
    { id: 1, nombre: "baya", precio: 50, efecto: "vida", valor: 10, descripcion: "+10 vida máxima", emoji: "🍎", alias: ["bayaaranja", "baya"] },
    { id: 2, nombre: "caramelo", precio: 100, efecto: "nivel", valor: 1, descripcion: "+1 nivel", emoji: "🍖", alias: ["carameloraro", "caramelo"] },
    { id: 3, nombre: "pastel", precio: 80, efecto: "experiencia", valor: 50, descripcion: "+50 experiencia", emoji: "🧁", alias: ["pastel", "pastelpokemon"] },
    { id: 4, nombre: "miel", precio: 150, efecto: "vida", valor: 25, descripcion: "+25 vida máxima", emoji: "🍯", alias: ["miel", "mieldorada"] },
    { id: 5, nombre: "carameloxl", precio: 200, efecto: "nivel", valor: 2, descripcion: "+2 niveles", emoji: "⭐", alias: ["carameloxl", "xl"] },
    { id: 6, nombre: "carameloenergia", precio: 120, efecto: "vida", valor: 15, descripcion: "+15 vida máxima", emoji: "🍬", alias: ["carameloenergia", "energia"] },
    { id: 7, nombre: "tarta", precio: 180, efecto: "experiencia", valor: 100, descripcion: "+100 experiencia", emoji: "🎂", alias: ["tarta", "tartaexperiencia"] }
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

// Buscar item por nombre o alias
function buscarItem(nombre, items) {
  const nombreBusqueda = nombre.toLowerCase().trim()
  return items.find(item => 
    item.nombre.toLowerCase() === nombreBusqueda ||
    item.alias.includes(nombreBusqueda) ||
    item.emoji === nombre
  )
}

// Variable global para compras temporales
const comprasPendientes = new Map()

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
    
    // VERIFICAR SI ES COMANDO ALIMENTAR
    if (command === 'alimentar') {
      if (args.length < 2) {
        return m.reply(`❌ Formato incorrecto. Usa: *${usedPrefix}alimentar <número> <item>*\nEjemplo: *${usedPrefix}alimentar 1 caramelo*`)
      }
      
      const numeroPokemon = parseInt(args[0]) - 1
      const nombreItem = args.slice(1).join(' ').toLowerCase()
      
      if (isNaN(numeroPokemon) || numeroPokemon < 0 || numeroPokemon >= pokemones.length) {
        return m.reply(`❌ Número de Pokémon inválido. Tienes ${pokemones.length} Pokémon.`)
      }
      
      const item = buscarItem(nombreItem, itemsTienda)
      if (!item) {
        return m.reply(`❌ Item no encontrado. Usa *${usedPrefix}comprar* para ver items.`)
      }
      
      if (user.dinero < item.precio) {
        return m.reply(`❌ No tienes suficiente dinero. Necesitas $${item.precio}, tienes $${user.dinero}.`)
      }
      
      // APLICAR ITEM
      const pokemon = pokemones[numeroPokemon]
      let mensaje = `✅ ¡Alimentación exitosa!\n`
      mensaje += `📦 ${item.emoji} ${item.nombre} - $${item.precio}\n`
      mensaje += `🐾 Para: ${pokemon.name}\n\n`
      mensaje += aplicarEfectoItem(pokemon, item)
      
      // ACTUALIZAR
      user.dinero -= item.precio
      usuarios[userId] = user
      guardarUsuarios(usuarios)
      
      return m.reply(mensaje)
    }
    
    // COMANDO COMPRAR (mostrar tienda)
    if (args.length === 0) {
      let listaTienda = `🛒 *TIENDA POKÉMON* 🛒\n\n`
      listaTienda += `💵 Tu dinero: $${user.dinero}\n\n`
      
      itemsTienda.forEach(item => {
        listaTienda += `${item.emoji} *${item.nombre}* - $${item.precio}\n`
        listaTienda += `   📝 ${item.descripcion}\n\n`
      })
      
      listaTienda += `💡 *Para comprar:*\n`
      listaTienda += `• ${usedPrefix}comprar <item>\n`
      listaTienda += `• ${usedPrefix}alimentar <número> <item>\n\n`
      listaTienda += `📌 *Ejemplos:*\n`
      listaTienda += `• ${usedPrefix}comprar caramelo\n`
      listaTienda += `• ${usedPrefix}alimentar 1 caramelo\n`
      listaTienda += `• ${usedPrefix}alimentar 3 miel`
      
      return m.reply(listaTienda)
    }
    
    // COMPRAR ITEM DIRECTAMENTE (si solo tiene 1 Pokémon)
    const nombreItem = args.join(' ').toLowerCase()
    const item = buscarItem(nombreItem, itemsTienda)
    
    if (!item) {
      return m.reply(`❌ Item no encontrado. Usa *${usedPrefix}comprar* para ver items.`)
    }
    
    if (user.dinero < item.precio) {
      return m.reply(`❌ No tienes suficiente dinero. Necesitas $${item.precio}, tienes $${user.dinero}.`)
    }
    
    if (pokemones.length === 0) {
      return m.reply('😢 No tienes Pokémon. Atrapa uno primero.')
    }
    
    // SI SOLO TIENE 1 POKÉMON - APLICAR DIRECTAMENTE
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
    
    // SI TIENE MÚLTIPLES POKÉMON - ENSEÑAR CÓMO ALIMENTAR
    let mensaje = `🎯 *Tienes múltiples Pokémon* 🎯\n\n`
    mensaje += `📦 Item: ${item.emoji} ${item.nombre} - $${item.precio}\n\n`
    mensaje += `*TUS POKÉMON:*\n`
    
    pokemones.forEach((poke, index) => {
      mensaje += `${index + 1}. ${poke.name} - Nvl ${poke.nivel || 1} | ❤️ ${poke.vida || 100}/${poke.vidaMax || 100}\n`
    })
    
    mensaje += `\n💡 *Para alimentar usa:*\n`
    mensaje += `*${usedPrefix}alimentar <número> ${item.nombre}*\n\n`
    mensaje += `📌 *Ejemplos:*\n`
    mensaje += `• ${usedPrefix}alimentar 1 ${item.nombre}\n`
    mensaje += `• ${usedPrefix}alimentar 3 ${item.nombre}`
    
    return m.reply(mensaje)
    
  } catch (error) {
    console.error('Error en comando comprar/alimentar:', error)
    m.reply('❌ Error en el sistema. Intenta nuevamente.')
  }
}

// CONFIGURAR MÚLTIPLES COMANDOS EN EL MISMO HANDLER
handler.help = ['comprar [item]', 'alimentar [número] [item]']
handler.tags = ['pokemon', 'economy']
handler.command = /^(comprar|buy|alimentar|feed)$/i
handler.register = true

export default handler

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

// Función para ver inventario
function verInventarioUsuario(user) {
  if (!user.inventario || user.inventario.length === 0) {
    return null
  }
  
  return user.inventario
}

// Función para usar item del inventario
function usarItemInventario(user, indexItem, indexPokemon) {
  if (!user.inventario || indexItem < 0 || indexItem >= user.inventario.length) {
    return { success: false, message: '❌ Item no encontrado en el inventario' }
  }
  
  const pokemones = obtenerPokemonesUsuario(user)
  if (indexPokemon < 0 || indexPokemon >= pokemones.length) {
    return { success: false, message: '❌ Pokémon no encontrado' }
  }
  
  const item = user.inventario[indexItem]
  const pokemon = pokemones[indexPokemon]
  
  // Aplicar efecto
  const mensajeEfecto = aplicarEfectoItem(pokemon, item)
  
  // Reducir cantidad o eliminar item
  if (item.cantidad > 1) {
    item.cantidad -= 1
  } else {
    user.inventario.splice(indexItem, 1)
  }
  
  return { 
    success: true, 
    message: `✅ ¡${item.emoji} ${item.nombre} usado en ${pokemon.name}!\n${mensajeEfecto}` 
  }
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
    
    // COMANDO INVENTARIO
    if (command === 'inventario') {
      const inventario = verInventarioUsuario(user)
      
      if (!inventario) {
        return m.reply('🎒 *Tu inventario está vacío*\n\nUsa *.comprar* para adquirir items o completa misiones para ganar recompensas.')
      }
      
      let mensaje = '🎒 *TU INVENTARIO* 🎒\n\n'
      
      inventario.forEach((item, index) => {
        mensaje += `${index + 1}. ${item.emoji} *${item.nombre}* x${item.cantidad}\n`
        mensaje += `   📝 ${item.descripcion || 'Sin descripción'}\n`
        if (item.efecto) {
          mensaje += `   ⚡ Efecto: ${item.efecto} +${item.valor}\n`
        }
        mensaje += '\n'
      })
      
      mensaje += `💡 *Para usar un item:*\n`
      mensaje += `*${usedPrefix}usar <item_num> <pokemon_num>*\n\n`
      mensaje += `📌 *Ejemplos:*\n`
      mensaje += `• ${usedPrefix}usar 1 1 - Usar el primer item en el primer Pokémon\n`
      mensaje += `• ${usedPrefix}usar 2 3 - Usar el segundo item en el tercer Pokémon\n\n`
      mensaje += `📋 *Tus Pokémon:*\n`
      
      if (pokemones.length > 0) {
        pokemones.forEach((poke, index) => {
          mensaje += `${index + 1}. ${poke.name} - Nvl ${poke.nivel || 1}\n`
        })
      } else {
        mensaje += '❌ No tienes Pokémon todavía'
      }
      
      return m.reply(mensaje)
    }
    
    // COMANDO USAR ITEM
    if (command === 'usar') {
      if (args.length < 2) {
        return m.reply(`❌ Formato incorrecto. Usa: *${usedPrefix}usar <número_item> <número_pokemon>*\nEjemplo: *${usedPrefix}usar 1 1*`)
      }
      
      const indexItem = parseInt(args[0]) - 1
      const indexPokemon = parseInt(args[1]) - 1
      
      if (isNaN(indexItem) || isNaN(indexPokemon)) {
        return m.reply('❌ Debes usar números válidos para el item y el Pokémon.')
      }
      
      const resultado = usarItemInventario(user, indexItem, indexPokemon)
      
      if (resultado.success) {
        // Guardar cambios en la base de datos
        usuarios[userId] = user
        guardarUsuarios(usuarios)
        return m.reply(resultado.message)
      } else {
        return m.reply(resultado.message)
      }
    }
    
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
      
      listaTienda += `💡 *Comandos disponibles:*\n`
      listaTienda += `• ${usedPrefix}comprar <item> - Comprar item\n`
      listaTienda += `• ${usedPrefix}alimentar <num> <item> - Alimentar Pokémon\n`
      listaTienda += `• ${usedPrefix}inventario - Ver tu inventario\n`
      listaTienda += `• ${usedPrefix}usar <item_num> <poke_num> - Usar item del inventario\n\n`
      listaTienda += `📌 *Ejemplos:*\n`
      listaTienda += `• ${usedPrefix}comprar caramelo\n`
      listaTienda += `• ${usedPrefix}alimentar 1 caramelo\n`
      listaTienda += `• ${usedPrefix}usar 1 1`
      
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
    
    // INICIALIZAR INVENTARIO SI NO EXISTE
    if (!user.inventario) {
      user.inventario = []
    }
    
    // AGREGAR ITEM AL INVENTARIO
    const itemExistente = user.inventario.find(i => i.id === item.id)
    if (itemExistente) {
      itemExistente.cantidad += 1
    } else {
      user.inventario.push({
        id: item.id,
        nombre: item.nombre,
        emoji: item.emoji,
        descripcion: item.descripcion,
        efecto: item.efecto,
        valor: item.valor,
        cantidad: 1
      })
    }
    
    user.dinero -= item.precio
    usuarios[userId] = user
    
    if (guardarUsuarios(usuarios)) {
      let mensaje = `✅ ¡Compra exitosa!\n`
      mensaje += `📦 ${item.emoji} ${item.nombre} - $${item.precio}\n`
      mensaje += `🎒 Agregado a tu inventario\n`
      mensaje += `💵 Saldo restante: $${user.dinero}\n\n`
      mensaje += `💡 Usa *${usedPrefix}inventario* para ver tus items\n`
      mensaje += `💡 Usa *${usedPrefix}usar <num_item> <num_pokemon>* para usar items`
      
      return m.reply(mensaje)
    } else {
      return m.reply('❌ Error al guardar la compra. Intenta nuevamente.')
    }
    
  } catch (error) {
    console.error('Error en comando:', error)
    m.reply('❌ Error en el sistema. Intenta nuevamente.')
  }
}

// CONFIGURAR MÚLTIPLES COMANDOS EN EL MISMO HANDLER
handler.help = [
  'comprar [item]', 
  'alimentar [número] [item]', 
  'inventario', 
  'usar [item_num] [poke_num]'
]
handler.tags = ['pokemon', 'economy', 'inventory']
handler.command = /^(comprar|buy|alimentar|feed|inventario|inventory|usar|use)$/i
handler.register = true

export default handler

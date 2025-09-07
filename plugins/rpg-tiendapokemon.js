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
    { id: 1, nombre: "🍎 Baya Aranja", precio: 50, efecto: "vida", valor: 10, descripcion: "+10 vida máxima" },
    { id: 2, nombre: "🍖 Caramelo Raro", precio: 100, efecto: "nivel", valor: 1, descripcion: "+1 nivel" },
    { id: 3, nombre: "🧁 Pastel Pokémon", precio: 80, efecto: "experiencia", valor: 50, descripcion: "+50 experiencia" },
    { id: 4, nombre: "🍯 Miel Dorada", precio: 150, efecto: "vida", valor: 25, descripcion: "+25 vida máxima" },
    { id: 5, nombre: "⭐ Caramelo XL", precio: 200, efecto: "nivel", valor: 2, descripcion: "+2 niveles" },
    { id: 6, nombre: "🍬 Caramelo Energía", precio: 120, efecto: "vida", valor: 15, descripcion: "+15 vida máxima" },
    { id: 7, nombre: "🎂 Tarta Experiencia", precio: 180, efecto: "experiencia", valor: 100, descripcion: "+100 experiencia" }
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

// Variable global para almacenar compras temporales
const comprasTemporales = new Map()

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
    
    // VERIFICAR SI HAY UNA COMPRA PENDIENTE PARA ESTE USUARIO
    if (comprasTemporales.has(userId) && args.length === 0) {
      const compra = comprasTemporales.get(userId)
      const seleccion = m.text ? m.text.trim() : args[0]
      
      if (seleccion) {
        const seleccionIdx = parseInt(seleccion) - 1
        
        // Validar selección
        if (isNaN(seleccionIdx) || seleccionIdx < 0 || seleccionIdx >= pokemones.length) {
          comprasTemporales.delete(userId)
          return m.reply(`❌ Número inválido. Elige entre 1 y ${pokemones.length}.`)
        }
        
        const item = itemsTienda.find(i => i.id === compra.itemId)
        if (!item) {
          comprasTemporales.delete(userId)
          return m.reply('❌ Error: El artículo ya no está disponible.')
        }
        
        if (user.dinero < item.precio) {
          comprasTemporales.delete(userId)
          return m.reply(`❌ Ya no tienes suficiente dinero. Necesitas $${item.precio}.`)
        }
        
        // Aplicar el efecto al Pokémon seleccionado
        const pokemon = pokemones[seleccionIdx]
        let mensaje = `✅ ¡Compra exitosa!\n`
        mensaje += `📦 ${item.nombre} - $${item.precio}\n`
        mensaje += `🐾 Para: ${pokemon.name}\n\n`
        mensaje += aplicarEfectoItem(pokemon, item)
        
        // Actualizar el Pokémon
        pokemones[seleccionIdx] = pokemon
        user.pokemons = pokemones
        user.dinero -= item.precio
        
        // Guardar cambios
        usuarios[userId] = user
        guardarUsuarios(usuarios)
        
        comprasTemporales.delete(userId)
        return m.reply(mensaje)
      }
    }
    
    // MOSTRAR TIENDA SI NO HAY ARGUMENTOS
    if (args.length === 0) {
      let listaTienda = `🛒 *TIENDA POKÉMON* 🛒\n\n`
      listaTienda += `💵 Tu dinero: $${user.dinero}\n\n`
      
      itemsTienda.forEach(item => {
        listaTienda += `*${item.id}.* ${item.nombre} - $${item.precio}\n`
        listaTienda += `   📝 ${item.descripcion}\n\n`
      })
      
      listaTienda += `💡 Usa: *${usedPrefix}comprar <número>* para comprar un item\n`
      listaTienda += `Ejemplo: *${usedPrefix}comprar 1*`
      
      return m.reply(listaTienda)
    }
    
    // VERIFICAR POKÉMON
    if (pokemones.length === 0) {
      return m.reply('😢 No tienes Pokémon. Atrapa uno primero.')
    }
    
    // COMPRAR ITEM
    const itemId = parseInt(args[0])
    const item = itemsTienda.find(i => i.id === itemId)
    
    if (!item) {
      return m.reply(`❌ Item no válido. Usa *${usedPrefix}comprar* para ver los items.`)
    }
    
    if (user.dinero < item.precio) {
      return m.reply(`❌ No tienes suficiente dinero.\nNecesitas: $${item.precio}\nTienes: $${user.dinero}`)
    }
    
    // SI SOLO TIENE UN POKÉMON
    if (pokemones.length === 1) {
      const pokemon = pokemones[0]
      let mensaje = `✅ ¡Compra exitosa!\n`
      mensaje += `📦 ${item.nombre} - $${item.precio}\n`
      mensaje += `🐾 Para: ${pokemon.name}\n\n`
      mensaje += aplicarEfectoItem(pokemon, item)
      
      user.dinero -= item.precio
      guardarUsuarios(usuarios)
      
      return m.reply(mensaje)
    }
    
    // SI TIENE MÚLTIPLES POKÉMON
    let listaPokemones = `🎯 *¿Qué Pokémon quieres alimentar?* 🎯\n\n`
    listaPokemones += `📦 Item: ${item.nombre} - $${item.precio}\n\n`
    listaPokemones += `*TUS POKÉMON:*\n`
    
    pokemones.forEach((poke, index) => {
      listaPokemones += `*${index + 1}.* ${poke.name} - Nvl ${poke.nivel || 1} | ❤️ ${poke.vida || 100}/${poke.vidaMax || 100}\n`
    })
    
    listaPokemones += `\nResponde con el *número* del Pokémon.\n`
    listaPokemones += `Ejemplo: *1* para ${pokemones[0].name}`
    
    // GUARDAR COMPRA TEMPORAL EN MEMORIA
    comprasTemporales.set(userId, {
      itemId: item.id,
      timestamp: Date.now()
    })
    
    // Configurar timeout para limpiar compra temporal (5 minutos)
    setTimeout(() => {
      if (comprasTemporales.has(userId)) {
        comprasTemporales.delete(userId)
      }
    }, 300000)
    
    await m.reply(listaPokemones)
    
  } catch (error) {
    console.error('Error en comando comprar:', error)
    m.reply('❌ Error en la tienda. Intenta nuevamente.')
  }
}

// ELIMINAR EL HANDLER BEFORE - TODO SE MANEJA EN EL HANDLER PRINCIPAL

handler.help = ['comprar [número]']
handler.tags = ['pokemon', 'economy']
handler.command = ['comprar', 'buy']
handler.register = true

export default handler

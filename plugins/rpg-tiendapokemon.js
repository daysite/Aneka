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
    { id: 5, nombre: "⭐ Caramelo XL", precio: 200, efecto: "nivel", valor: 2, descripcion: "Sube 2 niveles inmediatamente" }
  ]
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
  
  // Verificar si el usuario tiene Pokémon
  if (!user.pokemon) return m.reply('😢 No tienes un Pokémon. Atrapa uno primero.')
  
  // Verificar si el usuario tiene dinero (añadir propiedad si no existe)
  if (user.dinero === undefined) user.dinero = 1000

  const action = args[0] ? args[0].toLowerCase() : ''

  // Mostrar tienda
  if (!action || action === 'tienda' || action === 'ver') {
    let listaTienda = `🛒 *TIENDA POKÉMON* 🛒\n\n`
    listaTienda += `💵 Tu dinero: $${user.dinero}\n\n`
    
    // Verificación adicional para evitar el error
    if (!tienda.items || !Array.isArray(tienda.items)) {
      // Si aún así hay problema, restaurar los items por defecto
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
    
    // Aplicar el efecto del item
    const pokemon = user.pokemon
    let mensajeEfecto = `✅ ¡Compra exitosa!\n\n`
    mensajeEfecto += `Has comprado: ${item.nombre}\n`
    mensajeEfecto += `Gastaste: $${item.precio}\n\n`
    
    // Aplicar efecto según el tipo
    switch(item.efecto) {
      case 'vida':
        pokemon.vidaMax += item.valor
        pokemon.vida = pokemon.vidaMax
        mensajeEfecto += `❤️ ${pokemon.nombre} ahora tiene ${pokemon.vidaMax} puntos de vida máxima!`
        break
        
      case 'nivel':
        const nivelAnterior = pokemon.nivel
        pokemon.nivel += item.valor
        const nivelesSubidos = item.valor
        pokemon.vidaMax += 5 * nivelesSubidos
        pokemon.vida = pokemon.vidaMax
        mensajeEfecto += `🆙 ${pokemon.nombre} subió del nivel ${nivelAnterior} al nivel ${pokemon.nivel}!`
        break
        
      case 'experiencia':
        pokemon.experiencia = (pokemon.experiencia || 0) + item.valor
        
        // Verificar si sube de nivel por experiencia
        const expNecesaria = pokemon.nivel * 100
        if (pokemon.experiencia >= expNecesaria) {
          const nivelesSubidos = Math.floor(pokemon.experiencia / expNecesaria)
          pokemon.nivel += nivelesSubidos
          pokemon.experiencia = pokemon.experiencia % expNecesaria
          pokemon.vidaMax += 5 * nivelesSubidos
          pokemon.vida = pokemon.vidaMax
          mensajeEfecto += `✨ ${pokemon.nombre} ganó ${item.valor} puntos de experiencia y subió ${nivelesSubidos} nivel(es)!`
        } else {
          mensajeEfecto += `✨ ${pokemon.nombre} ganó ${item.valor} puntos de experiencia!`
        }
        break
        
      default:
        mensajeEfecto += `✨ ${pokemon.nombre} recibió el efecto de ${item.nombre}!`
    }
    
    // Restar dinero y guardar cambios
    user.dinero -= item.precio
    
    // Inicializar inventario si no existe y agregar item
    if (!user.inventario) user.inventario = []
    user.inventario.push(item.id)
    
    usuarios[userId] = user
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
    }
    
    return m.reply(mensajeInventario)
  }

  // Mostrar ayuda si el comando no se reconoce
  return m.reply(`🛒 *SISTEMA DE COMPRAS POKÉMON* 🛒\n\n• ${usedPrefix}comprar tienda - Ver items disponibles\n• ${usedPrefix}comprar [número] - Comprar un item\n• ${usedPrefix}comprar inventario - Ver tu inventario`)
}

handler.help = ['comprar [tienda|número|inventario]']
handler.tags = ['pokemon', 'economy']
handler.command = ['comprar', 'buy', 'tienda', 'shop']
handler.register = true

export default handler

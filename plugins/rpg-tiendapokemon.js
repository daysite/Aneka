import fs from 'fs'

const usuariosPath = './src/database/usuarios.json'
const tiendaPath = './src/database/tienda.json'

// Función para leer usuarios
function leerUsuarios() {
  try {
    const data = fs.readFileSync(usuariosPath, 'utf8')
    return JSON.parse(data) || {}
  } catch (error) {
    return {}
  }
}

// Función para guardar usuarios
function guardarUsuarios(usuarios) {
  try {
    fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2))
  } catch (error) {
    console.error('Error al guardar usuarios:', error)
  }
}

// Función para leer tienda
function leerTienda() {
  try {
    if (!fs.existsSync(tiendaPath)) {
      // Crear tienda por defecto si no existe
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
      fs.writeFileSync(tiendaPath, JSON.stringify(tiendaDefault, null, 2))
      return tiendaDefault
    }
    
    const data = fs.readFileSync(tiendaPath, 'utf8')
    return JSON.parse(data) || {}
  } catch (error) {
    console.error('Error al leer tienda:', error)
    return {}
  }
}

// Función para obtener Pokémon de usuario
function obtenerPokemonesUsuario(user) {
  if (!user) return []
  return user.pokemons || []
}

// Función para aplicar efectos de items
function aplicarEfectoItem(pokemon, item) {
  let mensaje = ''
  
  switch(item.efecto) {
    case 'vida':
      const vidaAnterior = pokemon.vidaMax || 100
      pokemon.vidaMax = (pokemon.vidaMax || 100) + item.valor
      pokemon.vida = pokemon.vidaMax
      mensaje = `❤️ Vida aumentada: ${vidaAnterior} → ${pokemon.vidaMax}`
      break
      
    case 'nivel':
      const nivelAnterior = pokemon.nivel || 1
      pokemon.nivel = (pokemon.nivel || 1) + item.valor
      mensaje = `⭐ Subió de nivel: ${nivelAnterior} → ${pokemon.nivel}`
      break
      
    case 'experiencia':
      if (!pokemon.experiencia) pokemon.experiencia = 0
      const expAnterior = pokemon.experiencia
      pokemon.experiencia += item.valor
      mensaje = `✨ Experiencia aumentada: ${expAnterior} → ${pokemon.experiencia}`
      break
      
    default:
      mensaje = '📦 Item aplicado (efecto desconocido)'
  }
  
  return mensaje
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    const usuarios = leerUsuarios()
    const tienda = leerTienda()
    const userId = m.sender
    
    if (!usuarios[userId]) {
      return m.reply('❌ No estás registrado. Usa *.registrar* primero.')
    }
    
    const user = usuarios[userId]
    const pokemones = obtenerPokemonesUsuario(user)
    
    // Asegurar que el usuario tenga dinero
    if (user.dinero === undefined) {
      user.dinero = 1000
    }
    
    // Mostrar tienda si no hay argumentos
    if (args.length === 0) {
      let listaTienda = `🛒 *TIENDA POKÉMON* 🛒\n\n`
      listaTienda += `💵 Tu dinero: $${user.dinero}\n\n`
      
      tienda.items.forEach(item => {
        listaTienda += `*${item.id}.* ${item.nombre} - $${item.precio}\n`
        listaTienda += `   📝 ${item.descripcion}\n\n`
      })
      
      listaTienda += `💡 Usa: *${usedPrefix}comprar <número>* para comprar un item\n`
      listaTienda += `Ejemplo: *${usedPrefix}comprar 1*`
      
      // Enviar imagen de tienda Pokémon
      try {
        await conn.sendFile(m.chat, 'https://i.imgur.com/8Zz0W3p.png', 'tienda.png', listaTienda, m)
      } catch (e) {
        // Si falla la imagen, enviar solo texto
        m.reply(listaTienda)
      }
      return
    }
    
    // Verificar si el usuario tiene Pokémon
    if (pokemones.length === 0) {
      return m.reply('😢 No tienes Pokémon. Atrapa uno primero.')
    }
    
    // Comprar item
    const itemId = parseInt(args[0])
    const item = tienda.items.find(i => i.id === itemId)
    
    if (!item) {
      return m.reply(`❌ Item no válido. Usa *${usedPrefix}comprar* para ver los items.`)
    }
    
    // Verificar si tiene suficiente dinero
    if (user.dinero < item.precio) {
      return m.reply(`❌ No tienes suficiente dinero.\nNecesitas: $${item.precio}\nTienes: $${user.dinero}`)
    }
    
    // Si solo tiene un Pokémon, aplicarlo directamente
    if (pokemones.length === 1) {
      const pokemon = pokemones[0]
      let mensaje = `✅ ¡Compra exitosa!\n`
      mensaje += `📦 ${item.nombre} - $${item.precio}\n`
      mensaje += `🐾 Para: ${pokemon.name}\n\n`
      mensaje += aplicarEfectoItem(pokemon, item)
      
      // Actualizar dinero
      user.dinero -= item.precio
      guardarUsuarios(usuarios)
      
      return m.reply(mensaje)
    }
    
    // Si tiene múltiples Pokémon, mostrar opciones
    let listaPokemones = `🎯 *¿Qué Pokémon quieres alimentar?* 🎯\n\n`
    listaPokemones += `📦 Item: ${item.nombre} - $${item.precio}\n\n`
    listaPokemones += `*TUS POKÉMON:*\n`
    
    pokemones.forEach((poke, index) => {
      listaPokemones += `*${index + 1}.* ${poke.name} - Nvl ${poke.nivel || 1} | ❤️ ${poke.vida || 100}/${poke.vidaMax || 100}\n`
    })
    
    listaPokemones += `\nResponde con el *número* del Pokémon.\n`
    listaPokemones += `Ejemplo: *1* para ${pokemones[0].name}`
    
    // Guardar estado temporal
    user.compraTemporal = {
      itemId: item.id,
      timestamp: Date.now()
    }
    guardarUsuarios(usuarios)
    
    m.reply(listaPokemones)
    
  } catch (error) {
    console.error('Error en comprar:', error)
    m.reply('❌ Error en la tienda. Intenta nuevamente.')
  }
}

// Manejar mensajes de respuesta (para la selección de Pokémon)
export async function before(m, { conn }) {
  if (!m.text || m.isBaileys || m.fromMe) return
  
  try {
    const usuarios = leerUsuarios()
    const tienda = leerTienda()
    const userId = m.sender
    const user = usuarios[userId]
    
    // Verificar si hay una compra en proceso
    if (user && user.compraTemporal) {
      const selection = m.text.trim()
      const seleccionIdx = parseInt(selection) - 1
      const pokemones = obtenerPokemonesUsuario(user)
      
      // Validar selección
      if (isNaN(seleccionIdx) || seleccionIdx < 0 || seleccionIdx >= pokemones.length) {
        return m.reply(`❌ Número inválido. Elige entre 1 y ${pokemones.length}.`)
      }
      
      // Verificar que la compra no sea muy antigua (5 minutos)
      if (Date.now() - user.compraTemporal.timestamp > 300000) {
        delete user.compraTemporal
        guardarUsuarios(usuarios)
        return m.reply('❌ Tiempo agotado. Realiza la compra nuevamente.')
      }
      
      const item = tienda.items.find(i => i.id === user.compraTemporal.itemId)
      if (!item) {
        delete user.compraTemporal
        guardarUsuarios(usuarios)
        return m.reply('❌ Error: El artículo ya no está disponible.')
      }
      
      // Verificar si todavía tiene suficiente dinero
      if (user.dinero < item.precio) {
        delete user.compraTemporal
        guardarUsuarios(usuarios)
        return m.reply(`❌ Ya no tienes suficiente dinero. Necesitas $${item.precio}.`)
      }
      
      // Aplicar el efecto al Pokémon seleccionado
      const pokemon = pokemones[seleccionIdx]
      let mensaje = `✅ ¡Compra exitosa!\n`
      mensaje += `📦 ${item.nombre} - $${item.precio}\n`
      mensaje += `🐾 Para: ${pokemon.name}\n\n`
      mensaje += aplicarEfectoItem(pokemon, item)
      
      // Actualizar dinero y limpiar estado temporal
      user.dinero -= item.precio
      delete user.compraTemporal
      guardarUsuarios(usuarios)
      
      m.reply(mensaje)
      return true
    }
  } catch (error) {
    console.error('Error en before comprar:', error)
  }
  
  return false
}

handler.help = ['comprar [número]']
handler.tags = ['pokemon', 'economy']
handler.command = ['comprar', 'buy']
handler.register = true

export default handler

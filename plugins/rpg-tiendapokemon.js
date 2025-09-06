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
    return valorDefault
  }
}

// Función para guardar JSON
function guardarJSON(ruta, data) {
  fs.writeFileSync(ruta, JSON.stringify(data, null, 2))
}

// Datos predeterminados de la tienda
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
  const tienda = cargarJSON(tiendaPath, tiendaDefault)
  const userId = m.sender.replace(/[^0-9]/g, '')
  const user = usuarios[userId]

  // Verificar si el usuario existe
  if (!user) return m.reply('❌ No estás registrado. Usa *.registrar* primero.')
  
  // Obtener Pokémon usando la función compatible
  const pokemones = obtenerPokemonesUsuario(user)
  
  // Verificar si el usuario tiene Pokémon
  if (pokemones.length === 0) {
    return m.reply('😢 No tienes Pokémon. Atrapa uno primero.')
  }
  
  // Asegurar que tenga dinero
  if (user.dinero === undefined) user.dinero = 1000

  // Mostrar tienda si no se especifica acción
  if (args.length === 0) {
    let listaTienda = `🛒 *TIENDA POKÉMON* 🛒\n\n`
    listaTienda += `💵 Tu dinero: $${user.dinero}\n\n`
    
    // Asegurarse de que los items existan
    const items = tienda.items || tiendaDefault.items
    
    items.forEach(item => {
      listaTienda += `*${item.id}.* ${item.nombre} - $${item.precio}\n`
      listaTienda += `   📝 ${item.descripcion}\n\n`
    })
    
    listaTienda += `Para comprar: *${usedPrefix}comprar [número]*\n`
    listaTienda += `Ejemplo: *${usedPrefix}comprar 1*`
    
    return m.reply(listaTienda)
  }

  // Comprar item
  const itemId = parseInt(args[0])
  const items = tienda.items || tiendaDefault.items
  const item = items.find(i => i.id === itemId)
  
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
    mensaje += `🐾 Para: ${pokemon.nombre}\n\n`
    mensaje += aplicarEfectoItem(pokemon, item)
    
    // Actualizar el Pokémon
    pokemones[0] = pokemon
    const userActualizado = guardarPokemonesUsuario(user, pokemones)
    
    // Actualizar dinero
    userActualizado.dinero -= item.precio
    usuarios[userId] = userActualizado
    guardarJSON(usuariosPath, usuarios)
    
    return m.reply(mensaje)
  }
  
  // Si tiene múltiples Pokémon, mostrar opciones
  let listaPokemones = `🎯 *¿Qué Pokémon quieres alimentar?* 🎯\n\n`
  listaPokemones += `📦 Item: ${item.nombre} - $${item.precio}\n\n`
  listaPokemones += `*TUS POKÉMON:*\n`
  
  pokemones.forEach((poke, index) => {
    listaPokemones += `*${index + 1}.* ${poke.nombre} - Nvl ${poke.nivel} | ❤️ ${poke.vida}/${poke.vidaMax}\n`
  })
  
  listaPokemones += `\nResponde con el *número* del Pokémon.\n`
  listaPokemones += `Ejemplo: *1* para ${pokemones[0].nombre}`
  
  // Guardar estado temporal
  if (!user.compraTemporal) user.compraTemporal = {}
  user.compraTemporal = { 
    itemId: item.id, 
    timestamp: Date.now() 
  }
  usuarios[userId] = user
  guardarJSON(usuariosPath, usuarios)
  
  m.reply(listaPokemones)
}

// Función para procesar la selección de Pokémon
async function handlePokemonSelection(m, usuarios, userId, selection, tiendaData) {
  const user = usuarios[userId]
  const pokemones = obtenerPokemonesUsuario(user)
  const seleccionIdx = parseInt(selection) - 1
  
  // Validar selección
  if (isNaN(seleccionIdx) || seleccionIdx < 0 || seleccionIdx >= pokemones.length) {
    return `❌ Número inválido. Elige entre 1 y ${pokemones.length}.`
  }
  
  // Verificar que la compra no sea muy antigua (5 minutos)
  if (!user.compraTemporal || Date.now() - user.compraTemporal.timestamp > 300000) {
    delete user.compraTemporal
    return '❌ Tiempo agotado. Realiza la compra nuevamente.'
  }
  
  const items = tiendaData.items || tiendaDefault.items
  const item = items.find(i => i.id === user.compraTemporal.itemId)
  if (!item) {
    delete user.compraTemporal
    return '❌ Error: El artículo ya no está disponible.'
  }
  
  // Verificar si todavía tiene suficiente dinero
  if (user.dinero < item.precio) {
    delete user.compraTemporal
    return `❌ Ya no tienes suficiente dinero. Necesitas $${item.precio}.`
  }
  
  // Aplicar el efecto al Pokémon seleccionado
  const pokemon = pokemones[seleccionIdx]
  let mensaje = `✅ ¡Compra exitosa!\n`
  mensaje += `📦 ${item.nombre} - $${item.precio}\n`
  mensaje += `🐾 Para: ${pokemon.nombre}\n\n`
  mensaje += aplicarEfectoItem(pokemon, item)
  
  // Actualizar el Pokémon
  pokemones[seleccionIdx] = pokemon
  const userActualizado = guardarPokemonesUsuario(user, pokemones)
  
  // Actualizar dinero y limpiar estado temporal
  userActualizado.dinero -= item.precio
  delete userActualizado.compraTemporal
  
  usuarios[userId] = userActualizado
  guardarJSON(usuariosPath, usuarios)
  
  return mensaje
}

// Función para aplicar efectos de items
function aplicarEfectoItem(pokemon, item) {
  let mensaje = ''
  
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
      pokemon.vidaMax += 5 * item.valor
      pokemon.vida = pokemon.vidaMax
      mensaje = `🆙 Subió de nivel: ${nivelAnterior} → ${pokemon.nivel}`
      break
      
    case 'experiencia':
      pokemon.experiencia = (pokemon.experiencia || 0) + item.valor
      mensaje = `✨ +${item.valor} puntos de experiencia`
      
      // Verificar si sube de nivel por experiencia
      const expNecesaria = pokemon.nivel * 100
      if (pokemon.experiencia >= expNecesaria) {
        const nivelesSubidos = Math.floor(pokemon.experiencia / expNecesaria)
        const nivelAnteriorExp = pokemon.nivel
        pokemon.nivel += nivelesSubidos
        pokemon.experiencia = pokemon.experiencia % expNecesaria
        pokemon.vidaMax += 5 * nivelesSubidos
        pokemon.vida = pokemon.vidaMax
        mensaje = `✨ +${item.valor} exp | 🆙 Nivel: ${nivelAnteriorExp} → ${pokemon.nivel}`
      }
      break
  }
  
  return mensaje
}

// Manejar mensajes de respuesta (para la selección de Pokémon)
export async function before(m, { conn }) {
  if (!m.text || m.isBaileys) return
  
  const usuarios = cargarJSON(usuariosPath)
  const tienda = cargarJSON(tiendaPath, tiendaDefault)
  const userId = m.sender.replace(/[^0-9]/g, '')
  const user = usuarios[userId]
  
  // Verificar si hay una compra en proceso
  if (user && user.compraTemporal) {
    const selection = m.text.trim()
    
    // Si es un número, procesar la selección
    if (!isNaN(selection)) {
      const resultado = await handlePokemonSelection(m, usuarios, userId, selection, tienda)
      m.reply(resultado)
      return true // Indicar que el mensaje fue procesado
    }
  }
  
  return false
}

handler.help = ['comprar [número]']
handler.tags = ['pokemon', 'economy']
handler.command = ['comprar', 'buy']
handler.register = true

export default handler

import fs from 'fs'
import { createCanvas, loadImage, registerFont } from 'canvas'
import path from 'path'
import { fileURLToPath } from 'url'

const usuariosPath = './src/database/usuarios.json'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

// Función para obtener los Pokémon de un usuario
function obtenerPokemonesUsuario(user) {
  if (user.pokemon && typeof user.pokemon === 'object' && !Array.isArray(user.pokemon)) {
    return [user.pokemon]
  }
  if (user.pokemones && Array.isArray(user.pokemones)) {
    return user.pokemones
  }
  return []
}

// Colores según el tipo de Pokémon (puedes expandir esta lista)
const coloresTipos = {
  agua: '#6890F0',
  fuego: '#F08030',
  eléctrico: '#F8D030',
  planta: '#78C850',
  veneno: '#A040A0',
  volador: '#A890F0',
  normal: '#A8A878',
  lucha: '#C03028',
  psíquico: '#F85888',
  roca: '#B8A038',
  tierra: '#E0C068',
  hielo: '#98D8D8',
  bicho: '#A8B820',
  fantasma: '#705898',
  dragón: '#7038F8',
  siniestro: '#705848',
  acero: '#B8B8D0',
  hada: '#EE99AC'
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const usuarios = cargarJSON(usuariosPath)
  const userId = m.sender.replace(/[^0-9]/g, '')
  const user = usuarios[userId]

  // Verificar si el usuario existe
  if (!user) return m.reply('❌ No estás registrado. Usa *.registrar* primero.')
  
  // Obtener Pokémon del usuario
  const pokemones = obtenerPokemonesUsuario(user)
  
  // Verificar si el usuario tiene Pokémon
  if (pokemones.length === 0) {
    return m.reply('😢 No tienes Pokémon. Atrapa uno primero.')
  }

  const action = args[0] ? args[0].toLowerCase() : ''

  // Mostrar lista de Pokémon si no se especifica cuál
  if (!action || action === 'lista') {
    let lista = `📋 *TUS POKÉMON* 📋\n\n`
    
    pokemones.forEach((poke, index) => {
      lista += `*${index + 1}.* ${poke.nombre} - Nvl ${poke.nivel}\n`
      lista += `   ❤️ ${poke.vida}/${poke.vidaMax} | ⭐ Exp: ${poke.experiencia || 0}\n\n`
    })
    
    lista += `Usa *${usedPrefix}pokecard [número]* para ver la tarjeta de un Pokémon.\n`
    lista += `Ejemplo: *${usedPrefix}pokecard 1*`
    
    return m.reply(lista)
  }

  // Generar pokecard específica
  if (!isNaN(action)) {
    const index = parseInt(action) - 1
    
    if (index < 0 || index >= pokemones.length) {
      return m.reply(`❌ Número inválido. Elige entre 1 y ${pokemones.length}.`)
    }
    
    const pokemon = pokemones[index]
    
    try {
      // Crear la pokecard
      const imageBuffer = await crearPokecard(pokemon, user.nombre || 'Entrenador')
      
      // Enviar la imagen
      await conn.sendMessage(m.chat, {
        image: imageBuffer,
        caption: `🃏 *POKÉCARD DE ${pokemon.nombre.toUpperCase()}* 🃏\nNivel: ${pokemon.nivel} | Dueño: ${user.nombre || 'Entrenador'}`,
        mentions: [m.sender]
      }, { quoted: m })
      
    } catch (error) {
      console.error('Error al crear pokecard:', error)
      return m.reply('❌ Error al crear la pokecard. Intenta nuevamente.')
    }
  } else {
    return m.reply(`❌ Comando no reconocido. Usa *${usedPrefix}pokecard* para ver la lista.`)
  }
}

// Función para crear la pokecard
async function crearPokecard(pokemon, nombreEntrenador) {
  const canvas = createCanvas(400, 600)
  const ctx = canvas.getContext('2d')
  
  // Color de fondo según el tipo (usamos el primer tipo si es array, o un tipo por defecto)
  let tipoPokemon = 'normal'
  if (pokemon.tipo) {
    tipoPokemon = Array.isArray(pokemon.tipo) ? pokemon.tipo[0].toLowerCase() : pokemon.tipo.toLowerCase()
  }
  
  const colorFondo = coloresTipos[tipoPokemon] || '#A8A878'
  
  // Fondo gradiente
  const gradient = ctx.createLinearGradient(0, 0, 400, 600)
  gradient.addColorStop(0, colorFondo)
  gradient.addColorStop(1, '#FFFFFF')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 400, 600)
  
  // Borde
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 5
  ctx.strokeRect(10, 10, 380, 580)
  
  // Logo Pokémon
  ctx.font = 'bold 28px Arial'
  ctx.fillStyle = '#000000'
  ctx.fillText('POKÉMON', 150, 50)
  
  // Imagen del Pokémon (intentamos usar una imagen real o un placeholder)
  try {
    // Intentar cargar imagen del Pokémon
    const pokemonName = pokemon.nombre.toLowerCase().replace(/\s+/g, '-')
    const imageUrl = `https://pokemon.com/images/${pokemonName}.png`
    
    // Aquí podrías usar loadImage si tienes imágenes locales
    // const img = await loadImage(`./assets/pokemon/${pokemonName}.png`)
    // ctx.drawImage(img, 100, 80, 200, 200)
    
    // Por ahora dibujamos un círculo como placeholder
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(200, 180, 80, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 3
    ctx.stroke()
    
    // Nombre del Pokémon en el círculo
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 20px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(pokemon.nombre, 200, 185)
    
  } catch (error) {
    console.log('Usando placeholder para imagen de Pokémon')
  }
  
  // Información del Pokémon
  ctx.textAlign = 'left'
  ctx.fillStyle = '#000000'
  ctx.font = 'bold 18px Arial'
  ctx.fillText('NIVEL:', 50, 250)
  ctx.font = '16px Arial'
  ctx.fillText(pokemon.nivel.toString(), 120, 250)
  
  ctx.font = 'bold 18px Arial'
  ctx.fillText('VIDA:', 50, 280)
  ctx.font = '16px Arial'
  ctx.fillText(`${pokemon.vida}/${pokemon.vidaMax}`, 120, 280)
  
  ctx.font = 'bold 18px Arial'
  ctx.fillText('EXPERIENCIA:', 50, 310)
  ctx.font = '16px Arial'
  ctx.fillText((pokemon.experiencia || 0).toString(), 180, 310)
  
  // Tipo(s) del Pokémon
  ctx.font = 'bold 18px Arial'
  ctx.fillText('TIPO:', 50, 340)
  ctx.font = '16px Arial'
  
  if (pokemon.tipo) {
    const tipos = Array.isArray(pokemon.tipo) ? pokemon.tipo : [pokemon.tipo]
    tipos.forEach((tipo, i) => {
      ctx.fillText(tipo, 120 + (i * 80), 340)
    })
  } else {
    ctx.fillText('Normal', 120, 340)
  }
  
  // Ataques (si existen en los datos)
  if (pokemon.ataques && pokemon.ataques.length > 0) {
    ctx.font = 'bold 18px Arial'
    ctx.fillText('ATAQUES:', 50, 380)
    ctx.font = '14px Arial'
    
    pokemon.ataques.slice(0, 3).forEach((ataque, i) => {
      ctx.fillText(`• ${ataque.nombre || ataque}`, 50, 410 + (i * 25))
    })
  }
  
  // Estadísticas adicionales
  ctx.font = 'bold 16px Arial'
  ctx.fillText('ESTADÍSTICAS', 50, 480)
  ctx.font = '14px Arial'
  
  // Barra de experiencia
  const expMax = pokemon.nivel * 100
  const expActual = pokemon.experiencia || 0
  const expPercentage = Math.min(expActual / expMax, 1)
  
  ctx.fillText('EXP: ', 50, 510)
  ctx.fillStyle = '#DDDDDD'
  ctx.fillRect(90, 495, 200, 15)
  ctx.fillStyle = '#FFCC00'
  ctx.fillRect(90, 495, 200 * expPercentage, 15)
  ctx.strokeRect(90, 495, 200, 15)
  
  ctx.fillStyle = '#000000'
  ctx.font = '12px Arial'
  ctx.fillText(`${expActual}/${expMax}`, 300, 508)
  
  // Información del entrenador
  ctx.font = 'italic 14px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(`Entrenador: ${nombreEntrenador}`, 200, 550)
  
  ctx.font = '10px Arial'
  ctx.fillText('Carta oficial de Pokémon - No para venta', 200, 580)
  
  // Convertir canvas a buffer
  return canvas.toBuffer('image/png')
}

// Comando alternativo para ver todas las pokécards
handler.help = ['pokecard [número|lista]']
handler.tags = ['pokemon', 'fun']
handler.command = ['pokecard', 'pcard', 'cartapokemon']
handler.register = true

export default handler

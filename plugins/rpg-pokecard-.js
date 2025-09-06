import fs from 'fs'
import { createCanvas } from 'canvas'

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

// Colores según el tipo de Pokémon
const coloresTipos = {
  agua: '#6890F0', fuego: '#F08030', eléctrico: '#F8D030', planta: '#78C850',
  veneno: '#A040A0', volador: '#A890F0', normal: '#A8A878', lucha: '#C03028',
  psíquico: '#F85888', roca: '#B8A038', tierra: '#E0C068', hielo: '#98D8D8',
  bicho: '#A8B820', fantasma: '#705898', dragón: '#7038F8', siniestro: '#705848',
  acero: '#B8B8D0', hada: '#EE99AC'
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

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    const usuarios = cargarJSON(usuariosPath)
    const userId = m.sender.replace(/[^0-9]/g, '')
    const user = usuarios[userId]

    // Verificar si el usuario existe
    if (!user) {
      return m.reply('❌ No estás registrado en el sistema. Usa *.registrar* primero.')
    }
    
    // Obtener Pokémon del usuario
    const pokemones = obtenerPokemonesUsuario(user)
    
    // Verificar si el usuario tiene Pokémon
    if (pokemones.length === 0) {
      return m.reply('😢 No tienes Pokémon en tu equipo. Atrapa alguno primero.')
    }

    const action = args[0] ? args[0].toLowerCase() : ''

    // Mostrar lista de Pokémon si no se especifica cuál
    if (!action || action === 'lista' || action === 'list') {
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
        // Fallback: enviar información en texto si falla la imagen
        let infoPokemon = `🃏 *POKÉCARD DE ${pokemon.nombre.toUpperCase()}* 🃏\n\n`
        infoPokemon += `Nivel: ${pokemon.nivel}\n`
        infoPokemon += `Vida: ${pokemon.vida}/${pokemon.vidaMax}\n`
        infoPokemon += `Experiencia: ${pokemon.experiencia || 0}\n`
        infoPokemon += `Tipo: ${pokemon.tipo || 'Normal'}\n`
        infoPokemon += `Entrenador: ${user.nombre || 'Desconocido'}\n\n`
        infoPokemon += `*¡Pokémon listo para combatir!*`
        
        return m.reply(infoPokemon)
      }
    } else {
      // Mostrar ayuda si el comando no es reconocido
      return m.reply(`❌ Comando no reconocido. Usa:\n• *${usedPrefix}pokecard* para ver la lista\n• *${usedPrefix}pokecard [número]* para una tarjeta específica\n• *${usedPrefix}pokecard lista* para ver todos tus Pokémon`)
    }
    
  } catch (error) {
    console.error('Error en handler pokecard:', error)
    return m.reply('❌ Ocurrió un error al procesar el comando. Intenta nuevamente.')
  }
}

// Función para crear la pokecard
async function crearPokecard(pokemon, nombreEntrenador) {
  const canvas = createCanvas(400, 600)
  const ctx = canvas.getContext('2d')
  
  // Color de fondo según el tipo
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
  ctx.textAlign = 'center'
  ctx.fillText('POKÉMON', 200, 50)
  
  // Círculo para la imagen del Pokémon
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
  ctx.fillText(pokemon.nombre, 200, 185)
  
  // Información del Pokémon
  ctx.textAlign = 'left'
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
  
  // Tipo del Pokémon
  ctx.font = 'bold 18px Arial'
  ctx.fillText('TIPO:', 50, 340)
  ctx.font = '16px Arial'
  
  if (pokemon.tipo) {
    const tipos = Array.isArray(pokemon.tipo) ? pokemon.tipo : [pokemon.tipo]
    tipos.forEach((tipo, i) => {
      ctx.fillText(tipo.charAt(0).toUpperCase() + tipo.slice(1), 120 + (i * 80), 340)
    })
  } else {
    ctx.fillText('Normal', 120, 340)
  }
  
  // Barra de experiencia
  const expMax = pokemon.nivel * 100
  const expActual = pokemon.experiencia || 0
  const expPercentage = Math.min(expActual / expMax, 1)
  
  ctx.font = 'bold 16px Arial'
  ctx.fillText('PROGRESO:', 50, 380)
  
  ctx.fillStyle = '#DDDDDD'
  ctx.fillRect(50, 400, 300, 20)
  ctx.fillStyle = '#FFCC00'
  ctx.fillRect(50, 400, 300 * expPercentage, 20)
  ctx.strokeStyle = '#000000'
  ctx.strokeRect(50, 400, 300, 20)
  
  ctx.fillStyle = '#000000'
  ctx.font = '14px Arial'
  ctx.fillText(`${expActual}/${expMax}`, 160, 415)
  
  // Información del entrenador
  ctx.textAlign = 'center'
  ctx.font = 'italic 16px Arial'
  ctx.fillText(`Entrenador: ${nombreEntrenador}`, 200, 470)
  
  ctx.font = '12px Arial'
  ctx.fillText('Carta oficial de Pokémon - No para venta', 200, 550)
  
  // Convertir canvas a buffer
  return canvas.toBuffer('image/png')
}

// Configuración mejorada del handler
handler.help = ['pokecard [número|lista]']
handler.tags = ['pokemon', 'fun', 'rpg']
handler.command = /^(pokecard|pcard|cartapokémon|cartapokemon|pokétarjeta|poketarjeta)$/i
handler.register = true
handler.limit = true

export default handler

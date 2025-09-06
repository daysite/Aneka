import fs from 'fs'
import { createCanvas } from 'canvas'

const usuariosPath = './src/database/usuarios.json'

// Función para cargar JSON con mejor manejo de errores
function cargarJSON(ruta, valorDefault = {}) {
  try {
    if (!fs.existsSync(ruta)) {
      fs.writeFileSync(ruta, JSON.stringify(valorDefault, null, 2))
      console.log(`Archivo ${ruta} creado exitosamente`)
    }
    const data = fs.readFileSync(ruta, 'utf-8').trim()
    return data ? JSON.parse(data) : valorDefault
  } catch (e) {
    console.error('Error crítico al cargar JSON:', e)
    return valorDefault
  }
}

// Función para obtener Pokémon (compatible con todos los formatos)
function obtenerPokemonesUsuario(user) {
  if (!user) return []
  
  // Diferentes formatos que podría tener la base de datos
  if (user.pokemon) {
    if (Array.isArray(user.pokemon)) return user.pokemon
    if (typeof user.pokemon === 'object') return [user.pokemon]
  }
  
  if (user.pokemones && Array.isArray(user.pokemones)) return user.pokemones
  if (user.pokemons && Array.isArray(user.pokemons)) return user.pokemons
  if (user.poke && Array.isArray(user.poke)) return user.poke
  
  return []
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    console.log(`Comando recibido: ${command}, Argumentos: ${args}`)
    
    const usuarios = cargarJSON(usuariosPath)
    const userId = m.sender.replace(/[^0-9]/g, '')
    const user = usuarios[userId]

    if (!user) {
      console.log(`Usuario ${userId} no encontrado en la base de datos`)
      return m.reply('❌ No estás registrado en el sistema. Usa *.registrar* primero.')
    }
    
    console.log(`Usuario encontrado: ${user.nombre || userId}`)
    
    const pokemones = obtenerPokemonesUsuario(user)
    console.log(`Pokémon encontrados: ${pokemones.length}`)
    
    if (pokemones.length === 0) {
      return m.reply('😢 No tienes Pokémon en tu equipo. Atrapa alguno primero.')
    }

    // MOSTRAR AYUDA SI NO HAY ARGUMENTOS
    if (args.length === 0) {
      let lista = `🎴 *SISTEMA DE POKÉCARDS* 🎴\n\n`
      lista += `📋 *TUS POKÉMON* (${pokemones.length}):\n\n`
      
      pokemones.forEach((poke, index) => {
        lista += `*${index + 1}.* ${poke.nombre} - Nvl ${poke.nivel || 1}\n`
        lista += `   ❤️ ${poke.vida || 0}/${poke.vidaMax || 20} | ⭐ Exp: ${poke.experiencia || 0}\n\n`
      })
      
      lista += `\n🃏 *USO:*\n`
      lista += `• *${usedPrefix}pokecard* - Ver esta lista\n`
      lista += `• *${usedPrefix}pokecard 1* - Ver tarjeta del 1er Pokémon\n`
      lista += `• *${usedPrefix}pcard 2* - Ver tarjeta del 2do Pokémon\n`
      lista += `• *${usedPrefix}pokecard all* - Ver todas las tarjetas`
      
      return m.reply(lista)
    }

    const action = args[0].toLowerCase()
    
    // MOSTRAR TODAS LAS TARJETAS
    if (action === 'all' || action === 'todos' || action === 'todas') {
      for (let i = 0; i < pokemones.length; i++) {
        const pokemon = pokemones[i]
        try {
          const imageBuffer = await crearPokecardSimple(pokemon, user.nombre || 'Entrenador')
          await conn.sendMessage(m.chat, {
            image: imageBuffer,
            caption: `🃏 ${pokemon.nombre} - Nvl ${pokemon.nivel} (${i + 1}/${pokemones.length})`
          }, { quoted: m })
          // Pequeña pausa entre mensajes
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
          console.error(`Error con Pokémon ${i}:`, error)
          m.reply(`❌ Error al crear tarjeta para ${pokemon.nombre}`)
        }
      }
      return
    }
    
    // MOSTRAR TARJETA ESPECÍFICA
    if (!isNaN(action)) {
      const index = parseInt(action) - 1
      
      if (index < 0 || index >= pokemones.length) {
        return m.reply(`❌ Número inválido. Tienes ${pokemones.length} Pokémon. Usa del 1 al ${pokemones.length}.`)
      }
      
      const pokemon = pokemones[index]
      
      try {
        const imageBuffer = await crearPokecardSimple(pokemon, user.nombre || 'Entrenador')
        await conn.sendMessage(m.chat, {
          image: imageBuffer,
          caption: `🃏 *POKÉCARD DE ${pokemon.nombre.toUpperCase()}* 🃏\nNivel: ${pokemon.nivel} | Dueño: ${user.nombre || 'Entrenador'}`,
          mentions: [m.sender]
        }, { quoted: m })
        
      } catch (error) {
        console.error('Error al crear pokecard:', error)
        // Fallback a texto
        let info = `🃏 *POKÉCARD DE ${pokemon.nombre}* 🃏\n\n`
        info += `Nivel: ${pokemon.nivel || 1}\n`
        info += `Vida: ${pokemon.vida || 0}/${pokemon.vidaMax || 20}\n`
        info += `Experiencia: ${pokemon.experiencia || 0}\n`
        info += `Entrenador: ${user.nombre || 'Desconocido'}\n\n`
        info += `*¡Pokémon listo para aventuras!*`
        
        m.reply(info)
      }
    } else {
      // COMANDO NO RECONOCIDO - MOSTRAR AYUDA
      m.reply(`❌ Opción no reconocida. Usa:\n• *${usedPrefix}pokecard* - Ver tus Pokémon\n• *${usedPrefix}pokecard 1* - Ver tarjeta específica\n• *${usedPrefix}pokecard all* - Ver todas las tarjetas`)
    }
    
  } catch (error) {
    console.error('Error grave en handler:', error)
    m.reply('❌ Error interno del sistema. Contacta al administrador.')
  }
}

// Versión simplificada de crearPokecard para mejor compatibilidad
async function crearPokecardSimple(pokemon, entrenador) {
  const canvas = createCanvas(300, 450)
  const ctx = canvas.getContext('2d')
  
  // Fondo simple
  ctx.fillStyle = '#F0F0F0'
  ctx.fillRect(0, 0, 300, 450)
  
  // Borde
  ctx.strokeStyle = '#3366CC'
  ctx.lineWidth = 3
  ctx.strokeRect(5, 5, 290, 440)
  
  // Título
  ctx.fillStyle = '#3366CC'
  ctx.font = 'bold 20px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('POKÉCARD', 150, 30)
  
  // Nombre Pokémon
  ctx.fillStyle = '#000000'
  ctx.font = 'bold 24px Arial'
  ctx.fillText(pokemon.nombre, 150, 70)
  
  // Círculo para Pokémon
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(150, 120, 40, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 2
  ctx.stroke()
  
  // Información
  ctx.font = '16px Arial'
  ctx.textAlign = 'left'
  ctx.fillText(`Nivel: ${pokemon.nivel || 1}`, 30, 170)
  ctx.fillText(`Vida: ${pokemon.vida || 0}/${pokemon.vidaMax || 20}`, 30, 200)
  ctx.fillText(`Exp: ${pokemon.experiencia || 0}`, 30, 230)
  
  // Tipo
  ctx.fillText('Tipo:', 30, 260)
  ctx.textAlign = 'center'
  ctx.fillText(pokemon.tipo || 'Normal', 150, 260)
  
  // Barra de experiencia
  const expMax = (pokemon.nivel || 1) * 100
  const expActual = pokemon.experiencia || 0
  const expPercentage = Math.min(expActual / expMax, 1)
  
  ctx.textAlign = 'left'
  ctx.fillText('Progreso:', 30, 300)
  ctx.fillStyle = '#DDDDDD'
  ctx.fillRect(30, 320, 240, 15)
  ctx.fillStyle = '#FFCC00'
  ctx.fillRect(30, 320, 240 * expPercentage, 15)
  ctx.strokeStyle = '#000000'
  ctx.strokeRect(30, 320, 240, 15)
  
  ctx.fillStyle = '#000000'
  ctx.font = '12px Arial'
  ctx.fillText(`${expActual}/${expMax}`, 120, 332)
  
  // Entrenador
  ctx.textAlign = 'center'
  ctx.font = 'italic 14px Arial'
  ctx.fillText(`Entrenador: ${entrenador}`, 150, 380)
  
  ctx.font = '10px Arial'
  ctx.fillText('Generado por Bot Pokémon', 150, 420)
  
  return canvas.toBuffer('image/png')
}

// CONFIGURACIÓN MEJORADA DEL HANDLER
handler.help = ['pokecard [número|all]']
handler.tags = ['pokemon', 'rpg', 'fun']
handler.command = /^(pokecard|pcard|poketarjeta|cartapokemon|verpokemon|mispokemon)$/i
handler.register = true
handler.limit = false

// Añadir esto para diagnóstico
handler.before = async (m, { conn, usedPrefix, command }) => {
  console.log(`[DIAGNÓSTICO] Comando intentado: ${m.text}`)
  console.log(`[DIAGNÓSTICO] Prefijo usado: ${usedPrefix}`)
  console.log(`[DIAGNÓSTICO] Comando detectado: ${command}`)
  return false
}

export default handler

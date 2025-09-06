import fs from 'fs'

const usuariosPath = './src/database/usuarios.json'

// Función para cargar JSON (manteniendo tu implementación)
function cargarJSON(ruta, valorDefault = {}) {
  try {
    if (!fs.existsSync(ruta)) fs.writeFileSync(ruta, JSON.stringify(valorDefault, null, 2))
    const data = fs.readFileSync(ruta, 'utf-8').trim()
    return data ? JSON.parse(data) : valorDefault
  } catch (e) {
    return valorDefault
  }
}

// Función para guardar JSON (manteniendo tu implementación)
function guardarJSON(ruta, data) {
  fs.writeFileSync(ruta, JSON.stringify(data, null, 2))
}

// Función para calcular el poder de un Pokémon
function calcularPoder(pokemon) {
  return pokemon.vidaMax + (pokemon.nivel * 5) + 
         (pokemon.ataque || 0) + (pokemon.defensa || 0) + 
         (pokemon.velocidad || 0)
}

// Función para simular batalla con más detalle
function simularBatalla(miPoke, rivalPoke, userName, rivalName) {
  const miPoder = calcularPoder(miPoke)
  const rivalPoder = calcularPoder(rivalPoke)
  
  let resultado = `⚔️ *Batalla Pokémon*\n\n`
  resultado += `👤 ${userName} - ${miPoke.nombre} (Nivel ${miPoke.nivel})\n`
  resultado += `❤️ Vida: ${miPoke.vidaMax} | ⚡ Poder: ${miPoder}\n\n`
  resultado += `🆚\n\n`
  resultado += `👤 ${rivalName} - ${rivalPoke.nombre} (Nivel ${rivalPoke.nivel})\n`
  resultado += `❤️ Vida: ${rivalPoke.vidaMax} | ⚡ Poder: ${rivalPoder}\n\n`
  
  // Simular algunos turnos de batalla
  const turnos = Math.min(3, Math.floor(Math.random() * 5) + 1)
  for (let i = 1; i <= turnos; i++) {
    if (Math.random() > 0.5) {
      resultado += `⏱️ Turno ${i}: ${miPoke.nombre} ataca a ${rivalPoke.nombre}\n`
    } else {
      resultado += `⏱️ Turno ${i}: ${rivalPoke.nombre} ataca a ${miPoke.nombre}\n`
    }
  }
  
  resultado += `\n🎯 *RESULTADO FINAL*:\n`
  
  if (miPoder > rivalPoder) {
    const expGanada = Math.max(1, Math.floor(rivalPoder / 10))
    miPoke.nivel += 1
    miPoke.vidaMax += 5
    miPoke.vida = miPoke.vidaMax
    miPoke.experiencia = (miPoke.experiencia || 0) + expGanada
    
    resultado += `🎉 ¡*${userName}* gana la batalla!\n`
    resultado += `🆙 ${miPoke.nombre} sube a nivel ${miPoke.nivel}\n`
    resultado += `✨ +${expGanada} puntos de experiencia\n`
  } else if (miPoder < rivalPoder) {
    const expGanada = Math.max(1, Math.floor(miPoder / 10))
    rivalPoke.nivel += 1
    rivalPoke.vidaMax += 5
    rivalPoke.vida = rivalPoke.vidaMax
    rivalPoke.experiencia = (rivalPoke.experiencia || 0) + expGanada
    
    resultado += `😵 ¡*${rivalName}* gana la batalla!\n`
    resultado += `🆙 ${rivalPoke.nombre} sube a nivel ${rivalPoke.nivel}\n`
    resultado += `✨ +${expGanada} puntos de experiencia\n`
  } else {
    resultado += `🤝 ¡Empate! Ambos Pokémon lucharon con igual fuerza.\n`
    resultado += `✨ Ambos ganan 1 punto de experiencia\n`
    
    miPoke.experiencia = (miPoke.experiencia || 0) + 1
    rivalPoke.experiencia = (rivalPoke.experiencia || 0) + 1
  }
  
  return resultado
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const usuarios = cargarJSON(usuariosPath)
  const userId = m.sender.replace(/[^0-9]/g, '')
  const user = usuarios[userId]

  // Verificar si el usuario existe y tiene Pokémon
  if (!user) return m.reply('❌ No estás registrado en el sistema. Usa *.registrar* primero.')
  if (!user.pokemon) return m.reply('😢 No tienes un Pokémon. Atrapa uno primero.')

  // Obtener el usuario mencionado
  let mentioned = m.mentionedJid?.[0]
  if (!mentioned && args[0]) {
    // Intentar encontrar usuario por mención sin @
    const possibleNumber = args[0].replace(/[^0-9]/g, '')
    if (possibleNumber.length > 5) {
      mentioned = possibleNumber + '@s.whatsapp.net'
    }
  }
  
  if (!mentioned) return m.reply(`👥 Debes mencionar a otro jugador para pelear.\nEjemplo: *${usedPrefix + command} @usuario*`)

  const rivalId = mentioned.replace(/[^0-9]/g, '')
  const rival = usuarios[rivalId]

  // Verificar si el rival existe y tiene Pokémon
  if (!rival) return m.reply('❌ El usuario mencionado no está registrado en el sistema.')
  if (!rival.pokemon) return m.reply('⚠️ El oponente no tiene un Pokémon.')

  // Verificar que no se esté desafiando a sí mismo
  if (userId === rivalId) return m.reply('❌ No puedes pelear contra ti mismo.')

  const miPoke = user.pokemon
  const rivalPoke = rival.pokemon

  // Simular la batalla
  const resultado = simularBatalla(miPoke, rivalPoke, user.nombre || `Usuario ${userId}`, rival.nombre || `Usuario ${rivalId}`)

  // Guardar los cambios
  usuarios[userId] = user
  usuarios[rivalId] = rival
  guardarJSON(usuariosPath, usuarios)

  // Enviar resultado con estilo
  await conn.sendMessage(m.chat, { 
    text: resultado,
    contextInfo: {
      mentionedJid: [mentioned, m.sender]
    }
  }, { quoted: m })
}

handler.help = ['pelear @usuario']
handler.tags = ['pokemon', 'rpg']
handler.command = ['pelear', 'battle', 'batallapokemon']
handler.register = true

export default handler

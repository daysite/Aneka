import fs from 'fs'

const usuariosPath = './src/database/usuarios.json'

function cargarJSON(ruta, valorDefault = {}) {
  try {
    if (!fs.existsSync(ruta)) fs.writeFileSync(ruta, JSON.stringify(valorDefault, null, 2))
    const data = fs.readFileSync(ruta, 'utf-8').trim()
    return data ? JSON.parse(data) : valorDefault
  } catch (e) {
    return valorDefault
  }
}

function guardarJSON(ruta, data) {
  fs.writeFileSync(ruta, JSON.stringify(data, null, 2))
}

const precios = {
  pocion: 20,
  comida: 15,
  revivir: 50
}

let handler = async (m, { conn, args }) => {
  const userId = m.sender.replace(/[^0-9]/g, '')
  const usuarios = cargarJSON(usuariosPath)
  const user = usuarios[userId]

  if (!user) return m.reply('😢 No tienes perfil. Usa *.atrapar* primero.')
  if (!args[0]) return m.reply('❓ ¿Qué quieres comprar? Usa *.tienda* para ver opciones.')
  
  const item = args[0].toLowerCase()
  const cantidad = Math.max(1, parseInt(args[1]) || 1)

  if (!precios[item]) return m.reply('❌ Ese objeto no existe. Usa *.tienda* para ver opciones.')

  const costo = precios[item] * cantidad
  if (user.dinero < costo) {
    return m.reply(`💸 No tienes suficientes monedas.\nTienes: ${user.dinero} – Necesitas: ${costo}`)
  }

  user.dinero -= costo
  user[item] = (user[item] || 0) + cantidad

  guardarJSON(usuariosPath, usuarios)

  return m.reply(`✅ Compraste *${cantidad} ${item}* por 💰 ${costo} monedas.\nMonedas restantes: ${user.dinero}`)
}

handler.help = ['comprar <item> <cantidad>']
handler.tags = ['juegos']
handler.command = ['comprar']
handler.register = true

export default handler

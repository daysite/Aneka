let handler = async (m, { conn }) => {
  global.siderList = global.siderList || {}
  const sider = global.siderList[m.chat]

  if (!sider || !Array.isArray(sider) || sider.length === 0) {
    return conn.reply(m.chat, '⚠️ No hay fantasmas guardados recientemente. Usa el comando *fantasmas* primero.', m)
  }

  let kicked = 0, failed = 0

  for (let id of sider) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [id], 'remove')
      kicked++
    } catch (e) {
      failed++
    }
    await delay(3000) // ⏳ espera 3 segundos entre cada expulsión
  }

  delete global.siderList[m.chat]

  m.reply(`✅ Se eliminaron ${kicked} fantasmas.${failed > 0 ? `\n❌ Fallaron ${failed} eliminaciones.` : ''}`)
}

// Función delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

handler.help = ['kickfantasmas']
handler.tags = ['gc']
handler.command = /^kickfantasmas$/i
handler.admin = true
handler.botAdmin = true

export default handler
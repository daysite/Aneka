const delay = ms => new Promise(res => setTimeout(res, ms))

let handler = async (m, { conn, command }) => {
  global.siderList = global.siderList || {}
  global.pendingKick = global.pendingKick || {}

  const sider = global.siderList[m.chat]

  if (command === 'kickfantasmas') {
    if (!sider || !Array.isArray(sider) || sider.length === 0) {
      return conn.reply(m.chat, '⚠️ No hay fantasmas guardados recientemente.\nUsa el comando *fantasmas* primero.', m)
    }

    global.pendingKick[m.chat] = sider

    setTimeout(() => {
      if (global.pendingKick[m.chat]) {
        delete global.pendingKick[m.chat]
        conn.reply(m.chat, '⌛ Tiempo de espera agotado. La limpieza fue cancelada automáticamente.', m)
      }
    }, 60_000)

    return await conn.sendMessage(m.chat, {
      text: `👻 Se encontraron *${sider.length}* fantasmas en el grupo.\n¿Deseas eliminarlos?`,
      buttons: [
        { buttonId: 'kick_yes', buttonText: { displayText: '✅ Sí, eliminar' }, type: 1 },
        { buttonId: 'kick_no', buttonText: { displayText: '❌ Cancelar' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  if (command === 'kick_yes') {
    const pending = global.pendingKick[m.chat]
    if (!pending || pending.length === 0) return m.reply('⚠️ No hay fantasmas pendientes de eliminar.')

    const groupMetadata = await conn.groupMetadata(m.chat)
    const groupAdmins = groupMetadata.participants
      .filter(p => p.admin)
      .map(p => p.id)
    const botNumber = conn.user.jid

    let kicked = 0, failed = 0

    for (let id of pending) {
      try {
        if (groupAdmins.includes(id) || id === botNumber || id === m.sender) {
          failed++
          continue
        }

        await conn.groupParticipantsUpdate(m.chat, [id], 'remove')
        kicked++
        await delay(3000) // ⏱️ 3 segundos por usuario
      } catch (e) {
        failed++
      }
    }

    delete global.siderList[m.chat]
    delete global.pendingKick[m.chat]

    return m.reply(`🧹 *Limpieza completada:*\n\n✅ Eliminados: *${kicked}*\n❌ Fallos: *${failed}*`)
  }

  if (command === 'kick_no') {
    delete global.pendingKick[m.chat]
    return m.reply('🚫 Cancelado. No se eliminará a ningún usuario.')
  }
}

handler.help = ['kickfantasmas']
handler.tags = ['gc']
handler.command = /^(kickfantasmas|kick_yes|kick_no)$/i
handler.admin = true
handler.botAdmin = true

export default handler
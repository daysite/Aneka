let handler = async (m, { conn, participants, usedPrefix, command, isROwner }) => {
  if (!global.db.data.settings[conn.user.jid].restrict) {
    return m.reply('🍭 El owner tiene restringido está opción');
  }

  let groupMetadata = await conn.groupMetadata(m.chat)
  let owner = groupMetadata.owner
  let botJid = conn.user.jid
  let allParticipants = participants.map(p => p.id)
  
  // Filtrar para no eliminar al owner del grupo ni al bot
  let usersToRemove = allParticipants.filter(user => 
    user !== owner && 
    user !== botJid
  )

  if (usersToRemove.length === 0) {
    return m.reply('🍭 No hay participantes para eliminar (excluyendo al owner y al bot)')
  }

  // Confirmación antes de eliminar a todos
  await m.reply(`⚠️ *¿Estás seguro de que quieres eliminar a TODOS los participantes del grupo?*\n\n*Participantes a eliminar:* ${usersToRemove.length}\n\nEscribe *SI* para confirmar o *NO* para cancelar.`)

  // Esperar confirmación
  let response = await conn.ev.wait('messages.upsert', {
    timeout: 30000, // 30 segundos para responder
    filter: ({ messages }) => 
      messages[0]?.key?.remoteJid === m.chat && 
      messages[0]?.key?.participant === m.sender
  }).catch(() => null)

  if (!response || !response.messages?.[0]) {
    return m.reply('⏰ Tiempo de confirmación agotado. Operación cancelada.')
  }

  let confirmMessage = response.messages[0].message?.conversation?.toLowerCase() || 
                      response.messages[0].message?.extendedTextMessage?.text?.toLowerCase()

  if (confirmMessage !== 'si') {
    return m.reply('❌ Operación cancelada.')
  }

  // Eliminar participantes en lotes para evitar errores
  try {
    await m.reply(`🔄 Eliminando a ${usersToRemove.length} participantes...`)

    // Eliminar en lotes de 10 para evitar límites de WhatsApp
    for (let i = 0; i < usersToRemove.length; i += 10) {
      let batch = usersToRemove.slice(i, i + 10)
      await conn.groupParticipantsUpdate(m.chat, batch, 'remove')
      
      // Pequeña pausa entre lotes
      if (i + 10 < usersToRemove.length) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    await m.reply(`✅ *Eliminación completada*\n\nSe eliminaron ${usersToRemove.length} participantes del grupo.`)

  } catch (error) {
    console.error(error)
    await m.reply('❌ Error al eliminar participantes. Puede que no tenga permisos suficientes.')
  }
}

handler.help = ['kickall']
handler.tags = ['gc']
handler.command = ['kickall', 'expulsartodos', 'banall', 'sacartodos', 'removeall'] 
handler.admin = true
handler.group = true
handler.botAdmin = true
handler.owner = true // Solo el owner del bot puede usar este comando

export default handler

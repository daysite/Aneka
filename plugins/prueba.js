let handler = async (m, { conn, participants, usedPrefix, command, isROwner }) => {
  if (!global.db.data.settings[conn.user.jid].restrict) {
    return m.reply('🍭 El owner tiene restringido está opción');
  }

  // Comando para eliminar a todos los miembros
  if (command === 'kickall' || command === 'expulsartodos' || command === 'banall' || command === 'sacartodos') {
    let groupMetadata = await conn.groupMetadata(m.chat);
    let owner = groupMetadata.owner;
    let botId = conn.user.jid;
    
    // Obtener todos los participantes excepto el owner y el bot
    let membersToRemove = participants
      .filter(p => p.id !== owner && p.id !== botId && !p.isAdmin)
      .map(p => p.id);

    if (membersToRemove.length === 0) {
      return m.reply('🍭 No hay miembros para eliminar (solo quedan admins y el bot).');
    }

    // Preguntar confirmación
    let confirmMessage = `⚠️ *¿Estás seguro de que deseas eliminar a TODOS los miembros del grupo?*\n\n`
    confirmMessage += `📊 *Miembros a eliminar:* ${membersToRemove.length}\n`
    confirmMessage += `👑 *Admins que se mantendrán:* ${participants.filter(p => p.isAdmin).length}\n\n`
    confirmMessage += `*Para confirmar escribe:*\n`
    confirmMessage += `✅ *!confirmar kickall* - Para eliminar todos los miembros\n`
    confirmMessage += `❌ *!cancelar kickall* - Para cancelar la operación\n\n`
    confirmMessage += `*Tienes 1 minuto para confirmar.*`

    // Guardar el estado de la operación pendiente
    if (!global.pendingActions) global.pendingActions = {};
    global.pendingActions[m.chat] = {
      type: 'kickall',
      members: membersToRemove,
      timestamp: Date.now()
    };

    return m.reply(confirmMessage);
  }

  // Comando para confirmar la eliminación
  if (command === 'confirmar' && m.text.includes('kickall')) {
    if (!global.pendingActions || !global.pendingActions[m.chat]) {
      return m.reply('❌ No hay una operación pendiente de eliminación.');
    }

    let pendingAction = global.pendingActions[m.chat];
    
    // Verificar que no haya pasado más de 1 minuto
    if (Date.now() - pendingAction.timestamp > 60000) {
      delete global.pendingActions[m.chat];
      return m.reply('❌ El tiempo para confirmar ha expirado. Por favor, inicia la operación nuevamente.');
    }

    // Verificar que sea la acción correcta
    if (pendingAction.type !== 'kickall') {
      return m.reply('❌ La operación pendiente no coincide.');
    }

    let membersToRemove = pendingAction.members;
    
    m.reply(`🔄 Eliminando a ${membersToRemove.length} miembros del grupo...`);

    let successCount = 0;
    let errorCount = 0;

    // Eliminar miembros en lotes para evitar errores
    for (let i = 0; i < membersToRemove.length; i++) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [membersToRemove[i]], 'remove');
        successCount++;
        // Pequeña pausa entre eliminaciones para evitar límites
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(`Error al eliminar a ${membersToRemove[i]}:`, error);
        errorCount++;
      }
    }

    // Limpiar la acción pendiente
    delete global.pendingActions[m.chat];

    let resultMessage = `✅ *Operación completada*\n\n`;
    resultMessage += `👥 Miembros eliminados: ${successCount}\n`;
    if (errorCount > 0) {
      resultMessage += `❌ Errores: ${errorCount}\n`;
    }
    resultMessage += `\n🏁 Proceso finalizado.`;

    return m.reply(resultMessage);
  }

  // Comando para cancelar la eliminación
  if (command === 'cancelar' && m.text.includes('kickall')) {
    if (!global.pendingActions || !global.pendingActions[m.chat]) {
      return m.reply('❌ No hay una operación pendiente de eliminación.');
    }

    delete global.pendingActions[m.chat];
    return m.reply('✅ Operación de eliminación cancelada.');
  }

  // Comando original para eliminar un solo miembro
  let kickte = `*${xgc} Menciona algún participante que desea eliminar del grupo.*`

  if (!m.mentionedJid[0] && !m.quoted) return m.reply(kickte, m.chat, { mentions: conn.parseMention(kickte)})

  let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender
  let owr = m.chat.split`-`[0]

  // Verificamos si el usuario a eliminar es el creador del grupo
  let groupMetadata = await conn.groupMetadata(m.chat)
  let owner = groupMetadata.owner

  if (user === owner) {
    return m.reply(`🍭 No puedes eliminar al Creador del Grupo`)
  }

  await conn.groupParticipantsUpdate(m.chat, [user], 'remove')

  m.reply(`🍟 El participante @${user.split('@')[0]} lo desaparecieron.`, m.chat, {
    mentions: [user]
  })
}

handler.help = ['kick', 'kickall', 'confirmar kickall', 'cancelar kickall']
handler.tags = ['gc']
handler.command = ['kick', 'expulsar', 'ban', 'rip', 'sacar', 'remove', 'kickall', 'expulsartodos', 'banall', 'sacartodos', 'confirmar', 'cancelar'] 
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler

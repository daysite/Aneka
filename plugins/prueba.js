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

    m.reply(`🔄 Eliminando a ${membersToRemove.length} miembros del grupo...`);

    // Eliminar miembros en lotes para evitar errores
    for (let i = 0; i < membersToRemove.length; i++) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [membersToRemove[i]], 'remove');
        // Pequeña pausa entre eliminaciones para evitar límites
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(`Error al eliminar a ${membersToRemove[i]}:`, error);
      }
    }

    return m.reply(`✅ Se eliminaron ${membersToRemove.length} miembros del grupo.`);
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

handler.help = ['kick', 'kickall']
handler.tags = ['gc']
handler.command = ['kick', 'expulsar', 'ban', 'rip', 'sacar', 'remove', 'kickall', 'expulsartodos', 'banall', 'sacartodos'] 
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler

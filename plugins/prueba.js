let handler = async (m, { conn, participants, usedPrefix, command, isROwner }) => {
  try {
    // 1. Verificar restricción
    if (!global.db.data.settings[conn.user.jid].restrict) {
      return m.reply('🍭 El owner tiene restringido está opción');
    }

    // 2. Verificar que el comando se usa en grupo
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos');

    // 3. Obtener metadata del grupo con validación
    let groupMetadata;
    try {
      groupMetadata = await conn.groupMetadata(m.chat);
    } catch (e) {
      return m.reply('❌ No se pudo obtener la información del grupo');
    }

    // 4. Validar que el bot es administrador
    let botAdmin = groupMetadata.participants.find(p => p.id === conn.user.jid)?.admin;
    if (!botAdmin) {
      return m.reply('❌ Necesito ser administrador para usar este comando');
    }

    // 5. Obtener owner del grupo
    let owner = groupMetadata.owner || groupMetadata.participants.find(p => p.admin === 'superadmin')?.id;
    let botJid = conn.user.jid;

    // 6. Obtener participantes de forma segura
    let allParticipants = groupMetadata.participants.map(p => p.id) || [];
    
    // 7. Filtrar participantes a eliminar
    let usersToRemove = allParticipants.filter(user => 
      user !== owner && 
      user !== botJid &&
      user !== m.sender // No eliminar a quien ejecuta el comando
    );

    if (usersToRemove.length === 0) {
      return m.reply('🍭 No hay participantes para eliminar');
    }

    // 8. SISTEMA DE CONFIRMACÓN MEJORADO (sin conn.ev.wait)
    let confirmationKey = `${m.chat}_${m.sender}_kickall`;
    global.kickallConfirmation = global.kickallConfirmation || {};
    
    global.kickallConfirmation[confirmationKey] = {
      usersToRemove: usersToRemove,
      timestamp: Date.now()
    };

    await m.reply(
      `⚠️ *CONFIRMACIÓN REQUERIDA*\n\n` +
      `¿Eliminar a *${usersToRemove.length}* participantes?\n\n` +
      `Escribe: *${usedPrefix}confirmar kickall* para proceder\n` +
      `O: *${usedPrefix}cancelar kickall* para cancelar\n\n` +
      `⏰ Esta confirmación expira en 2 minutos`
    );

    // Esperar confirmación manual
    return;

  } catch (error) {
    console.error('Error en kickall:', error);
    m.reply('❌ Error interno del comando');
  }
}

// COMANDO DE CONFIRMACIÓN SEPARADO
let confirmHandler = async (m, { conn, usedPrefix, command }) => {
  try {
    let confirmationKey = `${m.chat}_${m.sender}_kickall`;
    let confirmation = global.kickallConfirmation?.[confirmationKey];
    
    if (!confirmation) {
      return m.reply('❌ No hay confirmación pendiente o expiró');
    }

    // Verificar expiración (2 minutos)
    if (Date.now() - confirmation.timestamp > 120000) {
      delete global.kickallConfirmation[confirmationKey];
      return m.reply('❌ La confirmación expiró');
    }

    let usersToRemove = confirmation.usersToRemove;
    
    // Eliminar la confirmación
    delete global.kickallConfirmation[confirmationKey];

    // Proceder con la eliminación
    await m.reply(`🔄 Eliminando ${usersToRemove.length} participantes...`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < usersToRemove.length; i += 5) {
      let batch = usersToRemove.slice(i, i + 5);
      
      try {
        await conn.groupParticipantsUpdate(m.chat, batch, 'remove');
        successCount += batch.length;
        
        // Pausa entre lotes
        if (i + 5 < usersToRemove.length) {
          await new Promise(resolve => setTimeout(resolve, 2500));
        }
      } catch (batchError) {
        failCount += batch.length;
        console.error('Error en lote:', batchError);
      }
    }

    let resultMessage = `✅ *Eliminación completada*\n\n` +
                       `✓ Eliminados: ${successCount}\n` +
                       (failCount > 0 ? `✖ Fallidos: ${failCount}` : '');

    await m.reply(resultMessage);

  } catch (error) {
    console.error('Error en confirmación:', error);
    m.reply('❌ Error al procesar la confirmación');
  }
}

// COMANDO DE CANCELACIÓN
let cancelHandler = async (m) => {
  let confirmationKey = `${m.chat}_${m.sender}_kickall`;
  if (global.kickallConfirmation?.[confirmationKey]) {
    delete global.kickallConfirmation[confirmationKey];
    m.reply('❌ Operación cancelada');
  } else {
    m.reply('❌ No hay confirmación pendiente');
  }
}

handler.help = ['kickall']
handler.tags = ['gc']
handler.command = ['kickall', 'expulsartodos', 'banall', 'sacartodos', 'removeall'] 
handler.admin = true
handler.group = true
handler.botAdmin = true
handler.owner = true

// Agregar handlers para confirmar y cancelar
export { handler as default, confirmHandler, cancelHandler }

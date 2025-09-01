let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
  let isEnable = /true|enable|(turn)?on|1/i.test(command)
  let chat = global.db.data.chats[m.chat]
  let user = global.db.data.users[m.sender]
  let bot = global.db.data.settings[conn.user.jid] || {}
  let type = (args[0] || '').toLowerCase()
  let isAll = false, isUser = false
  switch (type) {
  case 'welcome':
    case 'bv':
    case 'bienvenida':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn)
          throw false
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.welcome = isEnable
      break

  case 'antiPrivate':
    case 'antiprivado':
    case 'antipriv':
     isAll = true
        if (!isOwner) {
          global.dfail('rowner', m, conn)
          throw false
      }
      bot.antiPrivate = isEnable
      break

  case 'restrict':
    case 'restringir':
     isAll = true
        if (!isOwner) {
          global.dfail('rowner', m, conn)
          throw false
      }
      bot.restrict = isEnable
      break

 case 'antibot':
    case 'antibots':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.antiBot = isEnable
      break

 case 'antisubbots':
    case 'antisub':
    case 'antisubot':
    case 'antibot2':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.antiBot2 = isEnable
      break

 case 'antifake':
    case 'antifakes':
    case 'antiarabes':
    case 'antiarab':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.onlyLatinos = isEnable
      break

 case 'nsfw':
      case 'modohorny':
       if (m.isGroup) {
         if (!(isAdmin || isOwner)) {
           global.dfail('admin', m, conn)
            throw false
           }}
    chat.nsfw = isEnable          
    break

case 'autoaceptar':
case 'aceptarnuevos':
  if (m.isGroup) {
    if (!(isAdmin || isOwner)) {
      global.dfail('admin', m, conn)
      throw false
    }
    chat.autoaceptar = isEnable
  } else {
    global.dfail('group', m, conn)
    throw false
  }
  break

case 'antitraba':
case 'antivirus':
  if (m.isGroup) {
    if (!(isAdmin || isOwner)) {
      global.dfail('admin', m, conn)
      throw false
    }
    chat.antiTraba = isEnable
  } else {
    global.dfail('group', m, conn)
    throw false
  }
  break


 case 'modoadmin':
    case 'soloadmin':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.modoadmin = isEnable
      break

 case 'autoread':
    case 'autoleer':
    case 'autover':
      isAll = true
       if (!isROwner) {
         global.dfail('rowner', m, conn)
         throw false
      }
      global.opts['autoread'] = isEnable
      break

  case 'antiver':
    case 'antiocultar':
    case 'antiviewonce':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn)
          throw false
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.antiver = isEnable
      break

  case 'reaction':
    case 'reaccion':
    case 'emojis':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn)
          throw false
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.reaction = isEnable
      break

  case 'audios':
    case 'audiosbot':
    case 'botaudios':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn)
          throw false
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.audios = isEnable
      break

  case 'antiSpam':
    case 'antispam':
    case 'antispamosos':
     isAll = true
      if (!isOwner) {
      global.dfail('rowner', m, conn)
      throw false
      }
      bot.antiSpam = isEnable
      break

   case 'antidelete': 
     case 'antieliminar': 
     case 'delete':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
       global.dfail('admin', m, conn)
       throw false
     }}
     chat.delete = isEnable
     break

  case 'autobio':
    case 'status':
    case 'bio':
     isAll = true
        if (!isOwner) {
          global.dfail('rowner', m, conn)
          throw false
        }
      bot.autobio = isEnable
      break

  case 'jadibotmd':
    case 'serbot':
    case 'subbots':
     isAll = true
        if (!isOwner) {
          global.dfail('rowner', m, conn)
          throw false
      }
      bot.jadibotmd = isEnable
      break

  case 'detect':
    case 'configuraciones':
    case 'avisodegp':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn)
          throw false
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.detect = isEnable
      break

  case 'autoresponder':
    case 'chatbot':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn)
          throw false
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn)
        throw false
      }
      chat.autoresponder = isEnable
      break

    case 'document':
    case 'documento':
    isUser = true
    user.useDocument = isEnable
    break

    case 'antilink':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn)
          throw false
        }
      }
      chat.antiLink = isEnable
      break
    default:
      if (!/[01]/.test(command)) return conn.reply(m.chat, `
\`🍟 ENABLE - DISABLE\`

\`ゲ◜៹ Administración  ៹◞ゲ\`

${usedPrefix + command} welcome 
${usedPrefix + command} antibot
${usedPrefix + command} antibot2
${usedPrefix + command} antiarabes
${usedPrefix + command} antilink
${usedPrefix + command} antiver
${usedPrefix + command} antidelete
${usedPrefix + command} nsfw
${usedPrefix + command} modoadmin
${usedPrefix + command} reaction
${usedPrefix + command} audios
${usedPrefix + command} detect
${usedPrefix + command} chatbot

\`ゲ◜៹ Creador - Owner ៹◞ゲ\`

${usedPrefix + command} antispam
${usedPrefix + command} antiprivado
${usedPrefix + command} autoread
${usedPrefix + command} restrict
${usedPrefix + command} status
${usedPrefix + command} subbots`, fkontak)
      throw false
  }

  conn.reply(m.chat, `🍭 𝖫𝖺 𝗈𝗉𝖼𝗂𝗈́𝗇 ${type} se ${isEnable ? 'activó' : 'desactivó'} ${isAll ? 'para este bot' : isUser ? '' : 'para este chat'}`, fkontak)
}

handler.help = ['enable', 'disable', 'on', 'off']
handler.tags = ['config']
handler.command = ['enable', 'disable', 'on', 'off', '1', '0']

export default handler

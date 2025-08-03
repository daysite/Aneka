/* 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗦𝗵𝗮𝗱𝗼𝘄'𝘀 𝗖𝗹𝘂𝗯 🌺᭄
𝖢𝗋𝖾𝖺𝖽𝗈 𝗉𝗈𝗋 𝖣𝖾𝗏.𝖢𝗋𝗂𝗌𝗌 🇦🇱
https://whatsapp.com/channel/0029VauTE8AHltY1muYir31n*/

import db from '../lib/database.js'
const img = 'https://files.catbox.moe/zggh6y.jpg'

const fkontak2 = {
  key: {
    participants: "0@s.whatsapp.net",
    remoteJid: "status@broadcast",
    fromMe: false,
    id: "Halo"
  },
  message: {
    locationMessage: {
      name: `Banco - ${botname}`,
      jpegThumbnail: await (await fetch('https://cdn-sunflareteam.vercel.app/images/72184a0f56.png')).buffer()
    }
  },
  participant: "0@s.whatsapp.net"
};

let handler = async (m, { conn, usedPrefix }) => {
  const who = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
if (!who || who === conn.user.jid)
  return m.reply(`*${emojis} Debes mencionar o responder a un usuario válido.*`)

  if (!(who in global.db.data.users)) return m.reply(`*⚠️ El usuario no está registrado en la base de datos.*`)

  const user = global.db.data.users[who]
  const name = await conn.getName(who)
  const fecha = new Date().toLocaleString('es-PE')

  const txt = `🏦 *Bienvenido al Banco de Coins*
> Cuenta vinculada a: ${who === m.sender ? name : `@${who.split('@')[0]}`}

*💼 Detalles actuales:*
🪙 *Cartera:* ${user.diamantes}
🏦 *Banco:* ${user.bank}
💫 *Experiencia:* ${user.exp}
🆙 *Nivel:* ${user.level}
⚜️ *Role:* ${user.role}

Consulta tus finanzas, sube de nivel y gana recompensas.\n`.trim()

  const buttons = [
    { buttonId: `${usedPrefix}retirar all`, buttonText: { displayText: '🪙 Retirar Todo' }, type: 1 },
    { buttonId: `${usedPrefix}d all`, buttonText: { displayText: 'Depositar Todo 🏦' }, type: 1 }
  ]

  await conn.sendMessage(m.chat, {
    image: { url: img },
    caption: txt,
    footer: dev,
    buttons,
    mentions: [who],
    headerType: 4
  }, { quoted: fkontak2 })
}

/*
  await conn.sendFile(m.chat, img, 'perfil.jpg', txt, m, null, {
    mentions: [who]
  })
}*/

handler.help = ['bank']
handler.tags = ['rpg']
handler.command = ['bank', 'banco', 'banko']
handler.register = true
handler.group = true

export default handler
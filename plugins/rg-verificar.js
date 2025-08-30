import { createHash } from 'crypto'
import fetch from 'node-fetch'

const fkontak = {
  key: { participant: '0@s.whatsapp.net' },
  message: {
    locationMessage: {
      displayName: botname,
      vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${botname}\nTEL;type=CELL;type=VOICE;waid=0:0\nEND:VCARD`
    }
  }
}

let handler = async function (m, { conn, text, usedPrefix, command }) {
  const user = global.db.data.users[m.sender]
  const name2 = await conn.getName(m.sender)
  const Reg = /^(.*?)[.|] *?(\d{1,3})$/i

  if (user.registered === true)
    return m.reply(`🍭 Ya te encuentras registrado en mi base de datos.\nSi deseas eliminar tu registro usa la función \`#unreg\``)

  if (!Reg.test(text))
    return m.reply(`🍭 Por favor, ingresa tu nombre y edad para registrarte en mi base de datos.🍭\n> *\`Ejemplo:\`*\n> ${usedPrefix + command} ${name2}.20`)

  let [_, name, ageStr] = text.match(Reg) || []
  if (!name) return m.reply('*⚠️ El nombre no puede estar vacío.*')
  if (!ageStr) return m.reply('*⚠️ La edad no puede estar vacía.*')
  if (name.length > 30) return m.reply('*⚠️ El nombre es muy largo (máx 30 caracteres).*')

  let age = parseInt(ageStr)
  if (isNaN(age)) return m.reply('*👴🏻 Qué haces acá, no deberías estar en el cementerio?*')
  if (age < 5 || age > 100) return m.reply('*👶🏻 Mira el nenito quiere jugar al bot*')

  await m.react('🍟')

  Object.assign(user, {
    name: name.trim(),
    age,
    regTime: +new Date(),
    registered: true,
    diamantes: (user.coins || 0) + 15,
    exp: (user.exp || 0) + 245,
  })

  const perfil = await conn.profilePictureUrl(m.sender, 'image').catch(() => 'https://files.catbox.moe/xr2m6u.jpg')
  const img = await (await fetch(perfil)).buffer()
  const sn = createHash('md5').update(m.sender).digest('hex')

  const shortText = `\`\`\`REGISTRO COMPLETO\`\`\``
  const fullText = `
  
👤 \`Nombre:\` ${user.name}
📅 \`Edad:\` ${user.age} años

> 𝖢𝗈𝗅𝗈𝖼𝖺 *#profile* 𝗉𝖺𝗋𝖺 𝗏𝖾𝗋 𝗍𝗎 𝗉𝖾𝗋𝖿𝗂𝗅`.trim()

  await conn.sendLuffy(m.chat, shortText, dev, fullText, img, img, 'https://instagram.com/dev.criss_vx', fkontak)
  await m.react('✅')
}

handler.help = ['reg']
handler.tags = ['rg']
handler.command = ['verify', 'verificar', 'reg', 'register', 'registrar']

export default handler

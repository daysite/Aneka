import { createHash } from 'crypto'
import fetch from 'node-fetch'

const fkontak = {
  key: { participant: '0@s.whatsapp.net' },
  message: {
    locationMessage: { displayName: `${botname}`, vcard: '' }
  }
}

let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i

let handler = async function (m, { conn, text, usedPrefix, command }) {
  const user = global.db.data.users[m.sender]

  if (user.registered === true) {
    return m.reply(`*🍚 Ya te encuentras registrado en mi base de datos.*\n*Si deseas eliminar tu registro use la función \`#unreg\`*`)
  }

  if (!Reg.test(text)) {
    return m.reply(`*🍚 Por favor, ingresa tu nombre y edad para registrarte en mi base de datos.*\n> *\`Ejemplo:\`*\n> ${usedPrefix + command} ${name2}.20`)
  }

  let [_, name, __, age] = text.match(Reg)
  if (!name) return m.reply('*⚠️ El nombre no puede estar vacío.*')
  if (!age) return m.reply('*⚠️ La edad no puede estar vacía.*')
  if (name.length > 30) return m.reply('*⚠️ El nombre es muy largo (máx 30 caracteres).*')

  age = parseInt(age)
  if (isNaN(age)) return m.reply('*👴🏻 Qué haces acá, no deberías estar en el cementerio?*')
  if (age < 5 || age > 100) return m.reply('*👶🏻 Mira el nenito quiere jugar al bot*')

await m.react('💌')

  user.name = name.trim()
  user.age = age
  user.regTime = +new Date
  user.registered = true
  user.money += 600
  user.coins += 15
  user.exp += 245
  user.joincount += 5

  let perfil = await conn.profilePictureUrl(m.sender, 'image')
    .catch(() => 'https://files.catbox.moe/xr2m6u.jpg')
  let img = await (await fetch(perfil)).buffer()

  const sn = createHash('md5').update(m.sender).digest('hex')

  let shortText = `⊱『💚𝆺𝅥 𝗥𝗘𝗚𝗜𝗦𝗧𝗥𝗔𝗗𝗢(𝗔) 𝆹𝅥💚』⊰'`
  let title = dev
  let fullText = `*Registro - ${botname}*

- *Nombre:* ${user.name}
- *Edad:* ${user.age} años

*Recompensas:*

🪙 15 ShadowCoins
💫 245 Exp

> ✎ Usa *.profile* para ver tu perfil.`.trim()

  await conn.sendLuffy(m.chat, shortText, title, fullText, img, img, 'https://instagram.com/dev.criss_vx', fkontak)
  await m.react('✅')
}

handler.help = ['reg']
handler.tags = ['rg']
handler.command = ['verify', 'verificar', 'reg', 'register', 'registrar']

export default handler
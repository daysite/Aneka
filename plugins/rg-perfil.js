/*
import fetch from 'node-fetch'

const loadMarriages = () => {
  const path = './src/database/marry.json'
  global.db.data.marriages = fs.existsSync(path)
    ? JSON.parse(fs.readFileSync(path, 'utf-8'))
    : {}
}

const handler = async (m, { conn }) => {
  loadMarriages()

  const userId = m.quoted?.sender || m.mentionedJid?.[0] || m.sender
  const user = global.db.data.users[userId] || {}

  const nme = await conn.getName(userId)
  const tag = `@${userId.split('@')[0]}`
  const name = user.registered && user.name ? user.name : await conn.getName(userId)
  const perfilUrl = await conn.profilePictureUrl(userId, 'image')
    .catch(() => 'https://files.catbox.moe/xr2m6u.jpg')
  const img = await (await fetch(perfilUrl)).buffer()

  const birth = user.birth || 'No especificado'
  const edad = user.age || 'No registrada'
  const desc = user.descripcion || 'Sin descripción'
  const exp = user.exp || 0
  const level = user.level || 0
  const role = user.role || 'Novato'
  const coin = user.diamantes || 0
  const bank = user.bank || 0
  const premium = user.premium ? '✅' : '❌'
  const registered = user.registered ? '✅' : '❌'

  const isMarried = userId in global.db.data.marriages
  const partner = isMarried ? global.db.data.marriages[userId] : null
  const partnerName = partner ? await conn.getName(partner) : 'Nadie'

  const textoCorto = `Perfil de ${nme}`
  const tituloDecorado = club
  const textoLargo = `
=͟͟͞͞ ✿  *𝖯𝖾𝗋𝖿𝗂𝗅 𝖽𝖾𝗅 𝖴𝗌𝗎𝖺𝗋𝗂𝗈  ←╮*
╰ ࣪ ˖ ∿ ${tag}

> ${desc}

∘🌴.• *Nombre:* ${name}
∘🌿.• *Edad:* ${edad}
∘🌺.• *Cumpleaños:* ${birth}
∘💍.• *Casado/a con:* ${partnerName}

ᦷᩘᦷ *Experiencia:* ${exp.toLocaleString()}
ᦷᩘᦷ *Nivel:* ${level}
ᦷᩘᦷ *Rango:* ${role}
ᦷᩘᦷ *Premium:* ${premium}
ᦷᩘᦷ *Registro:* ${registered}

💎 *Diamantes:* \`${coin.toLocaleString()}\` 
🏦 *Banco:* \`${bank.toLocaleString()}\`
`.trim()

  await conn.sendLuffy(m.chat, textoCorto, tituloDecorado, textoLargo, img, img, 'https://instagram.com/dev.criss_vx', fkontak, { mentions: [user.Id] })
  await m.react('🪪')
}

handler.help = ['profile']
handler.tags = ['rg']
handler.command = ['profile', 'perfil']

export default handler
*/

import fs from 'fs'
import fetch from 'node-fetch'

const loadMarriages = () => {
  const path = './src/database/marry.json'
  global.db.data.marriages = fs.existsSync(path)
    ? JSON.parse(fs.readFileSync(path, 'utf-8'))
    : {}
}

const handler = async (m, { conn }) => {
  loadMarriages()

  const userId = m.quoted?.sender || m.mentionedJid?.[0] || m.sender
  const user = global.db.data.users[userId] || {}

  const nme = await conn.getName(userId)
  const tag = `@${userId.split('@')[0]}`
  const name = user.registered && user.name ? user.name : nme
  const perfilUrl = await conn.profilePictureUrl(userId, 'image')
    .catch(() => 'https://files.catbox.moe/xr2m6u.jpg')
  const img = await (await fetch(perfilUrl)).buffer()

  const birth = user.birth || 'No especificado'
  const edad = user.age || 'No registrada'
  const desc = user.descripcion || 'Sin descripción'
  const exp = user.exp || 0
  const level = user.level || 0
  const role = user.role || 'Novato'
  const coin = user.diamantes || 0
  const bank = user.bank || 0
  const premium = user.premium ? '✅' : '❌'
  const registered = user.registered ? '✅' : '❌'

  const isMarried = userId in global.db.data.marriages
  const partner = isMarried ? global.db.data.marriages[userId] : null
  const partnerName = partner ? await conn.getName(partner) : 'Nadie'

  const textoCorto = `Perfil de ${nme}`
  const tituloDecorado = club // <- no tocar, como pediste
  const textoLargo = `
=͟͟͞͞ ✿  *𝖯𝖾𝗋𝖿𝗂𝗅 𝖽𝖾𝗅 𝖴𝗌𝗎𝖺𝗋𝗂𝗈  ←╮*
╰ ࣪ ˖ ∿ ${tag}

> ${desc}

∘🌴.• *Nombre:* ${name}
∘🌿.• *Edad:* ${edad}
∘🌺.• *Cumpleaños:* ${birth}
∘💍.• *Casado/a con:* ${partnerName}

ᦷᩘᦷ *Experiencia:* ${exp.toLocaleString()}
ᦷᩘᦷ *Nivel:* ${level}
ᦷᩘᦷ *Rango:* ${role}
ᦷᩘᦷ *Premium:* ${premium}
ᦷᩘᦷ *Registro:* ${registered}

💎 *Diamantes:* \`${coin.toLocaleString()}\` 
🏦 *Banco:* \`${bank.toLocaleString()}\`
`.trim()

  await conn.sendLuffy(m.chat, textoCorto, tituloDecorado, textoLargo, img, img, 'https://instagram.com/dev.criss_vx', fkontak, {
    mentions: [userId] // ← corregido: antes tenías "user.Id"
  })

  await m.react('🪪')
}

handler.help = ['profile']
handler.tags = ['rg']
handler.command = ['profile', 'perfil']

export default handler
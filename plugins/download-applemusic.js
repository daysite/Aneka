import fetch from 'node-fetch'

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  if (!text) throw `${xtools} Por favor, ingresa un nombre de usuario de Instagram\n📌 Ejemplo:\n${usedPrefix + command} dev.criss_vx`

  let res = await fetch(`https://api.vreden.my.id/api/igstalk?query=${encodeURIComponent(text)}`)
  if (!res.ok) throw `🚫 Error al obtener datos del perfil.`

  let json = await res.json()
  if (!json.result || !json.result.user) throw `⚠️ Usuario no encontrado.`

  let user = json.result.user
  let img = user.hd_profile_pic_url || user.profile_pic_url
  //let img = json.result.image || user.hd_profile_pic_url || user.profile_pic_url
  let url = user.external_url || '-'
  let bio = user.biography || '-'

  let info = `
\`\`\`乂 STALKER - INSTAGRAM\`\`\`

*👤 Usuario:* @${user.username}
*🌴 Nombre:* ${user.full_name || '-'}
*🍁 Posts:* ${user.media_count}
*📄 Biografía:* ${bio}
*⛓️ Enlaces:* ${url}
*🌵 Categoría:* ${user.category || 'No definida'}
*👥 Seguidores:* ${user.follower_count.toLocaleString()}
*📧 Siguiendo:* ${user.following_count.toLocaleString()}
*🔐 Cuenta:* ${user.is_private ? 'Sí 🔒' : 'No 🔓'}
`.trim()

  await conn.sendFile(m.chat, img, 'perfil.jpg', info, m)
}

handler.help = ['igstalk <usuario>']
handler.tags = ['tools']
handler.command = /^igstalk$/i

export default handler
/* 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗦𝗵𝗮𝗱𝗼𝘄'𝘀 𝗖𝗹𝘂𝗯 🌺᭄
𝖢𝗋𝖾𝖺𝖽𝗈 𝗉𝗈𝗋 𝖣𝖾𝗏.𝖢𝗋𝗂𝗌𝗌 🇦🇱
https://whatsapp.com/channel/0029VauTE8AHltY1muYir31n */

import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) {
      throw `*${xtools} Por favor, ingresa un nombre de usuario de Instagram.*\n> *\`Ejemplo:\`* ${usedPrefix + command} dev.criss_vx`
    }

    await m.react('🔎')

    const res = await fetch(`https://api.vreden.my.id/api/igstalk?query=${encodeURIComponent(text)}`)
    if (!res.ok) throw `*✖️ Error al obtener datos del perfil. Código:* ${res.status}`

    const json = await res.json()
    const user = json?.result?.user
    if (!user) throw `*⚠️ No se encontró el usuario: ${text}*`

    const {
      username, full_name, biography, external_url,
      category, follower_count, following_count,
      media_count, is_private, profile_pic_url, hd_profile_pic_url
    } = user

    const img = hd_profile_pic_url || profile_pic_url
    const url = external_url || '-'
    const bio = biography?.trim() || '-'

    const info = `
\`\`\`乂 STALKER - INSTAGRAM\`\`\`

*👤 Usuario:* @${username}
*🌴 Nombre:* ${full_name || '-'}
*🍁 Posts:* ${media_count}
*📄 Biografía:* ${bio}
*⛓️ Enlaces:* ${url}
*🌵 Categoría:* ${category || 'No definida'}
*👥 Seguidores:* ${follower_count?.toLocaleString() || '-'}
*📧 Siguiendo:* ${following_count?.toLocaleString() || '-'}
*🔐 Cuenta:* ${is_private ? 'Sí 🔒' : 'No 🔓'}

> ${club}`.trim()

    await conn.sendFile(m.chat, img, 'perfil.jpg', info, m)
    await m.react('✅')

  } catch (e) {
    if (typeof e !== 'string') {
      await m.react('✖️')
      console.error('[IGSTALK]', e)
    }
    throw typeof e === 'string' ? e : '*✖️ Ocurrió un error inesperado. Intenta nuevamente.*'
  }
}

handler.help = ['igstalk']
handler.tags = ['tools']
handler.command = ['igstalk', 'stalkig', 'igstalker', 'instagramstalk']

export default handler
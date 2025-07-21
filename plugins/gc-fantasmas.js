
let handler = async (m, { conn, text, participants }) => {
  const member = participants.map(u => u.id)
  let sum = text ? parseInt(text) : member.length
  if (isNaN(sum) || sum <= 0) sum = member.length
  if (sum > member.length) sum = member.length

  let total = 0
  let sider = []

  for (let i = 0; i < sum; i++) {
    const id = member[i]
    const users = m.isGroup ? participants.find(u => u.id === id) : {}
    const user = global.db.data.users[id]
    const attx = '☕ 𝖤𝗌𝗍𝖾 𝗆𝖾𝗇𝗌𝖺𝗃𝖾 𝗉𝗎𝖾𝖽𝖾 𝗇𝗈 𝗌𝖾𝗋 𝖼𝗈𝗆𝗉𝗅𝖾𝗍𝖺𝗆𝖾𝗇𝗍𝖾 𝗉𝗋𝖾𝖼𝗂𝗌𝗈, 𝖾𝗅 𝖻𝗈𝗍 𝖼𝗈𝗆𝗂𝖾𝗇𝗓𝖺 𝖺 𝗆𝗈𝗇𝗂𝗍𝗈𝗋𝖾𝖺𝗋 𝗅𝖺 𝗂𝗇𝖺𝖼𝗍𝗂𝗏𝗂𝖽𝖺𝖽 𝖽𝖾𝗌𝖽𝖾 𝖾𝗅 𝗆𝗈𝗆𝖾𝗇𝗍𝗈 𝖾𝗇 𝗊𝗎𝖾 𝗌𝖾 𝗎𝗇𝗂ó.'
    const isInactive = !user || user.chat === 0
    const isNotAdmin = !users?.admin && !users?.superAdmin
    const isNotWhitelisted = user ? user.whitelist === false : true

    if (isInactive && isNotAdmin && isNotWhitelisted) {
      total++
      sider.push(id)
    }
  }

  if (total === 0) return conn.reply(m.chat, `⚠️ En este grupo no hay fantasmas.`, m)

  let mensaje = `*${await conn.getName(m.chat)}*\n> *\`𝖨𝗇𝗍𝖾𝗀𝗋𝖺𝗇𝗍𝖾𝗌:\`* ${sum}\n> *\`𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝗈𝗌:\`* ${total}\n\n━━ *_ETIQUETAS_*\n${sider.map(v => 'യ ׄ👻 @' + v.replace(/@.+/, '')).join('\n')}\n`

  await conn.sendMessage(m.chat, {
    text: mensaje,
    mentions: sider,
    footer: attx,
    buttons: [
      {
        buttonId: `.kickfantasmas`,
        buttonText: { displayText: '🚮 𝖤𝗅𝗂𝗆𝗂𝗇𝖺𝗋 𝖿𝖺𝗇𝗍𝖺𝗌𝗆𝖺𝗌' },
        type: 1
      }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.help = ['fantasmas']
handler.tags = ['gc']
handler.command = /^(fantasmas|sider)$/i
handler.admin = true
handler.botAdmin = true

export default handler
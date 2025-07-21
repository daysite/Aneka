/*
let handler = async (m, { conn, text, participants }) => {
let member = participants.map(u => u.id)
if(!text) {
var sum = member.length
} else {
var sum = text} 
var total = 0
var sider = []
for(let i = 0; i < sum; i++) {
let users = m.isGroup ? participants.find(u => u.id == member[i]) : {}
if((typeof global.db.data.users[member[i]] == 'undefined' || global.db.data.users[member[i]].chat == 0) && !users.isAdmin && !users.isSuperAdmin) { 
if (typeof global.db.data.users[member[i]] !== 'undefined'){
if(global.db.data.users[member[i]].whitelist == false){
total++
sider.push(member[i])}
}else {
total++
sider.push(member[i])}}}
if(total == 0) return conn.reply(m.chat, `⚠️ En este grupo no hay fantasmas.`, m)

m.reply(`*${await conn.getName(m.chat)}*\n> *\`𝖨𝗇𝗍𝖾𝗀𝗋𝖺𝗇𝗍𝖾𝗌:\`* ${sum}\n\n  ━━ *_ETIQUETAS_*\n${sider.map(v => 'യ ׄ👻 @' + v.replace(/@.+/, '')).join('\n')}\n\n> 🪶 *\`Nota:\`* Este mensaje puede no ser completamente preciso. El bot comienza a monitorear la inactividad desde el momento en que se unió.`, null, { mentions: sider })}

handler.help = ['fantasmas']
handler.tags = ['gc']
handler.command = /^(fantasmas|sider)$/i
handler.admin = true
handler.botAdmin = true

export default handler*/

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

    const isInactive = !user || user.chat === 0
    const isNotAdmin = !users?.admin && !users?.superAdmin
    const isNotWhitelisted = user ? user.whitelist === false : true

    if (isInactive && isNotAdmin && isNotWhitelisted) {
      total++
      sider.push(id)
    }
  }

  if (total === 0) return conn.reply(m.chat, `⚠️ En este grupo no hay fantasmas.`, m)

  let mensaje = `*${await conn.getName(m.chat)}*\n> *\`𝖨𝗇𝗍𝖾𝗀𝗋𝖺𝗇𝗍𝖾𝗌:\`* ${sum}\n> *\`𝖨𝗇𝖺𝖼𝗍𝗂𝗏𝗈𝗌:\`* ${total}\n\n━━ *_ETIQUETAS_*\n${sider.map(v => 'യ ׄ👻 @' + v.replace(/@.+/, '')).join('\n')}\n\n> 🪶 *\`Nota:\`* Este mensaje puede no ser completamente preciso. El bot comienza a monitorear la inactividad desde el momento en que se unió.`

  await conn.sendMessage(m.chat, {
    text: mensaje,
    mentions: sider,
    footer: club,
    buttons: [
      {
        buttonId: `.kickfantasmas`,
        buttonText: { displayText: '𝖤𝗅𝗂𝗆𝗂𝗇𝖺𝗋 𝖿𝖺𝗇𝗍𝖺𝗌𝗆𝖺𝗌' },
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
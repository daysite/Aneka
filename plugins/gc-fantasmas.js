
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

m.reply(`

*${await conn.getName(m.chat)}*
> *\`𝖨𝗇𝗍𝖾𝗀𝗋𝖺𝗇𝗍𝖾𝗌:\`* ${sum}

  ━━ *_ETIQUETAS_*
${sider.map(v => 'യ ׄ👻 @' + v.replace(/@.+/, '')).join('\n')}

> 🪶 Nota: Esto no es al 100% correcto, el bot inicia el control de inactivos desde que se unió.`, null, { mentions: sider })}

handler.help = ['fantasmas']
handler.tags = ['gc']
handler.command = /^(fantasmas|sider)$/i
handler.admin = true
handler.botAdmin = true

export default handler
/*import fetch from 'node-fetch';

const handler = async (m, { conn, usedPrefix, isPrems }) => {
try {
await m.react('👑');

const _uptime = process.uptime() * 1000;  
const uptime = clockString(_uptime);  

let totalreg = Object.keys(global.db.data.users).length  
let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length  
const pp = 'https://files.catbox.moe/9d4ria.jpg';  
const img = await (await fetch(pp)).buffer()  
const shadow = `${date}`;  
const taguser = '@' + m.sender.split('@s.whatsapp.net')[0];  
const txt = `${await conn.getName(m.sender)}, Welcome to my developer menu, follow me on Instagram, thank you very much.`;  

const text = `

꡴ㅤ   ︵ᤢ⏜   ᷃ᩚ   ☕᪶     ᷃ᩚ ⏜ᤢ︵    ㅤ᪬
Hola  ׅ ෫ׄ᷼͝${taguser}  ಒ
‎ ‎ ‎ ‎౨ৎ  ‎ ‎ ‎ ‎Bienvenido ‎ ‎  ‎ ‎✿̮    ׅ  al   ୂ
⿻    𝖬𝖾𝗇𝗎    ෨    𝖮𝗐𝗇𝖾𝗋    𑇙ᰍ

🌴 Nombre: Shadow Ultra
☕ Creador: Cristian
📚 Librería: Baileys
⏰ Uptime: ${uptime}
🚀 Type: NodeJs
🧇 Usuarios regs: ${rtotalreg}
🥞 Usuarios totales: ${totalreg}
${readMore}
෨   `Lista de Comandos`    𓈒𓏸    ☁︎
𑂯 ׁ${xowner} ${usedPrefix}update
𑂯 ׁ${xowner} ${usedPrefix}leavegc
𑂯 ׁ${xowner} ${usedPrefix}blocklist
𑂯 ׁ${xowner} ${usedPrefix}grouplist
𑂯 ׁ${xowner} ${usedPrefix}restart
𑂯 ׁ${xowner} ${usedPrefix}join
𑂯 ׁ${xowner} ${usedPrefix}chetar
𑂯 ׁ${xowner} ${usedPrefix}banchat
𑂯 ׁ${xowner} ${usedPrefix}unbanchat
𑂯 ׁ${xowner} ${usedPrefix}banuser
𑂯 ׁ${xowner} ${usedPrefix}unbanuser
𑂯 ׁ${xowner} ${usedPrefix}dsowner
𑂯 ׁ${xowner} ${usedPrefix}autoadmin

> ${club}
`.trim();



await conn.sendLuffy(m.chat, txt, shadow, text, img, img, ig, fkontak)

} catch (e) {
conn.reply(m.chat, '✖️ Error en el comando. Inténtalo más tarde.', m);
}
};

handler.command = /^(menuowner)$/i;
handler.fail = null;
export default handler;

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)
function clockString(ms) {
let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}*/


// MENU OWNER BY DEV.CRISS

let handler = async (m, { conn, usedPrefix: _p }) => {

let tag = @${m.sender.split('@')[0]}
let tags = { owner: 'Owner' }
let imgPath = './src/catalogo.jpg'

const own = {
before: (name, readMore) => `
ㅤᨦ۪۪۪۪ׄ᷼ㅤ֢ㅤׄㅤׅ֟፝ㅤ⋱ㅤ⁝ㅤ⋰ㅤׅ፝֟ㅤׄㅤ֢ㅤ۪۪۪۪ׄ᷼ഒ
🌺 ׅ  ¡Hola! ¿Como estás?  ৎ୭
ׅ ෫${tag}  ಒ
‎ ‎ ‎ ‎౨ৎ  ‎ ‎ ‎ ‎Bienvenido ‎ ‎  ‎ ‎✿̮    ׅ  al   ୂ
⿻     𝖬𝖾𝗇𝗎    ෨    𝖮𝗐𝗇𝖾𝗋    𑇙ᰍ

🌴 Nombre: Shadow Ultra
☕ Creador: Cristian
📚 Librería: Baileys
⏰ Uptime: 26:48:07
🚀 Type: NodeJs
🧇 Usuarios regs: 5
🥞 Usuarios totales: 1594
,   header: category => ┏━━⪩「 ${category} 」⪨,   body: cmd => ┃ ${cmd}`,
footer: '┗━━━━━━━━━━━━━━━⪩',
after: ''
}

let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => ({
help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
}))

let groups = {}
for (let tag in tags) {
groups[tag] = help.filter(plugin => plugin.tags.includes(tag))
}

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

let text = [
defaultMenu.before(name, readMore),
...Object.keys(tags).map(tagKey => {
return defaultMenu.header(tags[tagKey]) + '\n' + [
...groups[tagKey].map(plugin =>
plugin.help.map(cmd =>
defaultMenu.body(_p + cmd)
).join('\n')
),
defaultMenu.footer
].join('\n')
}),
defaultMenu.after
].join('\n')

await m.react('🤴🏻')
await conn.sendMessage(m.chat, {
image: { url: imgPath },
caption: text,
mentions: [m.sender]
}, { quoted: m })
}

handler.help = ['menueconomia']
handler.tags = ['rpg']
handler.command = ['menue', 'menueco', 'menueconomia']

export default handler
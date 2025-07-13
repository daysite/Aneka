/*import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) return m.reply(`*${xsearch} Por favor, ingrese el nombre de una pelicula*\n> *\`Ejemplo:\`* ${usedPrefix + command} Venom 3 The last Dance`)

try {
let api = await fetch(`https://delirius-apiofc.vercel.app/search/cuevana?q=${encodeURIComponent(text)}`)
let json = await api.json()

let JT = `\`\`\`乂 CUEVANA - SEARCH\`\`\``;
json.data.forEach((app, index) => {
      JT += `\n\n*\`${index + 1}\`*`
      JT += `\n≡ 🌴 *\`Title:\`* ${app.title}`
      JT += `\n≡ 🍃 *\`Description:\`* ${app.description}`
      JT += `\n≡ 🌿 *\`Link:\`* ${app.link}`
}) 

m.reply(JT)
} catch (error) {
console.error(error)
}}

handler.help = ['cuevana'];
handler.tag = ['buscador'];
handler.command = /^(cuevana|cuevanasearch|gnula)$/i

export default handler*/

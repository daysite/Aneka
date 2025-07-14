

let handler = async (m, { conn, usedPrefix, command, text }) => {

    if (!text) return m.reply(`*${xfun} Por favor, ingresa el nombre de alguna persona.*\n> *\`Ejemplo:\`* ${usedPrefix + command} Shadow`)





*│ 💪🏻 Coraje:* 
*│ 😨 Miedo:* 
*│ 🌟 Fama:* 
*│ 🚻 Género:* 
*╰╼━━━━━━━━━━━━─⪩*



  let personalidad = `
*╭╼━•♡ 𝖯𝖾𝗋𝗌𝗈𝗇𝖺𝗅𝗂𝖽𝖺𝖽 ♡•━─*
*│ 💫 Nombre:* ${text}
*│ 🙂 Buena moral:* ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98,3%','99,7%','99,9%','1%','2,9%','0%','0,4%'])}
*│ 🙄 Mala moral:* ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98,3%','99,7%','99,9%','1%','2,9%','0%','0,4%'])}
*│ 💟 Tipo de persona:* ${pickRandom(['De buen corazón','Arrogante','Tacaño','Generoso','Humilde','Tímido','Cobarde','Entrometido','Cristal','No binarie XD', 'Pendejo'])}
*│ 🪶 Siempre:* ${pickRandom(['Pesado','De malas','Distraido','De molestoso','Chismoso','Pasa jalandosela','De compras','Viendo anime','Chatea en WhatsApp porque esta soltero','Acostado bueno para nada','De mujeriego','En el celular'])}
*│ 🤓 Inteligencia:* ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98,3%','99,7%','99,9%','1%','2,9%','0%','0,4%'])}
*│ 🤯 Morosidad:* ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98,3%','99,7%','99,9%','1%','2,9%','0%','0,4%'])}
*┃• Coraje* : ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98,3%','99,7%','99,9%','1%','2,9%','0%','0,4%'])}
*┃• Miedo* : ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98,3%','99,7%','99,9%','1%','2,9%','0%','0,4%'])}
*┃• Fama* : ${pickRandom(['6%','12%','20%','27%','35%','41%','49%','54%','60%','66%','73%','78%','84%','92%','93%','94%','96%','98,3%','99,7%','99,9%','1%','2,9%','0%','0,4%'])}
*┃• Género* : ${pickRandom(['Hombre', 'Mujer', 'Homosexual', 'Bisexual', 'Pansexual', 'Feminista', 'Heterosexual', 'Macho alfa', 'Mujerzona', 'Marimacha', 'Palosexual', 'PlayStationSexual', 'Sr. Manuela', 'Pollosexual'])}
┗━━━━━━━━━━━━━━━━
`
conn.reply(m.chat, personalidad, fkontak, { mentions: conn.parseMention(personalidad) })
}
handler.help = ['personalidad']
handler.tags = ['fun']
handler.command = /^personalidad/i

export default handler 

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}
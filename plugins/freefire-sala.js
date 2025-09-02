
let toM = a => '@' + a.split('@')[0]
function handler(m, { groupMetadata }) {
let ps = groupMetadata.participants.map(v => v.id)
let a = ps.getRandom()
let b
do b = ps.getRandom()
while (b === a)

  let mensajes = [
    `${toM(a)} Vaya entrando al fifayer te toca poner la sala`,
    `${toM(a)} No te me escondas que esta vez vas a donar la sala`,
    `${toM(a)} ¡La sala mijo yaya!`,
    `${toM(a)} La sala cabrón, ¡Ya va a empezar!`,
    `${toM(a)} Donde estás pendejo, ¡Esta vez te toca poner sala a vos!`,
    `${toM(a)} Pepara esa sala oe gil fast`,
    `${toM(a)} Apurate que te toca poner la sala`,
    `${toM(a)} ¡Deja de dormir! Crea la sala gei`,
    `${toM(a)} ¡Le tocó poner sala a este pobre diablo!`,
    `${toM(a)} ¡Le tocó poner sala al más malo del grupo`,
    `${toM(a)} Le tocó poner la sala bro`,
    `${toM(a)} Le tocó poner sala al cachudo del grupo`,
    `${toM(a)} le toco poner sala a la cachuda del grupo`,
    `*${toM(a)}¡Le tocó poner sala apurate`
]

  let mensajeAleatorio = mensajes[Math.floor(Math.random() * mensajes.length)]

  m.reply(mensajeAleatorio, null, { mentions: [a, b] })
}

handler.help = ['donarsala']
handler.tags = ['ff', 'ffgc']
handler.command = ['donarsala', 'sala']
handler.group = true
export default handler

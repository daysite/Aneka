let toM = a => '@' + a.split('@')[0]

function handler(m, { groupMetadata, args }) {
  let ps = groupMetadata.participants.map(v => v.id)
  let a = ps.getRandom()
  let b
  do b = ps.getRandom()
  while (b === a)

  let premio = args.join(' ')?.trim()

  let mensajes = [
    `*${toM(a)} ¡Felicidades! Eres el ganador del sorteo.*\n*¡Disfruta de tu premio 🥳!*`,
    `*${toM(a)} ¡Enhorabuena! Has sido seleccionado como el ganador del sorteo. ¡Bien hecho! 🎉*`,
    `*${toM(a)} ¡La suerte te sonríe! Has sido seleccionado como el ganador del sorteo.*\n*¡Aprovecha al máximo tu premio! 🍨*`,
    `*${toM(a)} ¡No te lo vas a creer! Eres el ganador del sorteo. ¡Parece que la suerte te ha sonreído!* 😯`,
    `*${toM(a)} ¡Lo lograste! Eres el ganador del sorteo. ¡No te rindas, sigue participando y quién sabe, tal vez ganes de nuevo!* 😊`,
    `*${toM(a)} ¡Ganaste! Eres el afortunado ganador del sorteo. 🏆*`,
    `*${toM(a)} ¡Enhorabuena! Has sido seleccionado como el ganador del sorteo. ¡No te preocupes, no te vamos a pedir que devuelvas el premio! 🎊*`
  ]

  let mensajesConPremio = [
    `*${toM(a)} ¡Felicidades! Eres el ganador del sorteo, te llevas \`${premio}.\`*\n*¡Disfruta de tu premio 🥳!*`,
    `*${toM(a)} ¡Enhorabuena! Has sido seleccionado como el ganador del sorteo y ganaste \`${premio}.\` ¡Bien hecho! 🎉*`,
    `*${toM(a)} ¡La suerte te sonríe! Has sido seleccionado como el ganador del sorteo y ganaste \`${premio}.\`*\n*¡Aprovecha al máximo tu premio! 🍨*`,
    `*${toM(a)} ¡No te lo vas a creer! Ganaste \`${premio}\` en el sorteo. ¡Parece que la suerte te ha sonreído!* 😯`,
    `*${toM(a)} ¡Lo lograste! Ganaste \`${premio}\` en el sorteo. ¡No te rindas, sigue participando y quién sabe, tal vez ganes de nuevo!* 😊`,
    `*${toM(a)} ¡Ganaste! Eres el afortunado ganador de \`${premio}.\` 🏆*`,
    `*${toM(a)} ¡Enhorabuena! Has sido seleccionado como el ganador del sorteo y te llevas \`${premio}.\` ¡No te preocupes, no te vamos a pedir que lo devuelvas! 🎊*`
  ]

  let mensaje = premio
    ? mensajesConPremio[Math.floor(Math.random() * mensajesConPremio.length)]
    : mensajes[Math.floor(Math.random() * mensajes.length)]

  m.reply(mensaje, null, { mentions: [a, b] })
}

handler.help = ['sorteo']
handler.tags = ['fun']
handler.command = ['sorteo', 'sortear']
handler.group = true

export default handler
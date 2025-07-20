import fetch from 'node-fetch'

let handler = async (m, { conn, text, command }) => {
  if (!text) throw `*${xtools} Por favor, ingresa una tarjeta con el formato correcto.*\n> *\`Ejemplo:\`* ${command} 5154620086381074|04|2027|672`

  const api = `https://www.dark-yasiya-api.site/other/cc-check?cc=${encodeURIComponent(text)}`
  m.reply('*⏳ Verificando la tarjeta, espera un momento...*')

  try {
    const res = await fetch(api)
    if (!res.ok) throw '*✖️ Error al conectar con la API.*'

    const json = await res.json()
    const card = json?.result?.card || {}
    const result = json?.result || {}

    let msg = `*ゲ◜៹ Tools - CCChecker ៹◞ゲ*

° *💚 Estado:* ${result.status === 'Live' ? 'LIVE 🟢' : 'DIE 🔴'}
° *📧 Mensaje:* ${result.message || 'Ninguno'}
° *🏷️ Marca:* ${card.brand || 'Desconocida'}
° *🪶 Categoría:* ${card.category || 'Indefinida'}
° *🏦 Banco:* ${card.bank || 'Desconocido'}
° *🌍 País:* ${card.country?.name || '-'} ${card.country?.emoji || ''}
° *🪙 Moneda:* ${card.country?.currency || 'Desconocida'}

> ${club}`

    m.reply(msg)
  } catch (e) {
    console.error(e)
    throw '*⚠️ Ocurrió un error al verificar la tarjeta.*'
  }
}

handler.help = ['cccheck']
handler.tags = ['tools']
handler.command = /^cccheck|ccc$/i

export default handler
import axios from 'axios'
import * as cheerio from 'cheerio'

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

async function mfsearch(query) {
  if (!query) throw new Error('Escribe una búsqueda')

  const searchUrl = `https://mediafiretrend.com/?q=${encodeURIComponent(query)}&search=Search`
  const { data: html } = await axios.get(searchUrl)
  const $ = cheerio.load(html)

  const links = shuffle(
    $('tbody tr a[href*="/f/"]').map((_, el) => $(el).attr('href')).get()
  ).slice(0, 10)

  if (!links.length) return []

  const results = await Promise.all(links.map(async (path) => {
    const url = `https://mediafiretrend.com${path}`
    const { data } = await axios.get(url)
    const $ = cheerio.load(data)

    const filename = $('tr:nth-child(2) td:nth-child(2) b').text().trim()
    const filesize = $('tr:nth-child(3) td:nth-child(2)').text().trim()
    const sourceUrl = $('tr:nth-child(5) td:nth-child(2)').text().trim()
    const sourceTitle = $('tr:nth-child(6) td:nth-child(2)').text().trim()

    const rawScript = $('div.info tbody tr:nth-child(4) td:nth-child(2) script').text()
    const match = rawScript.match(/unescape['"`]([^'"`]+)['"`]/)
    const decodedUrl = match ? cheerio.load(decodeURIComponent(match[1]))('a').attr('href') : null

    return {
      filename,
      filesize,
      url: decodedUrl || 'Enlace no disponible',
      source_url: sourceUrl,
      source_title: sourceTitle
    }
  }))

  return results
}


let handler = async (m, { text, usedPrefix, command }) => {

  if (!text) return m.reply(`*${xsearch} Por favor, ingresa una búsqueda de mediafire.*\n> *\`Ejemplo:\`* ${usedPrefix + command} free fire config`)

  try {

    await m.react('⌛')
    const results = await mfsearch(text)

    if (!results.length)
      return m.reply('*⚠️ No se encontró nada, intenta con otra palabra.*')

    const list = results.map((v) =>
`° ${v.filename}
≡ ⚖️ *\`Tamaño:\`* ${v.filesize}
≡ 🌿 \`Link:\` ${v.url}
≡ 🍙 \`Fuente:\` ${v.source_title}
≡ 🌵 \`Url Fuente:\` ${v.source_url}`).join('\n\n________________________\n\n')

    const replyMsg = `乂 *MEDIAFIRE - RESULTADOS*\n\n${list}\n\n> ${dev}`

    await m.reply(replyMsg)
  } catch (err) {
    console.error(err)
    m.reply(`⚠️ Ocurrió un error:\n${err.message}`)
  }
}

handler.help = ['mediafiresearch <query>']
handler.tags = ['search']
handler.command = ['mfsearch', 'mediafiresearch']

export default handler
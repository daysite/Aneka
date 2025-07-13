import cheerio from 'cheerio'
import axios from 'axios'

let handler = async (m, { conn, args, command, usedPrefix }) => {

if (!db.data.chats[m.chat].nsfw && m.isGroup) {
    return m.reply(hotw);
    }

  if (!args[0]) {
    return conn.reply(m.chat, `*🍁 Ingrese la búsqueda que desea realizar en PornHub.*\n> *\`Ejemplo:\`* ${usedPrefix + command} Gótica Culona`, m)
  }

  try {
    await m.react('⌛')
    let searchResults = await searchPornhub(args.join(" "))
    if (searchResults.result.length === 0) {
      return conn.reply(m.chat, '```⚠️ No se encontraron resultados.```', m)
    }

    let txt = '```乂 PORNHUB - SEARCH```'

    searchResults.result.slice(0, 10).forEach((v, i) => {
      txt += `\n\n*\`${i + 1}\`*`
      txt += `\n° *${v.title}*`
      txt += `\n≡ 🌵 *\`Duración:\`* ${v.duration}`
      txt += `\n≡ 🌿 *\`Link:\`* ${v.url}`
    })

    await conn.reply(m.chat, txt.trim(), m)
    await m.react('✅')
  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, '```✖️ Ocurrió un error al realizar la búsqueda.```', m)
    await m.react('✖️')
  }
}

handler.tags = ['search']
handler.help = ['pornhubsearch']
handler.command = ['phsearch', 'pornhubsearch']

export default handler

async function searchPornhub(search) {
  try {
    const response = await axios.get(`https://www.pornhub.com/video/search?search=${encodeURIComponent(search)}`)
    const html = response.data
    const $ = cheerio.load(html)
    const result = []

    $('ul#videoSearchResult > li.pcVideoListItem').each((a, b) => {
      const _title = $(b).find('a').attr('title')
      const _duration = $(b).find('var.duration').text().trim()
      const _url = 'https://www.pornhub.com' + $(b).find('a').attr('href')
      if (_title && _duration && _url.includes('/view_video.php')) {
        result.push({ title: _title, duration: _duration, url: _url })
      }
    })

    return { result }
  } catch (error) {
    console.error('*✖️ Error al buscar en Pornhub:*', error)
    return { result: [] }
  }
}

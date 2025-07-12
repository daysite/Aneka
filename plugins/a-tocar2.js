/*const defaultMenu = {
  before: `💸 ¡Hola *%name*!, aquí está mi menú de economía:\n\n%readmore`,
  header: '┏━━⪩「 *%category* 」⪨',
  body: '┃ %cmd',
  footer: '┗━━━━━━━━━━━━━━━⪩',
  after: '',
}

let handler = async (m, { conn, usedPrefix: _p }) => {
  let name = await conn.getName(m.sender)
  let tag = `@${m.sender.split('@')[0]}`
  let tags = { rpg: 'Economía' }
  let imgPath = './src/catalogo.jpg'

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
    defaultMenu.before,
    ...Object.keys(tags).map(tag => {
      return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + [
        ...groups[tag].map(plugin =>
          plugin.help.map(cmd =>
            defaultMenu.body.replace(/%cmd/g, _p + cmd)
          ).join('\n')
        ),
        defaultMenu.footer
      ].join('\n')
    }),
    defaultMenu.after
  ].join('\n')

  text = text.replace(/%name/g, name).replace(/%tag/g, tag).replace(/%readmore/g, readMore)

  await m.react('💸')
  await conn.sendMessage(m.chat, {
    image: { url: imgPath },
    caption: text,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help = ['menueconomia']
handler.tags = ['rpg']
handler.command = ['menue', 'menueco', 'menueconomia']

export default handler*/

const defaultMenu = {
  before: (name, readMore) => `💸 ¡Hola *${name}*, aquí está mi menú de economía:\n\n${readMore}`,
  header: category => `┏━━⪩「 *${category}* 」⪨`,
  body: cmd => `┃ ${cmd}`,
  footer: '┗━━━━━━━━━━━━━━━⪩',
  after: ''
}

let handler = async (m, { conn, usedPrefix: _p }) => {
  let name = await conn.getName(m.sender)
  let tag = `@${m.sender.split('@')[0]}`
  let tags = { owner: 'Owner' }
  let imgPath = './src/catalogo.jpg'

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

  await m.react('💸')
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
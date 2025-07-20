/*import fetch from 'node-fetch'

let handler = async (m, { text, command, usedPrefix }) => {
  const input = text.trim()
  const fontAPI = 'https://www.dark-yasiya-api.site/other/font?text='

  if (!input) {
    const res = await fetch(fontAPI + encodeURIComponent('Shadow Bot'))
    const json = await res.json()

    if (!json.status || !json.result) throw '*✖️ Error al obtener las fuentes.*'

    const list = json.result.map((f, i) => `${i + 1}. ${f.name}`).join('\n')

    m.reply(`*Lista de Fuentes Disponibles:*\n${list}`)
    return
  }

  const match = input.match(/^(\d+)\s+(.+)/)
  if (!match) {
    // Formato inválido: mostrar lista
    const res = await fetch(fontAPI + encodeURIComponent('Shadow Bot'))
    const json = await res.json()

    if (!json.status || !json.result) throw '⚠️ Error al obtener las fuentes.'

    const list = json.result.map((f, i) => `${i + 1}. ${f.name}`).join('\n')

    m.reply(`❌ *Formato incorrecto*\n\n✅ Usa el comando así:\n${usedPrefix + command} <número> <texto>\n\n🔤 *Lista de fuentes disponibles:*\n${list}`)
    return
  }

  const index = parseInt(match[1]) - 1
  const texto = match[2]

  const res = await fetch(fontAPI + encodeURIComponent(texto))
  const json = await res.json()

  if (!json.status || !json.result) throw '⚠️ No se pudo obtener la fuente.'

  if (index < 0 || index >= json.result.length) {
    m.reply(`✖️ *Número inválido.*\nSolo hay ${json.result.length} fuentes disponibles.`)
    return
  }

  const fuente = json.result[index]
  const salida = fuente.result || '(vacío)'

  m.reply(`${salida}`)
}

handler.help = ['font']
handler.tags = ['tools']
handler.command = /^font|fonts$/i
export default handler*/

import fetch from 'node-fetch'

let handler = async (m, { text, command, usedPrefix }) => {
  const input = text.trim()
  const fontAPI = 'https://www.dark-yasiya-api.site/other/font?text='

  async function obtenerFuentes(texto) {
    const res = await fetch(fontAPI + encodeURIComponent(texto))
    const contentType = res.headers.get('content-type') || ''

    if (!contentType.includes('application/json')) {
      const textoPlano = await res.text()
      throw `⚠️ El servidor respondió con un error:\n\n${textoPlano.slice(0, 200)}`
    }

    return await res.json()
  }

  try {
    if (!input) {
      const json = await obtenerFuentes('Shadow Bot')
      if (!json.status || !json.result) throw '*✖️ Error al obtener las fuentes.*'

      const list = json.result.map((f, i) => `${i + 1}. ${f.name}`).join('\n')
      m.reply(`🔤 *Lista de Fuentes Disponibles:*\n${list}`)
      return
    }

    const match = input.match(/^(\d+)\s+(.+)/)
    if (!match) {
      const json = await obtenerFuentes('Shadow Bot')
      if (!json.status || !json.result) throw '⚠️ Error al obtener las fuentes.'

      const list = json.result.map((f, i) => `${i + 1}. ${f.name}`).join('\n')
      m.reply(`❌ *Formato incorrecto*\n\n✅ Usa el comando así:\n${usedPrefix + command} <número> <texto>\n\n🔤 *Lista de fuentes disponibles:*\n${list}`)
      return
    }

    const index = parseInt(match[1]) - 1
    const texto = match[2]

    const json = await obtenerFuentes(texto)
    if (!json.status || !json.result) throw '⚠️ No se pudo obtener la fuente.'

    if (index < 0 || index >= json.result.length) {
      m.reply(`✖️ *Número inválido.*\nSolo hay ${json.result.length} fuentes disponibles.`)
      return
    }

    const fuente = json.result[index]
    const salida = fuente.result || '(vacío)'
    m.reply(`${salida}`)

  } catch (e) {
    console.error(e)
    m.reply(typeof e === 'string' ? e : '❌ Error inesperado al procesar la fuente.')
  }
}

handler.help = ['font']
handler.tags = ['tools']
handler.command = /^font|fonts$/i
export default handler
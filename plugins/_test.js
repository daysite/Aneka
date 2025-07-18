import fetch from 'node-fetch'

const API_URL = 'https://www.dark-yasiya-api.site/other/font'

const handler = async (m, { text, command, usedPrefix }) => {
  if (!text) {
    throw `Ingresa un texto o elige un estilo.\n\nEjemplo: ${usedPrefix + command} 5 | Shadow Bot\nO también: ${usedPrefix + command} Shadow Bot`
  }

  const isNumbered = /^\d+\s*\|\s*/.test(text)

  const fetchFonts = async (inputText) => {
    try {
      const res = await fetch(`${API_URL}?text=${encodeURIComponent(inputText)}`)
      if (!res.ok) throw new Error(`Error HTTP: ${res.status} ${res.statusText}`)
      
      const json = await res.json()
      if (!json.status || !Array.isArray(json.result) || json.result.length === 0) {
        throw new Error('La API no devolvió resultados válidos.')
      }
      return json.result
    } catch (e) {
      console.error('[FontAPI Error]', e)
      throw 'Ocurrió un error al consultar los estilos. Asegúrate de usar un texto válido.'
    }
  }

  if (isNumbered) {
    const [rawIndex, ...textParts] = text.split('|')
    const fontText = textParts.join('|').trim()
    const index = parseInt(rawIndex.trim()) - 1

    if (!fontText) throw `Ingresa un texto después del número.\nEjemplo: ${usedPrefix + command} 5 | Shadow Bot`
    if (isNaN(index)) throw 'El número no es válido.'

    const fonts = await fetchFonts(fontText)

    if (!fonts[index]) throw `El número debe estar entre 1 y ${fonts.length}`

    const font = fonts[index]
    return m.reply(
      `Fuente seleccionada:
Nombre: ${font.name}
Estilo Nº: ${index + 1}

Resultado:
${font.result}`
    )
  } else {
    const fonts = await fetchFonts(text)

    const list = fonts
      .map((f, i) => `${i + 1}.- ${f.name}\n${f.result}`)
      .join('\n\n')

    return m.reply(
      `Estilos disponibles para: ${text}
Total de estilos: ${fonts.length}
Ejemplo: ${usedPrefix + command} 5 | ${text}

${list}`
    )
  }
}

handler.command = /^font|fuente|fonts$/i
handler.help = ['font <texto>', 'font <número> | <texto>']
handler.tags = ['tools']

export default handler
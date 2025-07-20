
import fetch from 'node-fetch'

let handler = async (m, { text, command, usedPrefix }) => {
  const input = text.trim()
  const fontAPI = 'https://www.dark-yasiya-api.site/other/font?text='

  async function obtenerFuentes(texto) {
    const res = await fetch(fontAPI + encodeURIComponent(texto))
    const contentType = res.headers.get('content-type') || ''

    if (!contentType.includes('application/json')) {
      const textoPlano = await res.text()
      throw `*⚠️ El servidor respondió con un error:*\n\n${textoPlano.slice(0, 200)}`
    }

    return await res.json()
  }

  try {
    if (!input) {
      const json = await obtenerFuentes('Shadow Bot')
      if (!json.status || !json.result) throw '*✖️ Error al obtener las fuentes.*'

      const list = json.result.map((f, i) => `${i + 1}. ${f.name}`).join('\n')
      m.reply(`${xtools} *Por favor, ingresa un número de la fuente que deseas convertir el texto ingresado.*
> *\`Ejemplo:\`* ${usedPrefix + command} 28 Shadow Ultra

📄 *Lista de fuentes disponibles:*
1. CIRCLED
2. ROUND
3. Wide
4. Bold
5. Empire
6. Serif
7. Script
8. Prem
9. Monospace
10. Sans
11. Sans Bold
12. Sans Italic
13. Sans Italic
14. PARENT
15. BLUE
16. SQ BOX
17. SQUARED
18. Tag
19. Cute
20. Thai
21. Curvy
22. Curvy2
23. Curvy3
23. Cyrillic
24. Ethiopia
25. Fraktur
26. Rock Dots
27. Small Caps
28. Stroked
29. Subscript
30. Superscript
31. Inverter
32. Inverter
33. Reversed
34. Reversed`)
      return
    }

    const match = input.match(/^(\d+)\s+(.+)/)
    if (!match) {
      const json = await obtenerFuentes('Shadow Bot')
      if (!json.status || !json.result) throw '*⚠️ Error al obtener las fuentes.*'

      const list = json.result.map((f, i) => `${i + 1}. ${f.name}`).join('\n')
      m.reply(`❌ *Formato incorrecto*\n\n✅ Usa el comando así:\n${usedPrefix + command} <número> <texto>\n\n🔤 *Lista de fuentes disponibles:*\n${list}`)
      return
    }

    const index = parseInt(match[1]) - 1
    const texto = match[2]

    const json = await obtenerFuentes(texto)
    if (!json.status || !json.result) throw '*⚠️ No se pudo obtener la fuente.*'

    if (index < 0 || index >= json.result.length) {
      m.reply(`✖️ *Número inválido.*\n*Solo hay ${json.result.length} fuentes disponibles.*`)
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
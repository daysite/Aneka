// ==================== FUENTES COMPLETAS SIN API ====================

// Generadores especiales
function reverseText(txt) {
  return txt.split('').reverse().join('')
}
function invertText(txt) {
  const map = { a:'ɐ', b:'q', c:'ɔ', d:'p', e:'ǝ', f:'ɟ', g:'ƃ', h:'ɥ', i:'ᴉ', j:'ɾ', k:'ʞ', l:'l', m:'ɯ', n:'u', o:'o', p:'d', q:'b', r:'ɹ', s:'s', t:'ʇ', u:'n', v:'ʌ', w:'ʍ', x:'x', y:'ʎ', z:'z' }
  return txt.split('').map(c => map[c.toLowerCase()] || c).join('')
}
function subscript(txt) {
  const map = { a:'ₐ', e:'ₑ', h:'ₕ', i:'ᵢ', j:'ⱼ', k:'ₖ', l:'ₗ', m:'ₘ', n:'ₙ', o:'ₒ', p:'ₚ', r:'ᵣ', s:'ₛ', t:'ₜ', u:'ᵤ', v:'ᵥ', x:'ₓ', y:'ᵧ', z:'ᶻ', 0:'₀',1:'₁',2:'₂',3:'₃',4:'₄',5:'₅',6:'₆',7:'₇',8:'₈',9:'₉'}
  return txt.split('').map(c => map[c] || map[c.toLowerCase()] || c).join('')
}
function superscript(txt) {
  const map = { a:'ᵃ', b:'ᵇ', c:'ᶜ', d:'ᵈ', e:'ᵉ', f:'ᶠ', g:'ᵍ', h:'ʰ', i:'ⁱ', j:'ʲ', k:'ᵏ', l:'ˡ', m:'ᵐ', n:'ⁿ', o:'ᵒ', p:'ᵖ', r:'ʳ', s:'ˢ', t:'ᵗ', u:'ᵘ', v:'ᵛ', w:'ʷ', x:'ˣ', y:'ʸ', z:'ᶻ', 0:'⁰',1:'¹',2:'²',3:'³',4:'⁴',5:'⁵',6:'⁶',7:'⁷',8:'⁸',9:'⁹'}
  return txt.split('').map(c => map[c] || map[c.toLowerCase()] || c).join('')
}

// 🔹 Mapas estándar A-Z a-z
function makeMap(upper, lower) {
  let map = {}
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', a = 'abcdefghijklmnopqrstuvwxyz'
  for (let i=0;i<26;i++) {
    map[A[i]] = upper[i] || A[i]
    map[a[i]] = lower[i] || a[i]
  }
  return map
}

const fuentes = [
  { name:'CIRCLED', map:makeMap('ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ','ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ') },
  { name:'WIDE', map:makeMap('ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ','ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ') },
  { name:'BOLD', map:makeMap('𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙','𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳') },
  { name:'ITALIC', map:makeMap('𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍','𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧') },
  { name:'BOLD ITALIC', map:makeMap('𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁','𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛') },
  { name:'SCRIPT', map:makeMap('𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩','𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃') },
  { name:'DOUBLESTRUCK', map:makeMap('𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ','𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫') },
  { name:'FRAKTUR', map:makeMap('𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ','𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷') },
  { name:'BOLD FRAKTUR', map:makeMap('𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅','𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟') },
  { name:'MONOSPACE', map:makeMap('𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉','𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣') },
  { name:'SMALL CAPS', map:makeMap('ABCDEFGHIJKLMNOPQRSTUVWXYZ','ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ') },
  { name:'TAG', map:makeMap('ABCDEFGHIJKLMNOPQRSTUVWXYZ','🇦🇧🇨🇩🇪🇫🇬🇭🇮🇯🇰🇱🇲🇳🇴🇵🇶🇷🇸🇹🇺🇻🇼🇽🇾🇿') },
  { name:'BLUE', map:makeMap('🇦🇧🇨🇩🇪🇫🇬🇭🇮🇯🇰🇱🇲🇳🇴🇵🇶🇷🇸🇹🇺🇻🇼🇽🇾🇿','🇦🇧🇨🇩🇪🇫🇬🇭🇮🇯🇰🇱🇲🇳🇴🇵🇶🇷🇸🇹🇺🇻🇼🇽🇾🇿') },
  { name:'ROCK DOTS', map:makeMap('ȦḂĊḊĖḞĠḢİJ̇K̇L̇ṀṄȮṖQ̇ṘṠṪU̇V̇ẆẊẎŻ','ȧḃċḋėḟġḣi̇j̇k̇l̇ṁṅȯṗq̇ṙṡṫu̇v̇ẇẋẏż') },
  { name:'REVERSED', fn:txt=>reverseText(txt) },
  { name:'INVERTED', fn:txt=>invertText(txt) },
  { name:'SUBSCRIPT', fn:txt=>subscript(txt) },
  { name:'SUPERSCRIPT', fn:txt=>superscript(txt) }
]

// 🔹 Función para convertir
function convertirFuente(texto, fuente) {
  if (fuente.fn) return fuente.fn(texto)
  return texto.split('').map(ch => fuente.map[ch] || ch).join('')
}

// ==================== HANDLER ====================
let handler = async (m,{text,usedPrefix,command})=>{
  if(!text){
    let lista = fuentes.map((f,i)=>`${i+1}. ${f.name}`).join('\n')
    return m.reply(`*📄 Lista de fuentes disponibles:*\n${lista}\n\n> Ejemplo: ${usedPrefix+command} 7 Shadow Ultra`)
  }

  const match = text.match(/^(\d+)\s+(.+)/)
  if(!match) return m.reply(`*⚠️ Coloca el número de la fuente y el texto.*\nEjemplo:\n${usedPrefix+command} 3 Hola Mundo`)

  const index = parseInt(match[1])-1
  const input = match[2]
  if(index<0||index>=fuentes.length) return m.reply(`✖️ Número inválido. Solo hay ${fuentes.length} fuentes.`)

  const fuente = fuentes[index]
  const salida = convertirFuente(input,fuente)
  m.reply(`*${fuente.name}:*\n${salida}`)
}

handler.help=['font']
handler.tags=['tools']
handler.command=/^font|fonts$/i

export default handler
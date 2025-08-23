/* 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗦𝗵𝗮𝗱𝗼𝘄'𝘀 𝗖𝗹𝘂𝗯 🌺᭄
𝖢𝗋𝖾𝖺𝖽𝗈 𝗉𝗈𝗋 𝖣𝖾𝗏.𝖢𝗋𝗂𝗌𝗌 🇦🇱
https://whatsapp.com/channel/0029VauTE8AHltY1muYir31n*/

const handler = async (m, { conn, text }) => {


  let user = m.mentionedJid && m.mentionedJid[0]
           ? m.mentionedJid[0]
           : m.quoted?.sender;

  if (!user) return conn.reply(m.chat, `*${xfun} Por favor, menciona algún usuario para doxear.*`, m);

  const taguser = '@' + user.split('@')[0];
  const pn = new PhoneNumber('+' + user);
  const regionCode = pn.getRegionCode();


  const countryNames = {
    US: 'Estados Unidos 🇺🇸', MX: 'México 🇲🇽', AR: 'Argentina 🇦🇷', PE: 'Perú 🇵🇪',
    CO: 'Colombia 🇨🇴', BR: 'Brasil 🇧🇷', CL: 'Chile 🇨🇱', VE: 'Venezuela 🇻🇪',
    EC: 'Ecuador 🇪🇨', BO: 'Bolivia 🇧🇴', PY: 'Paraguay 🇵🇾', UY: 'Uruguay 🇺🇾',
    GT: 'Guatemala 🇬🇹', HN: 'Honduras 🇭🇳', NI: 'Nicaragua 🇳🇮', SV: 'El Salvador 🇸🇻',
    CR: 'Costa Rica 🇨🇷', PA: 'Panamá 🇵🇦', DO: 'República Dominicana 🇩🇴', CU: 'Cuba 🇨🇺',
    ES: 'España 🇪🇸', FR: 'Francia 🇫🇷', IT: 'Italia 🇮🇹', DE: 'Alemania 🇩🇪',
    GB: 'Reino Unido 🇬🇧',
  };

  const locationByCountry = {
    US: { city: 'Los Angeles', region: 'California', lat: '34.0522', lon: '-118.2437' },
    MX: { city: 'CDMX', region: 'Ciudad de México', lat: '19.4326', lon: '-99.1332' },
    AR: { city: 'Buenos Aires', region: 'Buenos Aires', lat: '-98.6037', lon: '-76.3816' },
    PE: { city: 'Lima', region: 'Lima Metropolitana', lat: '-12.0464', lon: '-77.0428' },
    CO: { city: 'Bogotá', region: 'Cundinamarca', lat: '4.7110', lon: '-74.0721' },
    BR: { city: 'São Paulo', region: 'São Paulo', lat: '-23.5505', lon: '-46.6333' },
    CL: { city: 'Santiago', region: 'Región Metropolitana', lat: '-33.4489', lon: '-70.6693' },
    VE: { city: 'Caracas', region: 'Distrito Capital', lat: '10.4806', lon: '-66.9036' },
    EC: { city: 'Quito', region: 'Pichincha', lat: '-0.1807', lon: '-78.4678' },
    BO: { city: 'La Paz', region: 'La Paz', lat: '-16.5000', lon: '-68.1500' },
    PY: { city: 'Asunción', region: 'Asunción', lat: '-25.2637', lon: '-57.5759' },
    UY: { city: 'Montevideo', region: 'Montevideo', lat: '-34.9011', lon: '-56.1645' },
    GT: { city: 'Ciudad de Guatemala', region: 'Guatemala', lat: '14.6349', lon: '-90.5069' },
    HN: { city: 'Tegucigalpa', region: 'Francisco Morazán', lat: '14.0723', lon: '-87.1921' },
    NI: { city: 'Managua', region: 'Managua', lat: '12.1364', lon: '-86.2514' },
    SV: { city: 'San Salvador', region: 'San Salvador', lat: '13.6929', lon: '-89.2182' },
    CR: { city: 'San José', region: 'San José', lat: '9.9281', lon: '-84.0907' },
    PA: { city: 'Ciudad de Panamá', region: 'Panamá', lat: '8.9824', lon: '-79.5199' },
    DO: { city: 'Santo Domingo', region: 'Distrito Nacional', lat: '18.4861', lon: '-69.9312' },
    CU: { city: 'La Habana', region: 'La Habana', lat: '23.1136', lon: '-82.3666' },
    ES: { city: 'Madrid', region: 'Comunidad de Madrid', lat: '40.4168', lon: '-3.7038' },
    FR: { city: 'París', region: 'Île-de-France', lat: '48.8566', lon: '2.3522' },
    IT: { city: 'Roma', region: 'Lacio', lat: '41.9028', lon: '12.4964' },
    DE: { city: 'Berlín', region: 'Berlín', lat: '52.5200', lon: '13.4050' },
    GB: { city: 'Londres', region: 'Inglaterra', lat: '51.5074', lon: '-0.1278' },
  };

  const pais = countryNames[regionCode] || 'Desconocido';
  const location = locationByCountry[regionCode] || { city: 'Desconocida', region: 'Desconocida', lat: '0.0000', lon: '0.0000' };


  const sleep = (ms) => new Promise(res => setTimeout(res, ms));
  const randomIP = () => `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
  const randomIPv6 = () => Array(8).fill().map(() => Math.floor(Math.random() * 65536).toString(16)).join(':');
  const randomMAC = () => Array(6).fill().map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':');
  const randomSSN = () => `${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}-${Math.floor(1000 + Math.random() * 9000)}`;
  const randomToken = () => `ghp_${Math.random().toString(36).substring(2, 20)}`;
  const randomWifi = () => `WiFi-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const boosts = [
    '⋘ 𝑙𝑜𝑎𝑑𝑖𝑛𝑔 𝑑𝑎𝑡𝑎... ⋙',
    '25% 𝒄𝒐𝒎𝒑𝒍𝒆𝒕𝒂𝒅𝒐. . .',
    '*47% 𝒄𝒐𝒎𝒑𝒍𝒆𝒕𝒂𝒅𝒐. . .*',
    '*62% 𝒄𝒐𝒎𝒑𝒍𝒆𝒕𝒂𝒅𝒐. . .*',
    '*97% 𝒄𝒐𝒎𝒑𝒍𝒆𝒕𝒂𝒅𝒐. . .*'
  ];

  let sent = await conn.sendMessage(m.chat, { text: boosts[0] }, { quoted: m });
  for (let i = 1; i < boosts.length; i++) {
    await sleep(800);
    await conn.sendMessage(m.chat, { text: boosts[i], edit: sent.key });
  }

  const start = performance.now();
  await sleep(500 + Math.floor(Math.random() * 500));
  const end = performance.now();
  const speed = ((end - start) / 1000).toFixed(4);

const googleMapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lon}`;

  const doxeo = `*\`👨🏻‍💻 DOXEO FINALIZADO\`*
> *Realizado en* \`${speed} segundos\`

📆 *${date}*
⏰ *${hora}*


*RESULTADOS OBTENIDOS - V5*

*Nombre:* ${taguser}
*País:* ${pais}
*Ciudad:* ${location.city}
*Región:* ${location.region}
*Latitud:* ${location.lat}
*Longitud:* ${location.lon}
*Ubicación:* ${googleMapsUrl}
*IP Pública:* ${randomIP()}
*IP Privada:* 192.168.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}
*IPv6:* ${randomIPv6()}
*MAC:* ${randomMAC()}
*SSN:* ${randomSSN()}
*Token de Acceso:* ${randomToken()}
*Última actividad:* ${new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })}
*Red Wi-Fi:* ${randomWifi()}
*Potencia de Señal:* ${Math.floor(Math.random() * 50 + 50)}%
*ISP:* MoviNet Corp
*DNS:* 8.8.8.8
*ALT DNS:* 1.1.1.1
*GATEWAY:* 192.168.0.1
*TCP PUERTOS ABIERTOS:* 80, 443, 22
*UDP PUERTOS ABIERTOS:* 53, 67
*Vendedor del router:* TP-Link Technologies Co., Ltd.
*Build ID:* RP3A.210720.052
*Technology:* Li-ion
*Dispositivo:* Android 12 - SMA-G998B
*Navegador:* Chrome 120.0.0.1 (Android)
*Resolución:* 1080x2340
*Conexión:* Datos Móviles
*HOSTNAME:* host-${Math.floor(Math.random() * 255)}-${Math.floor(Math.random() * 255)}.net.local

*SHADOW ULTRA:* FREE CREDITS`;

  await sleep(1000);

  await conn.sendMessage(m.chat, { text: doxeo, edit: sent.key, mentions: [user] })
};

handler.help = ['doxear'];
handler.tags = ['fun'];
handler.command = ['doxxeo', 'doxxear', 'doxeo', 'doxear', 'doxxing', 'doxing', 'doxx', 'dox'];
handler.group = true;

export default handler;

/* 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗦𝗵𝗮𝗱𝗼𝘄'𝘀 𝗖𝗹𝘂𝗯 🌺᭄
𝖢𝗋𝖾𝖺𝖽𝗈 𝗉𝗈𝗋 𝖣𝖾𝗏.𝖢𝗋𝗂𝗌𝗌 🇦🇱
https://whatsapp.com/channel/0029VauTE8AHltY1muYir31n */
/*
import PhoneNumber from 'awesome-phonenumber'
import { performance } from 'perf_hooks'

const handler = async (m, { conn }) => {
  // 📌 Obtener al usuario target (mención o quote)
  const who = m.quoted?.sender || m.mentionedJid?.[0]
  if (!who) return m.reply('*⚠️ Debes etiquetar o responder a alguien.*')

  // 📌 Nombre real en WhatsApp
  let name
  try {
    name = await conn.getName(who)
  } catch {
    name = who.split('@')[0]
  }

  // 📌 Número (si es posible)
  const number = who.split('@')[0]
  const pn = new PhoneNumber('+' + number)
  const regionCode = pn.getRegionCode()

  const countryNames = {
    US: 'Estados Unidos 🇺🇸', MX: 'México 🇲🇽', AR: 'Argentina 🇦🇷', PE: 'Perú 🇵🇪',
    CO: 'Colombia 🇨🇴', BR: 'Brasil 🇧🇷', CL: 'Chile 🇨🇱', VE: 'Venezuela 🇻🇪',
    EC: 'Ecuador 🇪🇨', BO: 'Bolivia 🇧🇴', PY: 'Paraguay 🇵🇾', UY: 'Uruguay 🇺🇾',
    GT: 'Guatemala 🇬🇹', HN: 'Honduras 🇭🇳', NI: 'Nicaragua 🇳🇮', SV: 'El Salvador 🇸🇻',
    CR: 'Costa Rica 🇨🇷', PA: 'Panamá 🇵🇦', DO: 'República Dominicana 🇩🇴', CU: 'Cuba 🇨🇺',
    ES: 'España 🇪🇸', FR: 'Francia 🇫🇷', IT: 'Italia 🇮🇹', DE: 'Alemania 🇩🇪',
    GB: 'Reino Unido 🇬🇧',
  }

  const locationByCountry = {
    PE: { city: 'Lima', region: 'Lima Metropolitana', lat: '-12.0464', lon: '-77.0428' },
    MX: { city: 'CDMX', region: 'Ciudad de México', lat: '19.4326', lon: '-99.1332' },
    AR: { city: 'Buenos Aires', region: 'Buenos Aires', lat: '-34.6037', lon: '-58.3816' },
    CO: { city: 'Bogotá', region: 'Cundinamarca', lat: '4.7110', lon: '-74.0721' },
    // puedes seguir agregando...
  }

  const pais = countryNames[regionCode] || '🌎 Desconocido'
  const location = locationByCountry[regionCode] || { city: 'Desconocida', region: 'Desconocida', lat: '0.0000', lon: '0.0000' }

  const sleep = ms => new Promise(res => setTimeout(res, ms))
  const randomIP = () => `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`
  const randomIPv6 = () => Array(8).fill().map(() => Math.floor(Math.random() * 65536).toString(16)).join(':')
  const randomMAC = () => Array(6).fill().map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':')
  const randomToken = () => `ghp_${Math.random().toString(36).substring(2, 20)}`

  const boosts = [
    '*☠ ¡¡Iniciando Doxeo!! ☠*',
    '*25% completado...*',
    '*62% completado...*',
    '*97% completado...*'
  ]

  let sent = await conn.sendMessage(m.chat, { text: boosts[0] }, { quoted: m })
  for (let i = 1; i < boosts.length; i++) {
    await sleep(700)
    await conn.sendMessage(m.chat, { text: boosts[i], edit: sent.key })
  }

  const start = performance.now()
  await sleep(400 + Math.random() * 400)
  const end = performance.now()
  const speed = ((end - start) / 1000).toFixed(3)

  const googleMapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lon}`

  const doxeo = `*\`👨🏻‍💻 DOXEO FINALIZADO\`*
> *Realizado en* \`${speed} segundos\`

*Nombre:* ${name}
*Número:* @${number}
*País:* ${pais}
*Ciudad:* ${location.city}
*Región:* ${location.region}
*Ubicación:* ${googleMapsUrl}
*IP Pública:* ${randomIP()}
*IPv6:* ${randomIPv6()}
*MAC:* ${randomMAC()}
*Token:* ${randomToken()}

⚠️ *xd*`

  await conn.sendMessage(m.chat, { text: doxeo, edit: sent.key, mentions: [who] })
}

handler.help = ['doxear @user']
handler.tags = ['fun']
handler.command = ['doxtes', 'doxear', 'doxxeo']

export default handler*/
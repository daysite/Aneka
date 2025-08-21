import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'
import cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone' 

//─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─

global.botNumber = '' //Ejemplo: 51927238856

//─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─

global.owner = [
  ['51927238856', 'Dev.Criss 🇦🇱', true],
  ['5493865536185',  'Kenisawa (Colab)', true],
  ['90812788543600', 'Cris', true], //@lid
  ['10342868459625', 'Day Shx!', true], //@lid
];

//─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─

global.mods = []
global.suittag = ['51927238856'] 
global.prems = []

//─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─

global.namebot = 'ShadowUltra-MD'
global.packname = '𝖲𝗁𝖺𝖽𝗈𝗐 𝖴𝗅𝗍𝗋𝖺 - 𝖬𝖣'
global.botname = '𝖲𝗁𝖺𝖽𝗈𝗐 𝖴𝗅𝗍𝗋𝖺 - 𝖬𝖣'
global.wm = '𝖲𝗁𝖺𝖽𝗈𝗐 𝖴𝗅𝗍𝗋𝖺 - 𝖬𝖣'
global.author = '𝖣𝖾𝗏.𝖢𝗋𝗂𝗌𝗌 ☕'
global.dev = '© 𝖯᥆𝗐ᥱ𝗋ᥱძ ᑲᥡ 𝖲ᥙᥒ𝖿ᥣᥲ𝗋ᥱ  ☂︎  𝖳ᥱᥲ𝗆'
global.club = '𝖯𑄜𝗐𝖾𝗋𝖾𝖽 𝖻𝗒 𝖲𝗁⍺𝖽ᦅ𝗐′𝗌 𝖢𝗅𝗎𝖻'
global.textbot = '⿻ ׄ ˚. Տ𝗁⍺𝖽ᦅա  ⚡︎  𝖴𝗅ł𝗋⍺ ׄㅤ🥞ᩧᰰ˚'
global.etiqueta = '𝖲𝗁𝖺𝖽𝗈𝗐 𝖴𝗅𝗍𝗋𝖺 - 𝖬𝖣'
global.jadi = 'JadiBots'
global.sessions = 'ShadowSession'
global.vs = 'v2.3.0'

//─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─

global.moneda = 'Diamantes 💎'
global.xanime = '🍮'
global.xmenus = '🌿'
global.xconfig = '🧋'
global.xjadi = '🪶'
global.xefects = '🥥'
global.xfrases = '🍯'
global.xgame = '🪐'
global.xsearch = '🌳'
global.xtools = '🍚'
global.xdownload = '🥞'
global.xconverter = '🪾'
global.xlist = '📑'
global.xff = '🥧'
global.xlogos = '🍁'
global.xmaker = '🌹'
global.xgc = '🍃'
global.xinfo = '☁️'
global.xnsfw = '🦑'
global.xemox = '🪼'
global.xowner = '☕'
global.xia = '💭'
global.xfun = '🪻'
global.xsticker = '🌲'
global.xrpg = '🍙'
global.xreg = '🌴'

//─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─

global.github = 'https://github.com/CrxstianEscobar/ShadowUltra-MD'
global.grupo = 'https://chat.whatsapp.com/IJyN3cklID5HVKU3nAi0XL?mode=ac_t'
global.comu = 'https://chat.whatsapp.com/Kn1pPVAO08pFRo7qJnKuh6'
global.channel = 'https://whatsapp.com/channel/0029VauTE8AHltY1muYir31n'
global.ig = 'https://www.instagram.com/dev.criss_vx'

//─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─

global.catalogo = fs.readFileSync('./src/catalogo.jpg');
global.estilo = { key: {  fromMe: false, participant: `0@s.whatsapp.net`, ...(false ? { remoteJid: "543876577197-120363317332020195@g.us" } : {}) }, message: { orderMessage: { itemCount : -999999, status: 1, surface : 1, message: 'Sunflare  乂  Team', orderTitle: 'Bang', thumbnail: catalogo, sellerJid: '0@s.whatsapp.net'}}}
global.multiplier = 70

//─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─

global.cheerio = cheerio
global.fs = fs
global.fetch = fetch
global.axios = axios
global.moment = moment   

//─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
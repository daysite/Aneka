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
  ['5493884539290', 'lucxxs.qzy', true],
  ['18294922391',  'Aneka', true],
  ['217789839224855', 'Daniel', true], //@lid
  ['64304955007210', 'Aneka', true], //lid
];

//─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─

global.mods = []
global.suittag = ['50585389943'] 
global.prems = []

//─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─

global.namebot = 'Aneka'
global.packname = 'Aneka'
global.botname = 'Aneka'
global.wm = 'Aneka'
global.author = 'lucxxs.qzy'
global.dev = '© powered by lucxxs.qzy'
global.club = 'Powered by lucxxs.qzy'
global.textbot = 'Lucxxs.qzy dominado por Aneka'
global.etiqueta = 'Lucxxs.qzy dominado por Aneka'
global.jadi = 'JadiBots'
global.sessions = 'ShadowSession'
global.vs = 'v2.3.0'

//─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─

global.moneda = 'Dulces 🍹'
global.xanime = '🍯'
global.xmenus = '🥮'
global.xconfig = '✨'
global.xjadi = '🍊'
global.xefects = '🦁'
global.xfrases = '🍁'
global.xgame = '🪞'
global.xsearch = '🪸'
global.xtools = '🪭'
global.xdownload = '🎟️'
global.xconverter = '🧨'
global.xlist = '🌅'
global.xff = '🪄'
global.xlogos = '🐿️'
global.xmaker = '🦊'
global.xgc = '🐯'
global.xinfo = '🍭'
global.xnsfw = '🚼'
global.xemox = '🧡'
global.xowner = '📙'
global.xia = '🧺'
global.xfun = '🪔'
global.xsticker = '🏮'
global.xrpg = '🍙'
global.xreg = '✨'

//─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─

global.github = 'https://github.com/daysite'
global.grupo = 'https://chat.whatsapp.com/DWepOYLoEc3JgOAa1gG09h?mode=ems_copy_t'
global.comu = 'https://chat.whatsapp.com/DWepOYLoEc3JgOAa1gG09h?mode=ems_copy_t'
global.channel = 'https://chat.whatsapp.com/DWepOYLoEc3JgOAa1gG09h?mode=ems_copy_t'
global.ig = 'https://www.instagram.com/lucxxs.qzy'

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

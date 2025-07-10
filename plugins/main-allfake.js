import pkg from '@whiskeysockets/baileys'
import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = pkg

var handler = m => m
handler.all = async function (m) {

global.getBuffer = async function getBuffer(url, options) {
try {
options ? options : {}
var res = await axios({
method: "get",
url,
headers: {
'DNT': 1,
'User-Agent': 'GoogleBot',
'Upgrade-Insecure-Request': 1
},
...options,
responseType: 'arraybuffer'
})
return res.data
} catch (e) {
console.log(`Error : ${e}`)
}}

let pp = ''
let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
//let pp = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://telegra.ph/file/327f6ad853cb4f405aa80.jpg')

//CREADOR Y OTROS
global.creador = 'Wa.me/51927238856'
global.botreal = `${(conn.user.jid == global.conn.user.jid ? '*Bot:* Oficial' : `*SubBot de: ${conn.user.jid.split('@')[0]}*`)}`
global.asistencia = 'Wa.me/51927238856'

//REACCIONES 
global.rwait = '🕒'
global.done = '✅'
global.error = '✖️'

//EMOJIS PREDETERMINADOS
global.emoji = '🌿'
global.emoji2 = '🤍'
global.emoji3 = '☕'
global.emoji4 = '🍨'
global.emoji5 = '🍃'
global.emojis = [emoji, emoji2, emoji3, emoji4, emoji5].getRandom()


//MENSAJES DE AVISOS
global.wait = '*⏳ Aguarde un momento...*';
global.hotw = '*🔥 El contenido* `+18` *está desactivado para este chat.*\n> Use *enable nsfw* para activarlo.';
global.mistake = '*✖️ Error en el comando*\n*Por favor, intenta nuevamente más tarde. Si esto persiste envia:*\n> #report El comando (comando) no funciona.';

//ENLACES
var group = 'https://chat.whatsapp.com/Caj518FwPjHLVmGn48GvhW'  
var web = 'https://shadow-bot.vercel.app/' 
let instagram = 'https://www.instagram.com/shadowbot.md'

global.redes = [group, web, instagram].getRandom()

/*
//IMAGEN
let category = "imagen"
const db = './src/database/db.json'
const db_ = JSON.parse(fs.readFileSync(db))
const random = Math.floor(Math.random() * db_.links[category].length)
const randomlink = db_.links[category][random]
const response = await fetch(randomlink)
const rimg = await response.buffer()
global.icons = rimg
*/

//TIEMPO
var ase = moment().tz('America/Lima'); // Cambia 'America/Lima' por la zona horaria deseada
var hour = ase.hour(); // Obtiene la hora en la zona horaria elegida

switch(hour) { 
    case 0: case 1: case 2:
        hour = 'Lɪɴᴅᴀ Nᴏᴄʜᴇ 🌃'; 
        break;
    case 3: case 4: case 5: case 6:
        hour = 'Lɪɴᴅᴀ Mᴀɴ̃ᴀɴᴀ 🌄'; 
        break;
    case 7:
        hour = 'Lɪɴᴅᴀ Mᴀɴ̃ᴀɴᴀ 🌅'; 
        break;
    case 8: case 9:
        hour = 'Lɪɴᴅᴀ Mᴀɴ̃ᴀɴᴀ 🌄'; 
        break;
    case 10: case 11: case 12: case 13:
        hour = 'Lɪɴᴅᴏ Dɪᴀ 🌤'; 
        break;
    case 14: case 15: case 16: case 17:
        hour = 'Lɪɴᴅᴀ Tᴀʀᴅᴇ 🌇'; 
        break;
    case 18: case 19: case 20: case 21: case 22: case 23:
        hour = 'Lɪɴᴅᴀ Nᴏᴄʜᴇ 🌃'; 
        break;
}

global.saludo = hour;

// FECHA Y HORA EN FORMATO PERSONALIZADO (ZONA HORARIA PERÚ)
const fecha = moment().tz('America/Lima').locale('es')
let diaSemana = fecha.format('dddd')
let mes = fecha.format('MMMM')
diaSemana = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)
mes = mes.charAt(0).toUpperCase() + mes.slice(1)

global.date = `${diaSemana}, ${fecha.format('D')} de ${mes} del ${fecha.format('YYYY')}`
global.hora = fecha.format('h:mm A')

//TAGS & STICKERS
global.usnamebot = await conn.getName(conn.user.id)
global.usname = await conn.getName(m.sender)
var more = String.fromCharCode(8206)
global.readMore = more.repeat(850)

global.packN = `協会  Sʜʌᴅᴏᴡ′s Cʟᴜʙ  🍁 ࣪ ˖ ∿
↳ @shadows_club\n\n☁ 𝖲𝖾𝗇𝖽𝗂𝗇𝗀 𝖻𝗒 𝖡𝗈𝗍:\n↳ @${usnamebot}\n🌺 𝖴𝗌𝗎𝖺𝗋𝗂𝗈:`;
global.authN = `\n↳ @${usname}`;

//FAKES
global.fkontak = { key: { participants:"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }}, "participant": "0@s.whatsapp.net" }

global.fake = {
  contextInfo: {
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: '120363318267632676@newsletter',
      newsletterName: "˚₊·͟͟͟͟͟͟͞͞͞͞͞͞𝑺𝒖𝒏𝒇𝒍𝒂𝒓𝒆 - 𝑻𝒆𝒂𝒎 ೃ࿔₊•",
      serverMessageId: -1
    }
  }
}

//ID CANALES
global.idchannel = '120363357231409846@newsletter'
global.canalIdM = ["120363357231409846@newsletter", "120363318267632676@newsletter", "120363377595441592@newsletter"]
global.canalNombreM = [" 𐚁 ֹ ִ 𝖲𝗁⍺𝖽𑄈𝗐′𝗌 𝖢𝗅𝗎𝖻 ୧ ֹ ִ🌹ᩚ꤬ᰍ", "ꘓꘓ   ໒🌤️ؑ   𝖲𝗎𝗇ẜ𝗅⍺𝗋𝖾   𝖳𝖾⍺𑜀  ୭", "⿻ ׄ ˚. Տ𝗁⍺𝖽ᦅ𝗐  ⚡︎  𝖴𝗅ł𝗋⍺ ׄㅤ🥞ᩧᰰ˚"]
global.channelRD = await getRandomChannel()

global.icono = [
"https://files.catbox.moe/uu9lz5.jpg",
"https://files.catbox.moe/0a0e5s.jpg",
"https://files.catbox.moe/xe4y9r.jpg",
"https://files.catbox.moe/9pm5a8.jpg",
"https://files.catbox.moe/qs0h5r.jpg",
"https://files.catbox.moe/m78pwx.jpg",
"https://files.catbox.moe/ninsr8.jpg",
"https://files.catbox.moe/73bgpc.jpg",
"https://files.catbox.moe/8aguf5.jpg",
"https://files.catbox.moe/g48qfe.jpg",
"https://files.catbox.moe/0gtahy.jpg",
"https://files.catbox.moe/z2jdlo.jpg",
"https://files.catbox.moe/814bhm.jpg",
"https://files.catbox.moe/y5l3hq.jpg",
"https://files.catbox.moe/kevttt.jpg",
].getRandom()

global.urls = [
"https://qu.ax/vnPMj.mp4",
"https://qu.ax/vnPMj.mp4",
];
let gifUrl = urls[Math.floor(Math.random() * urls.length)];

//global.rcanal = { contextInfo: { isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: channelRD.id, serverMessageId: 100, newsletterName: channelRD.name, }, externalAdReply: { showAdAttribution: true, title: textbot, body: dev, mediaUrl: null, description: null, previewType: "PHOTO", thumbnailUrl: icono, sourceUrl: redes, mediaType: 1, renderLargerThumbnail: false }, }, }}
global.rcanal = { contextInfo: { isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: channelRD.id, serverMessageId: 100, newsletterName: channelRD.name, }, }, }}


export default handler

function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]
  }

async function getRandomChannel() {
let randomIndex = Math.floor(Math.random() * canalIdM.length)
let id = canalIdM[randomIndex]
let name = canalNombreM[randomIndex]
return { id, name }
}         
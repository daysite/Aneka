import { smsg } from './lib/simple.js'
import { format } from 'util' 
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'

const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
    clearTimeout(this)
    resolve()
}, ms))

export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    if (!chatUpdate)
        return
    this.pushMessage(chatUpdate.messages).catch(console.error)
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m)
        return
    if (global.db.data == null)
        await global.loadDatabase()
    try {
        m = smsg(this, m) || m
        if (!m)
            return
        m.exp = 0
        m.diamantes = false
        try {
            let user = global.db.data.users[m.sender]
            if (typeof user !== 'object')
                global.db.data.users[m.sender] = {}
            if (user) {
                if (!isNumber(user.exp))
                    user.exp = 0
                if (!isNumber(user.diamantes))
                    user.diamantes = 15
                if (!('premium' in user)) 
                    user.premium = false
                if (!user.premium) 
                    user.premiumTime = 0
                if (!('registered' in user))
                    user.registered = false
                if (!user.registered) {
                    if (!('name' in user))
                        user.name = m.name
                    if (!('description' in user))
                        user.description = ''
                    if (!isNumber(user.age))
                        user.age = -1
                    if (!isNumber(user.regTime))
                        user.regTime = -1
                }
                if (!isNumber(user.afk))
                    user.afk = -1
                if (!('afkReason' in user))
                    user.afkReason = ''
                if (!('role' in user))
                    user.role = 'Novato'
                if (!('banned' in user))
                    user.banned = false
                if (!('muto' in user))
                    user.muto = false
                if (!('useDocument' in user))
                    user.useDocument = false
                if (!isNumber(user.level))
                    user.level = 0
                if (!isNumber(user.bank))
                    user.bank = 0
                if (!isNumber(user.warn))
                    user.warn = 0
            } else
                global.db.data.users[m.sender] = {
                    exp: 0,
                    diamantes: 15,
                    registered: false,
                    name: m.name,
                    description: '',
                    age: -1,
                    regTime: -1,
                    afk: -1,
                    afkReason: '',
                    banned: false,
                    muto: false,
                    useDocument: false,
                    bank: 0,
                    level: 0,
                    role: 'Novato',
                    premium: false,
                    premiumTime: 0,
                }
            let chat = global.db.data.chats[m.chat]
            if (typeof chat !== 'object')
                global.db.data.chats[m.chat] = {}
            if (chat) {
                if (!('isBanned' in chat))
                    chat.isBanned = false
                if (!('welcome' in chat))
                    chat.welcome = false
                if (!('sAutoresponder' in chat))
                    chat.sAutoresponder = ''
                if (!('sWelcome' in chat))
                    chat.sWelcome = ''
                if (!('sBye' in chat))
                    chat.sBye = ''
                if (!('sKick' in chat))
                    chat.sKick = ''
                if (!('audios' in chat))
                    chat.audios = false
                if (!('detect' in chat))
                    chat.detect = true 
                if (!('antiLink' in chat))
                    chat.antiLink = false
                if (!('antiLink2' in chat))
                    chat.antiTraba = false
                if (!('antiTraba' in chat))
                    chat.antiLink2 = false
                if (!('onlyLatinos' in chat))
                    chat.onlyLatinos = false
                if (!('nsfw' in chat))
                    chat.nsfw = false           
                if (!('reaction' in chat))
                    chat.reaction = false
                if (!('simi' in chat))
                    chat.simi = false
                if (!('autolevelup' in chat))  
                    chat.autolevelup = false
                if (!('autoresponder' in chat)) 
                    chat.autoresponder = false
                if (!('autoaceptar' in chat)) 
                    chat.autoAceptar = false
                if (!('autorechazar' in chat)) 
                    chat.autoRechazar = false
                if (!('antiBot' in chat))
                     chat.antiBot = false
                if (!('antiBot2' in chat))
                     chat.antiBot2 = false
                if (!('antiver' in chat))
                    chat.antiver = false
                if (!('antifake' in chat))
                    chat.antifake = false
                if (!('delete' in chat))
                    chat.delete = false
                if (!isNumber(chat.expired))
                    chat.expired = 0
            } else
                global.db.data.chats[m.chat] = {
                    isBanned: false,
                    welcome: false,
                    sAutoresponder: '',
                    sWelcome: '',
                    sBye: '',
                    sKick: '',
                    delete: false,
                    audios: false,
                    detect: true,
                    onlyLatinos: false,
                    simi: false,
                    autolevelup: false,
                    autoresponder: false,
                    autoaceptar: false,
                    autorechazar: false,
                    antiLink: false,
                    antiLink2: false,
                    antiTraba: false,
                    antiBot: false,
                    antiBot2: false,
                    antifake: false,
                    antiver: false,
                    nsfw: false,
                    reaction: false,
                    expired: 0, 
                }
            var settings = global.db.data.settings[this.user.jid]
            if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {}
            if (settings) {
               if (!('self' in settings)) settings.self = false
               if (!('restrict' in settings)) settings.restrict = true
                if (!('jadibotmd' in settings)) settings.jadibotmd = false
                if (!('antiPrivate' in settings)) settings.antiPrivate = true
                if (!('autoread' in settings)) settings.autoread = false
                if (!('autoread2' in settings)) settings.autoread2 = false
                if (!('antiSpam' in settings)) settings.antiSpam = false
            } else global.db.data.settings[this.user.jid] = {
                self: false,
                restrict: true,
                jadibotmd: false,
                antiPrivate: true,
                autoread: false,
                autoread2: false,
                antiSpam: false,
                status: 0
            }
        } catch (e) {
            console.error(e)
        } //By will & Criss Validación Funcional
if (opts['nyimak']) return
if (!m.fromMe && opts['self']) return
if (opts['swonly'] && m.chat !== 'status@broadcast') return
if (typeof m.text !== 'string') m.text = ''

let _user = global.db.data?.users?.[m.sender]

const normalizeNum = jid => (jid || '').replace(/[^0-9]/g, '')
const senderNum = normalizeNum(m.sender)
const botNum = normalizeNum(conn.user?.id)

const owners = [
  conn.decodeJid(global.conn?.user?.id),
  ...(global.owner || []).map(([n]) => n)
].map(normalizeNum)

const mods = (global.mods || []).map(normalizeNum)
const prems = (global.prems || []).map(normalizeNum)

const isROwner = owners.includes(senderNum)
const isOwner = isROwner || m.fromMe
const isMods = isOwner || mods.includes(senderNum)
const isPrems = isOwner || prems.includes(senderNum) || _user?.prem === true

if (opts['queque'] && m.text && !(isMods || isPrems)) {
  let queque = this.msgqueque, delayTime = 5000
  const prevID = queque[queque.length - 1]
  queque.push(m.id || m.key.id)
  ;(async function waitForPrev() {
    while (queque.includes(prevID)) {
      await delay(delayTime)
    }
  })()
}

if (m.isBaileys) return

m.exp += Math.ceil(Math.random() * 10)


async function getLidFromJid(id, conn) {
  if (id.endsWith('@lid')) return id
  const res = await conn.onWhatsApp(id).catch(() => [])
  return res[0]?.lid || id
}

const senderLid = await getLidFromJid(m.sender, conn)
const botLid = await getLidFromJid(conn.user.jid, conn)
const senderJid = m.sender
const botJid = conn.user.jid

const groupMetadata = m.isGroup
  ? (conn.chats[m.chat]?.metadata || await conn.groupMetadata(m.chat).catch(() => null))
  : {}

const participants = groupMetadata?.participants || []


const getParticipant = (jid, lid) =>
  participants.find(p =>
    [p.id, p.jid].includes(jid) || [p.id, p.jid].includes(lid)
  ) || {}

const user = getParticipant(senderJid, senderLid)
const bot = getParticipant(botJid, botLid)

const isRAdmin = user?.admin === "superadmin"
const isAdmin = ["admin", "superadmin"].includes(user?.admin)
const isBotAdmin = ["admin", "superadmin"].includes(bot?.admin)

/*
if (opts['nyimak']) return
if (!m.fromMe && opts['self']) return
if (opts['swonly'] && m.chat !== 'status@broadcast') return
if (typeof m.text !== 'string') m.text = ''

let _user = global.db.data?.users?.[m.sender]

const cleanSender = m.sender.replace(/[^0-9]/g, '')
const senderType = m.sender.includes('@lid') ? '@lid' : '@s.whatsapp.net'

const isROwner = global.owner
  .map(([num]) => num.replace(/[^0-9]/g, ''))
  .some(n => [`${n}@s.whatsapp.net`, `${n}@lid`].includes(m.sender))

const isOwner = isROwner || m.fromMe
const isPrems = isROwner || _user?.premiumTime > 0

if (!isOwner && opts['self']) return

if (opts['queque'] && m.text && !(isMods || isPrems)) {
  let queque = this.msgqueque
  const time = 5000
  const prevID = queque[queque.length - 1]
  queque.push(m.id || m.key.id)

  if (prevID) {
    await new Promise(resolve => {
      let check = setInterval(() => {
        if (!queque.includes(prevID)) {
          clearInterval(check)
          resolve()
        }
      }, time)
    })
  }
}

if (m.isBaileys) return

m.exp += Math.ceil(Math.random() * 10)

let usedPrefix 
let groupMetadata = {}
let participants = []
if (m.isGroup) {
  groupMetadata = await (this.groupMetadataCache?.[m.chat] 
    || conn.groupMetadata(m.chat).catch(_ => null) || {})
  participants = groupMetadata.participants || []
}

function findParticipant(jid) {
  return participants.find(p => p.jid === jid || p.lid === jid.split('@')[0]) || {}
}

const user = findParticipant(m.sender)
const bot  = findParticipant(conn.user?.jid)

// Admins
const isRAdmin = user.admin === 'superadmin'
const isAdmin = isRAdmin || user.admin === 'admin'
const isBotAdmin = ['admin', 'superadmin'].includes(bot.admin)

// Detect Business y Canales
m.isWABusiness = /smb[ai]/.test(global.conn.authState?.creds?.platform || '')
m.isChannel = /@newsletter$/.test(m.chat) || /@newsletter$/.test(m.sender)*/

        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin)
                continue
            if (plugin.disabled)
                continue
            const __filename = join(___dirname, name)
            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(this, m, {
                        chatUpdate,
                        __dirname: ___dirname,
                        __filename
                    })
                } catch (e) {
                    console.error(e)
                }
            }
            if (!opts['restrict'])
                if (plugin.tags && plugin.tags.includes('admin')) {
                    continue
                }
            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
            let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix
            let match = (_prefix instanceof RegExp ? 
                [[_prefix.exec(m.text), _prefix]] :
                Array.isArray(_prefix) ?
                    _prefix.map(p => {
                        let re = p instanceof RegExp ?
                            p :
                            new RegExp(str2Regex(p))
                        return [re.exec(m.text), re]
                    }) :
                    typeof _prefix === 'string' ?
                        [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
                        [[[], new RegExp]]
            ).find(p => p[1])
            if (typeof plugin.before === 'function') {
                if (await plugin.before.call(this, m, {
                    match,
                    conn: this,
                    participants,
                    groupMetadata,
                    user,
                    bot,
                    isROwner,
                    isOwner,
                    isRAdmin,
                    isAdmin,
                    isBotAdmin,
                    isPrems,
                    chatUpdate,
                    __dirname: ___dirname,
                    __filename
                }))
                    continue
            }
            if (typeof plugin !== 'function')
                continue
            if ((usedPrefix = (match[0] || '')[0])) {
                let noPrefix = m.text.replace(usedPrefix, '')
                let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
                args = args || []
                let _args = noPrefix.trim().split` `.slice(1)
                let text = _args.join` `
                command = (command || '').toLowerCase()
                let fail = plugin.fail || global.dfail
                let isAccept = plugin.command instanceof RegExp ? 
                    plugin.command.test(command) :
                    Array.isArray(plugin.command) ?
                        plugin.command.some(cmd => cmd instanceof RegExp ? 
                            cmd.test(command) :
                            cmd === command
                        ) :
                        typeof plugin.command === 'string' ? 
                            plugin.command === command :
                            false

                if (!isAccept) {
continue
}
m.plugin = name
if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
let chat = global.db.data.chats[m.chat]
let user = global.db.data.users[m.sender]
if (!['owner-unbanchat.js'].includes(name) && chat && chat.isBanned && !isROwner) return // Except this
if (name != 'owner-unbanchat.js' && name != 'owner-exec.js' && name != 'owner-exec2.js' && name != 'tool-delete.js' && chat?.isBanned && !isROwner) return 
if (m.text && user.banned && !isROwner) {
if (user.antispam > 2) return
m.reply(`*🚫 Está baneado(a), no puede usar los comandos de este bot!*\n\n${user.bannedReason ? `\n💌 *Motivo:* 
${user.bannedReason}` : '💌 *Motivo:* Sin Especificar'}\n\n⚠️ *Si cree que es un error contacte con mi creador:*\n- Wa.me/51927238856`)
user.antispam++        
return
}

//Modoadmin
let hl = global.prefix 
let adminMode = chat.modoadmin
let isPotentialCommand = plugins.botAdmin || plugins.admin || plugins.group || plugins || noPrefix || hl || m.text.slice(0, 1) == hl || plugins.command

if (adminMode && !isOwner && !isROwner && m.isGroup && !isAdmin && isPotentialCommand) continue

//Antispam 2                
/*if (user.antispam2 && isROwner) return
let time = global.db.data.users[m.sender].spam + 3000
if (new Date - global.db.data.users[m.sender].spam < 3000) return console.log(`[ SPAM ]`)*/
global.db.data.users[m.sender].spam = new Date * 1
}
              //  m.plugin = name
                if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
                    let chat = global.db.data.chats[m.chat]
                    let user = global.db.data.users[m.sender]
                    let setting = global.db.data.settings[this.user.jid]
                    if (name != 'owner-unbanchat.js' && chat?.isBanned)
                        return 
                    if (name != 'owner-unbanuser.js' && user?.banned)
                        return
                    if (name != 'owner-unbanbot.js' && setting?.banned)
                        return
                }
                if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) { 
                    fail('owner', m, this)
                    continue
                }
                if (plugin.rowner && !isROwner) { 
                    fail('rowner', m, this)
                    continue
                }
                if (plugin.owner && !isOwner) { 
                    fail('owner', m, this)
                    continue
                }
                if (plugin.mods && !isMods) { 
                    fail('mods', m, this)
                    continue
                }
                if (plugin.premium && !isPrems) { 
                    fail('premium', m, this)
                    continue
                }
                if (plugin.group && !m.isGroup) { 
                    fail('group', m, this)
                    continue
                } else if (plugin.botAdmin && !isBotAdmin) { 
                    fail('botAdmin', m, this)
                    continue
                } else if (plugin.admin && !isAdmin) { 
                    fail('admin', m, this)
                    continue
                }
                if (plugin.private && m.isGroup) {
                    fail('private', m, this)
                    continue
}
              if (plugin.register == true && _user.registered == false) { 
              fail('unreg', m, this)
            continue
           }
             m.isCommand = true
                let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17 
                if (xp > 200)
                    m.reply('chirrido -_-')
                else
                    m.exp += xp
                if (!isPrems && plugin.diamantes && global.db.data.users[m.sender].diamantes < plugin.diamantes * 1) {
                    conn.reply(m.chat, `*Se agotaron tus ${moneda}*`, m)
                    continue
                }
                let extra = {
                    match,
                    usedPrefix,
                    noPrefix,
                    _args,
                    args,
                    command,
                    text,
                    conn: this,
                    participants,
                    groupMetadata,
                    user,
                    bot,
                    isROwner,
                    isOwner,
                    isRAdmin,
                    isAdmin,
                    isBotAdmin,
                    isPrems,
                    chatUpdate,
                    __dirname: ___dirname,
                    __filename
                }
                try {
                    await plugin.call(this, m, extra)
                    if (!isPrems)
                        m.diamantes = m.diamantes || plugin.diamantes || false
                } catch (e) {
                    m.error = e
                    console.error(e)
                    if (e) {
                        let text = format(e)
                        /*for (let key of Object.values(global.APIKeys))
                            text = text.replace(new RegExp(key, 'g'), '#HIDDEN#')*/
                        m.reply(text)
                    }
                } finally {
                    if (typeof plugin.after === 'function') {
                        try {
                            await plugin.after.call(this, m, extra)
                        } catch (e) {
                            console.error(e)
                        }
                    }
                    if (m.diamantes)
                        conn.reply(m.chat, `Utilizaste *${+m.diamantes}* ${moneda}`, m)
                }
                break
            }
        }
    } catch (e) {
        console.error(e)
    } finally {
        if (opts['queque'] && m.text) {
            const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
            if (quequeIndex !== -1)
                this.msgqueque.splice(quequeIndex, 1)
        }
        let user, stats = global.db.data.stats
        if (m) {
            if (m.sender && (user = global.db.data.users[m.sender])) {
                user.exp += m.exp
                user.diamantes -= m.diamantes * 1
            }

            let stat
            if (m.plugin) {
                let now = +new Date
                if (m.plugin in stats) {
                    stat = stats[m.plugin]
                    if (!isNumber(stat.total))
                        stat.total = 1
                    if (!isNumber(stat.success))
                        stat.success = m.error != null ? 0 : 1
                    if (!isNumber(stat.last))
                        stat.last = now
                    if (!isNumber(stat.lastSuccess))
                        stat.lastSuccess = m.error != null ? 0 : now
                } else
                    stat = stats[m.plugin] = {
                        total: 1,
                        success: m.error != null ? 0 : 1,
                        last: now,
                        lastSuccess: m.error != null ? 0 : now
                    }
                stat.total += 1
                stat.last = now
                if (m.error == null) {
                    stat.success += 1
                    stat.lastSuccess = now
                }
            }
        }

        try {
     if (!opts['noprint']) await (await import(`./lib/print.js`)).default(m, this)
} catch (e) { 
      console.log(m, m.quoted, e)}
       let settingsREAD = global.db.data.settings[this.user.jid] || {}  
      if (opts['autoread']) await this.readMessages([m.key])
      if (settingsREAD.autoread2) await this.readMessages([m.key])  

     if (db.data.chats[m.chat].reaction && m.text.match(/(ción|navidad|aje|oso|izar|mente|pero|tion|age|ous|ate|and|but|ify|ai|adow|a|s)/gi)) {
         let emot = pickRandom(["🍟", "😃", "😄", "😁", "😆", "🍓", "😅", "😂", "🤣", "🥲", "☺️", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "🌺", "🌸", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🌟", "🤓", "😎", "🥸", "🤩", "🥳", "😏", "💫", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😶‍🌫️", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🫣", "🤭", "🤖", "🍭", "🤫", "🫠", "🤥", "😶", "📇", "😐", "💧", "😑", "🫨", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😮‍💨", "😵", "😵‍💫", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👺", "🧿", "🌩", "👻", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🫶", "👍", "✌️", "🙏", "🫵", "🤏", "🤌", "☝️", "🖕", "🙏", "🫵", "🫂", "🐱", "🤹‍♀️", "🤹‍♂️", "🗿", "✨", "⚡", "🔥", "🌈", "🩷", "❤️", "🧡", "💛", "💚", "🩵", "💙", "💜", "🖤", "🩶", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "🚩", "👊", "⚡️", "💋", "🫰", "💅", "👑", "🐣", "🐤", "🐈"])
       if (!m.fromMe) return this.sendMessage(m.chat, { react: { text: emot, key: m.key }})
       }
     function pickRandom(list) { return list[Math.floor(Math.random() * list.length)]}
       }}

global.dfail = (type, m, conn) => {

let user2 = m.pushName || 'Anónimo'
const msg = {
rowner: '☁ 𝖤𝗌𝗍𝖺 𝖿𝗎𝗇𝖼𝗂𝗈́𝗇 𝗌𝗈𝗅𝗈 𝗉𝗎𝖾𝖽𝖾 𝗌𝖾𝗋 𝗎𝗍𝗂𝗅𝗂𝗓𝖺𝖽𝖺 𝗉𝗈𝗋 𝖾𝗅 𝖼𝗋𝖾𝖺𝖽𝗈𝗋 𝖽𝖾𝗅 𝖻𝗈𝗍', 
owner: '☁ 𝖤𝗌𝗍𝖺 𝖿𝗎𝗇𝖼𝗂𝗈́𝗇 𝗌𝗈𝗅𝗈 𝗉𝗎𝖾𝖽𝖾 𝗌𝖾𝗋 𝗎𝗍𝗂𝗅𝗂𝗓𝖺𝖽𝖺 𝗉𝗈𝗋 𝖾𝗅 𝗉𝗋𝗈𝗉𝗂𝖾𝗍𝖺𝗋𝗂𝗈 𝖽𝖾𝗅 𝖻𝗈𝗍', 
mods: '☁ 𝖤𝗌𝗍𝖾 𝖼𝗈𝗆𝖺𝗇𝖽𝗈 𝗌𝗈𝗅𝗈 𝗉𝗎𝖾𝖽𝖾 𝗌𝖾𝗋 𝗎𝗍𝗂𝗅𝗂𝗓𝖺𝖽𝗈 𝗉𝗈𝗋 𝗅𝗈𝗌 𝗆𝗈𝖽𝖾𝗋𝖺𝖽𝗈𝗋𝖾𝗌 𝖽𝖾𝗅 𝖻𝗈𝗍', 
premium: '☁ 𝖤𝗌𝗍𝖾 𝖼𝗈𝗆𝖺𝗇𝖽𝗈 𝗌𝗈𝗅𝗈 𝗉𝗎𝖾𝖽𝖾 𝗌𝖾𝗋 𝗎𝗍𝗂𝗅𝗂𝗓𝖺𝖽𝗈 𝗉𝗈𝗋 𝗎𝗌𝗎𝖺𝗋𝗂𝗈𝗌 𝗉𝗋𝖾𝗆𝗂𝗎𝗆', 
group: '☁ 𝖤𝗌𝗍𝖾 𝖼𝗈𝗆𝖺𝗇𝖽𝗈 𝗌𝗈𝗅𝗈 𝗉𝗎𝖾𝖽𝖾 𝗌𝖾𝗋 𝖾𝗃𝖾𝖼𝗎𝗍𝖺𝖽𝗈 𝖾𝗇 𝗀𝗋𝗎𝗉𝗈𝗌', 
private: '☁ 𝖤𝗌𝗍𝖺 𝖿𝗎𝗇𝖼𝗂𝗈́𝗇 𝗌𝗈𝗅𝗈 𝗉𝗎𝖾𝖽𝖾 𝗌𝖾𝗋 𝖾𝗃𝖾𝖼𝗎𝗍𝖺𝖽𝖺 𝖾𝗇 𝗆𝗂 𝖼𝗁𝖺𝗍 𝗉𝗋𝗂𝗏𝖺𝖽𝗈', 
admin: '☁ 𝖤𝗌𝗍𝖾 𝖼𝗈𝗆𝖺𝗇𝖽𝗈 𝗌𝗈𝗅𝗈 𝗉𝗎𝖾𝖽𝖾 𝗌𝖾𝗋 𝗎𝗍𝗂𝗅𝗂𝗓𝖺𝖽𝗈 𝗉𝗈𝗋 𝗅𝗈𝗌 𝖺𝖽𝗆𝗂𝗇𝗌 𝖽𝖾𝗅 𝗀𝗋𝗎𝗉𝗈!!', 
botAdmin: '☁ 𝖯𝖺𝗋𝖺 𝗉𝗈𝖽𝖾𝗋 𝗎𝗌𝖺𝗋 𝖾𝗌𝗍𝖾 𝖼𝗈𝗆𝖺𝗇𝖽𝗈 𝖾𝗌 𝗇𝖾𝖼𝖾𝗌𝖺𝗋𝗂𝗈 𝗊𝗎𝖾 𝗒𝗈 𝗌𝖾𝖺 𝖺𝖽𝗆𝗂𝗇!!',
unreg: `👤 𝖭𝗈 𝗍𝖾 𝖾𝗇𝖼𝗎𝖾𝗇𝗍𝗋𝖺𝗌 𝗋𝖾𝗀𝗂𝗌𝗍𝗋𝖺𝖽𝗈(𝖺)\n𝖱𝖾𝗀𝗂𝗌𝗍𝗋𝖺𝗍𝖾 𝗉𝖺𝗋𝖺 𝗎𝗌𝖺𝗋 𝖾𝗌𝗍𝖺 𝖿𝗎𝗇𝖼𝗂𝗈́𝗇.\n\n*#reg <nombre.edad>*\n\n> *\`Ejemplo:\`*\n> .reg ${user2}.18`,
restrict: '☁ 𝖤𝗌𝗍𝖺 𝖿𝗎𝗇𝖼𝗂𝗈́𝗇 𝖾𝗌𝗍𝖺 𝖽𝖾𝗌𝖺𝖼𝗍𝗂𝗏𝖺𝖽𝖺 𝗉𝗈𝗋 𝖾𝗅 𝖺𝖼𝗍𝗎𝖺𝗅 𝗈𝗐𝗇𝖾𝗋'
}[type];
if (msg) return conn.reply(m.chat, msg, m, rcanal).then(_ => m.react('✖️'))}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.magenta("Se actualizo 'handler.js'"))
    if (global.reloadHandler) console.log(await global.reloadHandler())
})
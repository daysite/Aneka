//Mejorado por Criss Escobar

let linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})(?:\s+([0-9]{1,3}))?/i

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply(`*${xowner} Por favor, ingresa el enlace del grupo.*`)

    try {
        let [_, code, expired] = text.match(linkRegex) || []
        if (!code) return m.reply('*⚠️ enlace inválido.*')

        let res = await conn.groupAcceptInvite(code)
        m.reply(`*✅ ${botname} se unió correctamente al grupo.*\n*¡Disfruta del Bot en tu grupo!*`)

/*let groupId = await conn.groupAcceptInvite(code)

let groupMetadata = await conn.groupMetadata(groupId).catch(() => null)
if (groupMetadata) return m.reply(`*[ 🦈 ] Ya estoy en este grupo.*`)

m.reply(`*✅ Shadow se unió correctamente al grupo.*\n*¡Disfruta del Bot en tu grupo!*`)*/


        if (expired) {
            expired = Math.min(999, Math.max(1, isNumber(expired) ? parseInt(expired) : 0))
            let chats = global.db.data.chats[res] || (global.db.data.chats[res] = {})
            chats.expired = +new Date() + expired * 1000 * 60 * 60 * 24
            m.reply(`*⌛ ${botname} permanecerá en el grupo durante \`${expired}\` días.*`)
        }
    } catch {
        return m.reply(`*✖️ Ocurrió un error al entrar al grupo.*`) 
    }
}

handler.help = ['join']
handler.tags = ['owner']
handler.command = ['join', 'entrar']
handler.rowner = true

export default handler

const isNumber = (x) => (x = parseInt(x), typeof x === 'number' && !isNaN(x))
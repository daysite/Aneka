/*let handler = async (m, { conn, args, usedPrefix, command }) => {
    let isClose = {
        'abrir': 'not_announcement',
        'cerrar': 'announcement',
    }[(args[0] || '')]
    if (isClose === undefined)
        await conn.reply(m.chat, `*🔐 Elija una opción.*\n\n*${usedPrefix + command}* abrir\n*${usedPrefix + command}* cerrar`, m, rcanal)
    await conn.groupSettingUpdate(m.chat, isClose)
}
handler.help = ['group *<abrir/cerrar>*']
handler.tags = ['gc']
handler.command = ['group', 'grupo'] 
handler.admin = true
handler.botAdmin = true

export default handler*/
let handler = async (m, { conn, args, usedPrefix, command }) => {
    //if (!m.isGroup) return m.reply('*❗ Este comando solo puede usarse en grupos.*')
    
    let options = {
        'abrir': 'not_announcement',
        'cerrar': 'announcement'
    }

    let action = options[(args[0] || '').toLowerCase()]
    if (!action) {
        return conn.reply(m.chat, `*🔐 Elija una opción válida:*\n\n*${usedPrefix + command} abrir* (todos pueden escribir)\n*${usedPrefix + command} cerrar* (solo admins pueden escribir)`, m)
    }

    try {
        await conn.groupSettingUpdate(m.chat, action)
        let texto = action === 'announcement' ? '*🔒 Grupo cerrado. Solo los admins pueden escribir.*' : '*🔓 Grupo abierto. Todos pueden escribir.*'
        await conn.reply(m.chat, texto, m)
    } catch (e) {
        console.error(e)
        await conn.reply(m.chat, '*⚠️ Ocurrió un error al intentar cambiar los ajustes del grupo.*\nAsegúrate de que el bot sea administrador.', m)
    }
}
handler.help = ['group *<abrir/cerrar>*']
handler.tags = ['gc']
handler.command = ['group', 'grupo']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
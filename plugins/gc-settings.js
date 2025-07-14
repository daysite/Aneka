let handler = async (m, { conn, args, usedPrefix, command }) => {
    
    let options = {
        'abrir': 'not_announcement',
        'cerrar': 'announcement'
    }

    let action = options[(args[0] || '').toLowerCase()]
    if (!action) {
        return conn.reply(m.chat, `*🔐 Elija una opción válida:*\n\n*${usedPrefix + command} abrir*\n> Todos pueden escribir\n*${usedPrefix + command} cerrar*\n> Solo admins pueden escribir`, m)
    }

    try {
        await conn.groupSettingUpdate(m.chat, action)
    } catch (e) {
        console.error(e)
        await conn.reply(m.chat, '*⚠️ Ocurrió un error al intentar cambiar los ajustes del grupo.*\nAsegúrate de que el bot sea administrador.', m)
    }
}
handler.help = ['group *<abrir/cerrar>*']
handler.tags = ['gc']
handler.command = ['group', 'grupo']
handler.admin = true
handler.botAdmin = true
handler.group = true

export default handler
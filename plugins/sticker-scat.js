import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn }) => {
    try {
        let res = await fetch('https://nekos.life/api/v2/img/meow')
        let json = await res.json()
        let stiker = await sticker(null, json.url, global.packname, global.author)
        
        if (stiker) {
            return conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, false, {
                asSticker: true
            })
        } else {
            throw new Error('No se pudo generar el sticker.')
        }
    } catch (err) {
        console.error(err)
        m.reply('⚠️ *Error:* No se pudo crear el sticker. Intenta de nuevo.')
    }
}

handler.help = ['scat']
handler.tags = ['sticker']
handler.command = ["scat", "stickercat", "cats"]

export default handler

// Comando HDR - Shadow Bot
// By: Criss Escobar

import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // Verificar si hay imagen
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!/image/.test(mime)) {
      return m.reply(`乂 *HDR - MEJORAR CALIDAD*\n\n✨ Responde a una imagen o envíala junto con el comando:\n\n> *Ejemplo:* ${usedPrefix + command} (respondiendo a una imagen)\n\n> Shadow Ultra MD`)
    }

    // Descargar imagen
    let img = await q.download?.()
    if (!img) throw 'No se pudo descargar la imagen'

    // Subir a Uguu temporalmente (para pasarle la URL a la API)
    let form = new FormData()
    form.append('files[]', img, 'image.jpg')
    let up = await fetch('https://uguu.se/upload.php', { method: 'POST', body: form })
    let uploaded = await up.json()
    let imageUrl = uploaded.files[0].url

    // Usar API HDR
    let apiUrl = `https://api.vreden.my.id/api/artificial/hdr?url=${imageUrl}&pixel=4`
    let res = await fetch(apiUrl)
    let data = await res.json()

    if (data?.result?.data?.downloadUrls?.length === 0) throw 'No se pudo mejorar la imagen'

    let hdrUrl = data.result.data.downloadUrls[0]

    // Enviar imagen mejorada
    await conn.sendFile(m.chat, hdrUrl, 'hdr.jpg', `乂 *HDR - RESULTADO*\n\n✅ Imagen mejorada con éxito\n📂 Tamaño: ${(data.result.data.filesize/1024/1024).toFixed(2)} MB\n📸 Formato: ${data.result.data.imagemimetype}\n\n> Shadow Ultra MD`, m)

  } catch (e) {
    console.error(e)
    m.reply('❌ Ocurrió un error al procesar la imagen')
  }
}

handler.command = /^(hdr)$/i
export default handler
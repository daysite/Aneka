
import fs from "fs"
import path from "path"
import fetch from "node-fetch"
import Jimp from "jimp"
import FormData from "form-data"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const handler = async (m, { conn }) => {
  try {
    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || q.mediaType || ""

    if (!/^image\/(jpe?g|png)$/.test(mime)) {
      return m.reply(`*${xtools} Por favor, responde a una imagen.*`)
    }

    await m.react('⌛')

    const buffer = await q.download()
    const image = await Jimp.read(buffer)
    image.resize(800, Jimp.AUTO)

    const tmp = path.join(__dirname, `tmp_${Date.now()}.jpg`)
    await image.writeAsync(tmp)

    const uploaded = await uploadToUguu(tmp)
    if (!uploaded) throw new Error('*No se pudo subir la imagen a Uguu*')

    const hdrUrl = await hdrProcess(uploaded)
    if (!hdrUrl) throw new Error('*No se pudo procesar la imagen en HDR*')

    await conn.sendFile(m.chat, hdrUrl, 'hdr.jpg', `° *HDR - RESULTADO*\n\n✅ Imagen mejorada con éxito.\n\n> ${club}`, m)

  } catch (err) {
    conn.reply(m.chat, `❌ Error: ${err.message}\n> Shadow Ultra MD`, m)
  }
}

handler.help = ['hdr']
handler.tags = ['tools']
handler.command = ['hdr']

export default handler

async function uploadToUguu(filePath) {
  const form = new FormData()
  form.append("files[]", fs.createReadStream(filePath))

  try {
    const res = await fetch("https://uguu.se/upload.php", {
      method: "POST",
      headers: form.getHeaders(),
      body: form
    })

    const json = await res.json()
    await fs.promises.unlink(filePath)
    return json.files?.[0]?.url
  } catch {
    await fs.promises.unlink(filePath)
    return null
  }
}

async function hdrProcess(url) {
  const apiUrl = `https://api.vreden.my.id/api/artificial/hdr?url=${encodeURIComponent(url)}&pixel=4`
  const res = await fetch(apiUrl)
  if (!res.ok) return null
  const json = await res.json()
  return json?.result?.data?.downloadUrls?.[0] || null
}
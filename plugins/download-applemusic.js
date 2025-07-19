import fetch from 'node-fetch'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) throw `*[❗] Ingresa el enlace de Apple Music que deseas descargar.*\n\n*Ejemplo:*\n${usedPrefix + command} https://music.apple.com/es/album/guess-featuring-billie-eilish/1760420560?i=1760420750`

  const url = args[0]
  if (!url.includes('music.apple.com')) throw '*[❗] El enlace debe ser válido de Apple Music.*'

  try {
    await m.react('⏳') // Reacción de espera

    const res = await fetch(`https://delirius-apiofc.vercel.app/download/applemusicdl?url=${encodeURIComponent(url)}`)
    const json = await res.json()

    if (!json.status || !json.data?.download) {
      await m.react('❌')
      throw '*[❗] No se pudo obtener la descarga. Verifica el enlace.*'
    }

    const { name, artists, download } = json.data
    const filename = `${name} - ${artists}.mp3`.replace(/[\\/:*?"<>|]/g, '')

    await conn.sendMessage(m.chat, {
      audio: { url: download },
      mimetype: 'audio/mpeg',
      fileName: filename,
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    throw '*[❗] Hubo un error al procesar la solicitud. Intenta de nuevo más tarde.*'
  }
}

handler.command = /^(applemusic|apdl)$/i
handler.help = ['applemusic <url>']
handler.tags = ['downloader']

export default handler
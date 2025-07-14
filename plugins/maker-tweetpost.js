let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text) return m.reply(
        `*${xtools} Por favor, ingresa el texto para crear un post de tweet.*
> *\`Uso:\`* ${usedPrefix + command} texto | usuario | nombre | likes | citas | retweets | cliente | perfilURL | imagenURL`
    )

    const parts = text.split('|').map(part => part.trim())
    const [tweet, username, name, likes = '5000', quotes = '200', retweets = '1000', client = 'Twitter for Android', profile, tweet_image] = parts

    if (!tweet || !username) {
        return m.reply(`*${xtools} Ingresa al menos el texto del tweet y el usuario.*
> *\`Ejemplo:\`* ${usedPrefix + command} Hello World | shadow.xyz`)
    }

    const usernames = username.replace(/\s/g, '').replace(/^@/, '')
    const profiles = profile?.trim() || await (async () => {
        try {
            return await conn.profilePictureUrl(m.sender, "image")
        } catch {
            return 'https://files.catbox.moe/nwvkbt.png'
        }
    })()

    const displayName = name || m.pushName || "No Name"

    const PARAMS = new URLSearchParams({
        profile: profiles,
        name: displayName,
        username: usernames,
        tweet: tweet,
        image: tweet_image || '',
        theme: 'dark',
        retweets,
        quotes,
        likes,
        client
    })

    try {
        await conn.sendMessage(m.chat, { react: { text: "🔎", key: m.key } })
        await conn.sendMessage(m.chat, {
            image: { url: `https://api.siputzx.my.id/api/m/tweet?${PARAMS.toString()}` },
            caption: ''
        }, { quoted: m })
    } catch (err) {
        console.error('Error:', err)
        m.reply('*Error en la API*')
    }
}

handler.command = ['tweetpost', 'twp']
handler.tags = ['maker']
handler.help = ['tweetpost']
export default handler





/*
let handler = async (m, { conn, usedPrefix, command, text}) => {
    if (!text) return m.reply(`*${xtools} Por favor, ingresa el texto para crear un post de tweet.*
> *\`Uso:\`* ${usedPrefix + command} *txt* | *user* | *name* | *likes* | *cited txt* | *perfil URL* | *tweet img URL*`)

    const parts = text.split('|').map(part => part.trim())

    const tweet = parts[0]
    const username = parts[1]

    if (!tweet || !username || parts.length < 2) return m.reply(`*${xtools} Ingresa correctamente los parámetros para crear el post.*
> *\`Ejemplo:\`* ${usedPrefix + command} Hello Word | shadow.xyz | Shadow Ultra | 1000 | 500 | 100 | Twitter`)

    const usernames = username.replace(/\s/g, '')

    const name = parts.length > 2 && parts[2] ? parts[2] : null
    const likes = parts.length > 3 && parts[3] ? parts[3] : '5000'
    const quotes = parts.length > 4 && parts[4] ? parts[4] : '200'
    const retweets = parts.length > 5 && parts[5] ? parts[5] : '1000'
    const client = parts.length > 6 && parts[6] ? parts[6] : 'Twitter for Android'
    const profile = parts.length > 7 && parts[7] ? parts[7] : null
    const tweet_image = parts.length > 8 && parts[8] ? parts[8] : null


    let profiles = profile
    if (!profiles) {
        try {
            profiles = await conn.profilePictureUrl(m.sender, "image")
        } catch (err) {
            profiles = 'https://files.catbox.moe/nwvkbt.png'
        }
    }

    let names = name
    if (!names) {
        names = m.pushName || "No Name"
    }

    const PARAMS = new URLSearchParams({
        profile: profiles,
        name: names,
        username: usernames,
        tweet: tweet,
        image: tweet_image,
        theme: 'dark',
        retweets: retweets,
        quotes: quotes,
        likes: likes,
        client: client
    })

    try {
        await conn.sendMessage(m.chat, { react: { text: "🔎", key: m.key} })

        conn.sendMessage(m.chat, { image: { url: `https://api.siputzx.my.id/api/m/tweet?${PARAMS.toString()}` }, caption: '' }, { quoted: m })
    } catch (err) {
        console.error('Error:', err)
        m.reply('*Error en la api*')
    }
}

handler.command = ['tweetpost']
handler.tags = ['tools']
handler.help = ['tweetpost']
export default handler
*/

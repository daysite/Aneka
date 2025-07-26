/*import fetch from 'node-fetch'
const { generateWAMessageContent, generateWAMessageFromContent, proto } = (await import('@whiskeysockets/baileys')).default

let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) return m.reply('*🌴 Ingresa el texto de lo que quieres buscar en Spotify*\n> *\`Ejemplo:\`* .spotifysearch Gata Only');
await m.react('🕓');

try {
async function createImage(url) {
const { imageMessage } = await generateWAMessageContent({image: { url }}, {upload: conn.waUploadToServer})
return imageMessage
}

let push = [];
let api = await fetch(`https://delirius-apiofc.vercel.app/search/spotify?q=${encodeURIComponent(text)}`);
let json = await api.json()

for (let track of json.data) {
let image = await createImage(track.image)
 

        push.push({
            body: proto.Message.InteractiveMessage.Body.fromObject({
                text: `◦ *Título:* ${track.title} \n◦ *Artistas:* ${track.artist} \n◦ *Duración:* ${track.duration} \n◦ *Popularidad:* ${track.popularity} \n◦ *Fecha:* ${track.publish}`
            }),
            footer: proto.Message.InteractiveMessage.Footer.fromObject({
                text: '' 
            }),
            header: proto.Message.InteractiveMessage.Header.fromObject({
                title: '',
                hasMediaAttachment: true,
                imageMessage: image 
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                buttons: [
{
"name": "cta_copy",
"buttonParamsJson": "{\"display_text\":\"𝖣𝖾𝗌𝖼𝖺𝗋𝗀𝖺𝗋 𝖺𝗎𝖽𝗂𝗈\",\"id\":\"123456789\",\"copy_code\":\".spotify " + track.url + "\"}"
},
]
})
});
}

const msg = generateWAMessageFromContent(m.chat, {
viewOnceMessage: {
message: {
messageContextInfo: {
deviceListMetadata: {},
deviceListMetadataVersion: 2
},
interactiveMessage: proto.Message.InteractiveMessage.fromObject({
body: proto.Message.InteractiveMessage.Body.create({text: '*`\Resultados de:\`* ' + `${text}`}),
footer: proto.Message.InteractiveMessage.Footer.create({text: 'Spotify - Search'}),
header: proto.Message.InteractiveMessage.Header.create({hasMediaAttachment: false}),
carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({cards: [...push]})
})
}}}, {
    'quoted': m
  });

await m.react('✅');
await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
} catch (error) {
console.error(error)
}}

handler.help = ["spotifysearch"]
handler.tags = ["search"]
handler.command = /^(spotifysearch|spsearch|spotifys)$/i

export default handler
*/

//MEJORA PARA SHADOW ULTRA
import fetch from 'node-fetch';
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `*🌴 Ingresa lo que deseas buscar en Spotify.*\n> *\`Ejemplo:\`* ${usedPrefix + command} Quevedo`;

  await m.react('🕐');

  try {
    const res = await fetch(`https://delirius-apiofc.vercel.app/search/spotify?q=${encodeURIComponent(text)}`);
    const json = await res.json();

    const tracks = json.data;
    if (!tracks.length) throw '❌ *No se encontraron resultados en Spotify.*';

    const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];

    const media = await prepareWAMessageMedia(
      { image: { url: randomTrack.image } },
      { upload: conn.waUploadToServer }
    );

    const listMessage = {
      body: {
        text: `> *Resultados encontrados:* \`${tracks.length}\`\n\n🎧 *${randomTrack.title}*\n\n≡ ☁️ *\`Artista:\`* ${randomTrack.artist}\n≡ 🌵 *\`Duración:\`* ${randomTrack.duration}\n≡ 🌿 *\`Popularidad:\`* ${randomTrack.popularity}\n≡ 🍁 *\`Fecha:\`* ${randomTrack.publish}\n≡ 🌵 *Enlace:* ${randomTrack.url}`
      },
      footer: { text: 'sʜᴀᴅᴏᴡ ᴜʟᴛʀᴀ ᴍᴅ' },
      header: {
        title: '```乂 SPOTIFY - SEARCH```',
        hasMediaAttachment: true,
        imageMessage: media.imageMessage
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: 'Resultados de Spotify',
              sections: tracks.map(track => ({
                title: `${track.title}`,
                rows: [
                  {
                    header: track.title,
                    title: track.artist,
                    description: `Descargar audio | Popularidad: ${track.popularity}`,
                    id: `.spotify ${track.url}`
                  }
                ]
              }))
            })
          }
        ],
        messageParamsJson: ''
      }
    };

    const userJid = conn?.user?.jid || m.key.participant || m.chat;
    const msg = generateWAMessageFromContent(m.chat, { interactiveMessage: listMessage }, { userJid, quoted: m });

    await m.react('✅');
    conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

  } catch (e) {
    console.error(e);
    await m.reply('⚠️ Ocurrió un error al buscar en Spotify.');
  }
};

handler.help = ['spotifysearch'];
handler.tags = ['search'];
handler.command = /^(spotifysearch|spsearch)$/i;

export default handler;

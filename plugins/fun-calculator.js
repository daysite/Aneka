/*const handler = async (m, { conn, command, text }) => {
  if (!text) return conn.reply(m.chat, `*${xfun} Por favor, menciona algún usuario.*`, m);

  const percentages = Math.floor(Math.random() * 501);
  const emojis = {
gay: '🏳️‍🌈', lesbiana: '🏳️‍🌈', pajero: '😏💦', pajera: '😏💦', puto: '🔥🥵', puta: '🔥🥵', manco: '🎮💀', manca: '🎮💀', rata: '🐁🧀', prostituto: '🫦💋', prostituta: '🫦💋', sinpoto: '😂', sintetas: '😿', chipi: '😹🫵🏻'
  };

  const descriptions = {
    gay: [
"💙 Parece que solo te gusta un poco la fiesta arcoíris.",
"🖤 Tu no eres amigo... ¡Tu eres amige! 💀",
"💜 ¡Nivel DIOS! Ya ni necesitas salir del clóset, lo rompiste amige."
    ],
    lesbiana: [
"👻 Tal vez un par de maratones de series lésbicas ayuden.",
"💗 No necesitas confirmación, ya lo sabíamos.",
"❣️ ¡Tu amor por las chicas es más fuerte que un ship de anime!"
    ],
    pajero: [
"🧡 Relájate, el internet no se va a acabar.",
"💞 Bueno, al menos te ejercitas un brazo...",
"💕 ¡Tus manos ya deberían estar aseguradas como patrimonio nacional!"
    ],
    pajera: [
"🧡 Relájate, el internet no se va a acabar.",
"💞 Bueno, al menos te ejercitas un brazo...",
"💕 ¡Tus manos ya deberían estar aseguradas como patrimonio nacional!"
    ],
    puto: [
"😼 Tranqui, no todos nacen con el talento.",
"😺 Si sigues así, te harán monumento en Tinder.",
"😻 ¡Ya ni el Diablo puede competir contigo!"
    ],
    puta: [
"😼 Tranqui, no todos nacen con el talento.",
"😺 Si sigues así, te dejarán mas abierta que las puertas del cielo vv.",
"😻 ¡Más información a su privado, uff mi amor!"
    ],
    manco: [
"🎮 ¿Seguro que no juegas con los pies?",
"🥷 ¡Cuidado! Hasta los bots juegan mejor que tú.",
"💀 Récord mundial en fallar tiros... ¡Sin balas!"
    ],
    manca: [
"🎮 ¿Porque eres así? Re Mala",
"🥷 Anda a la cocina mejor no servís pa jugar",
"💀 Récord mundial en fallar tiros... ¡Sin balas!"
    ],
    rata: [
"🐁 Te falta robar un poco más, sigue practicando.",
"😂 Roba peor que el Real Madrid el puto este",
"💖 ¡Eres más rata que Remy de Ratatouille!"
    ],
    prostituto: [
"🗣️ Tranquilo, el mercado siempre necesita talento nuevo.",
"✨ ¡Tus servicios tienen 5 estrellas en Google!",
"💖 Eres tan solicitado que ya tienes tarjeta VIP."
    ],
    prostituta: [
"🙈 Tranquila que te voy a dar tu pingasaurio.",
"🥵 ¿Lo haces por gusto verdad?",
"💖 ¿Cuando hacemos un trío? Nena"
    ],
    sinpoto: [
"👀 ¿Seguro que no eres hombre con pelo largo?",
"😹 Ni con cirugía te levantas ese autoestima",
"🙉 Hasta un mosquito hace más bulto que tú."
    ],
    sintetas: [
"📭 Mas vacía que el buzón de alguien sin amigos.",
"🌚 Da igual si estas defrente o de espalda, esque no hay diferencia.",
"🫨 Se supone que la pubertad ayuda, ¿Qué pasó contigo?"
    ],
    chipi: [
"🤡 Lo tuyo no es mini, es edición limitada.",
"😹 Lo bueno es que los golpes en la entrepierna no te hacen nada.",
"💀 Dicen q lo importante es como se usa, pero en tu casi ni así."
    ]
  };

  if (!descriptions[command]) return m.reply(`*[ ⚠️ ] Comando inválido.*`);

  const emoji = emojis[command] || '';
  let description;
  if (percentages < 150) description = descriptions[command][0];
  else if (percentages > 400) description = descriptions[command][2];
  else description = descriptions[command][1];

  const responses = [
    "El destino lo ha decidido.",
    "Los datos no mienten.",
    "¡Aquí tienes tu certificado oficial!"
  ];
  const response = responses[Math.floor(Math.random() * responses.length)];

  const cal = `*\`🤍 𝖢𝖠𝖫𝖢𝖴𝖫𝖠𝖳𝖮𝖱 🤍\`*

🌿 *Los cálculos han arrojado que ${text.toUpperCase()} es* \`${percentages}%\` *${command} ${emoji}*

*${description}*
> *${response}*`.trim();

  async function loading() {
    const hawemod = [
      "《 █▒▒▒▒▒▒▒▒▒▒▒》10%",
      "《 ████▒▒▒▒▒▒▒▒》30%",
      "《 ███████▒▒▒▒▒》50%",
      "《 ██████████▒▒》80%",
      "《 ████████████》100%"
    ];

    let { key } = await conn.sendMessage(m.chat, { text: `*☕ ¡Calculando Porcentaje!*`, mentions: conn.parseMention(cal) });

    for (let i = 0; i < hawemod.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await conn.sendMessage(m.chat, { text: hawemod[i], edit: key });
    }

    await conn.sendMessage(m.chat, { text: cal, edit: key, mentions: conn.parseMention(cal) });
  }

  loading();
};

handler.tags = ['fun'];
handler.group = true;
handler.command = ['gay', 'lesbiana', 'pajero', 'pajera', 'puto', 'puta', 'manco', 'manca', 'rata', 'prostituto', 'prostituta', 'sinpoto', 'sintetas', 'chipi'];
handler.help = ['gay', 'lesbiana', 'pajero', 'pajera', 'puto', 'puta', 'manco', 'manca', 'rata', 'prostituto', 'prostituta', 'sinpoto', 'sintetas', 'chipi'];

export default handler;*/

const handler = async (m, { conn, command, args }) => {

  let user = m.mentionedJid && m.mentionedJid[0]
           ? m.mentionedJid[0]
           : m.quoted?.sender;

  if (!user) return conn.reply(m.chat, `*${xfun} Por favor, menciona algún usuario.*`, m);

  const taguser = '@' + user.split('@')[0];
  const percentage = Math.floor(Math.random() * 501);

  const emojis = {
    kabrazo: '🏳️‍🌈', lesbiana: '🏳️‍🌈', pajero: '😏💦', pajera: '😏💦', puto: '🔥🥵',
    puta: '🔥🥵', manco: '🎮💀', manca: '🎮💀', rata: '🐁🧀', prostituto: '🫦💋',
    prostituta: '🫦💋', sinpoto: '😂', sintetas: '😿', chipi: '😹🫵🏻'
  };

  const descriptions = {
    kabrazo: [
      "💙 Parece que solo te gusta un poco la fiesta arcoíris.",
      "🖤 Tú no eres amigo... ¡Tú eres amigue! 💀",
      "💜 ¡Nivel DIOS! Ya ni necesitas salir del clóset, lo rompiste amige."
    ],
    lesbiana: [
      "👻 Tal vez un par de maratones de series lésbicas ayuden.",
      "💗 No necesitas confirmación, ya lo sabíamos.",
      "❣️ ¡Tu amor por las chicas es más fuerte que un ship de anime!"
    ],
    pajero: [
      "🧡 Relájate, el internet no se va a acabar.",
      "💞 Bueno, al menos te ejercitas un brazo...",
      "💕 ¡Tus manos ya deberían estar aseguradas como patrimonio nacional!"
    ],
    pajera: [
      "🧡 Relájate, el internet no se va a acabar.",
      "💞 Bueno, al menos te ejercitas un brazo...",
      "💕 ¡Tus manos ya deberían estar aseguradas como patrimonio nacional!"
    ],
    puto: [
      "😼 Tranqui, no todos nacen con el talento.",
      "😺 Si sigues así, te harán monumento en Tinder.",
      "😻 ¡Ya ni el Diablo puede competir contigo!"
    ],
    puta: [
      "😼 Tranqui, no todos nacen con el talento.",
      "😺 Si sigues así, te dejarán más abierta que las puertas del cielo vv.",
      "😻 ¡Más información a su privado, uff mi amor!"
    ],
    manco: [
      "🎮 ¿Seguro que no juegas con los pies?",
      "🥷 ¡Cuidado! Hasta los bots juegan mejor que tú.",
      "💀 Récord mundial en fallar tiros... ¡Sin balas!"
    ],
    manca: [
      "🎮 ¿Por qué eres así? Re mala.",
      "🥷 Anda a la cocina mejor, no servís pa' jugar.",
      "💀 Récord mundial en fallar tiros... ¡Sin balas!"
    ],
    rata: [
      "🐁 Te falta robar un poco más, sigue practicando.",
      "😂 Roba peor que el Real Madrid el puto este.",
      "💖 ¡Eres más rata que Remy de Ratatouille!"
    ],
    prostituto: [
      "🗣️ Tranquilo, el mercado siempre necesita talento nuevo.",
      "✨ ¡Tus servicios tienen 5 estrellas en Google!",
      "💖 Eres tan solicitado que ya tienes tarjeta VIP."
    ],
    prostituta: [
      "🙈 Tranquila que te voy a dar tu pingasaurio.",
      "🥵 ¿Lo haces por gusto, verdad?",
      "💖 ¿Cuándo hacemos un trío? Nena"
    ],
    sinpoto: [
      "👀 ¿Seguro que no eres hombre con pelo largo?",
      "😹 Ni con cirugía te levantas ese autoestima.",
      "🙉 Hasta un mosquito hace más bulto que tú."
    ],
    sintetas: [
      "📭 Más vacía que el buzón de alguien sin amigos.",
      "🌚 Da igual si estás de frente o de espalda, no hay diferencia.",
      "🫨 Se supone que la pubertad ayuda, ¿qué pasó contigo?"
    ],
    chipi: [
      "🤡 Lo tuyo no es mini, es edición limitada.",
      "😹 Lo bueno es que los golpes en la entrepierna no te hacen nada.",
      "💀 Dicen que lo importante es cómo se usa, pero en tu caso ni así."
    ]
  };

  if (!descriptions[command]) return conn.reply(m.chat, '*⚠️ Comando inválido.*', m);

  const emoji = emojis[command] || '';
  let description;
  if (percentage < 150) description = descriptions[command][0];
  else if (percentage > 400) description = descriptions[command][2];
  else description = descriptions[command][1];

  const responses = [
    "El destino lo ha decidido.",
    "Los datos no mienten.",
    "¡Aquí tienes tu certificado oficial!"
  ];
  const finalResponse = responses[Math.floor(Math.random() * responses.length)];

  const cal = `*🤍 \`𝖢𝖠𝖫𝖢𝖴𝖫𝖠𝖳𝖮𝖱 𝖱𝖠𝖭𝖣\` 🤍*

🌷 *Los cálculos han arrojado que* *${taguser}* *es* \`${percentage}%\` *${command} ${emoji}*

*${description}*
> *${finalResponse}*`.trim();

  async function loading() {
    const bars = [
      "█▒▒▒▒▒▒▒▒▒10%",
      "████▒▒▒▒▒▒30%",
      "█████▒▒▒▒▒50%",
      "██████████100%",
      "██████████100%"
    ];

    let { key } = await conn.sendMessage(m.chat, {
      text: '☁️ 𝐍𝐨𝐰 𝐥𝐨𝐚𝐝𝐢𝐧𝐠. . .',
      mentions: [user]
    });

    for (let i = 0; i < bars.length; i++) {
      await new Promise(res => setTimeout(res, 1000));
      await conn.sendMessage(m.chat, { text: bars[i], edit: key });
    }

    await conn.sendMessage(m.chat, {
      text: cal,
      edit: key,
      mentions: [user]
    });
  }

  loading();
};

handler.tags = ['fun'];
handler.group = true;
handler.command = ['kabrazo', 'lesbiana', 'pajero', 'pajera', 'puto', 'puta', 'manco', 'manca', 'rata', 'prostituto', 'prostituta', 'sinpoto', 'sintetas', 'chipi'];
handler.help = handler.command;

export default handler;

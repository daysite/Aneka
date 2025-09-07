import fetch from 'node-fetch';

// API CONFIABLE DE POKÉMON TCG
const POKEMON_TCG_API = 'https://api.pokemontcg.io/v2/cards';

let handler = async (m, { conn, command, usedPrefix, args, text }) => {
  if (!text) {
    return conn.reply(m.chat, 
      `🃏 *Pokémon Card Finder* 🃏\n\n` +
      `❌ Debes ingresar el nombre de un Pokémon.\n\n` +
      `💡 *Ejemplos:*\n` +
      `> ${usedPrefix + command} Pikachu\n` +
      `> ${usedPrefix + command} Charizard\n` +
      `> ${usedPrefix + command} Mewtwo\n\n` +
      `🌐 *Busca cartas de Pokémon TCG*`, 
    m);
  }
  
  await m.react('🕒');
  
  try {
    // Buscar cartas usando la API oficial de Pokémon TCG
    const searchUrl = `${POKEMON_TCG_API}?q=name:${encodeURIComponent(text)}*&orderBy=-set.releaseDate&pageSize=10`;
    
    await conn.reply(m.chat, `🔍 *Buscando cartas de:* ${text}\n\n⏳ Consultando Pokémon TCG API...`, m);
    
    const response = await fetch(searchUrl, { 
      timeout: 15000,
      headers: {
        'X-Api-Key': 'tu-api-key-aqui', // Opcional, funciona sin API key también
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      await m.react('✖️');
      return conn.reply(m.chat, 
        `❌ Error en la API (Código: ${response.status})\n\n` +
        `Intenta más tarde o con otro Pokémon.`, 
      m);
    }
    
    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      await m.react('✖️');
      return conn.reply(m.chat, 
        `❌ No se encontraron cartas para: "${text}"\n\n` +
        `💡 *Intenta:*\n` +
        `• Revisar el nombre del Pokémon\n` +
        `• Usar nombres en inglés\n` +
        `• Probar con otro Pokémon`, 
      m);
    }
    
    const cards = data.data;
    
    // Mostrar información de las cartas encontradas
    let cardInfo = `🃏 *Pokémon Cards Encontradas* 🃏\n\n`;
    cardInfo += `🔍 *Búsqueda:* ${text}\n`;
    cardInfo += `📊 *Total de cartas:* ${cards.length}\n\n`;
    
    // Mostrar primeras 5 cartas
    cards.slice(0, 5).forEach((card, index) => {
      cardInfo += `*${index + 1}.* ${card.name || 'Sin nombre'}\n`;
      if (card.set) cardInfo += `   🎴 *Set:* ${card.set.name || 'Desconocido'}\n`;
      if (card.rarity) cardInfo += `   ⭐ *Rareza:* ${card.rarity}\n`;
      if (card.hp) cardInfo += `   ❤️ *HP:* ${card.hp}\n`;
      cardInfo += `\n`;
    });
    
    if (cards.length > 5) {
      cardInfo += `ℹ️ *Y ${cards.length - 5} cartas más...*\n\n`;
    }
    
    cardInfo += `💡 *Usa:* ${usedPrefix}pokecardimg <número> para ver una carta`;
    
    await conn.reply(m.chat, cardInfo, m);
    
    // Guardar las cartas en temporal
    if (!global.pokecards) global.pokecards = {};
    global.pokecards[m.sender] = {
      cards: cards,
      timestamp: Date.now(),
      search: text
    };
    
    await m.react('✅');
    
  } catch (error) {
    console.error('Error en pokecard:', error);
    await m.react('✖️');
    
    await conn.reply(m.chat,
      `❌ *Error del sistema*\n\n` +
      `No se pudo completar la búsqueda.\n\n` +
      `💡 *Intenta:*\n` +
      `• Verificar tu conexión\n` +
      `• Probar más tarde\n` +
      `• Usar otro nombre de Pokémon`, 
    m);
  }
};

// Handler para ver imágenes de cartas
let handlerImg = async (m, { conn, usedPrefix, args }) => {
  if (!global.pokecards || !global.pokecards[m.sender]) {
    return conn.reply(m.chat,
      `❌ *No hay búsqueda activa*\n\n` +
      `Usa primero: ${usedPrefix}pokecard <pokémon>`, 
    m);
  }
  
  const userData = global.pokecards[m.sender];
  
  // Limpiar datos antiguos
  if (Date.now() - userData.timestamp > 300000) {
    delete global.pokecards[m.sender];
    return conn.reply(m.chat,
      `❌ *Búsqueda expirada*\n\n` +
      `Realiza una nueva búsqueda.`, 
    m);
  }
  
  if (!args[0] || isNaN(args[0])) {
    return conn.reply(m.chat,
      `❌ *Número inválido*\n\n` +
      `Usa: ${usedPrefix}pokecardimg <número>\n` +
      `Ejemplo: ${usedPrefix}pokecardimg 1\n\n` +
      `Cartas disponibles: 1-${userData.cards.length}`, 
    m);
  }
  
  const cardIndex = parseInt(args[0]) - 1;
  
  if (cardIndex < 0 || cardIndex >= userData.cards.length) {
    return conn.reply(m.chat,
      `❌ *Número fuera de rango*\n\n` +
      `Solo hay ${userData.cards.length} cartas.\n` +
      `Usa un número entre 1 y ${userData.cards.length}`, 
    m);
  }
  
  const card = userData.cards[cardIndex];
  
  try {
    await m.react('🕒');
    
    if (!card.images || !card.images.large) {
      await m.react('✖️');
      return conn.reply(m.chat,
        `❌ *Imagen no disponible*\n\n` +
        `Esta carta no tiene imagen.`, 
      m);
    }
    
    // Enviar información de la carta
    let cardDetails = `🃏 *Detalles de la Carta* 🃏\n\n`;
    cardDetails += `📛 *Nombre:* ${card.name || 'Desconocido'}\n`;
    
    if (card.hp) cardDetails += `❤️ *HP:* ${card.hp}\n`;
    if (card.types) cardDetails += `🎯 *Tipos:* ${card.types.join(', ')}\n`;
    if (card.rarity) cardDetails += `⭐ *Rareza:* ${card.rarity}\n`;
    
    if (card.set) {
      cardDetails += `🎴 *Set:* ${card.set.name || 'Desconocido'}\n`;
      if (card.set.series) cardDetails += `📚 *Serie:* ${card.set.series}\n`;
    }
    
    if (card.abilities) {
      cardDetails += `✨ *Habilidades:* ${card.abilities.length}\n`;
    }
    
    if (card.attacks) {
      cardDetails += `⚔️ *Ataques:* ${card.attacks.length}\n`;
    }
    
    cardDetails += `\n🌐 *Fuente:* Pokémon TCG API`;
    
    // Enviar imagen de la carta
    await conn.sendFile(m.chat, card.images.large, 'pokecard.jpg', cardDetails, m);
    
    await m.react('✅');
    
  } catch (error) {
    console.error('Error en pokecardimg:', error);
    await m.react('✖️');
    
    await conn.reply(m.chat,
      `❌ *Error al cargar la imagen*\n\n` +
      `No se pudo cargar la imagen.`, 
    m);
  }
};

// Configuración
handler.help = ['pokecard <pokémon>'];
handler.tags = ['pokemon', 'cards'];
handler.command = ['pokecard', 'pkmncard', 'cartapokemon'];
handler.register = true;

handlerImg.help = ['pokecardimg <número>'];
handlerImg.tags = ['pokemon', 'cards'];
handlerImg.command = ['pokecardimg', 'pkmnimg', 'vercarta'];
handlerImg.register = true;

export { handler as default, handlerImg };

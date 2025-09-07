import fetch from 'node-fetch';

// API oficial de Pokémon TCG
const POKEMON_TCG_API = 'https://api.pokemontcg.io/v2/cards';

// Mapeo de nombres en español a inglés (para búsquedas más efectivas)
const POKEMON_TRANSLATIONS = {
  'pikachu': 'pikachu',
  'charizard': 'charizard', 
  'mewtwo': 'mewtwo',
  'bulbasaur': 'bulbasaur',
  'squirtle': 'squirtle',
  'charmander': 'charmander',
  'eevee': 'eevee',
  'lucario': 'lucario',
  'gengar': 'gengar',
  'mew': 'mew',
  'lugia': 'lugia',
  'rayquaza': 'rayquaza',
  'garchomp': 'garchomp',
  'snorlax': 'snorlax',
  'dragonite': 'dragonite',
  'blastoise': 'blastoise',
  'venusaur': 'venusaur',
  'gyarados': 'gyarados',
  'arcanine': 'arcanine',
  'umbreon': 'umbreon'
};

let handler = async (m, { conn, command, usedPrefix, args, text }) => {
  // Verificar si es el comando pokecarding
  if (command === 'pokecarding') {
    if (!global.pokecards || !global.pokecards[m.sender]) {
      return conn.reply(m.chat,
        `❌ *No hay búsqueda activa*\n\n` +
        `Usa primero: ${usedPrefix}pokecard <pokémon>`, 
      m);
    }
    
    const userData = global.pokecards[m.sender];
    
    // Limpiar datos después de 5 minutos
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
        `Usa: ${usedPrefix}pokecarding <número>\n` +
        `Ejemplo: ${usedPrefix}pokecarding 1\n\n` +
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
      
      let cardDetails = `🃏 *Detalles de la Carta* 🃏\n\n`;
      cardDetails += `📛 *Nombre:* ${card.name}\n`;
      if (card.hp) cardDetails += `❤️ *HP:* ${card.hp}\n`;
      if (card.types) cardDetails += `🎯 *Tipos:* ${card.types.join(', ')}\n`;
      if (card.rarity) cardDetails += `⭐ *Rareza:* ${card.rarity}\n`;
      if (card.set) cardDetails += `🎴 *Set:* ${card.set.name}\n`;
      cardDetails += `\n🌐 *Fuente:* Pokémon TCG API`;
      
      await conn.sendFile(m.chat, card.images.large, 'pokecard.jpg', cardDetails, m);
      await m.react('✅');
      
    } catch (error) {
      console.error('Error en pokecarding:', error);
      await m.react('✖️');
      await conn.reply(m.chat, `❌ Error al cargar la imagen`, m);
    }
    return;
  }
  
  // Comando pokecard (búsqueda)
  if (!text) {
    return conn.reply(m.chat, 
      `🃏 *Pokémon Card Finder* 🃏\n\n` +
      `❌ Debes ingresar el nombre de un Pokémon.\n\n` +
      `💡 *Ejemplos:*\n` +
      `> ${usedPrefix + command} pikachu\n` +
      `> ${usedPrefix + command} charizard\n` +
      `> ${usedPrefix + command} mewtwo\n\n` +
      `⚠️ *Usa nombres en inglés*`, 
    m);
  }
  
  await m.react('🕒');
  
  try {
    // Convertir a minúsculas y buscar traducción
    const searchTerm = text.toLowerCase().trim();
    const englishName = POKEMON_TRANSLATIONS[searchTerm] || searchTerm;
    
    // Diferentes estrategias de búsqueda
    const searchStrategies = [
      `name:"${englishName}"`,           // Búsqueda exacta
      `name:${englishName}*`,            // Que comience con
      `name:*${englishName}*`,           // Que contenga
      `subtypes:${englishName}`          // Por subtipo
    ];
    
    let cards = [];
    let strategyUsed = '';
    
    // Probar diferentes estrategias de búsqueda
    for (const strategy of searchStrategies) {
      const searchUrl = `${POKEMON_TCG_API}?q=${encodeURIComponent(strategy)}&pageSize=20&orderBy=-set.releaseDate`;
      
      try {
        const response = await fetch(searchUrl, { 
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.length > 0) {
            cards = data.data;
            strategyUsed = strategy;
            break;
          }
        }
      } catch (error) {
        console.log(`Estrategia fallida: ${strategy}`);
      }
    }
    
    if (cards.length === 0) {
      await m.react('✖️');
      return conn.reply(m.chat, 
        `❌ *No se encontraron cartas* 🃏\n\n` +
        `No hay cartas para: *${text}*\n\n` +
        `💡 *Soluciones:*\n` +
        `• Usa nombres en *inglés* (pikachu, charizard)\n` +
        `• Pokémon más populares\n` +
        `• Verifica el nombre\n\n` +
        `📋 *Ejemplos que sí funcionan:*\n` +
        `• ${usedPrefix + command} pikachu\n` +
        `• ${usedPrefix + command} charizard\n` +
        `• ${usedPrefix + command} mewtwo`, 
      m);
    }
    
    // Mostrar información de las cartas encontradas
    let cardInfo = `🃏 *Pokémon Cards Encontradas* 🃏\n\n`;
    cardInfo += `🔍 *Búsqueda:* ${text}\n`;
    cardInfo += `📊 *Total de cartas:* ${cards.length}\n\n`;
    
    // Mostrar primeras 5 cartas
    cards.slice(0, 5).forEach((card, index) => {
      cardInfo += `*${index + 1}.* ${card.name}\n`;
      if (card.set) cardInfo += `- *Set:* ${card.set.name}\n`;
      if (card.rarity) cardInfo += `- *Rareza:* ${card.rarity}\n`;
      if (card.hp) cardInfo += `- *HP:* ${card.hp}\n`;
      cardInfo += `\n`;
    });
    
    if (cards.length > 5) {
      cardInfo += `ℹ️ *Y ${cards.length - 5} cartas más...*\n\n`;
    }
    
    cardInfo += `💡 *Usa:* ${usedPrefix}pokecarding <número> para ver una carta`;
    
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
      `❌ *Error de conexión*\n\n` +
      `No se pudo conectar con la API.\n\n` +
      `💡 *Intenta:*\n` +
      `• Verificar tu conexión a internet\n` +
      `• Probar en unos minutos\n` +
      `• Usar Pokémon más comunes`, 
    m);
  }
};

// Configuración
handler.help = ['pokecard <pokémon>', 'pokecarding <número>'];
handler.tags = ['pokemon', 'cards'];
handler.command = ['pokecard', 'pkmncard', 'cartapokemon', 'pokecarding'];
handler.register = true;

export default handler;

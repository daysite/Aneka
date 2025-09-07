import fs from 'fs';
import path from 'path';
import axios from 'axios';

const usuariosPath = './src/database/usuarios.json';
const tiendaPokemonPath = './src/database/tienda_pokemon.json';

// Crear directorios si no existen
function asegurarDirectorio(rutaArchivo) {
  const directorio = path.dirname(rutaArchivo);
  if (!fs.existsSync(directorio)) {
    fs.mkdirSync(directorio, { recursive: true });
  }
}

// Función para leer usuarios
function leerUsuarios() {
  try {
    asegurarDirectorio(usuariosPath);
    if (!fs.existsSync(usuariosPath)) {
      fs.writeFileSync(usuariosPath, JSON.stringify({}, null, 2));
      return {};
    }
    
    const data = fs.readFileSync(usuariosPath, 'utf8');
    return JSON.parse(data) || {};
  } catch (error) {
    console.error('Error al leer usuarios:', error);
    return {};
  }
}

// Función para guardar usuarios
function guardarUsuarios(usuarios) {
  try {
    asegurarDirectorio(usuariosPath);
    fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));
    return true;
  } catch (error) {
    console.error('Error al guardar usuarios:', error);
    return false;
  }
}

// LÍMITE DE POKÉMON POR USUARIO
const LIMITE_POKEMONES = 5;

// TIENDA POKÉMON POR DEFECTO
const tiendaPokemonDefault = {
  pokemones: [
    {
      id: 1,
      nombre: "Pikachu",
      precio: 500,
      nivel: 5,
      tipos: ["eléctrico"],
      imagen: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
      rareza: "raro",
      stats: { hp: 35, attack: 55, defense: 40, speed: 90 }
    },
    {
      id: 2,
      nombre: "Charmander",
      precio: 300,
      nivel: 3,
      tipos: ["fuego"],
      imagen: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png",
      rareza: "común",
      stats: { hp: 39, attack: 52, defense: 43, speed: 65 }
    },
    {
      id: 3,
      nombre: "Bulbasaur",
      precio: 300,
      nivel: 3,
      tipos: ["planta", "veneno"],
      imagen: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
      rareza: "común",
      stats: { hp: 45, attack: 49, defense: 49, speed: 45 }
    },
    {
      id: 4,
      nombre: "Squirtle",
      precio: 300,
      nivel: 3,
      tipos: ["agua"],
      imagen: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png",
      rareza: "común",
      stats: { hp: 44, attack: 48, defense: 65, speed: 43 }
    }
  ]
};

// Función para obtener Pokémon de la tienda
function obtenerPokemonTienda() {
  try {
    asegurarDirectorio(tiendaPokemonPath);
    
    if (!fs.existsSync(tiendaPokemonPath)) {
      fs.writeFileSync(tiendaPokemonPath, JSON.stringify(tiendaPokemonDefault, null, 2));
      return tiendaPokemonDefault.pokemones;
    }
    
    const data = fs.readFileSync(tiendaPokemonPath, 'utf8');
    const tienda = JSON.parse(data);
    
    if (!tienda || !tienda.pokemones || !Array.isArray(tienda.pokemones) || tienda.pokemones.length === 0) {
      return tiendaPokemonDefault.pokemones;
    }
    
    // FILTRAR POKÉMON INVÁLIDOS
    return tienda.pokemones.filter(poke => poke && poke.nombre && poke.nombre !== 'undefined');
  } catch (error) {
    console.error('Error al leer tienda Pokémon:', error);
    return tiendaPokemonDefault.pokemones;
  }
}

// Función para obtener emoji de rareza
function obtenerEmojiRareza(rareza) {
  switch (rareza) {
    case 'común': return '⭐';
    case 'raro': return '🌟🌟';
    case 'épico': return '🌟🌟🌟';
    case 'legendario': return '💎💎💎';
    default: return '📦';
  }
}

// Función para obtener Pokémon aleatorio de la API (MEJORADA)
async function obtenerPokemonAleatorio() {
  try {
    const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1000');
    const pokemons = response.data.results;
    
    let pokemonData;
    let intentos = 0;
    let pokemonValido = false;
    
    // Intentar hasta encontrar un Pokémon válido
    while (!pokemonValido && intentos < 10) {
      const randomPokemon = pokemons[Math.floor(Math.random() * pokemons.length)];
      try {
        pokemonData = await axios.get(randomPokemon.url);
        
        // Validar que tenga los datos necesarios
        if (pokemonData.data && 
            pokemonData.data.name && 
            pokemonData.data.sprites && 
            pokemonData.data.stats &&
            pokemonData.data.types) {
          pokemonValido = true;
        }
      } catch (e) {
        console.error('Error al obtener datos del Pokémon:', e);
      }
      
      intentos++;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (!pokemonValido) {
      console.error('No se pudo obtener un Pokémon válido después de 10 intentos');
      return null;
    }
    
    const nombre = pokemonData.data.name.charAt(0).toUpperCase() + pokemonData.data.name.slice(1);
    const imagen = pokemonData.data.sprites.other?.['official-artwork']?.front_default || 
                  pokemonData.data.sprites.front_default;
    
    // Si no hay imagen, usar una por defecto
    const imagenFinal = imagen || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
    
    return {
      id: pokemonData.data.id,
      nombre: nombre,
      precio: Math.floor(Math.random() * 2000) + 100,
      nivel: Math.floor(Math.random() * 20) + 1,
      tipos: pokemonData.data.types.map(t => t.type.name),
      imagen: imagenFinal,
      rareza: determinarRareza(pokemonData.data),
      stats: {
        hp: pokemonData.data.stats[0].base_stat,
        attack: pokemonData.data.stats[1].base_stat,
        defense: pokemonData.data.stats[2].base_stat,
        speed: pokemonData.data.stats[5].base_stat
      }
    };
  } catch (error) {
    console.error('Error al obtener Pokémon aleatorio:', error);
    return null;
  }
}

// Función para determinar rareza
function determinarRareza(pokemonData) {
  const totalStats = pokemonData.stats.reduce((acc, stat) => acc + stat.base_stat, 0);
  
  if (totalStats > 600) return 'legendario';
  if (totalStats > 500) return 'épico';
  if (totalStats > 400) return 'raro';
  return 'común';
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    const usuarios = leerUsuarios();
    const pokemonTienda = obtenerPokemonTienda();
    const userId = m.sender;
    
    if (!usuarios[userId]) {
      return m.reply('❌ No estás registrado. Usa *.registrar* primero.');
    }
    
    const user = usuarios[userId];
    if (user.dinero === undefined || user.dinero === null) user.dinero = 1000;
    
    // Inicializar array de Pokémon si no existe
    if (!user.pokemons || !Array.isArray(user.pokemons)) {
      user.pokemons = [];
    }

    // COMANDO: tiendapokemon (mostrar tienda)
    if (command === 'tiendapokemon' && args.length === 0) {
      let listaTienda = `🛒 *TIENDA POKÉMON* 🛒\n\n`;
      listaTienda += `💵 Tu dinero: $${user.dinero}\n`;
      listaTienda += `📦 Pokémon actuales: ${user.pokemons.length}/${LIMITE_POKEMONES}\n\n`;
      
      // FILTRAR POKÉMON VÁLIDOS
      const pokemonesValidos = pokemonTienda.filter(poke => poke && poke.nombre && poke.nombre !== 'undefined');
      
      if (pokemonesValidos.length === 0) {
        listaTienda += '❌ No hay Pokémon disponibles en la tienda.\n';
        listaTienda += `Usa *${usedPrefix}renovartienda* para agregar nuevos Pokémon.`;
        return m.reply(listaTienda);
      }
      
      pokemonesValidos.forEach((poke, index) => {
        const emojiRareza = obtenerEmojiRareza(poke.rareza);
        listaTienda += `${index + 1}. ${emojiRareza} *${poke.nombre}* - $${poke.precio}\n`;
        listaTienda += `   📊 Nivel: ${poke.nivel} | 🎯 ${Array.isArray(poke.tipos) ? poke.tipos.join('/').toUpperCase() : 'Desconocido'}\n`;
        listaTienda += `   ❤️ HP: ${poke.stats?.hp || '?'} | ⚔️ ATK: ${poke.stats?.attack || '?'}\n\n`;
      });
      
      listaTienda += `💡 *Para comprar:*\n`;
      listaTienda += `• ${usedPrefix}comprarpokemon <número>\n`;
      listaTienda += `• ${usedPrefix}renovartienda - Renovar stock ($200)\n\n`;
      
      // MOSTRAR LÍMITE ACTUAL
      if (user.pokemons.length >= LIMITE_POKEMONES) {
        listaTienda += `❌ *¡LÍMITE ALCANZADO!*\n`;
        listaTienda += `Tienes ${user.pokemons.length}/${LIMITE_POKEMONES} Pokémon.\n`;
        listaTienda += `Usa *.liberar* <número> para hacer espacio.\n\n`;
      } else {
        listaTienda += `📊 Espacio disponible: ${LIMITE_POKEMONES - user.pokemons.length} Pokémon\n\n`;
      }
      
      listaTienda += `📌 *Ejemplos:*\n`;
      listaTienda += `• ${usedPrefix}comprarpokemon 1\n`;
      listaTienda += `• ${usedPrefix}liberar 2`;
      
      return m.reply(listaTienda);
    }

    // COMANDO: comprarpokemon
    if (command === 'comprarpokemon' || (command === 'tiendapokemon' && args[0] === 'comprar')) {
      const index = command === 'comprarpokemon' ? parseInt(args[0]) - 1 : parseInt(args[1]) - 1;
      
      if (isNaN(index) || index < 0 || index >= pokemonTienda.length) {
        return m.reply(`❌ Número de Pokémon inválido. Usa *${usedPrefix}tiendapokemon* para ver los números.`);
      }
      
      const pokemon = pokemonTienda[index];
      
      // VERIFICACIÓN MÁS ESTRICTA
      if (!pokemon || !pokemon.nombre || pokemon.nombre === 'undefined' || !pokemon.imagen) {
        return m.reply('❌ Este Pokémon no está disponible. Usa *renovartienda* para obtener nuevos Pokémon.');
      }
      
      // VERIFICAR LÍMITE DE POKÉMON
      if (user.pokemons.length >= LIMITE_POKEMONES) {
        return m.reply(`❌ *¡LÍMITE ALCANZADO!*\n\nTienes ${user.pokemons.length}/${LIMITE_POKEMONES} Pokémon.\nUsa *.liberar* <número> para liberar alguno y hacer espacio.\n\nEjemplo: *.liberar 1*`);
      }
      
      if (user.dinero < pokemon.precio) {
        return m.reply(`❌ No tienes suficiente dinero. Necesitas $${pokemon.precio}, tienes $${user.dinero}.`);
      }
      
      // Crear copia del Pokémon para el usuario
      const pokemonComprado = {
        ...pokemon,
        captured: new Date().toLocaleDateString(),
        idUnico: Date.now() + Math.random().toString(36).substr(2, 9)
      };
      
      // Realizar compra
      user.dinero -= pokemon.precio;
      user.pokemons.push(pokemonComprado);
      
      // Guardar cambios
      usuarios[userId] = user;
      guardarUsuarios(usuarios);
      
      // Enviar mensaje con imagen del Pokémon
      try {
        await conn.sendFile(
          m.chat, 
          pokemon.imagen, 
          'pokemon.png', 
          `🎉 *¡COMPRA EXITOSA!* 🎉\n\n` +
          `✨ *${pokemon.nombre}* se unió a tu equipo!\n` +
          `💰 Precio: $${pokemon.precio}\n` +
          `📊 Nivel: ${pokemon.nivel}\n` +
          `🎯 Tipo: ${Array.isArray(pokemon.tipos) ? pokemon.tipos.join(' / ').toUpperCase() : 'Desconocido'}\n` +
          `⭐ Rareza: ${pokemon.rareza}\n\n` +
          `❤️ HP: ${pokemon.stats?.hp || '?'} | ⚔️ ATK: ${pokemon.stats?.attack || '?'}\n` +
          `🛡️ DEF: ${pokemon.stats?.defense || '?'} | 🏃 VEL: ${pokemon.stats?.speed || '?'}\n\n` +
          `💵 Dinero restante: $${user.dinero}\n` +
          `📦 Pokémon en equipo: ${user.pokemons.length}/${LIMITE_POKEMONES}`,
          m
        );
      } catch (error) {
        // Si falla la imagen, enviar solo texto
        m.reply(`🎉 *¡COMPRA EXITOSA!* 🎉\n\n✨ *${pokemon.nombre}* se unió a tu equipo!\n💰 Precio: $${pokemon.precio}\n💵 Dinero restante: $${user.dinero}\n📦 Pokémon en equipo: ${user.pokemons.length}/${LIMITE_POKEMONES}`);
      }
      
      return;
    }

    // COMANDO: renovartienda
    if (command === 'renovartienda' || (command === 'tiendapokemon' && args[0] === 'renovar')) {
      if (user.dinero < 200) {
        return m.reply('❌ Necesitas $200 para renovar la tienda.');
      }
      
      m.reply('🔄 Renovando tienda... Esto puede tomar unos segundos.');
      
      // Obtener 4 Pokémon aleatorios nuevos CON VALIDACIÓN
      const nuevosPokemones = [];
      let intentos = 0;
      
      while (nuevosPokemones.length < 4 && intentos < 20) {
        const nuevoPokemon = await obtenerPokemonAleatorio();
        // VALIDACIÓN ESTRICTA
        if (nuevoPokemon && nuevoPokemon.nombre && nuevoPokemon.nombre !== 'undefined' && nuevoPokemon.imagen) {
          nuevosPokemones.push(nuevoPokemon);
        }
        intentos++;
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      if (nuevosPokemones.length === 0) {
        return m.reply('❌ Error al renovar la tienda. Intenta nuevamente.');
      }
      
      // Actualizar tienda
      const nuevaTienda = {
        pokemones: nuevosPokemones,
        ultimaRenovacion: new Date().toISOString()
      };
      
      // Guardar nueva tienda
      asegurarDirectorio(tiendaPokemonPath);
      fs.writeFileSync(tiendaPokemonPath, JSON.stringify(nuevaTienda, null, 2));
      
      user.dinero -= 200;
      usuarios[userId] = user;
      guardarUsuarios(usuarios);
      
      return m.reply(`✅ *Tienda renovada exitosamente!*\n\nSe agregaron ${nuevosPokemones.length} Pokémon nuevos.\n💵 Gastado: $200\n💵 Saldo: $${user.dinero}\n\nUsa *${usedPrefix}tiendapokemon* para ver los nuevos Pokémon.`);
    }

    // Si no es ningún comando reconocido
    m.reply(`💡 Usa *${usedPrefix}tiendapokemon* para ver la tienda Pokémon`);

  } catch (error) {
    console.error('Error en comando tienda Pokémon:', error);
    m.reply('❌ Error en el sistema de tienda Pokémon. Intenta nuevamente.');
  }
};

handler.help = [
  'tiendapokemon', 
  'comprarpokemon [número]', 
  'renovartienda'
];
handler.tags = ['pokemon', 'economy', 'shop'];
handler.command = /^(tiendapokemon|comprarpokemon|renovartienda)$/i;
handler.register = true;

export default handler;

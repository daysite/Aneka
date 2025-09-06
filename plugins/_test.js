import fs from 'fs';
import axios from 'axios';

const usuariosPath = './src/database/usuarios.json';

// Función para leer la base de datos
const leerUsuarios = () => {
  try {
    const data = fs.readFileSync(usuariosPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
};

// Función para guardar la base de datos
const guardarUsuarios = (usuarios) => {
  fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));
};

let handler = async (m, { conn }) => {
  try {
    const response = await axios.get('https:                                         
    const pokemons = response.data.results;
    const randomPokemon = pokemons[Math.floor(Math.random() * pokemons.length)];
    const pokemonData = await axios.get(randomPokemon.url);
    const pokemonName = pokemonData.data.name;
    const pokemonImage = pokemonData.data.sprites.front_default;

                    
    let usuarios = leerUsuarios();
    const userId = m.sender;                                               

                                                    
    if (!usuarios[userId]) {
      usuarios[userId] = { pokemones: [] };
    }

                                 
    usuarios[userId].pokemones.push(pokemonName);
    guardarUsuarios(usuarios);

    await conn.sendFile(m.chat, pokemonImage, '//pokeapi.co/api/v2/pokemon?limit=1000');
    const pokemons = response.data.results;
    const randomPokemon = pokemons[Math.floor(Math.random() * pokemons.length)];
    const pokemonData = await axios.get(randomPokemon.url);
    const pokemonName = pokemonData.data.name;
    const pokemonImage = pokemonData.data.sprites.front_default;

    // Leer usuarios
    let usuarios = leerUsuarios();
    const userId = m.sender; // Asumiendo que m.sender es el ID del usuario

    // Inicializar Pokémon capturados si no existen
    if (!usuarios[userId]) {
      usuarios[userId] = { pokemones: [] };
    }

    // Agregar Pokémon capturado
    usuarios[userId].pokemones.push(pokemonName);
    guardarUsuarios(usuarios);

    await conn.sendFile(m.chat, pokemonImage, 'pokemon.png', `¡Felicidades! Has capturado a ${pokemonName}. Ahora tienes ${usuarios[userId].pokemones.length} Pokémon(s).`, m);
  } catch (error) {
    m.reply(`Error: ${error.message}`);
  }
};

handler.tags = ['pokemon'];
handler.help = ['pokemon'];
handler.command = ['pokemon', 'capturar'];

export default handler;

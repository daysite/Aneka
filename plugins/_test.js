import axios from 'axios';

const pokemon = async (m, { conn }) => {
  try {
    const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1000');
    const pokemons = response.data.results;
    const randomPokemon = pokemons[Math.floor(Math.random() * pokemons.length)];
    const pokemonData = await axios.get(randomPokemon.url);
    const pokemonName = pokemonData.data.name;
    const pokemonImage = pokemonData.data.sprites.front_default;

    await conn.sendFile(m.chat, pokemonImage, 'pokemon.png', `¡Felicidades! Has capturado a ${pokemonName}`, m);
  } catch (error) {
    await conn.reply(m.chat, 'Error al capturar Pokémon', m);
  }
};

pokemon.tags = ['pokemon'];
pokemon.help = ['pokemon'];
pokemon.command = ['pokemon', 'capturar'];

import fs from 'fs';

const usuariosPath = './src/database/usuarios.json';

function leerUsuarios() {
  try {
    const data = fs.readFileSync(usuariosPath, 'utf8');
    return JSON.parse(data) || {};
  } catch (error) {
    return {};
  }
}

function guardarUsuarios(usuarios) {
  fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));
}

let handler = async (m, { conn, args }) => {
  try {
    const sender = m.sender;
    const usuarios = leerUsuarios();
    
    if (!usuarios[sender] || usuarios[sender].pokemons.length === 0) {
      return await conn.sendMessage(m.chat, { 
        text: '❌ *No tienes Pokémon para liberar.*\nUsa *.pokemon* para capturar algunos primero.' 
      }, { quoted: m });
    }

    const index = parseInt(args[0]) - 1; // Restar 1 porque los usuarios ven lista desde 1
    
    if (isNaN(index) || index < 0 || index >= usuarios[sender].pokemons.length) {
      // Mostrar lista de Pokémon si no se especifica índice o es inválido
      let listaPokemon = '📋 *Tu colección de Pokémon:*\n\n';
      usuarios[sender].pokemons.forEach((p, i) => {
        listaPokemon += `${i + 1}. ${p.name} 🌟 ${p.types.join('/').toUpperCase()}\n`;
      });
      
      listaPokemon += '\n💡 *Para liberar un Pokémon usa:*\n.liberar [número]\nEjemplo: .liberar 1';
      
      return await conn.sendMessage(m.chat, { 
        text: listaPokemon 
      }, { quoted: m });
    }

    const pokemonLiberado = usuarios[sender].pokemons[index];
    
    // Eliminar el Pokémon de la lista
    usuarios[sender].pokemons.splice(index, 1);
    guardarUsuarios(usuarios);

    await conn.sendMessage(m.chat, { 
      text: `🎉 *¡Pokémon liberado!*\n\n✨ *${pokemonLiberado.name}* ha sido liberado y ha vuelto a la naturaleza.\n\n📊 *Pokémon restantes:* ${usuarios[sender].pokemons.length}/20\n\n¡Ahora tienes espacio para capturar más! 🎣` 
    }, { quoted: m });

  } catch (error) {
    console.error('Error en comando liberar:', error);
    await m.reply('❌ *Error al liberar el Pokémon.* Intenta de nuevo.');
  }
};

handler.tags = ['game', 'pokemon'];
handler.help = ['liberar [número]'];
handler.command = ['liberar', 'release'];
export default handler;

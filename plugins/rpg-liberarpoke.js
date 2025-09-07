import fs from 'fs';
import path from 'path';

const usuariosPath = './src/database/usuarios.json';

// Asegurar que el directorio existe
function asegurarDirectorio(rutaArchivo) {
  const directorio = path.dirname(rutaArchivo);
  if (!fs.existsSync(directorio)) {
    fs.mkdirSync(directorio, { recursive: true });
  }
}

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

// Función para obtener emoji de rareza (debe coincidir con otros handlers)
function obtenerEmojiRareza(rareza) {
  if (!rareza) return '📦';
  
  switch (rareza.toLowerCase()) {
    case 'común': return '⭐';
    case 'raro': return '🌟🌟';
    case 'épico': return '🌟🌟🌟';
    case 'legendario': return '💎💎💎';
    default: return '📦';
  }
}

let handler = async (m, { conn, args, usedPrefix }) => {
  try {
    const sender = m.sender;
    const usuarios = leerUsuarios();
    
    // Verificar si el usuario existe
    if (!usuarios[sender]) {
      return await conn.sendMessage(m.chat, { 
        text: '❌ *No estás registrado.*\nUsa *.registrar* para crear una cuenta primero.' 
      }, { quoted: m });
    }
    
    // Inicializar pokemons si no existe
    if (!usuarios[sender].pokemons || !Array.isArray(usuarios[sender].pokemons)) {
      usuarios[sender].pokemons = [];
    }
    
    // Filtrar solo Pokémon válidos
    const pokemonesValidos = usuarios[sender].pokemons.filter(p => 
      p && p.nombre && p.nombre !== 'undefined'
    );
    
    if (pokemonesValidos.length === 0) {
      return await conn.sendMessage(m.chat, { 
        text: `❌ *No tienes Pokémon para liberar.*\n\nUsa *${usedPrefix}pokemon* para capturar algunos primero.\nO usa *${usedPrefix}tiendapokemon* para comprar en la tienda.` 
      }, { quoted: m });
    }

    // Si no se proporciona argumento, mostrar la lista
    if (args.length === 0) {
      let listaPokemon = '📋 *Tu colección de Pokémon:*\n\n';
      
      pokemonesValidos.forEach((p, i) => {
        const emojiRareza = obtenerEmojiRareza(p.rareza);
        listaPokemon += `${i + 1}. ${emojiRareza} *${p.nombre}* `;
        
        if (p.tipos && Array.isArray(p.tipos)) {
          listaPokemon += `🎯 ${p.tipos.join('/').toUpperCase()}`;
        }
        
        if (p.nivel) {
          listaPokemon += ` | 📊 Nvl. ${p.nivel}`;
        }
        
        listaPokemon += '\n';
      });
      
      listaPokemon += `\n💡 *Para liberar un Pokémon usa:*\n${usedPrefix}liberar [número]\n\n`;
      listaPokemon += `📌 *Ejemplo:* ${usedPrefix}liberar 1`;
      
      return await conn.sendMessage(m.chat, { 
        text: listaPokemon 
      }, { quoted: m });
    }

    const index = parseInt(args[0]) - 1;
    
    if (isNaN(index) || index < 0 || index >= pokemonesValidos.length) {
      return await conn.sendMessage(m.chat, { 
        text: `❌ *Número de Pokémon inválido.*\n\nUsa *${usedPrefix}liberar* sin número para ver tu lista de Pokémon.` 
      }, { quoted: m });
    }

    const pokemonLiberado = pokemonesValidos[index];
    
    // Eliminar el Pokémon de la lista (usando el índice del array filtrado)
    // Necesitamos encontrar el índice real en el array original
    const pokemonId = pokemonLiberado.idUnico;
    const indiceReal = usuarios[sender].pokemons.findIndex(p => p.idUnico === pokemonId);
    
    if (indiceReal !== -1) {
      usuarios[sender].pokemons.splice(indiceReal, 1);
    } else {
      // Fallback: usar el índice proporcionado si no encontramos por idUnico
      usuarios[sender].pokemons.splice(index, 1);
    }
    
    // Guardar cambios
    if (!guardarUsuarios(usuarios)) {
      return await conn.sendMessage(m.chat, { 
        text: '❌ *Error al guardar los datos.* Intenta de nuevo.' 
      }, { quoted: m });
    }

    await conn.sendMessage(m.chat, { 
      text: `🎉 *¡Pokémon liberado!*\n\n✨ *${pokemonLiberado.nombre}* ha sido liberado y ha vuelto a la naturaleza.\n\n📊 *Pokémon restantes:* ${usuarios[sender].pokemons.length}/5\n\n¡Ahora tienes espacio para capturar más! 🎣` 
    }, { quoted: m });

  } catch (error) {
    console.error('Error en comando liberar:', error);
    await conn.sendMessage(m.chat, { 
      text: '❌ *Error al liberar el Pokémon.* Intenta de nuevo.' 
    }, { quoted: m });
  }
};

handler.tags = ['pokemon'];
handler.help = ['liberar [número]'];
handler.command = ['liberar', 'release'];
handler.register = true;

export default handler;

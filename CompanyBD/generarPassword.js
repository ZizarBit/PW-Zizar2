
const bcrypt = require('bcrypt');

async function generarHash() {
    const passwords = [
        { nombre: 'Prueba', password: 'prueba123' }
    ];

    console.log('='.repeat(60));
    console.log('GENERADOR DE CONTRASEÑAS HASHEADAS');
    console.log('='.repeat(60));
    console.log();

    for (const item of passwords) {
        const hash = await bcrypt.hash(item.password, 10);
        console.log(`Usuario: ${item.nombre}`);
        console.log(`Contraseña: ${item.password}`);
        console.log(`Hash: ${hash}`);
        console.log();
        console.log(`-- SQL para insertar:`);
        console.log(`INSERT INTO usuarios (name, email, password)`);
        console.log(`VALUES ('${item.nombre}', '${item.nombre.toLowerCase()}@dominio.com', '${hash}');`);
        console.log();
        console.log('-'.repeat(60));
        console.log();
    }
}
//Esto lo hice para hacer un usuario prueba -Zizar

generarHash().catch(console.error);
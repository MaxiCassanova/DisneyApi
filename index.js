const server = require('./src/app.js');
const { conn, Genre } = require('./src/db.js');

// Syncing all the models at once.
conn.sync({ force: false }).then(() => {
  server.listen(3001, () => {
    loadGenres();
    console.log('server listening at 3001'); // eslint-disable-line no-console
  });
});

async function loadGenres() {
  if(await Genre.count() === 0) {
    const genres = [
      { name: 'Acción', image: "./public/images/genres/accion" },
      { name: 'Animación', image: "./public/images/genres/animacion" },
      { name: 'Aventura', image: "./public/images/genres/aventura" },
      { name: 'Ciencia Ficción', image: "./public/images/genres/scific" },
      { name: 'Comedia', image: "./public/images/genres/comedia" },
      { name: 'Drama', image: "./public/images/genres/drama" },
      { name: 'Fantasía', image: "./public/images/genres/fantasia" },
      { name: 'Infantil', image: "./public/images/genres/infantil" },
      { name: 'Misterio', image: "./public/images/genres/misterio" },
      { name: 'Musical', image: "./public/images/genres/musical" },
      { name: 'Romance', image: "./public/images/genres/romance" },
      { name: 'Suspenso', image: "./public/images/genres/suspenso" },
      { name: 'Terror', image: "./public/images/genres/terror" },
    ];
    await Genre.bulkCreate(genres);
    console.log("Generos cargados");
  }
}
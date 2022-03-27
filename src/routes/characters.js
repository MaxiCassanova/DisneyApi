const { Router } = require('express');
const { Character, MovieOrSerie } = require('../db.js');
const { searchCharacters, listCharacters, filterCharacters, mapCharacters } = require('./characterUtil.js')
const { verifyToken } = require('./auth.js');
const multer = require('multer');
const upload = multer({ dest: './public/images/characters', fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg|jfif|webp)$/)) {
      cb(new Error("Please upload an image."));
    }
    cb(null, true);
  }, });
const { readImageSync } = require('./imagesUtil.js');
const router = Router();


//Movies debe ser un ID de MovieOrSerie
router.get('/', verifyToken, async (req, res) => {
    let { name, age, weight, movies} = req.query;
    let filters = [];
    
    if(age) if (Number.isInteger(Number(age))) filters.push({name: 'age', value: Number(age)});
            else return res.status(400).send('Edad debe ser un numero entero');
    
    if(weight)  if (Number(weight)) filters.push({name: 'weight', value: Number(weight)});
                else return res.status(400).send('Peso debe ser un numero');
    
    if(movies)  if (Number(movies)) filters.push({name: 'movies', value: movies});
                else return res.status(400).send('Movies debe contener un identificador');

    let characters;
    if (name) characters = await searchCharacters(name);
    else      characters = await listCharacters();

    if(characters.length == 0) return res.status(404).send('No se encontraron personajes');
    if(filters.length > 0) characters = await filterCharacters(characters, filters);
    if(characters.length == 0) return res.status(404).send('No se encontraron personajes con esos filtros');
    characters = await mapCharacters(characters);
    res.send(characters);
});

router.get("/detail", verifyToken, async(req, res) => {
    const { id } = req.query;
    let character = await Character.findOne({
        where: {
            id: id
        },
        include: [{
            model: MovieOrSerie,
        }]
    });
    if(!character) return res.status(404).send('No se encontro el personaje');
    console.log(character);
    let response = {
        id: character.id,
        name: character.dataValues.name,
        image: readImageSync(character.dataValues.image),
        age: character.dataValues.age,
        weight: character.dataValues.weight,
        lore: character.dataValues.lore,
        MovieOrSerie: character.dataValues.movieOrSeries?.map(movie => {
            return {
                title: movie.dataValues.title,
                image: readImageSync(movie.dataValues.image),
                releaseDate: movie.dataValues.releaseDate,
                rating: movie.dataValues.rating,
            }
        })
    };
    res.send(response);
})

router.post("/create", verifyToken, upload.single('image'), async(req, res) => {
    const file = req.file;
    let image = file.destination + '/' + file.filename;
    let { name, age, weight, lore, movies } = req.body;
    //movies sera un string con titulos de peliculas o series separados por comas
    if(!name || !image || !lore) return res.status(400).send("Los parametros Nombre, Imagen y Historia son obligatorios");
    if(!movies) return res.status(400).send("Debe tener al menos 1 pelicula o serie asociada");
    movies = movies.split(',');
    if(age && !Number.isInteger(Number(age))) return res.status(400).send("El parametro age debe ser un numero entero");
    if(weight && !Number(weight)) return res.status(400).send("El parametro weight debe ser un numero");

    let movie = await MovieOrSerie.findAll({
        where: {
            title: movies
        }
    });
    if(movie.length != movies.length) return res.status(400).send("Alguna pelicula o serie no existe");
    let character = await Character.create({
        name: name,
        image: image,
        age: age,
        weight: weight,
        lore: lore,
    });
    console.log(character);
    await character.setMovieOrSeries(movie);
    res.send(character);
});

router.put("/update", verifyToken, upload.single('image'), async(req, res) => {
    const file = req.file;
    if(!file) return res.status(400).send("Necesita una imagen");
    let image = file.destination + '/' + file.filename;
    let { id, name, age, weight, lore, movies } = req.body;
    if(!name || !image || !lore) return res.status(400).send("Los parametros Nombre, Imagen y Historia son obligatorios");
    //movies sera un string con titulos de peliculas o series separados por comas
    if(!movies) return res.status(400).send("Debe tener al menos 1 pelicula o serie asociada");
    movies = movies.split(',');
    if(age && !Number.isInteger(Number(age))) return res.status(400).send("El parametro age debe ser un numero entero");
    if(weight && !Number(weight)) return res.status(400).send("El parametro weight debe ser un numero");
    let movie = MovieOrSerie.findAll({
        where: {
            title: movies
        }
    });
    let character = Character.findOne({
        where: {
            id: id
        }
    });
    Promise.all([movie, character]).then(async ([movie, character]) => {
        if(movie.length != movies.length) return res.status(400).send("Alguna pelicula o serie no existe");
        character = await character.update({
            name: name,
            image: image,
            age: age,
            weight: weight,
            lore: lore,
        });
        await character.setMovieOrSeries(movie);
        res.send(character);
    });
})

router.delete("/delete", verifyToken, (req, res) => {
    const { id } = req.query;
    Character.destroy({
        where: {
            id: id
        }
    }).then(() => {
        res.status(200).send("Personaje eliminado");
    }).catch(err => {
        console.log(err);
        res.status(500).send(err);
    })
})

module.exports = router;

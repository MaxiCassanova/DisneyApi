const { Router } = require('express');
const { Character, MovieOrSerie, Genre } = require('../db.js');
const { readImageSync } = require('./imagesUtil.js');
const { verifyToken } = require('./auth.js');
const { listMovies, searchMovies, filterMovies, mapMovies } = require('./moviesUtil.js');
const multer = require('multer');
const upload = multer({ dest: './public/images/movies', fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg|jfif|webp)$/)) {
      cb(new Error("Please upload an image."));
    }
    cb(null, true);
  }, });

const router = Router();

router.get('/', verifyToken, async(req, res) => {
    let { name: title, genre, order } = req.query;

    if(order && order.toLowerCase() !== 'asc' && order.toLowerCase() !== 'desc')
        return res.status(400).send({ error: 'Invalid order' });
    if(genre && !Number.isInteger(Number(genre)))
        return res.status(400).send({ error: 'Invalid genre' });

    let movies;
    if (title) movies = await searchMovies(title, order);
    else movies = await listMovies(order);
    
    if (movies.length == 0) return res.status(404).send('No se encontraron peliculas');
    if (genre) {
        movies = await filterMovies(movies, genre);
        console.log(movies);
        if (movies.length === 0) return res.status(404).send('No se encontraron peliculas con ese genero');
    }

    movies = await mapMovies(movies);
    res.send(movies);

});
//GenresId debe ser un string con los id de los generos separados por comas
router.post("/create", verifyToken, upload.single('image'), async(req, res) => {
    try{
    let file = req.file;
    if (!file) return res.status(400).send({ error: 'Debe subir una imagen' });
    let image = file.destination + '/' + file.filename;
    let { title, releaseDate, rating, genresId } = req.body;
    if (!title || !image || !releaseDate || !genresId)
        return res.status(400).send({ error: 'Faltan parametros obligatorios' });
    if (rating) {
        if(Number(rating)){
            rating = Number(rating);
            if(!(rating > 0 && rating <= 5))
                return res.status(400).send({ error: 'Rating invalido' });
        }
        else
            return res.status(400).send({ error: 'Rating debe ser un numero' });
    }
    
    // debe ser un string con el id de un genero separado por comas
    genresId = genresId.split(',');
    if (Array.isArray(genresId)) {
        genresId.forEach(genre => {
            if(!Number.isInteger(Number(genre)))
                return res.status(400).send({ error: 'Genero invalido' });
        });
    }
    else return res.status(400).send({ error: 'Genero debe ser un Array' });
    let movie = await MovieOrSerie.create({
        title,
        image,
        releaseDate,
        rating,
    });
    genresId.forEach(genre => {
            movie.addGenre(genre);
    });
    res.send(movie);
    } catch(err) {
        console.log(err);
        res.status(500).send({ error: err });
    }
})

router.get("/detail", verifyToken, async(req, res) => {
    let { id } = req.query;
    if (!id) return res.status(400).send({ error: 'Falta id' });
    let movie = await MovieOrSerie.findOne({
        where: {
            id
        },
        include: [
            {
                model: Genre
            },
            {
                model: Character
            }
        ]
    });
    if (!movie) return res.status(404).send({ error: 'No se encontro la pelicula' });
    console.log(movie);
    let response = {
        id: movie.dataValues.id,
        title: movie.dataValues.title,
        image: readImageSync(movie.dataValues.image),
        releaseDate: movie.dataValues.releaseDate,
        rating: movie.dataValues.rating,
        genres: movie.dataValues.genres?.map(genre => {
            return {
                id: genre.dataValues.id,
                name: genre.dataValues.name
            }
        }),
        characters: movie.dataValues.characters?.map(character => {
            return {
                id: character.dataValues.id,
                name: character.dataValues.name,
            }
        })
    }
    res.send(response);
})
//GenresId debe ser un string con los id de los generos separados por comas
router.put("/update", verifyToken, upload.single('image'), async(req, res) => {
    let file = req.file;
    if (!file) return res.status(400).send({ error: 'Debe subir una imagen' });
    let image = file.destination + '/' + file.filename;
    let { id, title, releaseDate, rating, genresId } = req.body;
    if (!id) return res.status(400).send({ error: 'Falta id' });
    if (!title && !releaseDate && !genresId)
        return res.status(400).send({ error: 'Faltan parametros obligatorios' });
    if (rating) {
        if(Number(rating)){
            rating = Number(rating);
            if(!(rating > 0 && rating <= 5))
                return res.status(400).send({ error: 'Rating invalido' });
        }   
        else
            return res.status(400).send({ error: 'Rating debe ser un numero' });
    }
    // debe ser un string con el id de un genero separado por comas
    genresId = genresId.split(',');
    if (Array.isArray(genresId)) {
        genresId.forEach(genre => {
            if(!Number.isInteger(Number(genre)))
                return res.status(400).send({ error: 'Genero invalido' });
        });
    }
    else return res.status(400).send({ error: "Genero debe ser un string con los ID de los generos (separados con ',')" });

    let movie = await MovieOrSerie.findOne({
        where: {
            id
        }
    });
    if (!movie) return res.status(404).send({ error: 'No se encontro la pelicula' });

    if (title) movie.title = title;
    if (image) movie.image = image;
    if (releaseDate) movie.releaseDate = releaseDate;
    if (rating) movie.rating = rating;
    if (genresId) {
        movie.setGenres(genresId);
    }
    await movie.save();
    res.send(movie);
})

router.delete("/delete", verifyToken, async(req, res) => {
    let { id } = req.query;
    if (!id) return res.status(400).send({ error: 'Falta id' });
    let movie = await MovieOrSerie.findOne({
        where: {
            id
        }
    });
    if (!movie) return res.status(404).send({ error: 'No se encontro la pelicula' });
    await movie.destroy();
    res.send(movie);
})
module.exports = router;

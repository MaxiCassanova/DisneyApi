const { MovieOrSerie, Genre } = require('../db.js'); 
const { Op } = require('sequelize');
const { readImageSync } = require('./imagesUtil.js');

async function searchMovies(title, order){
    let movie = await MovieOrSerie.findAll({
        where: {
            title: {
                [Op.iLike]: `%${title}%`
            }
        },
        include: [
            {
                model: Genre
            }
        ],
        order: [
            ['releaseDate', `${order || 'ASC'}`]
        ],
    });
    return movie;
}

async function listMovies(order){
    return await MovieOrSerie.findAll({
        order: [
            ['releaseDate', `${order || 'ASC'}`]
        ],
        include: [
            {
                model: Genre
            }
        ]
    });
}

async function filterMovies(movies, genreId){
    let filteredMovies = movies;
    filteredMovies = filteredMovies.filter(movie => {
        let genresID = movie.dataValues.genres.map(genre => {
            return genre.dataValues.id;
        });
        let hasGenre = genresID.some(id => {
            return id == genreId;
        });
        return hasGenre;
    });
    return filteredMovies
    ;
}

async function mapMovies(movies){
    let response = movies.map(movie => {
        let path = movie.dataValues.image;
        let image = readImageSync(path);
        return {
            name: movie.dataValues.title,
            image: image,
            releaseDate: movie.dataValues.releaseDate,
        }
    });
    return response;
}

module.exports = {
    searchMovies,
    listMovies,
    filterMovies,
    mapMovies,
};
const { Character, MovieOrSerie } = require('../db.js'); 
const { Op } = require('sequelize');
const { readImageSync } = require('./imagesUtil.js');

async function searchCharacters(name){
    let character = await Character.findAll({
        //Buscar todos los personajes donde el nombre incluya el parametro name
        where: {
            name: {
                [Op.iLike]: `%${name}%`   
            },
            include: [{
                model: MovieOrSerie,
            }]
        }
    });
    console.log(character);
    return character;
}

async function listCharacters(){
    // return characters = await Character.findAll();
    let characters = await Character.findAll({
        include: [{
            model: MovieOrSerie
        }]
    });
    
    console.log(characters);
    return characters;
}
async function filterCharacters(characters, filters){
    let filteredCharacters = characters;
    console.log(filters);
    
        filters.forEach(filter => {
            if(filter.name == 'age')
            filteredCharacters = filteredCharacters.filter(character => {
                return character[filter.name] == filter.value;
            });
            else if(filter.name == 'movies')
                filteredCharacters = filteredCharacters.filter(character => {
                    return character.movieOrSeries.some(movie => {
                        return movie.id == filter.value;
                    });
                });
        });
    return filteredCharacters;
}

async function mapCharacters(characters){
    let response = characters.map(character => {
        let path = character.dataValues.image;
        let image = readImageSync(path);
        return {
            name: character.dataValues.name,
            image: image,
        }
    });
    return response;
}

module.exports = {
    searchCharacters,
    listCharacters,
    filterCharacters,
    mapCharacters,
};
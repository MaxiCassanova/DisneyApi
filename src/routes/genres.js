const { Router } = require('express');
const { Genre } = require('../db.js');
const { readImageSync } = require('./imagesUtil.js');
const {verifyToken} = require('./auth.js');

const router = Router();

router.get('/', verifyToken, async (req, res) => {
    let genres = await Genre.findAll();
    genres = genres.map(genre => {
        return {
            id: genre.dataValues.id,
            name: genre.dataValues.name,
            image: readImageSync(genre.dataValues.image),
        }
    });
    res.send(genres);
})

module.exports = router;
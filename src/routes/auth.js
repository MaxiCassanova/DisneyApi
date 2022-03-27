const { Router } = require('express');
const { User } = require('../db.js');
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');

const router = Router();

router.post('/register', async(req, res) => {
    try{
        const { first_name, last_name, email, password } = req.body;
        if(!first_name || !last_name || !email || !password){
            return res.status(400).send("Faltan parametros obligatorios");
        }
        const oldUser = await User.findOne({ where: { email } });
        if(oldUser){
            return res.status(400).send("El usuario ya existe");
        }
        encrytedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ 
            first_name,
            last_name,
            email: email.toLowerCase(),
            password: encrytedPassword 
        });
        const token = jsonwebtoken.sign({
            user_id: user.id,
            email 
        }, process.env.TOKEN_KEY, 
        { expiresIn: '2h' });

        user.token = token;
        await user.save();
        res.status(201).send(user);
    } catch(error){
        console.log(error);
        res.status(500).send();
    }
});

router.post('/login', async(req, res) => {
    try{
        const { email, password } = req.body;
        if(!email || !password){
            return res.status(400).send("Faltan parametros obligatorios");
        }
        const user = await User.findOne({ where: { email: email.toLowerCase() } });
        if(!user){
            return res.status(400).send("El usuario o la contraseña son incorrectos");
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).send("El usuario o la contraseña son incorrectos");
        }
        const token = jsonwebtoken.sign({
            user_id: user.id,
            email: user.email
        }, process.env.TOKEN_KEY,
        { expiresIn: '2h' });
        user.token = token;
        user.save();

        res.status(200).send(user);
    } catch(error){
        console.log(error);
        res.status(500).send();
    }
})

async function verifyToken(req, res, next){
    const token = req.body.token || req.query.token || req.headers['x-access-token'];

    if(!token){
        return res.status(403).send({ error: 'No hay token' });
    }
    try{
        const decoded = jsonwebtoken.verify(token, process.env.TOKEN_KEY);
        req.user = decoded;
    } catch(error){
        return res.status(401).send({ error: 'Token invalido' });
    }
    return next();
}
module.exports = {
    router,
    verifyToken,
}

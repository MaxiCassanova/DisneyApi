fs = require('fs')

readImageSync = (path) => {
    //Debe leer la imagen del Path, y devolverla en base64
    let image = fs.readFileSync(path);
    return image.toString('base64');
}


module.exports = {
    readImageSync,
};
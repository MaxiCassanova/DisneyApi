const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('movieOrSerie', {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        image:{
            type: DataTypes.STRING,
            allowNull: false
        },
        title:{
            type: DataTypes.STRING,
            allowNull: false
        },
        releaseDate:{
            type: DataTypes.STRING,
            allowNull: false
        },
        rating:{
            type: DataTypes.ENUM('1','2','3','4','5'),
            allowNull: true
        },
    });
};
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('character', {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        image:{
            type: DataTypes.STRING,
            allowNull: false
        },
        name:{
            type: DataTypes.STRING,
            allowNull: false
        },
        age:{
            type: DataTypes.INTEGER,
            allowNull: true
        },
        weight:{
            type: DataTypes.REAL,
            allowNull: true
        },
        lore:{
            type: DataTypes.STRING,
            allowNull: false
        },
    });
};

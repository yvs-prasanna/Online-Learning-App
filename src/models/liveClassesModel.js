const express = require('express');
const database = require('../config/database');

const getLiveClassById = async(id) => {
    try{
        const query = `SELECT * FROM live_classes WHERE id =?`;
        const result = await database.get(query, [id]);
        return result;
    }catch(error){
        console.log(error);
        return null;
    }
}

module.exports = {getLiveClassById};


const path = require('path');
const fs = require('fs');
const axios = require('axios');

module.exports = app => {
    function getCoursesInJson() {
        const productsPath = path.join(__dirname, '../jsons-products/products.json');
        const productsData = fs.readFileSync(productsPath, 'utf8');
        return JSON.parse(productsData);
    }

    return { getCoursesInJson }
}
'use strict';

const uuidv1 = require('uuid/v1');

module.exports = {
    get uuid(){
        return uuidv1().replace(/-/g, '');
    }
}
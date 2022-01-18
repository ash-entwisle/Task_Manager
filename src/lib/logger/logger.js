const fs = require('fs')
const path = require('path')

function logger(action) {

    let rawdate = new Date();
    let formdate = (
        rawdate.getFullYear() + '-' +
        ('0' + (rawdate.getMonth() + 1)).slice(-2) + '-' +
        ('0' + rawdate.getDate()).slice(-2) + ' ' +
        ('0' + rawdate.getHours()).slice(-2) + ':' +
        ('0' + rawdate.getMinutes()).slice(-2) + ':' +
        ('0' + rawdate.getSeconds()).slice(-2)
    );
    let data = (
        '[' + formdate + ']: ' + action + ' (' + ')'
    )

    
    console.log(data)
    fs.appendFile('./src/data/log/logger.log', ('\n' + data), err => {
        if (err) {
            console.error(err);
        }});

    }

module.exports = logger

let path = require('path')
let fs = require('fs')
const log= require('../logger/logger').log
const locale = "JSON"


function exportJSON (path, obj) {
    try {
        fs.writeFileSync(path, JSON.stringify(obj))
    } catch (error) {
        console.log(error)
        log("error in exporting object to json", locale)
    }

}

function importJSON (targetPath) {
    try {
        let data = fs.readFileSync(targetPath)
        return JSON.parse(data)
    } catch (error) {
        log("error in importing json", locale)
    }
}

module.exports = {
    exportJSON, importJSON
}

/*

json data held in an object. 
object will export to .
[
    "heading": "some random task"
    "for": "some random person"
    "description": "complete NEA"
    "dueDate": "yyyy/mm/dd"
    "setDate": "yyyy/mm/dd"
    "completed": False


]

*/
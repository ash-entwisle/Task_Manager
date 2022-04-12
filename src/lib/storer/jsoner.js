let path = require('path')
let fs = require('fs')
const logger = require('../logger/logger')
const locale = "JSON"


function exportJSON (obj) {
    try {
        let data = JSON.parse(obj)
        let logpath = "./src/data/exports/" + obj.heading + ".log"

        try {
            fs.appendFileSync(logpath, ('\n' + data));
        } catch (err) {
            console.error(err);
        };
    } catch (error) {
        logger("erroneous json passed", locale)
        console.error(error)
    }

}

function importJSON (targetPath) {
    try {
        
    } catch (error) {
      logger("error in importing object from json", locale)  
    }
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
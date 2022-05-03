
function getFormatTime(rawdate = new Date()) {      // get the time in the format HH:MM:SS               
    return (('0' + rawdate.getHours()).slice(-2) + ':' + ('0' + rawdate.getMinutes()).slice(-2) + ':' + ('0' + rawdate.getSeconds()).slice(-2));
}


function getFormatDate(rawdate = new Date()) {      // get the date in the format YYYY-MM-DD
    return (rawdate.getFullYear() + '-' + ('0' + (rawdate.getMonth() + 1)).slice(-2) + '-' +('0' + rawdate.getDate()).slice(-2));
}

function getFormatDateTime(rawdate = new Date()) {  // get the date and time in the format YYYY-MM-DDTHH:MM:SS
    return (`${getFormatDate(rawdate)}T${getFormatTime(rawdate)}`);
}

function timestamp(rawdate = new Date()) {          // get the timestamp YYYYMMDDHHMMSS
    return (rawdate.getFullYear() + ('0' + (rawdate.getMonth() + 1)).slice(-2) + ('0' + rawdate.getDate()).slice(-2) 
    + ('0' + rawdate.getHours()).slice(-2) + ('0' + rawdate.getMinutes()).slice(-2) + ('0' + rawdate.getSeconds()).slice(-2));
}

function isOverdue(date, today = new Date()) {      // check if date is in the past
    let dateArr = date.split("-");                  // split date into array
    if (new Date(dateArr[0], dateArr[1] - 1, dateArr[2]) < today) {return true;} 
    else {return false;}                            // return true if date is in the past. false if not
}

module.exports = {                                  // export the functions
    getFormatDate, getFormatTime, getFormatDateTime , timestamp, isOverdue 
}







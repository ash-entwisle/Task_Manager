// function to get and format the current time
function getFormatTime(rawdate = new Date()) {
    return (('0' + rawdate.getHours()).slice(-2) + ':' +( '0' + rawdate.getMinutes()).slice(-2) + ':' + ('0' + rawdate.getSeconds()).slice(-2));
}
// function to get and format the current date
function getFormatDate(rawdate = new Date()) {
    return (rawdate.getFullYear() + '-' + ('0' + (rawdate.getMonth() + 1)).slice(-2) + '-' +('0' + rawdate.getDate()).slice(-2));
}
// function to format the current date and time to ISO 8601
function getFormatDateTime(rawdate = new Date()) {
    return (`${getFormatDate(rawdate)}T${getFormatTime(rawdate)}`);
}
// function to get the timestamp
function timestamp(rawdate = new Date()) {
    return (`${rawdate.getFullYear()}${rawdate.getMonth()}${rawdate.getDate()}${rawdate.getHours()}${rawdate.getMinutes()}${rawdate.getSeconds()}`)
}
// function to check if a date is in the past where the date is in the format YYYY-MM-DD
function isOverdue(date, today = new Date()) {
    let dateArr = date.split("-");
    if (new Date(dateArr[0], dateArr[1] - 1, dateArr[2]) < today) {return true;} 
    else {return false;}
}
module.exports = { getFormatDate, getFormatTime, getFormatDateTime , timestamp, isOverdue }







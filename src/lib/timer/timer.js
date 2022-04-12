

function getFormatDateTime() {
    let rawdate = new Date()
    let formatdatetime = (
        rawdate.getFullYear() + '-' +
        ('0' + (rawdate.getMonth() + 1)).slice(-2) + '-' +
        ('0' + rawdate.getDate()).slice(-2) + '_' +
        ('0' + rawdate.getHours()).slice(-2) + ':' +
        ('0' + rawdate.getMinutes()).slice(-2) + ':' +
        ('0' + rawdate.getSeconds()).slice(-2)
    );
    return formatdatetime
}

function getFormatTime() {
    let rawdate = new Date()
    let formattime = (
        ('0' + rawdate.getHours()).slice(-2) + ':' +
        ('0' + rawdate.getMinutes()).slice(-2) + ':' +
        ('0' + rawdate.getSeconds()).slice(-2)
    );
    return formattime
}

function getFormatDate() {
    let rawdate = new Date()
    let formatdate = (
        rawdate.getFullYear() + '-' +
        ('0' + (rawdate.getMonth() + 1)).slice(-2) + '-' +
        ('0' + rawdate.getDate()).slice(-2)
    );
    return formatdate
}

function timestamp() {
    let rawdate = new Date()
    let timestamp = (`
        ${rawdate.getFullYear()}${rawdate.getMonth()}${rawdate.getDate()}${rawdate.getHours()}${rawdate.getMinutes()}${rawdate.getSeconds()}
    `)
    return timestamp
}


module.exports = { getFormatDate, getFormatTime, getFormatDateTime , timestamp }







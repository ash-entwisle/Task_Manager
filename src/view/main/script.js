const testbtn = document.getElementById("testbtn")

const { remote } = require("electron")
const getSplash = require("../../lib/splasher/splasher.js").getSplash;
const log = require("../../lib/logger/logger").log;


testbtn.addEventListener("click", () => {
    log("\"testbtn\" was clicked")
    testbtn.innerText = getSplash()
})

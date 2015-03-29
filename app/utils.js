function cleanRootPath(path) {
    // convert '/science/step1' => 'science'
    return path.replace(/\/?(\w+).*/, "$1");
}

function randomInt (min, max) {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
}

module.exports = {
    cleanRootPath, randomInt
};

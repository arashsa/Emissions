function cleanRootPath(path) {
    // convert '/science/step1' => 'science'
    return path.replace(/\/?(\w+).*/, "$1");
}

module.exports = {
    cleanRootPath
};

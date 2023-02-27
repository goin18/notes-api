const info = (...params) => {
    if (process.env.NODE_ENV != 'test') {
        console.log('INFO');
        console.log(...params);
    }
}

const error = (...params) => {
    if (process.env.NODE_ENV != 'test') {
        console.log('ERROR');
        console.log(...params);
    }
}

module.exports = {
    info, error
}
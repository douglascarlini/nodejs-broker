module.exports = {

    log: {

        debug(message) { this.output(message, 'DEBUG'); },
        error(message) { this.output(message, 'ERROR'); },
        output(message, type) { console.log(`${new Date().toLocaleString()} [${type}]: ${JSON.stringify(message)}`); }
    }

};
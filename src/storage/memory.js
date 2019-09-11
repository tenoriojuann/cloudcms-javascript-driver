var Extensions = require("../extensions");

class MemoryStorage
{
    constructor(config)
    {
        this.config = config;

        this.memory = {};
    }

    delete(key)
    {
        delete this.memory[key];
    }

    read(key)
    {
        return this.memory[key];

    }

    write(key, value)
    {
        this.memory[key] = value;
    }
}

// register
Extensions.storage("memory", MemoryStorage);

module.exports = MemoryStorage;
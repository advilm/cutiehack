class Command {
    constructor(options) {
        this.name = options.name || 'No name specified.';
        this.description = options.description || 'No description specified.';
        this.slashCommand = options.slashCommand || false;
    }
}

module.exports = Command;
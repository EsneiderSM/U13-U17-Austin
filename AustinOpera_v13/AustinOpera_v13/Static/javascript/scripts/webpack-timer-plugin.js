class WatchTimerPlugin {
    constructor(label) {
        this.label = label;
    }
    apply(compiler) {
        compiler.hooks.done.tap('Watch Timer Plugin', (stats) => {
            setTimeout(() => {
                console.log(`\n[${new Date().toLocaleString()}] - ${this.label} DONE.\n`);
            }, 100);
        });
    }
}

module.exports = WatchTimerPlugin;
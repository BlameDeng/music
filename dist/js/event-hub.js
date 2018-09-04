window.eventHub = {
    events: {},
    on(eventName, fn) {
        if (this.events[eventName] === undefined) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(fn);
    },
    emit(eventName, data) {
        for (const key in this.events) {
            if (key === eventName) {
                this.events[key].map((fn) => {
                    fn(data);
                })
            }
        }
    }
}
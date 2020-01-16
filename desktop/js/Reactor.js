
class Reactor {
    constructor() {
        this.events = {}
    }
    
    registerEvent(eventName) {
        class Event {
            constructor(name) {
                this.name = name
                this.callbacks = []
            }
            
            registerCallback(callback) {
                this.callbacks.push(callback)
            }
        }

        const event = new Event(eventName)
        this.events[eventName] = event
    }
    
    dispatchEvent(eventName, eventArgs) {
        if(this.events[eventName]) {
            this.events[eventName].callbacks.forEach(callback => callback(eventArgs))
        }
    }
    
    on(eventName, callback) {
        if(!this.events[eventName]) this.registerEvent(eventName)
        this.events[eventName].registerCallback(callback)
    }
}

module.exports = {
    Reactor
}
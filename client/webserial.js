const webserial = (() => {
    class Event {
        constructor(name) {
            this.name = name
            this.callbacks = []
        }
        
        registerCallback(callback) {
            this.callbacks.push(callback)
        }
    }
    
    class Reactor {
        constructor() {
            this.events = {}
        }
        
        registerEvent(eventName) {
            const event = new Event(eventName)
            this.events[eventName] = event
        }
        
        dispatchEvent(eventName, eventArgs) {
            if(this.events[eventName]) this.events[eventName].callbacks.forEach(callback => {
                callback(eventArgs)
            })
        }
        
        on(eventName, callback) {
            if(!this.events[eventName]) this.registerEvent(eventName)
            this.events[eventName].registerCallback(callback)
        }
    }
    
    const webserial = new Reactor()

    webserial.isConnected = false
    webserial.data = ''
    
    webserial.on('connection', () => {
        webserial.isConnected = true
        console.log('Serial device connected')
    })

    webserial.on('disconnection', () => {
        webserial.isConnected = false
        console.log('Serial device disconnected')
    })
    
    webserial.on('data', data => {
        webserial.data = data
        console.log(`data received: ${data}`)
    })
    
    const script = document.createElement('script')
    script.src = 'http://localhost:8135/socket.io/socket.io.js'
    script.addEventListener('load', e => {
        const socket = io('http://localhost:8135')
        socket.on('connection', () => webserial.dispatchEvent('connection'))
        socket.on('disconnection', () => webserial.dispatchEvent('disconnection'))
        socket.on('data', data => webserial.dispatchEvent('data', data))
    })
    document.head.appendChild(script)
    
    return webserial
})()

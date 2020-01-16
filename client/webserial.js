class WebSerial {
    constructor(port = 8135, host = 'http://localhost') {
        this.events = {}

        this.isConnected = false
        this.data = ''
        
        this.on('connection', () => {
            this.isConnected = true
            console.log('Serial device connected')
        })
    
        this.on('disconnection', () => {
            this.isConnected = false
            console.log('Serial device disconnected')
        })
        
        this.on('data', data => {
            this.data = data
            console.log(`data received: ${data}`)
        })

        const script = document.createElement('script')
        script.src = `${host}:${port}/socket.io/socket.io.js`
        script.addEventListener('load', e => {
            const socket = io(`${host}:${port}`)
            socket.on('connection', () => this.dispatchEvent('connection'))
            socket.on('disconnection', () => this.dispatchEvent('disconnection'))
            socket.on('data', data => this.dispatchEvent('data', data))
            this.on('write', data => {
                console.log(`writing data: ${data}`)
                socket.emit('write', data)
            })
        })
        document.head.appendChild(script)
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
        if(this.events[eventName]) this.events[eventName].callbacks.forEach(callback => {
            callback(eventArgs)
        })
    }
    
    on(eventName, callback) {
        if(!this.events[eventName]) this.registerEvent(eventName)
        this.events[eventName].registerCallback(callback)
    }

    write(data) {
        this.dispatchEvent('write', data)
    }
}

class WebSerial {
    constructor({ host = 'http://localhost', port = 8135 }) {
        this.events = {}
        this.isServerConnected = false
        this.isSerialConnected = false
        this.data = undefined
        this.log = false
        
        this.on('server-connect', () => {
            this.isServerConnected = true
            if(this.log) console.log('Connected to websocket server')
        })
    
        this.on('server-disconnect', () => {
            this.isServerConnected = false
            if(this.log) console.log('Disconnected from websocket server')
        })
        
        this.on('serial-connect', () => {
            this.isSerialConnected = true
            if(this.log) console.log('Connected to websocket server')
        })
    
        this.on('serial-disconnect', () => {
            this.isSerialConnected = false
            if(this.log) console.log('Disconnected from websocket server')
        })
        
        this.on('data', data => {
            this.data = data
            if(this.log) console.log(`data received: ${data}`)
        })

        const script = document.createElement('script')
        script.src = `${host}:${port}/socket.io/socket.io.js`
        script.addEventListener('load', e => {
            const socket = io(`${host}:${port}`)
            socket.on('connect', () => this.dispatchEvent('server-connect'))
            socket.on('disconnect', () => this.dispatchEvent('server-disconnect'))
            socket.on('serial-connect', () => this.dispatchEvent('serial-connect'))
            socket.on('serial-disconnect', () => this.dispatchEvent('serial-disconnect'))
            socket.on('data', data => this.dispatchEvent('data', data))

            this.on('write', data => {
                if(this.log) console.log(`writing data: ${data}`)
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
        if(this.events[eventName]) {
            this.events[eventName].callbacks.forEach(callback => {
                callback(eventArgs)
            })
        }
    }
    
    on(eventName, callback) {
        if(!this.events[eventName]) this.registerEvent(eventName)
        this.events[eventName].registerCallback(callback)
    }

    write(data) {
        this.dispatchEvent('write', data)
    }
}

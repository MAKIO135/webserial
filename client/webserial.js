class WebSerial {
    constructor(options) {
        const { host = 'http://localhost', port = 8135, log = false } = options || {}

        this.events = {}
        this.data = undefined
        this.isConnected = false

        this.on('server-update', status => {
            if(log) console.log(status ? 'Connected to websocket server' : 'Disconnected from websocket server')
        })

        this.on('serialport-update', status => {
            this.isConnected = status
            this.dispatchEvent(this.isConnected ? 'connect' : 'disconnect')
            if(log) console.log(this.isConnected ? 'Connected to Serial port' : 'Disconnected from Serial port')
        })

        this.on('data', data => {
            this.isConnected = true
            this.data = data
            if(log) console.log(`data received: ${data}`)
        })

        const script = document.createElement('script')
        script.src = `${host}:${port}/socket.io/socket.io.js`
        script.addEventListener('load', e => {
            const socket = io(`${host}:${port}`)
            socket.on('connect', () => this.dispatchEvent('server-update', true))
            socket.on('disconnect', () => {
                this.isConnected = false
                this.dispatchEvent('server-update', false)
                this.dispatchEvent('disconnect')
            })
            socket.on('serialport-update', status => {
                if(status !== this.isConnected) this.dispatchEvent('serialport-update', status)
            })
            socket.on('data', data => this.dispatchEvent('data', data))

            this.on('write', data => {
                if(log) {
                    console.log(`Writing data: ${data}`)
                }
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

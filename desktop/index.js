const { app, BrowserWindow } = require('electron')
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const expressApp = require('express')()
let http = require('http').createServer(expressApp)
let io = require('socket.io')(http)
const { Reactor } = require('./js/Reactor')

app.reactor = null
app.win = null
app.serialChecker = null
app.serialPort = null
app.serverPort = 8135

app.initEvents = () => {
    if(app.serialChecker) clearInterval(app.serialChecker)

    app.reactor = new Reactor()

    app.reactor.on('serialport-open', ({ path, baudRate }) => {
        app.reactor.dispatchEvent('serialport-close')
    
        app.serialPort = new SerialPort( path, { baudRate })
        app.parser = app.serialPort.pipe(new Readline())
        
        app.serialPort.on('error', err => {
            app.reactor.dispatchEvent('serialport-error', err)
        })
        
        app.parser.on('data', data => {
            app.reactor.dispatchEvent('serialport-data', data)
            app.reactor.dispatchEvent('server-emit', data)
        })
    
        app.reactor.dispatchEvent('serialport-opened')
    })
    
    app.reactor.on('serialport-close', () => {
        if(app.serialPort !== null) app.serialPort.close()
        app.serialPort = null
        app.reactor.dispatchEvent('serialport-closed')
    })
    
    app.reactor.on('server-start', port => {
        io.close()
        http.close(() => {
            app.serverPort = port
            http = require('http').createServer(expressApp)
            io = require('socket.io')(http)
    
            io.on('connection', socket => {
                app.reactor.dispatchEvent('client-update', Object.keys(io.sockets.connected).length)
                
                socket.on('write', dataString => {
                    if(app.serialPort) app.serialPort.write(`${dataString}\n`)
                    app.reactor.dispatchEvent('server-data', dataString)
                })
                
                socket.on('disconnect', () => {
                    app.reactor.dispatchEvent('client-update', Object.keys(io.sockets.connected).length)
                })
            })
    
            http.listen(app.serverPort, () => {
                console.log(`listening on ${app.serverPort}`)
                app.reactor.dispatchEvent('server-started', app.serverPort)
            })
        })
    })
    
    app.reactor.on('server-emit', msg => io.emit('data', msg))

    app.serialChecker = setInterval(() => {
        SerialPort.list().then(ports => {
            if(app.serialPort) {
                if(ports.find(p => p.path === app.serialPort.path)) {
                    app.reactor.dispatchEvent('serialport-opened')
                }
                else {
                    app.serialPort.close()
                    app.reactor.dispatchEvent('serialport-closed')
                }
            }
    
            app.reactor.dispatchEvent('serialport-scanned', ports)
        })
    }, 200)
}

const createWindow = () => {
    app.win = new BrowserWindow({
        width: 600,
        height: 400,
		minWidth: 250,
		minHeight: 150,
		// icon: __dirname + '/icon.ico',
		backgroundColor: 'black',
		frame: false,
		resizable: true,
		skipTaskbar: false,
		autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true
        }
    })
    
    app.win.loadFile('index.html')

    app.win.on('closed', () => {
        app.win = null
    })
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (app.win === null) {
        createWindow()
    }
})

app.on('ready', createWindow)
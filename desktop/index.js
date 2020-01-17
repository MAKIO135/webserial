const { app, BrowserWindow } = require('electron')
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const expressApp = require('express')()
let http = require('http').createServer(expressApp)
let io = require('socket.io')(http)
const { Reactor } = require('./js/Reactor')

app.reactor = new Reactor()
app.win = null
app.port = 8135
app.serialPort = null

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

    // app.win.webContents.openDevTools()
    
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

app.reactor.on('serialport-scann', () => {
    SerialPort.list().then(ports => app.reactor.dispatchEvent('serialport-scanned', ports))
})

app.reactor.on('serialport-open', ({ path, baudRate }) => {
    if(app.serialPort !== null) app.serialPort.close()

    app.serialPort = new SerialPort( path, { baudRate })
    app.parser = app.serialPort.pipe(new Readline())
    
    app.serialPort.on('open', () => {
        app.reactor.dispatchEvent('port-opened')
    })
    
    app.serialPort.on('error', err => {
        console.log('Error: ', err.message)
        app.reactor.dispatchEvent('serialport-opened', ({ path, baudRate }))
    })
    
    app.parser.on('data', data => {
        app.reactor.dispatchEvent('serialport-data', data)
        app.reactor.dispatchEvent('server-emit', data)
    })
})

app.reactor.on('server-start', port => {
    console.log("server-start")
    io.close()
    http.close(() => {
        console.log(`server closed, now starting on ${port}`)

        app.port = port
        http = require('http').createServer(expressApp)
        io = require('socket.io')(http)

        io.on('connection', socket => {
            app.reactor.dispatchEvent('client-connected', Object.keys(io.sockets.connected).length)
            
            socket.on('write', dataString => {
                if(app.serialPort) app.serialPort.write(`${dataString}\n`)
                app.reactor.dispatchEvent('server-data', dataString)
            })
            
            socket.on('disconnect', () => {
                app.reactor.dispatchEvent('client-connected', Object.keys(io.sockets.connected).length)
            })
        })

        http.listen(app.port, () => {
            console.log(`listening on ${app.port}`)
            app.reactor.dispatchEvent('server-started', app.port)
        })
    })
})


app.reactor.on('server-emit', msg => io.emit('data', msg))

app.on('ready', createWindow)
const { app, BrowserWindow } = require('electron')
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const expressApp = require('express')()
const http = require('http').createServer(expressApp)
const io = require('socket.io')(http)
const { Reactor } = require('./js/Reactor')

app.reactor = new Reactor()
app.win = null
app.port = 8135
app.serialPort = null

const createWindow = () => {
    app.win = new BrowserWindow({
        width: 500,
        height: 200,
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

    app.win.webContents.openDevTools()
    
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

app.reactor.on('device-scann', () => {
    SerialPort.list().then(ports => app.reactor.dispatchEvent('device-scanned', ports))
})

app.reactor.on('device-connect', ({ path, baudRate }) => {
    if(app.serialPort !== null) app.serialPort.close()
    
    app.serialPort = new SerialPort( path, { baudRate })
    app.parser = app.serialPort.pipe(new Readline())
    
    app.serialPort.on('open', () => {
        console.log(`port ${path} open`)
    })

    app.serialPort.on('error', err => {
        console.log('Error: ', err.message)
    })
    
    app.parser.on('data', data => {
        app.reactor.dispatchEvent('device-data', data)
        app.reactor.dispatchEvent('server-emit', data)
    })

    app.reactor.dispatchEvent('device-connected', { path, baudRate })
})

app.reactor.on('server-start', port => {
    app.port = port
    http.listen(app.port, () => {
        console.log(`listening on ${app.port}`)
        app.reactor.dispatchEvent('server-started', app.port)
    })
})

io.on('connection', socket => {
    app.reactor.dispatchEvent('client-connected')

    socket.on('write', dataString => app.serialPort.write(`${dataString}`))

    socket.on('disconnect', () => {
        if(Object.keys(io.sockets.connected).length == 0) {
            app.reactor.dispatchEvent('client-disconnected')
        }
    })
})

app.reactor.on('server-emit', msg => io.emit('data', msg))

app.on('ready', createWindow)
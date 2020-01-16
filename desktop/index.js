const { app, BrowserWindow } = require('electron')
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const expressApp = require('express')()
const http = require('http').createServer(expressApp)
const io = require('socket.io')(http)

let win

function createWindow () {
    win = new BrowserWindow({
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
    
    win.loadFile('index.html')

    // Ouvre les DevTools.
    win.webContents.openDevTools()
    
    win.on('closed', () => {
        win = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})

// serial port
let serialPort
app.scannPorts = () => SerialPort.list()

app.connectPort = (path, baudRate) => {
    serialPort = new SerialPort( path, { baudRate })
    const parser = serialPort.pipe(new Readline())
    return { serialPort, parser }
}

// express
const port = 8135
expressApp.get('/', (req, res) => res.send('YO'))
http.listen(port, () => console.log(`listening on ${port}`))

// socket
io.on('connection', socket => {
    socket.emit('connection', { msg: 'Connected to server' })
    socket.on('write', dataString => serialPort.write(`${dataString}`))
    socket.on('disconnect', () => {})
})

app.emitMessage = msg => io.emit('data', msg)
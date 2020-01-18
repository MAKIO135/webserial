const { app } = require('electron').remote

app.initEvents()

const serialPortSelect = document.querySelector('#serial-port')
const serialBaudrateSelect = document.querySelector('#serial-baudrate')
const serialData = document.querySelector('#serial-data')
const serialStatus = document.querySelector('#serial-status')

const serverPortSelect = document.querySelector('#server-port')
const serverStatus = document.querySelector('#server-status')
const serverClients = document.querySelector('#server-clients')
const serverData = document.querySelector('#server-data')

app.reactor.on('serialport-scanned', ports => {
    if(ports.length !== serialPortSelect.options.length - 1) {
        const selectedPort = serialPortSelect.selectedOptions[0]

        serialPortSelect.innerHTML = `<option value="">--Select port--</option>`

        ports.forEach(port => {
            const option = document.createElement('option')
            const { path, manufacturer } = port
            option.innerText = path + (manufacturer ? ` ${manufacturer}` : '')
            option.value = path
            serialPortSelect.appendChild(option)
        })

        serialPortSelect.selectedIndex = Math.max(0, [...serialPortSelect.options].findIndex(option => option.value === selectedPort.value))
    }
})

const connectSerial = () => {
    const path = serialPortSelect.value
    const baudRate = parseInt(serialBaudrateSelect.value)

    if(path && baudRate) {
        serialData.innerText = ''
        app.reactor.dispatchEvent('serialport-open', { path, baudRate })
    }
    else {
        app.reactor.dispatchEvent('serialport-close')
    }
}
serialPortSelect.addEventListener('change', connectSerial)
serialBaudrateSelect.addEventListener('change', connectSerial)

app.reactor.on('serialport-opened', () => {
    if(serialStatus.innerText !== 'OK') {
        serialStatus.innerText = 'OK'
    }
})

app.reactor.on('serialport-closed', () => {
    serialStatus.innerText = 'closed'
    serialData.innerText = ''
})

app.reactor.on('serialport-data', dataString => {
    serialData.innerText = dataString
})

serverPortSelect.addEventListener('change', e => {
    const port = parseInt(serverPortSelect.value)
    if(port > 1000) app.reactor.dispatchEvent('server-start', port)
})

app.reactor.on('server-started', port => {
    serverPortSelect.value = port
    serverStatus.innerText = `OK`
})

app.reactor.on('server-data', dataString => {
    serverData.innerText = dataString
})

app.reactor.on('client-update', n => {
    serverClients.innerText = n
})

app.reactor.dispatchEvent('server-start', app.serverPort)

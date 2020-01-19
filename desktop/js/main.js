const { app } = require('electron').remote

app.initEvents()

const serialPortSelect = document.querySelector('#serial>.port')
const serialBaudrateSelect = document.querySelector('#serial>.baudrate')
const serialStatus = document.querySelector('#serial>.status')
const serialData = document.querySelector('#serial>.data')

const serverPort = document.querySelector('#server>.port')
const serverStatus = document.querySelector('#server>.status')
const serverClients = document.querySelector('#server>.clients')
const serverData = document.querySelector('#server>.data')

app.reactor.on('serialport-scanned', ports => {
    if(ports.length !== serialPortSelect.options.length - 1) {
        const selectedPort = serialPortSelect.selectedOptions[0]

        serialPortSelect.innerHTML = `<option value="">--select serial port--</option>`

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
    if(!serialStatus.classList.contains('open')) {
        serialStatus.classList.add('open')
    }
})

app.reactor.on('serialport-closed', () => {
    serialStatus.classList.remove('open')
    serialData.innerText = ''
})

app.reactor.on('serialport-data', dataString => {
    serialData.innerText = dataString
})

serverPort.addEventListener('keypress', e => {
    if(isNaN(String.fromCharCode(e.which))) e.preventDefault()

    const port = parseInt(serverPort.innerText)

    if(port > 1000) {
        serverPort.classList.remove('unvalid-port')
        app.reactor.dispatchEvent('server-start', port)
    }
    else {
        serverPort.classList.add('unvalid-port')
    }
})

app.reactor.on('server-started', port => {
    console.log('server-started')
    serverPort.innerHTML = port
    serverStatus.classList.add('open')
})

app.reactor.on('server-closed', () => {
    console.log('server-closed')
    serverStatus.classList.remove('open')
})

app.reactor.on('server-data', dataString => {
    serverData.innerText = dataString
})

app.reactor.on('client-update', n => {
    serverClients.dataset.content = '|'.repeat(n).padStart(5, '•')
    if(serverClients.innerText === 0) serverData.innerText = ''
})

app.reactor.dispatchEvent('server-start', app.serverPort)

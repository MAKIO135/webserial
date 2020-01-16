const { app } = require('electron').remote

const serialPortSelect = document.querySelector('#serial-port')
const serialBaudrateSelect = document.querySelector('#serial-baudrate')
const serialConnect = document.querySelector('#serial-connect')
const serialData = document.querySelector('#serial-data')
const serialStatus = document.querySelector('#serial-status')

const serverPortSelect = document.querySelector('#server-port')
const serverData = document.querySelector('#server-data')
const serverStatus = document.querySelector('#server-status')

app.reactor.on('device-scanned', ports => {
    serialPortSelect.innerHTML = `<option value="">--Select port--</option>`

    ports.forEach(port => {
        const option = document.createElement('option')
        const { path, manufacturer } = port
        option.innerText = path + (manufacturer ? ` ${manufacturer}` : '')
        option.value = path
        serialPortSelect.appendChild(option)
    })
})

serialConnect.addEventListener('click', e => {
    if(serialPortSelect.value) {
        app.reactor.dispatchEvent('device-connect', { path: serialPortSelect.value, baudRate: parseInt(serialBaudrateSelect.value) })
    }
})

app.reactor.on('device-connected', ({ path, baudRate }) => {
    console.log(`device connected on ${path} at ${baudRate} bds`)
    // serialPortSelect.value = path
    // serialBaudrateSelect.value = baudRate
})

app.reactor.on('device-data', data => serialData.innerText = data)

app.reactor.on('server-started', port => serverPortSelect.value = port)

app.reactor.on('client-connected', () => console.log('client-connected'))
app.reactor.on('client-disconnected', () => console.log('client-disconnected'))

app.reactor.dispatchEvent('server-start', app.port)
app.reactor.dispatchEvent('device-scann')

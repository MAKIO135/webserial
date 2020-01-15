const { app } = require('electron').remote

let serialPort
let parser
const serialPortSelect = document.querySelector('#serial-port')
const serialBaudrateSelect = document.querySelector('#serial-baudrate')
const serialConnect = document.querySelector('#serial-connect')
const serialData = document.querySelector('#serial-data')

app.scannPorts().then(ports => {
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
        const connection = app.connectPort(serialPortSelect.value, parseInt(serialBaudrateSelect.value))
        serialPort = connection.serialPort
        parser = connection.parser

        // serialPort.on('open', () => {
            // console.log(`${serialPortSelect.value} open`)
        
            parser.on('data', data => {
                serialData.innerText = data
                app.emitMessage(data)
            })
        // })
    }
})
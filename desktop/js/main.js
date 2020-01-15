const { app } = require('electron').remote

let serialPort
let parser
const portSelect = document.querySelector('#port')
const rateSelect = document.querySelector('#baudrate')
const connectButton = document.querySelector('#connect')

app.scannPorts().then(ports => {
    portSelect.innerHTML = `<option value="">--Select port--</option>`

    ports.forEach(port => {
        const option = document.createElement('option')
        const { path, manufacturer } = port
        option.innerText = path + (manufacturer ? ` ${manufacturer}` : '')
        option.value = path
        portSelect.appendChild(option)
    })
})

connectButton.addEventListener('click', e => {
    if(portSelect.value) {
        const connection = app.connectPort(portSelect.value, parseInt(rateSelect.value))
        serialPort = connection.serialPort
        parser = connection.parser

        // serialPort.on('open', () => {
            // console.log(`${portSelect.value} open`)
        
            parser.on('data', data => {
                console.log('data from Serial: ' + data)
                app.emitMessage(data)
            })
        // })
    }
})
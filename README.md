# WebSerial

WebSerial is a minimal [Electron](https://electronjs.org/) application to bring Serial communication to Web browsers through websockets.

## Concept
[WebUSB](https://wicg.github.io/webusb/) is an awesome way to connect physical devices and microcontrollers to Web browsers but is limited to a [very little set of devices](https://github.com/webusb/arduino#compatible-hardware) for now.  

WebSerial brings a really simple way to connect your browser to any device with Serial communication and hack into tangible web.

WebSerial provides two ways communication between Serial deveices and browsers through websockets transport: *any Serial data is forwarded to your page, and the same in the other direction*.

WebSerial uses [serialport](https://serialport.io/) to open a Serial connection, and runs an [express](https://expressjs.com/) / [socket.io](https://socket.io/) websocket server to communicate with your web page in realtime.  
*Server runs on port 8135*.

## How to use WebSerial
Download the [latest release](https://github.com/makio135/webserial/releases) for your OS.  
Start the application.  
Connect your microcontroller.  
Select the `port` and `baudrate` for your device, and click `connect`.  
On your web page, add the link to this script:
```html
<script src="https://cdn.jsdelivr.net/gh/makio135/webserial/client/webserial.js"></script>
```
You now have access to the `Webserial` Class.

## Documentation
The `webserial` Object exposes a few methods and properties:
- `.on(eventType, callback)`, valid event types are:
    - `'connection'`: no argument is passed to the callback
    - `'disconnection'`: no argument is passed to the callback
    - `'data'`: callback takes one argument, the data received
- `.write(dataString)`: method use to send data to the microcontrolller

```html
<body>
    <script src="https://cdn.jsdelivr.net/gh/makio135/webserial/client/webserial.js"></script>
    <script>
        const webserial = new WebSerial()
        webserial.on('connection', () => console.log('Device connected'))
        webserial.on('disconnection', () => console.log('Device disconnected'))
        webserial.on('data', data => console.log(data))
    </script>
</body>
```

Or for use in a more direct mode:
- `.isConnected`: state of the connection with the Serial device (Boolean)
- `.data`: last data received from the device (String)

```html
<!-- Example using p5js https://p5js.org/ -->
<body>
    <script src="https://cdn.jsdelivr.net/gh/makio135/webserial/client/webserial.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/p5@0.10.2/lib/p5.js"></script>

    <script>
        let webserial

        function setup() {
            createCanvas(400, 400)
            webserial = new WebSerial()
        }

        function draw() {
            if(webserial.isConnected) {
                text(webserial.data, 5, 15)
            }
        }
    </script>
</body>
```

## Acknowledgments
WebSerial would not be possible without these great projects: 
- [electron](https://electronjs.org/)
- [electron-builder](https://www.electron.build/)
- [serialport](https://serialport.io/)
- [express](https://expressjs.com/)
- [socket.io](https://socket.io/)  

🙏🙏🙏
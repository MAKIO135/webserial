# WebSerial

> WebSerial is a minimal [Electron](https://electronjs.org/) application to bring Serial communication to Web browsers through websockets.  
> 
> [@Makio135](https://twitter.com/makio135)

![WbeSerial capture](https://i.imgur.com/WqXCIWo.png)

- [Concept](#concept)
- [How to use WebSerial](#how-to-use-webserial)
- [Documentation](#documentation)
- [Acknowledgments](#acknowledgments)

## Concept
[Web MIDI](https://webaudio.github.io/web-midi-api/), [Web Bluetooth](https://webbluetoothcg.github.io/web-bluetooth/) and [Web USB](https://wicg.github.io/webusb/) are awesome ways to connect physical devices and microcontrollers to Web browsers and create rich interactive experiments.  
But, while these APIs are still in early stages, not widely supported or limited to a [very little set of devices](https://github.com/webusb/arduino#compatible-hardware) for now, WebSockets are way more accessible and cheap Arduinos or the likes can be found easily.  

**WebSerial is a really simple way to connect your browser to any device with Serial communication and hack into physical web.**

WebSerial provides two ways communication between Serial devices and browsers through websockets transport: *any Serial data is forwarded to your page, and the same in the other direction*.

WebSerial uses [serialport](https://serialport.io/) to open a Serial connection, and runs an [express](https://expressjs.com/) / [socket.io](https://socket.io/) websocket server to communicate with your web page in realtime.  
*Server runs on port 8135* by default but can be changed in WebSerial.

For references, see:
- https://caniuse.com/#feat=midi
- https://caniuse.com/#feat=web-bluetooth
- https://caniuse.com/#feat=webusb
- https://caniuse.com/#feat=mdn-api_websocket

## How to use the WebSerial App
- Download the [latest release](https://github.com/makio135/webserial/releases) for your OS.  
- Start the WebSerial application.  
- Connect your microcontroller.  
- Select the `port` and `baudrate` for your device, and click `connect`.  
- On your web page, add the link to this script:
    ```html
    <script src="https://cdn.jsdelivr.net/gh/makio135/webserial/client/webserial.js"></script>
    ```
You now have access to the `Webserial` Class, see [Documentation](#documentation) below 👇.

## Documentation
The `Webserial` Class needs to be instanciated:
```javascript
const serial = new WebSerial()
```
The constructor can take an `options` Object to define the following properties:
- `host`: The IP of the computer running the WebSerial app. String, default to `localhost`, optional.
- `port`: The port of the websocket server. Number, default to `8135`, optional.
- `log`: Additional logs in the console for debugging. Boolean, default to `false`, optional.

```javascript
const serial = new WebSerial({
    host: '192.168.0.14',
    port: 8000,
    log: true
})
```

A `WebSerial` Instance exposes a few methods and properties:
- `.on(eventName, callback)`, valid events are:
    - `'connect'`: no argument is passed to the callback
    - `'disconnect'`: no argument is passed to the callback
    - `'data'`: callback takes one argument, the data received
- `.write(dataString)`: method used to send data to the microcontrolller

```html
<body>
    <script src="https://cdn.jsdelivr.net/gh/makio135/webserial/client/webserial.js"></script>
    <script>
        const serial = new WebSerial()
        serial.on('connect', () => console.log('Serial connected'))
        serial.on('disconnect', () => console.log('Serial disconnected'))
        serial.on('data', data => console.log(`Data received: ${data}`))
        serial.write('Hello WebSerial')
    </script>
</body>
```

Or for use in a more direct mode:
- `.isConnected`: state of the connection with Serial (Boolean)
- `.data`: last data received from Serial (String)

```html
<!-- Example using the p5js library (https://p5js.org/) -->
<body>
    <script src="https://cdn.jsdelivr.net/gh/makio135/webserial/client/webserial.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/p5@0.10.2/lib/p5.js"></script>

    <script>
        let serial

        function setup() {
            createCanvas(400, 400)
            serial = new WebSerial()
        }

        function draw() {
            background(255)
            if(serial.isConnected) {
                text(serial.data, 5, 15)
            }
        }

        function mousePressed() {
            serial.write(int(mouseX / width * 255))
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
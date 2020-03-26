const Cyton = require('@openbci/cyton');
const rp = require('request-promise');
const ourBoard = new Cyton();
let portName = "/dev/ttyUSB0"
const BASE_HOST = "http://localhost:3001";
const DEVICE_ID = "openbci_device_1"
let sessionId = "test_session_1"
const MAX_BATCH_SIZE = 250;
const MAX_DELAY_MS = 5000;

let batch = [];
let tmp = [];

ourBoard.listPorts().then(ports => {
  console.log("===================")
  console.log(ports);
});

ourBoard.connect(portName) // Port name is a serial port name, see `.listPorts()`
  .then(() => {
    ourBoard.streamStart();
    ourBoard.on('sample',(sample) => {
      // console.log(sample, "=====");

      let date = new Date();
      if (isNeedSend(batch, date)) {
        console.log("SEND batch with size === " + batch.length)
        tmp = [].concat(batch);
        batch = []
        // @todo protobuf send
            rp({
                method: 'POST',
                uri: BASE_HOST + '/api/v1/sensor/bci',
                body: {
                    data: tmp,
                    deviceId: DEVICE_ID,
                    sessionId: sessionId
                },
                json: true
            });
        console.log("Sended tmp");
      }

      batch.push(sample);
    });
});


function isNeedSend(batch, currentDate) {
	return batch.length > MAX_BATCH_SIZE || currentDate.getTime() - getMinTime(batch) >  MAX_DELAY_MS;
}

function getMinTime(batch) {
	return Math.min.apply(null, batch.map(item => item.timestamp));
}
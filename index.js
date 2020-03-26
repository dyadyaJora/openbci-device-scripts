const Cyton = require("@openbci/cyton");
const k = require("@openbci/utilities").constants;
const ourBoard = new Cyton({
  simulate: true,
  debug: true
});

ourBoard
  .connect(k.OBCISimulatorPortName) // This will set `simulate` to true
  .then(boardSerial => {
    ourBoard.streamStart();
    // ourBoard.on("sample", function(sample) {
    //   console.log("sample: ", sample);
    //   /** Work with sample */
    // });


    ourBoard.on('impedanceArray', impedanceArray => {
      console.log(impedanceArray);
      process.exit(0);
      /** Work with impedance */
    });
    ourBoard.impedanceTestAllChannels();
    setTimeout(() => {
      ourBoard.streamStop().then(ourBoard.disconnect());
    }, 15000)
  })
  .catch(err => {
    /** Handle connection errors */
  });
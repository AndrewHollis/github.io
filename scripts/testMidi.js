var midiAccess = null;  // global MIDIAccess object
var html, inputPort, outputPort;

function onMIDISuccess(midiAccess) {
    console.log("MIDI ready!");
    midi = midiAccess;  // store in the global (in real usage, would probably keep in an object instance)
    // for Debug
    //listInputsAndOutputs(midiAccess);
    DisplayInputsAndOutputs(midi);
    midi.onmidimessage = MIDIMessageEventHandler();

}

function onMIDIFailure(msg) {
    console.log("Failed to get MIDI access - " + msg);
}

navigator.requestMIDIAccess({ sysex: true }).then(onMIDISuccess, onMIDIFailure);

function selectInputIndex() {
    var x = document.getElementById("listInputs").selectedIndex;
    inputPort = midi.inputs.get(x);
    console.log(inputPort);
    inputPort.onmidimessage = MIDIMessageEventHandler;
    console.log("Selected Input Port: " + inputPort.name);
}

function selectOutputIndex() {
    var y = document.getElementById("listOutputs").selectedIndex;
    outputPort = midi.outputs.get(y);
    console.log("Selected Output Port: " + outputPort.name);
}

//TODO change so that midi port is connected on select: see guitest
function DisplayInputsAndOutputs(midiAccess) {
    var inputs = midiAccess.inputs,
        selectInput = document.getElementById("listInputs"),
        fragment = document.createDocumentFragment();

    // Add the inputs to the inputs selector drop down.
    for (var input of inputs)
    {
        var opt = document.createElement('option');
        opt.innerHTML = input[1].name;
        opt.value = input[1].id;
        fragment.appendChild(opt);
    }
    selectInput.appendChild(fragment);

    // Add outputs to drop down
    var outputs = midi.outputs,
      selectOutput = document.getElementById("listOutputs"),
      fragment2 = document.createDocumentFragment();

    if (outputs) { console.log("outputs present"); }

    // Add the outputs to the outputs selector drop down.
    for (var output of outputs)
    {
        var opt2 = document.createElement('option');
        opt2.innerHTML = output[1].name;
        opt2.value = output[1].id;
        fragment2.appendChild(opt2);
    }
    selectOutput.appendChild(fragment2);
}

function listInputsAndOutputs(midiAccess) {
    for (var entry of midiAccess.inputs) {
    //var input = entry[1];
        listInputs.choice = entry[1];

        console.log("Input port [type:'" + input.type + "'] id:'" + input.id +
            "' manufacturer:'" + input.manufacturer + "' name:'" + input.name +
            "' version:'" + input.version + "'");
    }
    for (var entry of midiAccess.outputs) {
    //var input = entry[1];
        listOutputs.choice = entry[1];

        console.log("Output port [type:'" + input.type + "'] id:'" + input.id +
            "' manufacturer:'" + input.manufacturer + "' name:'" + input.name +
            "' version:'" + input.version + "'");
    }
}


function MIDIMessageEventHandler(event) {
    data = event.data,

    cmd = data[0] >> 4, //extract command by shifting the first 4 bits by four.
                        // so 11 would be a CC message, 9 would mean a noteOn message. See notes

    channel = data[0] & 0xf, // Get channel by Bitwise AND operator 0xF = 15
        console.log("data: " + data[0]);
    type = data[0] & 0xf0, // Get message type using Bitwise AND operator 0xF0 = 240
    note = data[1],
    velocity = data[2] / 127;

    //console.log("data: " + data[0]);


    //console.log("Ch: " + channel);
    ////console.log("cmd: " + cmd);
    //console.log("Type: " + type);



    switch (type) {
        case 144: // noteOn  
            if (velocity == 0) { //Some devices send a midi note On message with velocity set to 0 to represent note off
                document.getElementById("message").innerHTML = "ch: " + channel + " NoteOff: " + note
                break;
            } else {
                document.getElementById("message").innerHTML = "ch: " + channel + " NoteOn: " + note + " Velocity: " + velocity;
                break;
            }
        case 128: // noteOff  
            document.getElementById("message").innerHTML = "ch: " + channel + " NoteOff: " + note
            break;
        case 160: // polyphonic key pressure  
            document.getElementById("message").innerHTML = "ch: " + channel + " poly key: " + note;
            break;
        case 176: // CC message 
            document.getElementById("message").innerHTML = "ch: " + channel + " CC: " + note + " data: " + velocity;
            break;
        case 192: // Program change  
            document.getElementById("message").innerHTML = "ch: " + channel + " Prg Chg: " + velocity;
            break;
        case 208: // Channel pressure  
            document.getElementById("message").innerHTML = "ch: " + channel + " ch pressure: " + velocity;
            break;
        case 224: // Pitch bend  
            document.getElementById("message").innerHTML = "ch: " + channel + " PB: " + data;
            break;
        case 240: // Sysex  
            document.getElementById("message").innerHTML = "ch: " + channel + " sysex: " + data;
            break;
        default:
            document.getElementById("message").innerHTML = "Unregistered message";

            
    }



    
}

function sendMessage(message) {
    outputPort.send(message);
}

function frequencyFromNoteNumber(note) {
    //TODO Which algorithm to use? Test using Tuner
    return 440 * Math.pow(2, (note - 69) / 12);
    //return (440. * Math.exp(.057762265 * (f - 69.)));
}




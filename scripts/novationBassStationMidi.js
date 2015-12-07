// #region Get MIDI Access 

var midiAccess = null;  // global MIDIAccess object
var html, inputPort, outputPort;

function onMIDISuccess(midiAccess) {
    console.log("MIDI ready!");
    var midi = {};
    midi = midiAccess;
    DisplayInputsAndOutputs(midi);
}

function onMIDIFailure(msg) {
    console.log("Failed to get MIDI access - " + msg);
    
}

navigator.requestMIDIAccess({ sysex: true }).then(onMIDISuccess, onMIDIFailure);

// #endregion

// #region List Inputs & Outputs


function selectInputIndex() {
    var x = document.getElementById("listInputs").selectedIndex;
    inputPort = midi.inputs.get(x);
    inputPort.onmidimessage = MIDIMessageEventHandler;
    console.log("Selected Input Port: " + inputPort.name);
}

function selectOutputIndex() {
    var y = document.getElementById("listOutputs").selectedIndex;
    outputPort = midi.outputs.get(y);
    console.log("Selected Output Port: " + outputPort.name);
}

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


// #endregion

// #region Events
function MIDIMessageEventHandler(event) {
    var data = event.data;
    cmd = data[0] >> 4,
    channel = data[0] & 0xf,
    type = data[0] & 0xf0, // channel agnostic message type. Thanks, Phil Burk.
    note = data[1],
    velocity = data[2] / 127;

    switch (type) {
        // TODO respond to program change messages
        // Update UI from MIDI CC messages
        case 176: // CC Message
            updateUI(note, velocity);
            break;

        default:
            break;
    }
}

function updateUI(note, velocity) {
    switch (note) {
        case 07:
            volume.set({ value: velocity * 127 });
            break;
        case 105:
            filterFrequency.set({ value: velocity * 127 });
            break;
        case 106:
            filterResonance.set({ value: velocity * 127 });
            break;
        case 107:
            filterModDepth.set({ value: velocity * 127 });
            break;
        case 108:
            envAttack.set({ value: velocity * 127 });
            break;
        case 109:
            envDecay.set({ value: velocity * 127 });
            break;
        case 110:
            envSustain.set({ value: velocity * 127 });
            break;
        case 111:
            envRelease.set({ value: velocity * 127 });
            break;
        case 112:
            envVelocity.set({ value: velocity * 127 });
            break;
        case 114:
            filterAttack.set({ value: velocity * 127 });
            break;
        case 115:
            filterDecay.set({ value: velocity * 127 });
            break;
        case 116:
            filterSustain.set({ value: velocity * 127 });
            break;
        case 117:
            filterRelease.set({ value: velocity * 127 });
            break;
        case 118:
            filterVelocity.set({ value: velocity * 127 });
            break;
        default:
            break;
    }
}

function sendMessage(message) {
    outputPort.send(message);
}

// #endregion

// TODO Add saving of patches
// #region Patches
function addPatches(){
    // Add outputs to drop down
    var patchesList = document.getElementById("selectPatch"),
      fragment = document.createDocumentFragment();
    
    p = [patch1, patch2, patch3];
    
    // Add the outputs to the outputs selector drop down.
    for (var patch of p)
    {
        var opt = document.createElement('option');
        opt.innerHTML = patch.patchName;
        opt.value = patch.patchNumber;
        fragment.appendChild(opt);
    }
    patchesList.appendChild(fragment);
}

function setPatch() {
    var index = document.getElementById("selectPatch"),
        patches = [patch1, patch2, patch3],
        newPatch = patches[index.value];

    // Set UI values from patch
    for (var i in nx.widgets) {
        if (nx.widgets[i].type == "comment") { // Add Patch Name to UI
            nx.widgets[i].set({ text: newPatch[i] });
        } else {
            nx.widgets[i].set({ value: newPatch[i] });
        }
    }
}


// #endregion

// #region Nexus Settings

nx.onload = function () {

    // NexusUI Settings
    nx.labelSize(30);
    nx.skin("dark");
    nx.colorize("#809BB9");
    channel.min = 0;
    channel.max = 15;
    //channel.set({ value: 1 });
    var patch = patch1, command,
    midiCh = 0;
    command = 176 + midiCh;
    addPatches();

    // Set UI values from patch
    for (var i in nx.widgets) {
        if (nx.widgets[i].type == "comment") { // Add Patch Name to UI
            nx.widgets[i].set({ text: patch[i] });
        } else {
            nx.widgets[i].set({ value: patch[i] });
        }
    }

    channel.on('*', function (data) {
        midiCh = data.value;
        command = 176 + midiCh;
    });


    // #region UI Controls

    volume.on('*', function (data) {
        //TODO Refactor: Use object to hold MIDI CC numbers. eg { "volume": 07, etc}
        var message = [command, 07, data.value];
        sendMessage(message);
    });

    filterFrequency.on('*', function (data) {
        var message = [command, 105, data.value];
        sendMessage(message);
    });

    filterResonance.on('*', function (data) {
        var message = [command, 106, data.value];
        sendMessage(message);
    });

    filterModDepth.on('*', function (data) {
        var message = [command, 107, data.value];
        sendMessage(message);
    });

    envAttack.on('*', function (data) {
        var message = [command, 108, data.value];
        sendMessage(message);
    });

    envDecay.on('*', function (data) {
        var message = [command, 109, data.value];
        sendMessage(message);
    });
    envSustain.on('*', function (data) {
        var message = [command, 110, data.value];
        sendMessage(message);
    });

    envRelease.on('*', function (data) {
        var message = [command, 111, data.value];
        sendMessage(message);
    });

    envVelocity.on('*', function (data) {
        var message = [command, 112, data.value];
        sendMessage(message);
    });

    filterAttack.on('*', function (data) {
        var message = [command, 114, data.value];
        sendMessage(message);
    });

    filterDecay.on('*', function (data) {
        var message = [command, 115, data.value];
        sendMessage(message);
    });

    filterSustain.on('*', function (data) {
        var message = [command, 116, data.value];
        sendMessage(message);
    });

    filterRelease.on('*', function (data) {
        var message = [command, 117, data.value];
        sendMessage(message);
    });

    filterVelocity.on('*', function (data) {
        var message = [command, 118, data.value];
        sendMessage(message);
    });

    // #endregion        
};


// #endregion

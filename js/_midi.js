// http://www.w3.org/TR/webmidi/

TANGUY.midi_success = function (midi) {
    'use strict';
    console.log('MIDI SUCCESS from TANGUY!');
    console.dir(midi);
    console.dir(midi.inputs);
};

TANGUY.midi_error = function () {
    'use strict';
    console.log('MIDI Error');
};

navigator.requestMIDIAccess({sysex: true}).then(TANGUY.midi_success, TANGUY.midi_error);

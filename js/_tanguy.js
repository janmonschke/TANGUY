/*global $, AudioContext, Float32Array*/
var TANGUY = {

    synth: new AudioContext(),

    //SENSIBLE DEFAULTS
    octave_shift: 0,
    osc1_master_pitch: 440,
    osc2_master_pitch: 444.18,
    key_down: false,

    program: {
        name: "INITIALIZE",
        osc1: {
            kbd: true,
            coarse: 1,
            saw_amt: 1,
            sqr_amt: 0,
            tri_amt: 0,
            sin_amt: 0,
            fm_amt: 0
        },
        osc2: {
            kbd: true,
            coarse: 1,
            waveform: "sawtooth",
            detune: 0,
            fine: 0,
            shape_amt: 0,
            fm_amt: 0
        },
        noise: {
            color: "white"
        },
        lfo: {
            shape: "sine",
            rate: 0.1,
            pitch_amt: 0,
            filter_amt: 0,
            amp_amt: 0
        },
        mixer: {
            osc1: 1,
            osc2: 1,
            noise: 0
        },
        filter: {
            mode: "lp",
            frequency: 22050,
            resonance: 0.0001,
            env_amt: 0,
            kbd: 0,
            attack: 0.0008,
            decay: 0.0008,
            sustain: 0,
            release: 0.0008
        },
        vca: {
            gain: 0,
            attack: 0.0001,
            decay: 0.0001,
            sustain: 1,
            release: 0.0001
        },
        portamento: {
            mode: "off",
            amt: 0.01
        },
        mod: {
            amt: 0,
            direction: 1
        },
        delay: {
            rate: 0,
            amt: 0
        }
    }
};
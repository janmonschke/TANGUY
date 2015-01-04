// TANGUY Web Audio Synthesizer
// Copyright 2014-2015 Luke Teaford
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
// luketeaford@gmail.com
// 153 Illinois Avenue, Dayton OH 45410

//BROWSER PREFIXING
window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

var TANGUY = {

    synth: new AudioContext(),

    //SENSIBLE DEFAULTS
    octave_shift: 0,
    osc1_master_pitch: 440,
    osc2_master_pitch: 444.18,
    key_down: false,

    program: {
        "name": "INITIALIZE",

        "osc1_kbd": true,
        "osc1_coarse": 1,
        "osc1_saw": 1,
        "osc1_sqr": 0,
        "osc1_tri": 0,
        "osc1_sin": 0,
        "osc1_fm": 0,

        "osc2_kbd": true,
        "osc2_coarse": 1,
        "osc2_waveform": "sawtooth",
        "osc2_detune": 0,
        "osc2_fine": 0,
        "osc2_shape": 0,
        "osc2_fm": 0,

        "noise_color": "white",

        "osc1_mix": 1,
        "osc2_mix": 1,
        "noise_mix": 0,
        "ext_mix": 0,

        "filter_mode": "lp",
        "cutoff": 1,
        "res": 0.0001,
        "filter_eg": 0,
        "filter_kbd": 0,
        "filter_attack": 0.008,
        "filter_decay": 0.008,
        "filter_sustain": 0,
        "filter_release": 0.008,

        "vca_gain": 0,
        "vca_attack": 0.0001,
        "vca_decay": 0.0001,
        "vca_sustain": 1,
        "vca_release": 0.0001,

        "lfo_shape": "sine",
        "lfo_rate": 0.1,
        "lfo_pitch": 0,
        "lfo_filter": 0,
        "lfo_amp": 0,

        "delay_rate": 0,
        "delay": 0,

        "portamento_mode": "off",
        "portamento": 0.01,

        "mod": 0,
        "mod_direction": 1
    }
};

TANGUY.save_program = function () {
    'use strict';
    var patch_name = prompt('PATCH NAME');
    TANGUY.program.name = patch_name;
    console.log('SAVE PROGRAM: ' + JSON.stringify(TANGUY.program));
};
TANGUY.populate_programs = function () {
    'use strict';
    var programs = [
        'initialize',

        //BASSES
        'eyeball bass',
        'stylish bass',
        'square wave bass',
        'whompy bass',
        'abominable bassman',
        'snarly bass',
        'panhandler bass',
        'sloppy bass',
        'perry on the beach',

        //LEADS
        'direct peon',
        'headcleaner',
        'jet lag',
        'ozone',
        'disco pabulum',
        'no pulse',
        'former marine',
        'lettuce in',
        'cool wire',
        'dolphin sighting',
        'rhinoceros',
        'wah wah',
        'black celebration',
        'banjo man',

        //STRINGS
        'digital fiddle',
        'camembert',
        'plywood violin',
        'metal cello',
        'synth strings',
        'slow motion sunrise',

        //GUITAR
        'fake sync',
        'event deafener',
        'faux set',
        'fuzzy',
        'easy cure',
        'crawler',
        'razor view',
        'invisible hand',

        //VOCAL SOUNDS
        'dusty pipes',
        'wistful pipes',
        'hum',
        'shanty',
        'galactic yawn',
        'male voice',
        'the last voice',

        //BELLS
        'bel homme',
        'gamelan',

        //FX
        'low bubble',
        'chattering',
        'salut detroit',
        'bacon grease',
        'chhchhchhchh',
        'fisherman',
        'r mutt',
        'showering dalek',
        'architecture',
        'bending branch',
        'weedy rectangle',
        'red river',
        'swamp monster',
        'papayawhip',
        'science fiction brains',
        'mimosa',

        //PERCUSSION
        'optic kick',
        'round kick',
        'cheap snare',
        'beefy snare',
        'hihat',
        'maracas',
        'beatnik bongos',

        //DRONES
        'feedback drone',
        'ragamuffin',
        'evening gardening',
        'pulse demon',
        'rubberband',
        'third member',
        'synth king',

        //EXTERNAL PROCESSING
        'external input',
        'slight delay',
        'metallic vocals',
        'systematic decline',
        'central scrutinizer',
        'boogie vocals',
        'meltdown'
    ],
        urls = [],
        buttons = '',
        i;
    for (i = 0; i < programs.length; i += 1) {
        urls[i] = programs[i].replace(/\s+/g, '');
        buttons += '<button value="' + urls[i] + '">' + programs[i] + '</button>';
    }
    $('#program-select').append(buttons);
};

TANGUY.load_program = function (patch) {
    'use strict';
    var patch_url = encodeURI('programs/') + patch + '.json';
    $.getJSON(decodeURI(patch_url), function (loaded) {
        TANGUY.program = loaded;
        return TANGUY.update_program();
    });
};

TANGUY.show_program = function () {
    'use strict';
    $('#program-select').show();
    $(document).one('click', TANGUY.hide_program);
    return false;
};

TANGUY.hide_program = function () {
    'use strict';
    $('#program-select').hide();
    $('body').one('click', '#program', TANGUY.show_program);
    return false;
};
TANGUY.update_program = function () {
    'use strict';

    //OSCILLATOR 1
    TANGUY.update_osc1_coarse();
    TANGUY.update_osc1_saw();
    TANGUY.update_osc1_sqr();
    TANGUY.update_osc1_tri();
    TANGUY.update_osc1_sin();
    TANGUY.update_osc1_fm();

    //OSCILLATOR 2
    TANGUY.update_osc2_coarse();
    TANGUY.update_osc2_waveform();
    TANGUY.update_osc2_detune();
    TANGUY.update_osc2_fine();
    TANGUY.update_osc2_shape();
    TANGUY.update_osc2_fm();

    //NOISE
    TANGUY.update_noise_color();

    //MIXER
    TANGUY.update_osc1_mix();
    TANGUY.update_osc2_mix();
    TANGUY.update_noise_mix();

    //FILTER
    TANGUY.update_filter_mode();
    TANGUY.update_cutoff();
    TANGUY.update_resonance();

    //VCA
    TANGUY.update_vca_gain();

    //LFO
    TANGUY.update_lfo_shape();
    TANGUY.update_lfo_rate();
    TANGUY.calculate_lfo();//update lfo amount? - what does this comment mean?

    //DELAY
    TANGUY.update_delay_rate();
    TANGUY.update_delay_amt();

    return TANGUY.update_panel();
};
TANGUY.update_panel = function () {
    'use strict';

    //PROGRAM NAME
    $('#program-name').text(TANGUY.program.name);

    //OSCILLATOR 1
    if (TANGUY.program.osc1_kbd) {
        TANGUY.button.change($('#osc1-on'));
    } else {
        TANGUY.button.change($('#osc1-off'));
    }

    switch (TANGUY.program.osc1_coarse) {
    case 0.5:
        TANGUY.button.change($('#osc1-32'));
        break;
    case 1:
        TANGUY.button.change($('#osc1-16'));
        break;
    case 2:
        TANGUY.button.change($('#osc1-8'));
        break;
    case 4:
        TANGUY.button.change($('#osc1-4'));
        break;
    }

    $('#osc1-saw').val(TANGUY.program.osc1_saw);
    $('#osc1-sqr').val(TANGUY.program.osc1_sqr);
    $('#osc1-tri').val(TANGUY.program.osc1_tri);
    $('#osc1-sin').val(TANGUY.program.osc1_sin);
    $('#osc1-fm').val(TANGUY.program.osc1_fm);

    //OSCILLATOR 2
    if (TANGUY.program.osc2_kbd) {
        TANGUY.button.change($('#osc2-on'));
    } else {
        TANGUY.button.change($('#osc2-off'));
    }

    switch (TANGUY.program.osc2_coarse) {
    case 0.5:
        TANGUY.button.change($('#osc2-32'));
        break;
    case 1:
        TANGUY.button.change($('#osc2-16'));
        break;
    case 2:
        TANGUY.button.change($('#osc2-8'));
        break;
    case 4:
        TANGUY.button.change($('#osc2-4'));
        break;
    }

    switch (TANGUY.program.osc2_waveform) {
    case 'sawtooth':
        TANGUY.button.change($('#osc2-saw'));
        break;
    case 'square':
        TANGUY.button.change($('#osc2-sqr'));
        break;
    case 'triangle':
        TANGUY.button.change($('#osc2-tri'));
        break;
    case 'sine':
        TANGUY.button.change($('#osc2-sin'));
        break;
    }

    $('#osc2-detune').val(TANGUY.program.osc2_detune);
    $('#osc2-fine').val(TANGUY.program.osc2_fine);
    $('#osc2-waveshape').val(TANGUY.program.osc2_shape);
    $('#osc2-fm').val(TANGUY.program.osc2_fm);

    //NOISE
    switch (TANGUY.program.noise_color) {
    case 'white':
        TANGUY.button.change($('#white-noise'));
        break;
    case 'pink':
        TANGUY.button.change($('#pink-noise'));
        break;
    case 'red':
        TANGUY.button.change($('#red-noise'));
        break;
    case 'blue':
        TANGUY.button.change($('#blue-noise'));
        break;
    case 'purple':
        TANGUY.button.change($('#purple-noise'));
        break;
    }

    //MIXER
    $('#osc1-mix').val(TANGUY.program.osc1_mix);
    $('#osc2-mix').val(TANGUY.program.osc2_mix);
    $('#noise-mix').val(TANGUY.program.noise_mix);
    $('#ext-mix').val(TANGUY.program.ext_mix);

    //FILTER
    switch (TANGUY.program.filter_mode) {
    case 'lp':
        TANGUY.button.change($('#filter-lp'));
        break;
    case 'bp':
        TANGUY.button.change($('#filter-bp'));
        break;
    case 'hp':
        TANGUY.button.change($('#filter-hp'));
        break;
    case 'notch':
        TANGUY.button.change($('#filter-notch'));
        break;
    case 'off':
        TANGUY.button.change($('#filter-off'));
        break;
    }

    $('#cutoff').val(TANGUY.program.cutoff);
    $('#resonance').val(TANGUY.program.res);
    $('#filter-eg-amt').val(TANGUY.program.filter_eg);
    $('#filter-kbd').val(TANGUY.program.filter_kbd);
    $('#filter-a').val(TANGUY.program.filter_attack);
    $('#filter-d').val(TANGUY.program.filter_decay);
    $('#filter-s').val(TANGUY.program.filter_sustain);
    $('#filter-r').val(TANGUY.program.filter_release);

    //VCA
    $('#vca-a').val(TANGUY.program.vca_attack);
    $('#vca-d').val(TANGUY.program.vca_decay);
    $('#vca-s').val(TANGUY.program.vca_sustain);
    $('#vca-r').val(TANGUY.program.vca_release);
    $('#vca-gain').val(TANGUY.program.vca_gain);

    //LFO
    switch (TANGUY.program.lfo_shape) {
    case 'sine':
        TANGUY.button.change($('#lfo-sin'));
        break;
    case 'triangle':
        TANGUY.button.change($('#lfo-tri'));
        break;
    case 'ramp':
        TANGUY.button.change($('#lfo-rmp'));
        break;
    case 'sawtooth':
        TANGUY.button.change($('#lfo-saw'));
        break;
    case 'square':
        TANGUY.button.change($('#lfo-sqr'));
        break;
    }

    $('#lfo-rate').val(TANGUY.program.lfo_rate);
    $('#lfo-pitch').val(TANGUY.program.lfo_pitch);
    $('#lfo-filter').val(TANGUY.program.lfo_filter);
    $('#lfo-amp').val(TANGUY.program.lfo_amp);

    //DELAY
    $('#delay-rate').val(TANGUY.program.delay_rate);
    $('#delay-amt').val(TANGUY.program.delay);

    //PORTAMENTO
    switch (TANGUY.program.portamento_mode) {
    case 'off':
        TANGUY.button.change($('#portamento-off'));
        break;
    case 'linear':
        TANGUY.button.change($('#portamento-linear'));
        break;
    case 'exponential':
        TANGUY.button.change($('#portamento-exponential'));
        break;
    }

    $('#portamento-amount').val(TANGUY.program.portamento);

    //MODWHEEL
    $('#mod-amount').val(TANGUY.program.mod);

};

TANGUY.shift_octave = function (direction) {
    'use strict';
    var lights = [
        $('#octave-minus-2'),
        $('#octave-minus-1'),
        $('#octave-plus-0'),
        $('#octave-plus-1'),
        $('#octave-plus-2')
    ];

    if (direction > 0 && TANGUY.octave_shift < 2) {
        TANGUY.octave_shift += 1;
        lights[TANGUY.octave_shift + 2].addClass('lit');
        lights[TANGUY.octave_shift + 1].removeClass('lit');
    } else if (direction < 0 && TANGUY.octave_shift > -2) {
        TANGUY.octave_shift -= 1;
        lights[TANGUY.octave_shift + 2].addClass('lit');
        lights[TANGUY.octave_shift + 3].removeClass('lit');
    }
};
TANGUY.calculate_pitch = function (pos, note_value) {
    'use strict';
    TANGUY.osc1_pitch = ((TANGUY.octave_shift + pos) * 1200) + note_value;
    TANGUY.osc2_pitch = TANGUY.osc1_pitch + TANGUY.program.osc2_detune;

    return TANGUY.set_pitch();
};

TANGUY.set_pitch = function () {
    'use strict';
    var osc1 = [TANGUY.osc1_saw, TANGUY.osc1_sqr, TANGUY.osc1_tri, TANGUY.osc1_sin],
        i;

    switch (TANGUY.program.portamento_mode) {
    case 'off':
        if (TANGUY.program.osc1_kbd === true) {
            for (i = 0; i < 4; i += 1) {
                osc1[i].detune.setValueAtTime(TANGUY.osc1_pitch, TANGUY.synth.currentTime);
            }
        }
        if (TANGUY.program.osc2_kbd === true) {
            TANGUY.osc2.detune.setValueAtTime(TANGUY.osc2_pitch, TANGUY.synth.currentTime);
        }
        break;
    case 'linear':
        if (TANGUY.program.osc1_kbd === true) {
            for (i = 0; i < 4; i += 1) {
                osc1[i].detune.linearRampToValueAtTime(TANGUY.osc1_pitch, TANGUY.synth.currentTime + TANGUY.program.portamento);
            }
        }
        if (TANGUY.program.osc2_kbd === true) {
            TANGUY.osc2.detune.linearRampToValueAtTime(TANGUY.osc2_pitch, TANGUY.synth.currentTime + TANGUY.program.portamento);
        }
        break;
    case 'exponential':
        if (TANGUY.program.osc1_kbd === true) {
            for (i = 0; i < 4; i += 1) {
                osc1[i].detune.setTargetAtTime(TANGUY.osc1_pitch, TANGUY.synth.currentTime, TANGUY.program.portamento / 5);
            }
        }
        if (TANGUY.program.osc2_kbd === true) {
            TANGUY.osc2.detune.setTargetAtTime(TANGUY.osc2_pitch, TANGUY.synth.currentTime, TANGUY.program.portamento / 5);
        }
        break;
    }

    return TANGUY.set_kbd();
};

TANGUY.set_kbd = function () {
    'use strict';
    var kbd = (4800 - TANGUY.osc1_pitch) * TANGUY.program.filter_kbd;

    switch (TANGUY.program.filter_mode) {
    case 'lp':
        TANGUY.lp_filter1.detune.setValueAtTime(kbd, TANGUY.synth.currentTime);
        TANGUY.lp_filter2.detune.setValueAtTime(kbd / 2, TANGUY.synth.currentTime);
        break;
    case 'bp':
        TANGUY.bp_filter1.detune.setValueAtTime(kbd, TANGUY.synth.currentTime);
        TANGUY.bp_filter2.detune.setValueAtTime(kbd, TANGUY.synth.currentTime);
        TANGUY.bp_filter3.detune.setValueAtTime(kbd, TANGUY.synth.currentTime);
        break;
    case 'hp':
        TANGUY.hp_filter1.detune.setValueAtTime(kbd, TANGUY.synth.currentTime);
        TANGUY.hp_filter2.detune.setValueAtTime(kbd, TANGUY.synth.currentTime);
        break;
    case 'notch':
        TANGUY.notch1.detune.setValueAtTime(kbd, TANGUY.synth.currentTime);
        TANGUY.notch2.detune.setValueAtTime(kbd, TANGUY.synth.currentTime);
        TANGUY.notch3.detune.setValueAtTime(kbd, TANGUY.synth.currentTime);
        break;
    case 'off':
        break;
    }
};

TANGUY.gate_on = function () {
    'use strict';
    TANGUY.calculate_pitch(parseFloat(this.getAttribute('data-keyboard-position')), parseFloat(this.getAttribute('data-note-value')));
    TANGUY.filter_env_on();
    return TANGUY.amp_env_on();
};

TANGUY.filter_env_on = function () {
    'use strict';
    var cutoff = TANGUY.program.cutoff * TANGUY.program.cutoff * 22030 + 20,
        filter_eg = ((TANGUY.program.filter_eg * (22050 - cutoff)) * Math.abs(TANGUY.program.filter_eg)) + cutoff,
        filter_end_of_attack = TANGUY.synth.currentTime + TANGUY.program.filter_attack,
        sustain = filter_eg * TANGUY.program.filter_sustain * TANGUY.program.filter_sustain + cutoff;

    switch (TANGUY.program.filter_mode) {
    case 'lp':
        TANGUY.lp_filter1.frequency.setValueAtTime(cutoff, TANGUY.synth.currentTime);
        TANGUY.lp_filter2.frequency.setValueAtTime(cutoff / 2, TANGUY.synth.currentTime);
        TANGUY.lp_filter1.frequency.linearRampToValueAtTime(filter_eg, TANGUY.synth.currentTime + TANGUY.program.filter_attack);
        TANGUY.lp_filter2.frequency.linearRampToValueAtTime(filter_eg / 2, TANGUY.synth.currentTime + TANGUY.program.filter_attack);
        TANGUY.lp_filter1.frequency.setTargetAtTime(sustain, filter_end_of_attack, TANGUY.program.filter_decay);
        TANGUY.lp_filter2.frequency.setTargetAtTime(sustain / 2, filter_end_of_attack, TANGUY.program.filter_decay);
        break;
    case 'bp':
        TANGUY.bp_filter1.frequency.setValueAtTime(cutoff, TANGUY.synth.currentTime);
        TANGUY.bp_filter2.frequency.setValueAtTime(cutoff * 0.9, TANGUY.synth.currentTime);
        TANGUY.bp_filter3.frequency.setValueAtTime(cutoff * 1.1, TANGUY.synth.currentTime);
        TANGUY.bp_filter1.frequency.linearRampToValueAtTime(filter_eg, TANGUY.synth.currentTime + TANGUY.program.filter_attack);
        TANGUY.bp_filter2.frequency.linearRampToValueAtTime(filter_eg * 0.9, TANGUY.synth.currentTime + TANGUY.program.filter_attack);
        TANGUY.bp_filter3.frequency.linearRampToValueAtTime(filter_eg * 1.1, TANGUY.synth.currentTime + TANGUY.program.filter_attack);
        TANGUY.bp_filter1.frequency.setTargetAtTime(sustain, filter_end_of_attack, TANGUY.program.filter_decay);
        TANGUY.bp_filter2.frequency.setTargetAtTime(sustain * 0.9, filter_end_of_attack, TANGUY.program.filter_decay);
        TANGUY.bp_filter3.frequency.setTargetAtTime(sustain * 1.1, filter_end_of_attack, TANGUY.program.filter_decay);
        break;
    case 'hp':
        TANGUY.hp_filter1.frequency.setValueAtTime(cutoff, TANGUY.synth.currentTime);
        TANGUY.hp_filter2.frequency.setValueAtTime(cutoff, TANGUY.synth.currentTime);
        TANGUY.hp_filter1.frequency.linearRampToValueAtTime(filter_eg, TANGUY.synth.currentTime + TANGUY.program.filter_attack);
        TANGUY.hp_filter2.frequency.linearRampToValueAtTime(filter_eg, TANGUY.synth.currentTime + TANGUY.program.filter_attack);
        TANGUY.hp_filter1.frequency.setTargetAtTime(sustain, filter_end_of_attack, TANGUY.program.filter_decay);
        TANGUY.hp_filter2.frequency.setTargetAtTime(sustain, filter_end_of_attack, TANGUY.program.filter_decay);
        break;
    case 'notch':
        TANGUY.notch1.frequency.setValueAtTime(cutoff, TANGUY.synth.currentTime);
        TANGUY.notch2.frequency.setValueAtTime(cutoff * 0.9, TANGUY.synth.currentTime);
        TANGUY.notch3.frequency.setValueAtTime(cutoff * 1.1, TANGUY.synth.currentTime);
        TANGUY.notch1.frequency.linearRampToValueAtTime(filter_eg, TANGUY.synth.currentTime + TANGUY.program.filter_attack);
        TANGUY.notch2.frequency.linearRampToValueAtTime(filter_eg * 0.9, TANGUY.synth.currentTime + TANGUY.program.filter_attack);
        TANGUY.notch3.frequency.linearRampToValueAtTime(filter_eg * 1.1, TANGUY.synth.currentTime + TANGUY.program.filter_attack);
        TANGUY.notch1.frequency.setTargetAtTime(sustain, filter_end_of_attack, TANGUY.program.filter_decay);
        TANGUY.notch2.frequency.setTargetAtTime(sustain * 0.9, filter_end_of_attack, TANGUY.program.filter_decay);
        TANGUY.notch3.frequency.setTargetAtTime(sustain * 1.1, filter_end_of_attack, TANGUY.program.filter_decay);
        break;
    }
};

TANGUY.amp_env_on = function () {
    'use strict';
    var vca_end_of_attack = TANGUY.synth.currentTime + TANGUY.program.vca_attack;

    TANGUY.vca.gain.setValueAtTime(TANGUY.program.vca_gain, TANGUY.synth.currentTime);
    TANGUY.vca.gain.linearRampToValueAtTime(1, TANGUY.synth.currentTime + TANGUY.program.vca_attack);
    TANGUY.vca.gain.setTargetAtTime(TANGUY.program.vca_sustain + TANGUY.program.vca_gain, vca_end_of_attack, TANGUY.program.vca_decay);
};

TANGUY.gate_off = function () {
    'use strict';
    TANGUY.filter_env_off();
    TANGUY.amp_env_off();
};

TANGUY.filter_env_off = function () {
    'use strict';
    var cutoff = TANGUY.program.cutoff * TANGUY.program.cutoff * 22030 + 20,
        filter_release_peak;

    switch (TANGUY.program.filter_mode) {
    case 'lp':
        filter_release_peak = TANGUY.lp_filter1.frequency.value;

        TANGUY.lp_filter1.frequency.cancelScheduledValues(TANGUY.synth.currentTime);
        TANGUY.lp_filter2.frequency.cancelScheduledValues(TANGUY.synth.currentTime);
        TANGUY.lp_filter1.frequency.setValueAtTime(filter_release_peak, TANGUY.synth.currentTime);
        TANGUY.lp_filter2.frequency.setValueAtTime(filter_release_peak / 2, TANGUY.synth.currentTime);
        TANGUY.lp_filter1.frequency.setTargetAtTime(cutoff, TANGUY.synth.currentTime, TANGUY.program.filter_release);
        TANGUY.lp_filter2.frequency.setTargetAtTime(cutoff / 2, TANGUY.synth.currentTime, TANGUY.program.filter_release);
        break;
    case 'bp':
        filter_release_peak = TANGUY.bp_filter1.frequency.value;

        TANGUY.bp_filter1.frequency.cancelScheduledValues(TANGUY.synth.currentTime);
        TANGUY.bp_filter2.frequency.cancelScheduledValues(TANGUY.synth.currentTime);
        TANGUY.bp_filter3.frequency.cancelScheduledValues(TANGUY.synth.currentTime);
        TANGUY.bp_filter1.frequency.setValueAtTime(filter_release_peak, TANGUY.synth.currentTime);
        TANGUY.bp_filter2.frequency.setValueAtTime(filter_release_peak * 0.9, TANGUY.synth.currentTime);
        TANGUY.bp_filter3.frequency.setValueAtTime(filter_release_peak * 1.1, TANGUY.synth.currentTime);
        TANGUY.bp_filter1.frequency.setTargetAtTime(cutoff, TANGUY.synth.currentTime, TANGUY.program.filter_release);
        TANGUY.bp_filter2.frequency.setTargetAtTime(cutoff * 0.9, TANGUY.synth.currentTime, TANGUY.program.filter_release);
        TANGUY.bp_filter3.frequency.setTargetAtTime(cutoff * 1.1, TANGUY.synth.currentTime, TANGUY.program.filter_release);
        break;
    case 'hp':
        filter_release_peak = TANGUY.hp_filter1.frequency.value;

        TANGUY.hp_filter1.frequency.cancelScheduledValues(TANGUY.synth.currentTime);
        TANGUY.hp_filter2.frequency.cancelScheduledValues(TANGUY.synth.currentTime);
        TANGUY.hp_filter1.frequency.setValueAtTime(filter_release_peak, TANGUY.synth.currentTime);
        TANGUY.hp_filter2.frequency.setValueAtTime(filter_release_peak, TANGUY.synth.currentTime);
        TANGUY.hp_filter1.frequency.setTargetAtTime(cutoff, TANGUY.synth.currentTime, TANGUY.program.filter_release);
        TANGUY.hp_filter2.frequency.setTargetAtTime(cutoff, TANGUY.synth.currentTime, TANGUY.program.filter_release);
        break;
    case 'notch':
        filter_release_peak = TANGUY.notch1.frequency.value;

        TANGUY.notch1.frequency.cancelScheduledValues(TANGUY.synth.currentTime);
        TANGUY.notch2.frequency.cancelScheduledValues(TANGUY.synth.currentTime);
        TANGUY.notch3.frequency.cancelScheduledValues(TANGUY.synth.currentTime);
        TANGUY.notch1.frequency.setValueAtTime(filter_release_peak, TANGUY.synth.currentTime);
        TANGUY.notch2.frequency.setValueAtTime(filter_release_peak * 0.9, TANGUY.synth.currentTime);
        TANGUY.notch3.frequency.setValueAtTime(filter_release_peak * 1.1, TANGUY.synth.currentTime);
        TANGUY.notch1.frequency.setTargetAtTime(cutoff, TANGUY.synth.currentTime, TANGUY.program.filter_release);
        TANGUY.notch2.frequency.setTargetAtTime(cutoff * 0.9, TANGUY.synth.currentTime, TANGUY.program.filter_release);
        TANGUY.notch3.frequency.setTargetAtTime(cutoff * 1.1, TANGUY.synth.currentTime, TANGUY.program.filter_release);
        break;
    }
};

TANGUY.amp_env_off = function () {
    'use strict';
    var vca_release_peak = TANGUY.vca.gain.value;

    TANGUY.vca.gain.cancelScheduledValues(TANGUY.synth.currentTime);
    TANGUY.vca.gain.setValueAtTime(vca_release_peak, TANGUY.synth.currentTime);
    TANGUY.vca.gain.setTargetAtTime(TANGUY.program.vca_gain, TANGUY.synth.currentTime, TANGUY.program.vca_release);
};

TANGUY.build_synth = function () {
    'use strict';
    var white_noise_data,
        pink_noise_data,
        red_noise_data,
        blue_noise_data,
        purple_noise_data,
        pink_noise_repeat,
        red_noise_repeat,
        blue_noise_repeat,
        purple_noise_repeat,
        i,
        j;

    //DELAY
    TANGUY.delay1_vca = TANGUY.synth.createGain();
    TANGUY.delay2_vca = TANGUY.synth.createGain();
    TANGUY.delay3_vca = TANGUY.synth.createGain();
    TANGUY.delay4_vca = TANGUY.synth.createGain();
    TANGUY.delay1_vca.gain.value = 0;
    TANGUY.delay2_vca.gain.value = 0;
    TANGUY.delay3_vca.gain.value = 0;
    TANGUY.delay4_vca.gain.value = 0;
    TANGUY.delay1_vca.connect(TANGUY.synth.destination);
    TANGUY.delay2_vca.connect(TANGUY.synth.destination);
    TANGUY.delay3_vca.connect(TANGUY.synth.destination);
    TANGUY.delay4_vca.connect(TANGUY.synth.destination);
    TANGUY.delay1 = TANGUY.synth.createDelay(2);
    TANGUY.delay2 = TANGUY.synth.createDelay(2);
    TANGUY.delay3 = TANGUY.synth.createDelay(2);
    TANGUY.delay4 = TANGUY.synth.createDelay(2);
    TANGUY.delay1.connect(TANGUY.delay1_vca);
    TANGUY.delay2.connect(TANGUY.delay2_vca);
    TANGUY.delay3.connect(TANGUY.delay3_vca);
    TANGUY.delay4.connect(TANGUY.delay4_vca);
    TANGUY.delay1_vca.connect(TANGUY.delay2);
    TANGUY.delay2_vca.connect(TANGUY.delay3);
    TANGUY.delay3_vca.connect(TANGUY.delay4);

    //VCA
    TANGUY.vca = TANGUY.synth.createGain();
    TANGUY.vca.gain.value = 0;
    TANGUY.vca.connect(TANGUY.delay1);
    TANGUY.vca.connect(TANGUY.synth.destination);

    //LP FILTER
    TANGUY.lp_filter1 = TANGUY.synth.createBiquadFilter();
    TANGUY.lp_filter2 = TANGUY.synth.createBiquadFilter();
    TANGUY.lp_filter1.type = 'lowpass';
    TANGUY.lp_filter2.type = 'lowpass';
    TANGUY.lp_filter1.connect(TANGUY.lp_filter2);
    TANGUY.lp_filter2.connect(TANGUY.vca);

    //BP FILTER
    TANGUY.bp_filter1 = TANGUY.synth.createBiquadFilter();
    TANGUY.bp_filter2 = TANGUY.synth.createBiquadFilter();
    TANGUY.bp_filter3 = TANGUY.synth.createBiquadFilter();
    TANGUY.bp_filter1.type = 'bandpass';
    TANGUY.bp_filter2.type = 'peaking';
    TANGUY.bp_filter3.type = 'peaking';
    TANGUY.bp_filter1.Q.value = 2;
    TANGUY.bp_filter2.Q.value = 3;
    TANGUY.bp_filter3.Q.value = 3;
    TANGUY.bp_filter1.connect(TANGUY.bp_filter2);
    TANGUY.bp_filter2.connect(TANGUY.bp_filter3);
    TANGUY.bp_filter3.connect(TANGUY.vca);

    //HP FILTER
    TANGUY.hp_filter1 = TANGUY.synth.createBiquadFilter();
    TANGUY.hp_filter2 = TANGUY.synth.createBiquadFilter();
    TANGUY.hp_filter1.type = 'highpass';
    TANGUY.hp_filter2.type = 'highpass';
    TANGUY.hp_filter1.connect(TANGUY.hp_filter2);
    TANGUY.hp_filter2.connect(TANGUY.vca);

    //NOTCH FILTER
    TANGUY.notch1 = TANGUY.synth.createBiquadFilter();
    TANGUY.notch2 = TANGUY.synth.createBiquadFilter();
    TANGUY.notch3 = TANGUY.synth.createBiquadFilter();
    TANGUY.notch1.type = 'notch';
    TANGUY.notch2.type = 'peaking';
    TANGUY.notch3.type = 'peaking';
    TANGUY.notch1.Q.value = 2;
    TANGUY.notch2.Q.value = 3;
    TANGUY.notch3.Q.value = 3;
    TANGUY.notch1.connect(TANGUY.notch2);
    TANGUY.notch2.connect(TANGUY.notch3);
    TANGUY.notch3.connect(TANGUY.vca);

    //MIXER SECTION
    TANGUY.mixer = TANGUY.synth.createGain();
    TANGUY.osc1_vca = TANGUY.synth.createGain();
    TANGUY.osc2_vca = TANGUY.synth.createGain();
    TANGUY.noise_vca = TANGUY.synth.createGain();
    TANGUY.ext_in_vca = TANGUY.synth.createGain();
    TANGUY.mixer.gain.value = 1;
    TANGUY.mixer.connect(TANGUY.lp_filter1);
    TANGUY.osc1_vca.connect(TANGUY.mixer);
    TANGUY.osc2_vca.connect(TANGUY.mixer);
    TANGUY.noise_vca.connect(TANGUY.mixer);
    TANGUY.ext_in_vca.connect(TANGUY.mixer);

    //OSC 1 VCAS
    TANGUY.osc1_saw_vca = TANGUY.synth.createGain();
    TANGUY.osc1_sqr_vca = TANGUY.synth.createGain();
    TANGUY.osc1_tri_vca = TANGUY.synth.createGain();
    TANGUY.osc1_sin_vca = TANGUY.synth.createGain();
    TANGUY.osc1_saw_vca.connect(TANGUY.osc1_vca);
    TANGUY.osc1_sqr_vca.connect(TANGUY.osc1_vca);
    TANGUY.osc1_tri_vca.connect(TANGUY.osc1_vca);
    TANGUY.osc1_sin_vca.connect(TANGUY.osc1_vca);

    //OSC 1 WAVEFORMS
    TANGUY.osc1_saw = TANGUY.synth.createOscillator();
    TANGUY.osc1_sqr = TANGUY.synth.createOscillator();
    TANGUY.osc1_tri = TANGUY.synth.createOscillator();
    TANGUY.osc1_sin = TANGUY.synth.createOscillator();
    TANGUY.osc1_saw.type = 'sawtooth';
    TANGUY.osc1_sqr.type = 'square';
    TANGUY.osc1_tri.type = 'triangle';
    TANGUY.osc1_sin.type = 'sine';
    TANGUY.osc1_saw.start(0);
    TANGUY.osc1_sqr.start(0);
    TANGUY.osc1_tri.start(0);
    TANGUY.osc1_sin.start(0);
    TANGUY.osc1_saw.connect(TANGUY.osc1_saw_vca);
    TANGUY.osc1_sqr.connect(TANGUY.osc1_sqr_vca);
    TANGUY.osc1_tri.connect(TANGUY.osc1_tri_vca);
    TANGUY.osc1_sin.connect(TANGUY.osc1_sin_vca);

    //FM OSCILLATOR 1
    TANGUY.osc1_fm_vca = TANGUY.synth.createGain();
    TANGUY.osc1_fm_vca.connect(TANGUY.osc1_saw.frequency);
    TANGUY.osc1_fm_vca.connect(TANGUY.osc1_sqr.frequency);
    TANGUY.osc1_fm_vca.connect(TANGUY.osc1_tri.frequency);
    TANGUY.osc1_fm_vca.connect(TANGUY.osc1_sin.frequency);

    //OSC 2 WAVESHAPER
    TANGUY.waveshaper = TANGUY.synth.createWaveShaper();
    TANGUY.waveshaper.connect(TANGUY.osc2_vca);

    //OSC 2
    TANGUY.osc2 = TANGUY.synth.createOscillator();
    TANGUY.osc2.start(0);
    TANGUY.osc2.connect(TANGUY.osc1_fm_vca);
    TANGUY.osc2.connect(TANGUY.waveshaper);

    //FM OSCILLATOR 2
    TANGUY.osc2_fm_vca = TANGUY.synth.createGain();
    TANGUY.osc2_fm_vca.connect(TANGUY.osc2.frequency);
    TANGUY.osc1_sin_vca.connect(TANGUY.osc2_fm_vca);

    //NOISE SECTION
    TANGUY.pink_noise_filter1 = TANGUY.synth.createBiquadFilter();
    TANGUY.pink_noise_filter2 = TANGUY.synth.createBiquadFilter();
    TANGUY.pink_noise_filter1.type = 'lowpass';
    TANGUY.pink_noise_filter2.type = 'lowpass';
    TANGUY.pink_noise_filter1.frequency.value = 8000;
    TANGUY.pink_noise_filter2.frequency.value = 4000;
    TANGUY.pink_noise_filter1.Q.value = 1;
    TANGUY.pink_noise_filter2.Q.value = 1;
    TANGUY.pink_noise_filter1.connect(TANGUY.pink_noise_filter2);
    TANGUY.pink_noise_filter2.connect(TANGUY.noise_vca);
    TANGUY.empty_white_noise_buffer = TANGUY.synth.createBuffer(1, 1, TANGUY.synth.sampleRate);
    TANGUY.empty_pink_noise_buffer = TANGUY.synth.createBuffer(1, 1, TANGUY.synth.sampleRate);
    TANGUY.empty_red_noise_buffer = TANGUY.synth.createBuffer(1, 1, TANGUY.synth.sampleRate);
    TANGUY.empty_blue_noise_buffer = TANGUY.synth.createBuffer(1, 1, TANGUY.synth.sampleRate);
    TANGUY.empty_purple_noise_buffer = TANGUY.synth.createBuffer(1, 1, TANGUY.synth.sampleRate);
    TANGUY.white_noise_buffer = TANGUY.synth.createBuffer(1, 88200, TANGUY.synth.sampleRate);
    TANGUY.pink_noise_buffer = TANGUY.synth.createBuffer(1, 44100, TANGUY.synth.sampleRate);
    TANGUY.red_noise_buffer = TANGUY.synth.createBuffer(1, 44100, TANGUY.synth.sampleRate);
    TANGUY.blue_noise_buffer = TANGUY.synth.createBuffer(1, 44100, TANGUY.synth.sampleRate);
    TANGUY.purple_noise_buffer = TANGUY.synth.createBuffer(1, 44100, TANGUY.synth.sampleRate);
    TANGUY.white_noise = TANGUY.synth.createBufferSource();
    TANGUY.pink_noise = TANGUY.synth.createBufferSource();
    TANGUY.red_noise = TANGUY.synth.createBufferSource();
    TANGUY.blue_noise = TANGUY.synth.createBufferSource();
    TANGUY.purple_noise = TANGUY.synth.createBufferSource();
    TANGUY.white_noise.start(0);
    TANGUY.pink_noise.start(0);
    TANGUY.red_noise.start(0);
    TANGUY.blue_noise.start(0);
    TANGUY.purple_noise.start(0);
    TANGUY.white_noise.loop = true;
    TANGUY.pink_noise.loop = true;
    TANGUY.red_noise.loop = true;
    TANGUY.blue_noise.loop = true;
    TANGUY.purple_noise.loop = true;
    TANGUY.white_noise.buffer = TANGUY.white_noise_buffer;
    TANGUY.pink_noise.buffer = TANGUY.empty_pink_noise_buffer;
    TANGUY.red_noise.buffer = TANGUY.empty_red_noise_buffer;
    TANGUY.blue_noise.buffer = TANGUY.empty_blue_noise_buffer;
    TANGUY.purple_noise.buffer = TANGUY.empty_purple_noise_buffer;
    TANGUY.white_noise.connect(TANGUY.noise_vca);
    TANGUY.pink_noise.connect(TANGUY.pink_noise_filter1);
    TANGUY.red_noise.connect(TANGUY.noise_vca);
    TANGUY.blue_noise.connect(TANGUY.noise_vca);
    TANGUY.purple_noise.connect(TANGUY.noise_vca);
    white_noise_data = TANGUY.white_noise_buffer.getChannelData(0);
    for (i = 0; i < 88200; i += 1) {
        white_noise_data[i] = 2 * Math.random() - 1;
    }
    pink_noise_data = TANGUY.pink_noise_buffer.getChannelData(0);
    for (i = 0; i < 44100; i += 1) {
        pink_noise_data[i] = Math.floor((Math.random() * (2000 - 20) + 20) / 1000);
        pink_noise_repeat = pink_noise_data[i];
        i += 1;
        for (j = 0; j < 4; j += 1) {
            pink_noise_data[i] = Math.abs(pink_noise_repeat);
            i += 1;
            pink_noise_data[i] = Math.abs(pink_noise_repeat) * 0.5;
        }
    }
    red_noise_data = TANGUY.red_noise_buffer.getChannelData(0);
    for (i = 0; i < 44100; i += 1) {
        red_noise_data[i] = (-1 * Math.random() + 2);
        red_noise_repeat = red_noise_data[i];
        i += 1;
        for (j = 0; j < 237; j += 1) {
            red_noise_data[i] = red_noise_repeat * 0.5;
            i += 1;
        }
    }
    blue_noise_data = TANGUY.blue_noise_buffer.getChannelData(0);
    for (i = 0; i < 44100; i += 1) {
        blue_noise_data[i] = (-1 * Math.random() + 1);
        blue_noise_repeat = blue_noise_data[i];
        i += 1;
        for (j = 0; j < 137; j += 1) {
            blue_noise_data[i] = blue_noise_repeat * 0.5;
            i += 1;
        }
    }
    purple_noise_data = TANGUY.purple_noise_buffer.getChannelData(0);
    for (i = 0; i < 44100; i += 1) {
        purple_noise_data[i] = -1 * Math.random() + 1;
        purple_noise_repeat = purple_noise_data[i];
        i += 1;
        for (j = 0; j < 172; j += 1) {
            purple_noise_data[i] = purple_noise_repeat * 0.75;
            i += 1;
        }
    }

    //LFO VCAS
    TANGUY.lfo_pitch_vca = TANGUY.synth.createGain();
    TANGUY.lfo_filter_vca = TANGUY.synth.createGain();
    TANGUY.lfo_amp_vca = TANGUY.synth.createGain();
    TANGUY.lfo_pitch_vca.connect(TANGUY.osc1_saw.frequency);
    TANGUY.lfo_pitch_vca.connect(TANGUY.osc1_sqr.frequency);
    TANGUY.lfo_pitch_vca.connect(TANGUY.osc1_tri.frequency);
    TANGUY.lfo_pitch_vca.connect(TANGUY.osc1_sin.frequency);
    TANGUY.lfo_pitch_vca.connect(TANGUY.osc2.frequency);
    TANGUY.lfo_filter_vca.connect(TANGUY.lp_filter1.frequency);
    TANGUY.lfo_amp_vca.connect(TANGUY.mixer.gain);

    //LFO
    TANGUY.lfo = TANGUY.synth.createOscillator();
    TANGUY.lfo.start(0);
    TANGUY.lfo.connect(TANGUY.lfo_pitch_vca);
    TANGUY.lfo.connect(TANGUY.lfo_filter_vca);
    TANGUY.lfo.connect(TANGUY.lfo_amp_vca);
};

TANGUY.route_external_input = function (input) {
    'use strict';
    TANGUY.ext_in = TANGUY.synth.createMediaStreamSource(input);
    TANGUY.ext_in.connect(TANGUY.ext_in_vca);
};

TANGUY.external_input_error = function () {
    'use strict';
    console.log('External input denied or unavailable.');
};

navigator.getUserMedia({audio: true}, TANGUY.route_external_input, TANGUY.external_input_error);

$(document).ready(function () {
    'use strict';
    TANGUY.build_synth();
    TANGUY.load_program('initialize');
    TANGUY.populate_programs();

    $('body').one('click', '#program', TANGUY.show_program);
    $('#program-select').on('click', 'button', function () {
        TANGUY.load_program(this.value);
    });
    $('#octave-shift').on('click', 'button', function () {
        return TANGUY.shift_octave(this.getAttribute('data-octave-shift'));
    });
    $('#osc1-kbd, #osc1-coarse, #osc2-kbd, #osc2-coarse, #osc2-waveform, #noise-color, #filter-mode, #lfo-shape, #portamento-mode').on('change', 'input', TANGUY.button.touch);
    $('#delay, #filter-eg, #vca-eg, #mixer, #filter, #mod-wheel').on('mousedown', 'input', TANGUY.slider.grab);
    $('#osc1, #osc2, #lfo').on('mousedown', 'input.vertical-slider', TANGUY.slider.grab);
    $('#portamento').on('mousedown', 'input.horizontal-slider', TANGUY.slider.grab);

});
TANGUY.update_osc1_coarse = function () {
    'use strict';
    var osc1 = [TANGUY.osc1_saw, TANGUY.osc1_sqr, TANGUY.osc1_tri, TANGUY.osc1_sin],
        i;
    for (i = 0; i < 4; i += 1) {
        osc1[i].frequency.setValueAtTime(440 * TANGUY.program.osc1_coarse, TANGUY.synth.currentTime);
    }
    return;
};

TANGUY.update_osc1_saw = function () {
    'use strict';
    return TANGUY.osc1_saw_vca.gain.setValueAtTime(TANGUY.program.osc1_saw * TANGUY.program.osc1_saw, TANGUY.synth.currentTime);
};

TANGUY.update_osc1_sqr = function () {
    'use strict';
    return TANGUY.osc1_sqr_vca.gain.setValueAtTime((TANGUY.program.osc1_sqr * TANGUY.program.osc1_sqr) * -1, TANGUY.synth.currentTime);
};

TANGUY.update_osc1_tri = function () {
    'use strict';
    return TANGUY.osc1_tri_vca.gain.setValueAtTime(TANGUY.program.osc1_tri * TANGUY.program.osc1_tri, TANGUY.synth.currentTime);
};

TANGUY.update_osc1_sin = function () {
    'use strict';
    return TANGUY.osc1_sin_vca.gain.setValueAtTime(TANGUY.program.osc1_sin * TANGUY.program.osc1_sin, TANGUY.synth.currentTime);
};

TANGUY.update_osc1_fm = function () {
    'use strict';
    return TANGUY.osc1_fm_vca.gain.setValueAtTime(TANGUY.program.osc1_fm * TANGUY.program.osc1_fm * 24000, TANGUY.synth.currentTime);
};
TANGUY.update_osc2_coarse = function () {
    'use strict';
    return TANGUY.osc2.frequency.setValueAtTime(TANGUY.osc2_master_pitch * TANGUY.program.osc2_coarse, TANGUY.synth.currentTime);
};

TANGUY.update_osc2_waveform = function () {
    'use strict';
    TANGUY.osc2.type = TANGUY.program.osc2_waveform;
    return;
};

TANGUY.update_osc2_detune = function () {
    'use strict';
    if (TANGUY.osc2_pitch === undefined) {
        TANGUY.osc2_pitch = TANGUY.osc2_master_pitch;
    }
    TANGUY.osc2.detune.setValueAtTime(TANGUY.osc2_pitch + TANGUY.program.osc2_detune, TANGUY.synth.currentTime);
};

TANGUY.update_osc2_fine = function () {
    'use strict';
    return TANGUY.osc2.frequency.setValueAtTime((TANGUY.osc2_master_pitch * TANGUY.program.osc2_coarse) + TANGUY.program.osc2_fine, TANGUY.synth.currentTime);
};

TANGUY.update_osc2_shape = function () {
    'use strict';
    var x = TANGUY.program.osc2_shape;
    if (x > 0) {
        TANGUY.waveshaper.curve = new Float32Array([x * 1.6, x * -2.5, x * -1.2, x * -2.4, x * -1.6, x * -3.2, x * 6.4, x * -3.2]);
    } else {
        TANGUY.waveshaper.curve = null;
    }
    return;
};

TANGUY.update_osc2_fm = function () {
    'use strict';
    return TANGUY.osc2_fm_vca.gain.setValueAtTime(TANGUY.program.osc2_fm * TANGUY.program.osc2_fm * 24000, TANGUY.synth.currentTime);
};
TANGUY.update_noise_color = function () {
    'use strict';
    switch (TANGUY.program.noise_color) {
    case 'white':
        TANGUY.white_noise.buffer = TANGUY.white_noise_buffer;
        TANGUY.pink_noise.buffer = TANGUY.empty_pink_noise_buffer;
        TANGUY.red_noise.buffer = TANGUY.empty_red_noise_buffer;
        TANGUY.blue_noise.buffer = TANGUY.empty_blue_noise_buffer;
        TANGUY.purple_noise.buffer = TANGUY.empty_purple_noise_buffer;
        break;
    case 'pink':
        TANGUY.pink_noise.buffer = TANGUY.pink_noise_buffer;
        TANGUY.white_noise.buffer = TANGUY.empty_white_noise_buffer;
        TANGUY.red_noise.buffer = TANGUY.empty_red_noise_buffer;
        TANGUY.blue_noise.buffer = TANGUY.empty_blue_noise_buffer;
        TANGUY.purple_noise.buffer = TANGUY.empty_purple_noise_buffer;
        break;
    case 'red':
        TANGUY.red_noise.buffer = TANGUY.red_noise_buffer;
        TANGUY.white_noise.buffer = TANGUY.empty_white_noise_buffer;
        TANGUY.pink_noise.buffer = TANGUY.empty_pink_noise_buffer;
        TANGUY.blue_noise.buffer = TANGUY.empty_blue_noise_buffer;
        TANGUY.purple_noise.buffer = TANGUY.empty_purple_noise_buffer;
        break;
    case 'blue':
        TANGUY.blue_noise.buffer = TANGUY.blue_noise_buffer;
        TANGUY.white_noise.buffer = TANGUY.empty_white_noise_buffer;
        TANGUY.pink_noise.buffer = TANGUY.empty_pink_noise_buffer;
        TANGUY.red_noise.buffer = TANGUY.empty_red_noise_buffer;
        TANGUY.purple_noise.buffer = TANGUY.empty_purple_noise_buffer;
        break;
    case 'purple':
        TANGUY.purple_noise.buffer = TANGUY.purple_noise_buffer;
        TANGUY.white_noise.buffer = TANGUY.empty_white_noise_buffer;
        TANGUY.pink_noise.buffer = TANGUY.empty_pink_noise_buffer;
        TANGUY.red_noise.buffer = TANGUY.empty_red_noise_buffer;
        TANGUY.blue_noise.buffer = TANGUY.empty_blue_noise_buffer;
        break;
    }
    return;
};
TANGUY.update_lfo_shape = function () {
    'use strict';
    switch (TANGUY.program.lfo_shape) {
    case 'sawtooth':
        TANGUY.lfo.type = TANGUY.program.lfo_shape;
        TANGUY.program.mod_direction = -1;
        break;
    case 'ramp':
        TANGUY.lfo.type = 'sawtooth';
        TANGUY.program.mod_direction = 1;
        break;
    case 'sine':
    case 'triangle':
    case 'square':
        TANGUY.lfo.type = TANGUY.program.lfo_shape;
        TANGUY.program.mod_direction = 1;
        break;
    }
    return TANGUY.calculate_lfo();
};

TANGUY.update_lfo_rate = function () {
    'use strict';
    return TANGUY.lfo.frequency.setValueAtTime(TANGUY.program.lfo_rate * TANGUY.program.lfo_rate * 100, TANGUY.synth.currentTime);
};

TANGUY.update_lfo_pitch = function () {
    'use strict';
    return TANGUY.lfo_pitch_vca.gain.setValueAtTime(TANGUY.program.lfo_pitch * TANGUY.program.mod * TANGUY.program.mod_direction, TANGUY.synth.currentTime);
};

TANGUY.update_lfo_filter = function () {
    'use strict';
    return TANGUY.lfo_filter_vca.gain.setValueAtTime(TANGUY.program.lfo_filter * TANGUY.program.mod * TANGUY.program.mod_direction, TANGUY.synth.currentTime);
};

TANGUY.update_lfo_amp = function () {
    'use strict';
    return TANGUY.lfo_amp_vca.gain.setValueAtTime(TANGUY.program.lfo_amp * TANGUY.program.mod * TANGUY.program.mod_direction, TANGUY.synth.currentTime);
};
TANGUY.update_delay_rate = function () {
    'use strict';
    var delay = [TANGUY.delay1, TANGUY.delay2, TANGUY.delay3, TANGUY.delay4],
        i;
    for (i = 0; i < 4; i += 1) {
        delay[i].delayTime.setValueAtTime(TANGUY.program.delay_rate * 2, TANGUY.synth.currentTime);
    }
    return;
};

TANGUY.update_delay_amt = function () {
    'use strict';
    var delay = [TANGUY.delay1_vca, TANGUY.delay2_vca, TANGUY.delay3_vca, TANGUY.delay4_vca],
        i;
    for (i = 0; i < 4; i += 1) {
        delay[i].gain.setValueAtTime(TANGUY.program.delay * TANGUY.program.delay, TANGUY.synth.currentTime);
    }
    return;
};
TANGUY.update_osc1_mix = function () {
    'use strict';
    return TANGUY.osc1_vca.gain.setValueAtTime(TANGUY.program.osc1_mix * TANGUY.program.osc1_mix, TANGUY.synth.currentTime);
};

TANGUY.update_osc2_mix = function () {
    'use strict';
    return TANGUY.osc2_vca.gain.setValueAtTime(TANGUY.program.osc2_mix * TANGUY.program.osc2_mix, TANGUY.synth.currentTime);
};

TANGUY.update_noise_mix = function () {
    'use strict';
    return TANGUY.noise_vca.gain.setValueAtTime(TANGUY.program.noise_mix * TANGUY.program.noise_mix, TANGUY.synth.currentTime);
};

TANGUY.update_ext_mix = function () {
    'use strict';
    return TANGUY.ext_in_vca.gain.setValueAtTime(TANGUY.program.ext_mix * TANGUY.program.ext_mix, TANGUY.synth.currentTime);
};

TANGUY.update_filter_mode = function () {
    'use strict';
    TANGUY.mixer.disconnect();
    TANGUY.lfo_filter_vca.disconnect();
    switch (TANGUY.program.filter_mode) {
    case 'lp':
        TANGUY.mixer.connect(TANGUY.lp_filter1);
        TANGUY.lfo_filter_vca.connect(TANGUY.lp_filter1.frequency);
        TANGUY.lfo_filter_vca.connect(TANGUY.lp_filter2.frequency);
        break;
    case 'bp':
        TANGUY.mixer.connect(TANGUY.bp_filter1);
        TANGUY.lfo_filter_vca.connect(TANGUY.bp_filter1.frequency);
        TANGUY.lfo_filter_vca.connect(TANGUY.bp_filter2.frequency);
        TANGUY.lfo_filter_vca.connect(TANGUY.bp_filter3.frequency);
        break;
    case 'hp':
        TANGUY.mixer.connect(TANGUY.hp_filter1);
        TANGUY.lfo_filter_vca.connect(TANGUY.hp_filter1.frequency);
        TANGUY.lfo_filter_vca.connect(TANGUY.hp_filter2.frequency);
        break;
    case 'notch':
        TANGUY.mixer.connect(TANGUY.notch1);
        TANGUY.lfo_filter_vca.connect(TANGUY.notch1.frequency);
        TANGUY.lfo_filter_vca.connect(TANGUY.notch2.frequency);
        TANGUY.lfo_filter_vca.connect(TANGUY.notch3.frequency);
        break;
    case 'off':
        TANGUY.mixer.connect(TANGUY.vca);
        break;
    }
    return;
};

TANGUY.update_cutoff = function () {
    'use strict';
    var cutoff = TANGUY.program.cutoff * TANGUY.program.cutoff * 22030 + 20;
    switch (TANGUY.program.filter_mode) {
    case 'lp':
        TANGUY.lp_filter1.frequency.setTargetAtTime(cutoff, TANGUY.synth.currentTime, 0.08);
        TANGUY.lp_filter2.frequency.setTargetAtTime(cutoff / 2, TANGUY.synth.currentTime, 0.08);
        break;
    case 'bp':
        TANGUY.bp_filter1.frequency.setTargetAtTime(cutoff, TANGUY.synth.currentTime, 0.08);
        TANGUY.bp_filter2.frequency.setTargetAtTime(cutoff * 0.9, TANGUY.synth.currentTime, 0.08);
        TANGUY.bp_filter3.frequency.setTargetAtTime(cutoff * 1.1, TANGUY.synth.currentTime, 0.08);
        break;
    case 'hp':
        TANGUY.hp_filter1.frequency.setTargetAtTime(cutoff, TANGUY.synth.currentTime, 0.08);
        TANGUY.hp_filter2.frequency.setTargetAtTime(cutoff, TANGUY.synth.currentTime, 0.08);
        break;
    case 'notch':
        TANGUY.notch1.frequency.setTargetAtTime(cutoff, TANGUY.synth.currentTime, 0.08);
        TANGUY.notch2.frequency.setTargetAtTime(cutoff * 0.9, TANGUY.synth.currentTime, 0.08);
        TANGUY.notch3.frequency.setTargetAtTime(cutoff * 1.1, TANGUY.synth.currentTime, 0.08);
        break;
    }
};

TANGUY.update_resonance = function () {
    'use strict';
    var q = TANGUY.program.res * TANGUY.program.res * 1000;
    switch (TANGUY.program.filter_mode) {
    case 'lp':
        TANGUY.lp_filter1.Q.setTargetAtTime(q / 82, TANGUY.synth.currentTime, 0.01);
        TANGUY.lp_filter2.Q.setTargetAtTime(q / 123, TANGUY.synth.currentTime, 0.01);
        break;
    case 'bp':
        TANGUY.bp_filter2.gain.setTargetAtTime(q / 82, TANGUY.synth.currentTime, 0.01);
        TANGUY.bp_filter3.gain.setTargetAtTime(q / 82, TANGUY.synth.currentTime, 0.01);
        break;
    case 'hp':
        TANGUY.hp_filter1.Q.setTargetAtTime(q / 82, TANGUY.synth.currentTime, 0.01);
        TANGUY.hp_filter2.Q.setTargetAtTime(q / 123, TANGUY.synth.currentTime, 0.01);
        break;
    case 'notch':
        TANGUY.notch2.gain.setTargetAtTime(q / -21, TANGUY.synth.currentTime, 0.01);
        TANGUY.notch3.gain.setTargetAtTime(q / -21, TANGUY.synth.currentTime, 0.01);
        break;
    }
};
TANGUY.update_vca_gain = function () {
    'use strict';
    return TANGUY.vca.gain.setTargetAtTime(TANGUY.program.vca_gain * TANGUY.program.vca_gain, TANGUY.synth.currentTime, 0.01);
};
//PITCH WHEEL CONTROLS
$('#pitch-bend').mousedown(function () {
    'use strict';
    var osc1 = [TANGUY.osc1_saw, TANGUY.osc1_sqr, TANGUY.osc1_tri, TANGUY.osc1_sin],
        i;
    $(this).mousemove(function () {
        for (i = 0; i < 4; i += 1) {
            osc1[i].detune.setTargetAtTime(TANGUY.osc1_pitch + (this.value * 100), TANGUY.synth.currentTime, 0.2);
        }
        TANGUY.osc2.detune.setTargetAtTime(TANGUY.osc2_pitch + (this.value * 100), TANGUY.synth.currentTime, 0.2);
    }).mouseup(function () {
        $(this).val(0).unbind('mousemove');
        for (i = 0; i < 4; i += 1) {
            osc1[i].detune.setTargetAtTime(TANGUY.osc1_pitch + (this.value * 100), TANGUY.synth.currentTime, 0.2);
        }
        TANGUY.osc2.detune.setTargetAtTime(TANGUY.osc2_pitch + (this.value * 100), TANGUY.synth.currentTime, 0.2);
    });
});
//MODWHEEL CONTROLS
TANGUY.calculate_lfo = function () {
    'use strict';
    var amt = TANGUY.program.mod * TANGUY.program.mod_direction;
    //PROBABLY MAKES BETTER SENSE TO CALL THE UPDATE FUNCTIONS HERE...
    TANGUY.lfo_pitch_vca.gain.setValueAtTime(TANGUY.program.lfo_pitch * amt, TANGUY.synth.currentTime);
    TANGUY.lfo_filter_vca.gain.setValueAtTime(TANGUY.program.lfo_filter * amt, TANGUY.synth.currentTime);
    TANGUY.lfo_amp_vca.gain.setValueAtTime(TANGUY.program.lfo_amp * amt, TANGUY.synth.currentTime);
    return;
};

TANGUY.slider = {
    grab: function () {
        'use strict';
        var config = {
            program: this.getAttribute('data-program'),
            update: this.getAttribute('data-update')
        };
        return $(this).mousemove(config, TANGUY.store_program).mouseup(TANGUY.slider.release);
    },

    release: function () {
        'use strict';
        return $(this).unbind('mousemove');
    }
};
TANGUY.button = {
    touch: function () {
        'use strict';
        var config = {
            program: this.parentNode.parentNode.getAttribute('data-program'),
            update: this.parentNode.parentNode.getAttribute('data-update')
        };
        TANGUY.button.change($(this));
        return $(this).one('click', config, TANGUY.store_program);
    },
    change: function (e) {
        'use strict';
        var button = e.currentTarget === undefined ? $(e) : $(e.currentTarget),
            pos = button.attr('data-pos'),
            bg_pos;
        if (pos) {
            bg_pos = 'pos' + pos;
            button.parent().parent().removeClass().addClass(bg_pos);
        }
        return button.parent().addClass('selected').siblings().removeClass('selected');
    }
};
TANGUY.store_program = function (e) {
    'use strict';
    switch (e.data.program) {
    case 'osc1_kbd':
    case 'osc2_kbd':
        TANGUY.program[e.data.program] = e.currentTarget.value === 'on' ? true : false;
        break;
    case 'osc2_waveform':
    case 'noise_color':
    case 'filter_mode':
    case 'lfo_shape':
    case 'portamento_mode':
        TANGUY.program[e.data.program] = e.currentTarget.value;
        break;
    default:
        TANGUY.program[e.data.program] = parseFloat(e.currentTarget.value);
    }
    if (TANGUY[e.data.update]) {
        return TANGUY[e.data.update]();
    }
    return;
};
//KEYBOARD CONTROLS
$('#keyboard').on('mousedown', 'button', TANGUY.gate_on).on('mouseup', 'button', TANGUY.gate_off);

$(document).keypress(function (key) {
    'use strict';
    switch (key.which) {
    case 45:
        TANGUY.shift_octave(-1);
        break;
    case 43:
    case 61:
        TANGUY.shift_octave(1);
        break;
    case 42:
        TANGUY.save_program();
        break;
    }
}).keydown(function (key) {
    'use strict';
    if (TANGUY.key_down === false) {
        TANGUY.key_active = key.which;
        TANGUY.key_down = true;
        switch (key.which) {
        case 65:
            $('#c1').trigger('mousedown').addClass('playing');
            break;
        case 83:
            $('#d1').trigger('mousedown').addClass('playing');
            break;
        case 68:
            $('#e1').trigger('mousedown').addClass('playing');
            break;
        case 70:
            $('#f1').trigger('mousedown').addClass('playing');
            break;
        case 71:
            $('#g1').trigger('mousedown').addClass('playing');
            break;
        case 72:
            $('#a1').trigger('mousedown').addClass('playing');
            break;
        case 74:
            $('#b1').trigger('mousedown').addClass('playing');
            break;
        case 75:
            $('#c2').trigger('mousedown').addClass('playing');
            break;
        case 76:
            $('#d2').trigger('mousedown').addClass('playing');
            break;
        case 186:
            $('#e2').trigger('mousedown').addClass('playing');
            break;
        case 222:
            $('#f2').trigger('mousedown').addClass('playing');
            break;
        case 87:
            $('#cs1').trigger('mousedown').addClass('playing');
            break;
        case 69:
            $('#ds1').trigger('mousedown').addClass('playing');
            break;
        case 84:
            $('#fs1').trigger('mousedown').addClass('playing');
            break;
        case 89:
            $('#gs1').trigger('mousedown').addClass('playing');
            break;
        case 85:
            $('#as1').trigger('mousedown').addClass('playing');
            break;
        case 79:
            $('#cs2').trigger('mousedown').addClass('playing');
            break;
        case 80:
            $('#ds2').trigger('mousedown').addClass('playing');
            break;
        case 221:
            $('#fs2').trigger('mousedown').addClass('playing');
            break;
        }
    }
}).keyup(function (key) {
    'use strict';
    if (key.which === TANGUY.key_active) {
        TANGUY.key_down = false;
        switch (key.which) {
        case 65:
            $('#c1').trigger('mouseup').removeClass('playing');
            break;
        case 83:
            $('#d1').trigger('mouseup').removeClass('playing');
            break;
        case 68:
            $('#e1').trigger('mouseup').removeClass('playing');
            break;
        case 70:
            $('#f1').trigger('mouseup').removeClass('playing');
            break;
        case 71:
            $('#g1').trigger('mouseup').removeClass('playing');
            break;
        case 72:
            $('#a1').trigger('mouseup').removeClass('playing');
            break;
        case 74:
            $('#b1').trigger('mouseup').removeClass('playing');
            break;
        case 75:
            $('#c2').trigger('mouseup').removeClass('playing');
            break;
        case 76:
            $('#d2').trigger('mouseup').removeClass('playing');
            break;
        case 186:
            $('#e2').trigger('mouseup').removeClass('playing');
            break;
        case 222:
            $('#f2').trigger('mouseup').removeClass('playing');
            break;
        case 87:
            $('#cs1').trigger('mouseup').removeClass('playing');
            break;
        case 69:
            $('#ds1').trigger('mouseup').removeClass('playing');
            break;
        case 84:
            $('#fs1').trigger('mouseup').removeClass('playing');
            break;
        case 89:
            $('#gs1').trigger('mouseup').removeClass('playing');
            break;
        case 85:
            $('#as1').trigger('mouseup').removeClass('playing');
            break;
        case 79:
            $('#cs2').trigger('mouseup').removeClass('playing');
            break;
        case 80:
            $('#ds2').trigger('mouseup').removeClass('playing');
            break;
        case 221:
            $('#fs2').trigger('mouseup').removeClass('playing');
            break;
        }
    }
});
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

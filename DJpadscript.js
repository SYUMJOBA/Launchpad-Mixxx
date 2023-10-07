var DJPad = {};
var shifting = false;

var deck1channel = "[Channel1]";
var deck2channel = "[Channel2]";

var deck1Channels_register = ["[Channel1]", "[Channel3]"];
var deck1ChannelCounter = 0;
var deck2Channels_register = ["[Channel2]", "[Channel4]"];
var deck2ChannelCounter = 0;
var deckLayerColours = [56,95];

function setupColor(LocalColor){
    for (var i = 0; i < 90; i++) {
        midi.sendShortMsg(0x90, i, LocalColor); //just resents the entire launchpad of whatever color you like
    }
}

function colorSeries(array, color){
    for (var elementIndex = 0; elementIndex < array.length; elementIndex++) { //makes it simpler to read and understand (it colors every pad address passed in the list with the color specified in the second parameter)
        midi.sendShortMsg(0x90, array[elementIndex], color);
    }
}
function color(button, color){
    midi.sendShortMsg(0x90, button, color); //shortens code a lot
}

function switchDeck1(button) {
    deck1ChannelCounter++;
    deck1channel = deck1Channels_register[deck1ChannelCounter%2];
    color(0x53, deckLayerColours[deck1ChannelCounter%2]);
}

function switchDeck2(button) {
    deck2ChannelCounter++;
    deck2channel = deck2Channels_register[deck2ChannelCounter%2];
    color(0x57, deckLayerColours[deck2ChannelCounter%2]);
}

function jp(value){ //just pressed
    if (value == 0x7f){
        return true;
    } else {
        return false;
    }
}

var colors = {
    empty_cue_blue : 0x27,
    filled_cue_blue : 0x43,

    action_pressed : 0x03,

    loopGeneral : 0x36,
    loopDarken : 0x37,
    loopactive : 4,

    beatjumpGeneral : 0x49,
    beatjumpDarken :0x64,

    play_still : 64,
    cue_still : 7,
    sync_still : 11,

    play_playing : 0x15,
    cue_on : 0x05,
    sync_on : 9,

    //eqs
    low_eq_on :1,    //  ||
    med_eq_on :21,   //  \/
    high_eq_on :45,  // from brigther to dimmer, for color reference see the velocity colors.png file

    low_eq_med :6,
    med_eq_med :22,
    high_eq_med :46, 

    low_eq_off :7,
    med_eq_off :27,
    high_eq_off :47,

    fx_off : 80,
    fx_on : 78,

    prelisten_on : 93,
    prelisten_off : 55,

    shift : 0x01,

    slider_bg : 105,
    slider_head : 97,

    shiftMode : 57,

};

var cues = {
    deck1 : [
        0x51,
        0x47,
        0x3d,
        0x33,
        0x52,
        0x48,
        0x3e,
        0x34,
    ],
    deck2 : [
        0x55,
        0x4b,
        0x41,
        0x37,
        0x56,
        0x4c,
        0x42,
        0x38
    ]
};

var loopButtons = {
    deck1 : {
        "setloop" : 0x53,
        "reloop" : 0x54,
        "halve" : 0x49,
        "dupe" : 0x4a 
    },
    deck2 : {
        "setloop" : 0x57,
        "reloop" : 0x58,
        "halve" : 0x4d,
        "dupe" : 0x4e 
    },
};

var beatjumps = {
    deck1 : {
        "backward" : 0x3f,
        "forward" : 0x40,
        "halve" : 0x35,
        "dupe" : 0x36
    },
    deck2 : {
        "backward" : 0x43,
        "forward" : 0x44,
        "halve" : 0x39,
        "dupe" : 0x3a
    },
};

var playbuttons = [
    deck1 = 0x29,
    deck2 = 0x2d,
];
var cuebuttons = [
    deck1 = 0x1f,
    deck2 = 0x23,
];
var syncbuttons = [
    deck1 = 0x15,
    deck2 = 0x19,
];
var eqs = {
    deck1 : {
        "low" : {"up" : 0x2a, "down":0x20},
        "med" : {"up" : 0x2b, "down":0x21},
        "hig" : {"up" : 0x2c, "down":0x22}
    },
    deck1 : {
        "low" : {"up" : 0x2e, "down":0x24},
        "med" : {"up" : 0x2f, "down":0x25},
        "hig" : {"up" : 0x30, "down":0x26}
    }
};

var shift = 0x12;

var crossfader = [
    0x0b,
    0x0c,
    0x0d,
    0x0e,
    0x0f,
    0x10,
    0x11,
];

var resetFX = [
    deck1 = 0x18,
    deck2 = 0x1c
];

var FXlink = [
    deck1 = {
        "1" : 0x16,
        "2" : 0x17 
    },
    deck2 = {
        "1" : 0x1a,
        "2" : 0x1b 
    }
];

DJPad.Key_0x12 = function (channel, control, value, status, group){
    if (jp(value)){
        shifting = true;
        color(control, colors.action_pressed);
    } else {
        shifting = false;
        color(control, colors.shift);
    }
}

DJPad.shutdown = function(){
    setupColor(0x00);
}

//INIT FUNCTION HERE
DJPad.init = function (id, debugging){

    var eqs = {
        deck1 : {
            "low" : {"up" : 0x2a, "down":0x20},
            "med" : {"up" : 0x2b, "down":0x21},
            "hig" : {"up" : 0x2c, "down":0x22}
        },
        deck1 : {
            "low" : {"up" : 0x2e, "down":0x24},
            "med" : {"up" : 0x2f, "down":0x25},
            "hig" : {"up" : 0x30, "down":0x26}
        }
    };

    colorSeries(crossfader, colors.slider_bg);
    color(0x12, colors.shift);

    colorSeries(cues.deck1, colors.empty_cue_blue);
    colorSeries(cues.deck2, colors.empty_cue_blue);

    colorSeries(playbuttons, colors.play_still);
    colorSeries(cuebuttons, colors.cue_still);
    colorSeries(syncbuttons, colors.sync_still);
    colorSeries([beatjumps.deck1.backward, beatjumps.deck1.forward, beatjumps.deck2.backward, beatjumps.deck2.forward], colors.beatjumpGeneral);
    colorSeries([beatjumps.deck1.dupe, beatjumps.deck1.halve, beatjumps.deck2.dupe, beatjumps.deck2.halve], colors.beatjumpDarken);
    colorSeries([loopButtons.deck1.setloop, loopButtons.deck1.reloop, loopButtons.deck2.setloop, loopButtons.deck2.reloop], colors.loopGeneral);
    colorSeries([loopButtons.deck1.dupe, loopButtons.deck1.halve, loopButtons.deck2.dupe, loopButtons.deck2.halve], colors.loopDarken);

    colorSeries([0x2c, 0x22, 0x30, 0x26], colors.high_eq_med);
    colorSeries([0x2b, 0x21, 0x2f, 0x25], colors.med_eq_med);
    colorSeries([0x2a, 0x24, 0x2e, 0x20], colors.low_eq_med);
    colorSeries([0x1c, 0x18], colors.prelisten_off)

    colorSeries([0x16, 0x17, 0x1a, 0x1b], colors.fx_off);
}

var lasthead = 0;
var currentHead = 0;
function managecrossfader(){
    var Jesus = engine.getParameter("[Master]", "crossfader");
    currentHead = Math.round(Jesus*6)
    if (currentHead != lasthead){
        color(crossfader[lasthead], colors.slider_bg);
        color(crossfader[currentHead], colors.slider_head);
        lasthead = currentHead;
    }
}

//all crossfader pads working are defined here
DJPad.Key_0x0b = function(channel, control, value, status, group){
    if (jp(value)){
        engine.setParameter("[Master]", "crossfader", 0)
    }
}
DJPad.Key_0x0c = function(channel, control, value, status, group){
    if (jp(value)){
        engine.setParameter("[Master]", "crossfader", 0.16)
    }
}
DJPad.Key_0x0d = function(channel, control, value, status, group){
    if (jp(value)){
        engine.setParameter("[Master]", "crossfader", 0.33)
    }
}
DJPad.Key_0x0e = function(channel, control, value, status, group){
    if (jp(value)){
        engine.setParameter("[Master]", "crossfader", 0.5)
    }
}
DJPad.Key_0x0f = function(channel, control, value, status, group){
    if (jp(value)){
        engine.setParameter("[Master]", "crossfader", 0.66)
    }
}
DJPad.Key_0x0g = function(channel, control, value, status, group){
    if (jp(value)){
        engine.setParameter("[Master]", "crossfader", 0.70)
    }
}
DJPad.Key_0x10 = function(channel, control, value, status, group){
    if (jp(value)){
        engine.setParameter("[Master]", "crossfader", 0.84)
    }
}
DJPad.Key_0x11 = function(channel, control, value, status, group){
    if (jp(value)){
        engine.setParameter("[Master]", "crossfader", 1)
    }
}


//HOT CUES
function colorCue(PadAddress, Channel, specificCue){
    if (engine.getParameter(Channel, "hotcue_" + specificCue + "_enabled")){
        color(PadAddress, colors.filled_cue_blue);
    } else{
        color(PadAddress, colors.empty_cue_blue);
    }
};
function manageCues(PadState, Channel, specificCue, Address){
    if (jp(PadState)){
        if (shifting){
            engine.setParameter(Channel, "hotcue_" + specificCue + "_clear", true);
        } else {
            engine.setParameter(Channel, "hotcue_" + specificCue + "_activate", true);
        }

        color(Address, colors.action_pressed);
    } else {
        engine.setParameter(Channel, "hotcue_" + specificCue + "_activate", false);
        colorCue(Address, Channel, specificCue);
    }
}

DJPad.Key_0x51 = function(channel, control, value, status, group){manageCues(value, deck1channel, 1)}
DJPad.Key_0x52 = function(channel, control, value, status, group){manageCues(value, deck1channel, 2)}
DJPad.Key_0x47 = function(channel, control, value, status, group){manageCues(value, deck1channel, 3)}
DJPad.Key_0x48 = function(channel, control, value, status, group){manageCues(value, deck1channel, 4)}
DJPad.Key_0x3d = function(channel, control, value, status, group){manageCues(value, deck1channel, 5)}
DJPad.Key_0x3e = function(channel, control, value, status, group){manageCues(value, deck1channel, 6)}
DJPad.Key_0x33 = function(channel, control, value, status, group){manageCues(value, deck1channel, 7)}
DJPad.Key_0x34 = function(channel, control, value, status, group){manageCues(value, deck1channel, 8)}

DJPad.Key_0x55 = function(channel, control, value, status, group){manageCues(value, deck2channel, 1)}
DJPad.Key_0x56 = function(channel, control, value, status, group){manageCues(value, deck2channel, 2)}
DJPad.Key_0x4b = function(channel, control, value, status, group){manageCues(value, deck2channel, 3)}
DJPad.Key_0x4c = function(channel, control, value, status, group){manageCues(value, deck2channel, 4)}
DJPad.Key_0x41 = function(channel, control, value, status, group){manageCues(value, deck2channel, 5)}
DJPad.Key_0x42 = function(channel, control, value, status, group){manageCues(value, deck2channel, 6)}
DJPad.Key_0x37 = function(channel, control, value, status, group){manageCues(value, deck2channel, 7)}
DJPad.Key_0x38 = function(channel, control, value, status, group){manageCues(value, deck2channel, 8)}

colorCue_Deck1_Cue1 = function(){colorCue(0x51, deck1channel, 1);}
colorCue_Deck1_Cue2 = function(){colorCue(0x52, deck1channel, 2);}
colorCue_Deck1_Cue3 = function(){colorCue(0x47, deck1channel, 3);}
colorCue_Deck1_Cue4 = function(){colorCue(0x48, deck1channel, 4);}
colorCue_Deck1_Cue5 = function(){colorCue(0x3d, deck1channel, 5);}
colorCue_Deck1_Cue6 = function(){colorCue(0x3e, deck1channel, 6);}
colorCue_Deck1_Cue7 = function(){colorCue(0x33, deck1channel, 7);}
colorCue_Deck1_Cue8 = function(){colorCue(0x34, deck1channel, 8);}

colorCue_Deck2_Cue1 = function(){colorCue(0x55, deck2channel, 1);}
colorCue_Deck2_Cue2 = function(){colorCue(0x56, deck2channel, 2);}
colorCue_Deck2_Cue3 = function(){colorCue(0x4b, deck2channel, 3);}
colorCue_Deck2_Cue4 = function(){colorCue(0x4c, deck2channel, 4);}
colorCue_Deck2_Cue5 = function(){colorCue(0x41, deck2channel, 5);}
colorCue_Deck2_Cue6 = function(){colorCue(0x42, deck2channel, 6);}
colorCue_Deck2_Cue7 = function(){colorCue(0x37, deck2channel, 7);}
colorCue_Deck2_Cue8 = function(){colorCue(0x38, deck2channel, 8);}

var crossfaderconnection = engine.makeConnection("[Master]", "crossfader", managecrossfader);

var Cue1_Deck1 = engine.makeConnection(deck1channel, "hotcue_1_enabled", colorCue_Deck1_Cue1);
var Cue2_Deck1 = engine.makeConnection(deck1channel, "hotcue_2_enabled", colorCue_Deck1_Cue2);
var Cue3_Deck1 = engine.makeConnection(deck1channel, "hotcue_3_enabled", colorCue_Deck1_Cue3);
var Cue4_Deck1 = engine.makeConnection(deck1channel, "hotcue_4_enabled", colorCue_Deck1_Cue4);
var Cue5_Deck1 = engine.makeConnection(deck1channel, "hotcue_5_enabled", colorCue_Deck1_Cue5);
var Cue6_Deck1 = engine.makeConnection(deck1channel, "hotcue_6_enabled", colorCue_Deck1_Cue6);
var Cue7_Deck1 = engine.makeConnection(deck1channel, "hotcue_7_enabled", colorCue_Deck1_Cue7);
var Cue8_Deck1 = engine.makeConnection(deck1channel, "hotcue_8_enabled", colorCue_Deck1_Cue8);

var Cue1_Deck2 = engine.makeConnection(deck2channel, "hotcue_1_enabled", colorCue_Deck2_Cue1);
var Cue2_Deck2 = engine.makeConnection(deck2channel, "hotcue_2_enabled", colorCue_Deck2_Cue2);
var Cue3_Deck2 = engine.makeConnection(deck2channel, "hotcue_3_enabled", colorCue_Deck2_Cue3);
var Cue4_Deck2 = engine.makeConnection(deck2channel, "hotcue_4_enabled", colorCue_Deck2_Cue4);
var Cue5_Deck2 = engine.makeConnection(deck2channel, "hotcue_5_enabled", colorCue_Deck2_Cue5);
var Cue6_Deck2 = engine.makeConnection(deck2channel, "hotcue_6_enabled", colorCue_Deck2_Cue6);
var Cue7_Deck2 = engine.makeConnection(deck2channel, "hotcue_7_enabled", colorCue_Deck2_Cue7);
var Cue8_Deck2 = engine.makeConnection(deck2channel, "hotcue_8_enabled", colorCue_Deck2_Cue8);


//play buttons
function playFuncManager(controlPad, Channel, PressingState){
    if (jp(PressingState)){
        script.toggleControl(Channel, "play");
        color(controlPad, colors.action_pressed)
    } else {
        if (engine.getParameter(Channel, "play")){
            color(controlPad, colors.play_playing);
        } else {
            color(controlPad, colors.play_still);
        }
    }
}

DJPad.Key_0x29 = function(channel, control, value, status, group){playFuncManager(control, deck1channel, value)}
DJPad.Key_0x2d = function(channel, control, value, status, group){playFuncManager(control, deck2channel, value)}

function ManagePlayColor (address, channel){
    if (engine.getParameter("[Channel"+channel+"]", "play")){
        color(address, colors.play_playing);
    } else {
        color(address, colors.play_still);
    }
}

function PlayButton1(){ManagePlayColor(0x29, 1)}
function PlayButton2(){ManagePlayColor(0x2d, 2)}

var PlayButton1Connection = engine.makeConnection(deck1channel, "play", PlayButton1);
var PlayButton2Connection = engine.makeConnection(deck2channel, "play", PlayButton2);;

function manageBeatJump (value, Action, Channel, address){
    if (jp(value)){
        engine.setParameter(Channel, Action, true);
        color(address, colors.action_pressed);
    } else {
        color(address, colors.beatjumpGeneral);
    }
}

function manageBeatJumpEdit (value, halve, Channel, address){
    if (jp(value)){
        if (shifting){
            if (halve){
                engine.setParameter(Channel, "beatjump_size", 1);
            } else {
                engine.setParameter(Channel, "beatjump_size", 32);
            }
        } else {
            if (halve){
                engine.setParameter(Channel, "beatjump_size", engine.getParameter(Channel, "beatjump_size")/2);
            } else {
                engine.setParameter(Channel, "beatjump_size", engine.getParameter(Channel, "beatjump_size")*2);
            }
        }

        color(address, colors.action_pressed);
    } else {
        color(address, colors.beatjumpDarken);
    }
}

DJPad.Key_0x40 = function(channel, control, value, status, group){manageBeatJump(value, "beatjump_forward" , deck1channel, control)}
DJPad.Key_0x43 = function(channel, control, value, status, group){manageBeatJump(value, "beatjump_backward", deck2channel, control)}
DJPad.Key_0x44 = function(channel, control, value, status, group){manageBeatJump(value, "beatjump_forward" , deck2channel, control)}
DJPad.Key_0x3f = function(channel, control, value, status, group){manageBeatJump(value, "beatjump_backward", deck1channel, control)}


DJPad.Key_0x35 = function(channel, control, value, status, group){manageBeatJumpEdit(value, true, deck1channel, control)}
DJPad.Key_0x36 = function(channel, control, value, status, group){manageBeatJumpEdit(value, false, deck1channel, control)}
DJPad.Key_0x39 = function(channel, control, value, status, group){manageBeatJumpEdit(value, true, deck2channel, control)}
DJPad.Key_0x3a = function(channel, control, value, status, group){manageBeatJumpEdit(value, false, deck2channel, control)}

function setBeatLoop(address, Channel, value, decknum){
    if(jp(value)){
        if (shifting){
            if (decknum == 0) {
                switchDeck1();
            }
            else{ 
                switchDeck2();
            }
        } else {
            engine.setParameter(Channel, "reloop_toggle", false);
            engine.setParameter(Channel, "beatloop_" + engine.getParameter(Channel, "beatloop_size") + "_toggle", true);
        }
    }
}

DJPad.Key_0x53 = function(channel, control, value, status, group){setBeatLoop(control, deck1channel, value, 0)}
DJPad.Key_0x57 = function(channel, control, value, status, group){setBeatLoop(control, deck2channel, value, 1)}

function IndicateLoop(address, Channel){
    if (engine.getParameter(Channel, "loop_enabled")){
        color(address, colors.loopactive);
    } else {
        color(address, colors.loopGeneral);
    }
}

function Reloop_light_Deck_1(){IndicateLoop(loopButtons.deck1.reloop, deck1channel)}
function Reloop_light_Deck_2(){IndicateLoop(loopButtons.deck2.reloop, deck2channel)}

var Reloop_light_Deck_1_connect = engine.makeConnection(deck1channel, "loop_enabled", Reloop_light_Deck_1)
var Reloop_light_Deck_2_connect = engine.makeConnection(deck2channel, "loop_enabled", Reloop_light_Deck_2)

function ManageReloop(address, channel, value){
    if(jp(value)){
        engine.setParameter(channel, "reloop_toggle", true);
    }
}

DJPad.Key_0x54 = function(channel, control, value, status, group){ManageReloop(control, deck1channel, value)}
DJPad.Key_0x58 = function(channel, control, value, status, group){ManageReloop(control, deck2channel, value)}

function manageBeatLoopEdit (value, halve, Channel, address){
    if (jp(value)){
        if (shifting){
            if (halve){
                engine.setParameter(Channel, "beatloop_size", 1)
            } else {
                engine.setParameter(Channel, "beatloop_size", 8)
            }
        } else{

            if (halve){
                engine.setParameter(Channel, "loop_halve", true);
            } else {
                engine.setParameter(Channel, "loop_double", true);
            }
        }

        color(address, colors.action_pressed);
    } else {
        color(address, colors.loopDarken);
    }
}

DJPad.Key_0x49 = function(channel, control, value, status, group){manageBeatLoopEdit(value, true,  deck1channel, control)}
DJPad.Key_0x4a = function(channel, control, value, status, group){manageBeatLoopEdit(value, false, deck1channel, control)}
DJPad.Key_0x4d = function(channel, control, value, status, group){manageBeatLoopEdit(value, true,  deck2channel, control)}
DJPad.Key_0x4e = function(channel, control, value, status, group){manageBeatLoopEdit(value, false, deck2channel, control)}

function manageSync(channel, value){
    if (jp(value)){
        if (engine.getParameter(channel, "beatsync")){
            engine.setParameter(channel, "beatsync", false)
        } else {
            engine.setParameter(channel, "beatsync", true)
        }
        
    }
}

function managesyncConolor(channel, address){
    if (engine.getParameter(channel, "beatsync")){
        color(address, colors.sync_on);
    } else {
        color(address, colors.sync_still);
    }
}

function Deck1_Sync(){managesyncConolor(deck1channel, 0x15)}
function Deck2_Sync(){managesyncConolor(deck2channel, 0x19)}

var Deck1_sync_connection = engine.makeConnection(deck1channel, "beatsync", Deck1_Sync);
var Deck2_sync_connection = engine.makeConnection(deck2channel, "beatsync", Deck2_Sync);



DJPad.Key_0x15 = function(channel, control, value, status, group){manageSync(deck1channel, value)}
DJPad.Key_0x19 = function(channel, control, value, status, group){manageSync(deck2channel, value)}

//una funzione che aggiunge e basta
//una funzione che toglie e basta

EQIncrement = 1/6;
function ManageEQ(add, type, channel, value){
    if (jp(value)){
        if (shifting){
            engine.setParameter(channel, type, 0.5);
        } else {
            if (add){
                engine.setParameter(channel, type, engine.getParameter(channel, type) + EQIncrement);
            } else {
                engine.setParameter(channel, type, engine.getParameter(channel, type) - EQIncrement);
            }
        }
    }
}

DJPad.Key_0x2a = function(channel, control, value, status, group){ManageEQ(true,  "filterLow", deck1channel,  value)}
DJPad.Key_0x20 = function(channel, control, value, status, group){ManageEQ(false, "filterLow", deck1channel,  value)}
DJPad.Key_0x2b = function(channel, control, value, status, group){ManageEQ(true,  "filterMid", deck1channel,  value)}
DJPad.Key_0x21 = function(channel, control, value, status, group){ManageEQ(false, "filterMid", deck1channel,  value)}
DJPad.Key_0x2c = function(channel, control, value, status, group){ManageEQ(true,  "filterHigh", deck1channel, value)}
DJPad.Key_0x22 = function(channel, control, value, status, group){ManageEQ(false, "filterHigh", deck1channel, value)}

DJPad.Key_0x2e = function(channel, control, value, status, group){ManageEQ(true,  "filterLow", deck2channel,  value)}
DJPad.Key_0x24 = function(channel, control, value, status, group){ManageEQ(false, "filterLow", deck2channel,  value)}
DJPad.Key_0x2f = function(channel, control, value, status, group){ManageEQ(true,  "filterMid", deck2channel,  value)}
DJPad.Key_0x25 = function(channel, control, value, status, group){ManageEQ(false, "filterMid", deck2channel,  value)}
DJPad.Key_0x30 = function(channel, control, value, status, group){ManageEQ(true,  "filterHigh", deck2channel, value)}
DJPad.Key_0x26 = function(channel, control, value, status, group){ManageEQ(false, "filterHigh", deck2channel, value)}

function manageCue(value, channel){
    if (jp(value)){
        engine.setParameter(channel, "cue_default", true)
    } else {
        engine.setParameter(channel, "cue_default", false)
    }
}

function manageCueLight(channel, address){
    if (engine.getParameter(channel, "cue_default")){
        color(address, colors.cue_on);
    } else {
        color(address, colors.cue_still);
    }
}

function Deck1_cue(){manageCueLight(deck1channel, 0x1f)}
function Deck2_cue(){manageCueLight(deck2channel, 0x23)}

var Deck1_cue_connection = engine.makeConnection(deck1channel, "cue_default", Deck1_cue);
var Deck2_cue_connection = engine.makeConnection(deck2channel, "cue_default", Deck2_cue);

DJPad.Key_0x1f = function(channel, control, value, status, group){manageCue(value, deck1channel)}
DJPad.Key_0x23 = function(channel, control, value, status, group){manageCue(value, deck2channel)}

function TogglePrelisten(Deck, value){
    if (jp(value)){
        script.toggleControl(Deck, "pfl");
    }
}

DJPad.Key_0x18 = function(channel, control, value, status, group){TogglePrelisten(deck1channel, value)}
DJPad.Key_0x1c = function(channel, control, value, status, group){TogglePrelisten(deck2channel, value)}

function ManagePFLColor(Deck, key){
    if (engine.getParameter(Deck, "pfl")){
        color(key, colors.prelisten_on);
    } else {
        color(key, colors.prelisten_off);
    }
}

function managePFLColorDeck1(){ManagePFLColor(deck1channel, 0x18)}
function managePFLColorDeck2(){ManagePFLColor(deck2channel, 0x1c)}

var Deck1_pfl_alert = engine.makeConnection(deck1channel, "pfl", managePFLColorDeck1);
var Deck2_pfl_alert = engine.makeConnection(deck2channel, "pfl", managePFLColorDeck2);

function toggleEffectRackConnection(Deck, EffectUnit, value){
    if (jp(value)){
        script.toggleControl("[EffectRack1_EffectUnit" + EffectUnit + "]", "group_" + Deck + "_enable");
    }
}

DJPad.Key_0x16 = function(channel, control, value, status, group){toggleEffectRackConnection(deck1channel, 1, value)}
DJPad.Key_0x17 = function(channel, control, value, status, group){toggleEffectRackConnection(deck1channel, 2, value)}
DJPad.Key_0x1a = function(channel, control, value, status, group){toggleEffectRackConnection(deck2channel, 1, value)}
DJPad.Key_0x1b = function(channel, control, value, status, group){toggleEffectRackConnection(deck2channel, 2, value)}

function ManageEffectToggleColor(address, Deck, EffectUnit){
    if (engine.getParameter("[EffectRack1_EffectUnit" + EffectUnit + "]", "group_" + Deck + "_enable")){
        color(address, colors.fx_on);
    } else {
        color(address, colors.fx_off);
    }
}

var Connection_Effect1_Deck1 = function(){ManageEffectToggleColor(0x16, deck1channel, "1")}
var Connection_Effect2_Deck1 = function(){ManageEffectToggleColor(0x17, deck1channel, "2")}
var Connection_Effect1_Deck2 = function(){ManageEffectToggleColor(0x1a, deck2channel, "1")}
var Connection_Effect2_Deck2 = function(){ManageEffectToggleColor(0x1b, deck2channel, "2")}

var EngineConnection_Effect1_Deck1 = engine.makeConnection("[EffectRack1_EffectUnit1]", "group_[Channel1]_enable", Connection_Effect1_Deck1);
var EngineConnection_Effect2_Deck1 = engine.makeConnection("[EffectRack1_EffectUnit2]", "group_[Channel1]_enable", Connection_Effect2_Deck1);
var EngineConnection_Effect1_Deck2 = engine.makeConnection("[EffectRack1_EffectUnit1]", "group_[Channel2]_enable", Connection_Effect1_Deck2);
var EngineConnection_Effect2_Deck2 = engine.makeConnection("[EffectRack1_EffectUnit2]", "group_[Channel2]_enable", Connection_Effect2_Deck2);

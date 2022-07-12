"use strict";

/* -- Magic Numbers -- */

const OGG_START = new Uint8Array([79, 103, 103, 83, 0, 2]);

/* -- Elements -- */

const FIGCAPTION_ELEMENT = (document.querySelector("figcaption") as HTMLElement);

const SPAN_SONG_ELEMENT = (document.querySelector("figcaption > span#now-playing-song") as HTMLElement);
const SPAN_ARTIST_ELEMENT = (document.querySelector("figcaption > span#now-playing-artist") as HTMLElement);
const SPAN_STATION_ELEMENT = (document.querySelector("figcaption > span#now-playing-station") as HTMLElement);

const RADIO_SELECT_ELEMENT = (document.querySelector("select#select-radio-station") as HTMLSelectElement);
const LOCATION_SELECT_ELEMENT = (document.querySelector("select#select-location") as HTMLSelectElement);

const BUTTON_PREV_TRACK_ELEMENT = (document.querySelector("button#button-prev-track") as HTMLButtonElement);
const BUTTON_NEXT_TRACK_ELEMENT = (document.querySelector("button#button-next-track") as HTMLButtonElement);

const AUDIO_ELEMENT = (document.querySelector("audio") as HTMLAudioElement);

/* -- IDK -- */

let promisesCollection = new Array<Promise<void>>();

let availableStations = new Array<string>();
let preparedTracks = new Array();
let trackCollection = new Array();

let currentGame = -1;
let currentTrack = -1;
let currentStation = "CHAT";

let retrievedFilesCount = 0;

let songTracker = 0;
let songHistory = new Array<any>(5); // -- Past, Past, Current, Future, Future.

/* -- game id: { fileName : [station_name, host_name(s)] } -- */

type Station = { [index: string]: Array<string | string[]> }
type GameAudio = { [index: number]: Station };

let audioCollection : GameAudio = {
    0: {
        "CHAT":     ["Chatterbox FM", ["Lazlow"]],
        "CLASS":    ["Double Clef FM", ["Morgan Merryweather"]],
        "HEAD":     ["Head Radio", ["Michael Hunt"]],
        "FLASH":    ["Flashback 95.6", ["Toni"]],
        "GAME":     ["Game Radio", ["Stretch Armstrong", "Lord Sear"]],
        "KJAH":     ["K-JAH",   ["Horace Walsh"]],
        "LIPS":     ["Lips 106", ["Andee"]],
        "MSX":      ["MSX FM", ["MC Codebreaker"]],
        "RISE":     ["Rise FM", ["Andree the Accelerator"]]
    },
    1: {
        "EMOTION": ["Emotion 98.3", ["Fernando Martinez"]],
        "ESPANT": ["Radio Espantoso", ["Pepe"]],
        "FEVER": ["Fever 105", ["Oliver Biscuit"]],
        "FLASH": ["Flash FM", ["Toni"]],
        "KCHAT": ["K-Chat", ["Amy Scheknhausen"]],
        "VCPR": ["VCPR", ["Maurice Chavez"]],
        "VROCK": ["V-Rock", ["Lazlow"]],
        "WAVE": ["Wave 103", ["Adam First"]],
        "WILD": ["Wildstyle", ["Mr. Magic"]]
    },
    2: {
        "CH": ["Playback FM", ["Forth Right MC"]],
        "CO": ["K-Rose", ["Mary-Beth Maybell"]],
        "CR": ["K-DST", ["Tommy \"The Nightmare\" Smith"]],
        "DS": ["Bounce FM", ["The Funktipus"]],
        "HC": ["SF-UR", ["Hans Oberlander"]],
        "MH": ["Radio Los Santos", ["Julio G"]],
        "MR": ["Radio X", ["Sage"]],
        "NJ": ["CSR 103.9", ["Phillip Michaels"]],
        "RE": ["K-JAH West", ["Marshall Peters", "Johnny Lawton"]],
        "RG": ["Master Sounds 98.3", ["Johnny Parkinson"]],
        "TK": ["WCTR", ["Lianna Forget", "Derrick Thackery", "James Pedeaston", "Billy Dexter", "Lazlow", "Maurice", "Peyton Phillips", "Mary Phillips", "Christy MacIntyre", "Fernando Martinez", "Marvin Trill"]]
    }
};

let audioInformation = new Array(3);

/* -- Utility Functions -- */

function randomInteger(min : number, max : number) : number 
{
    return Math.floor(Math.random() * (max - min)) + min;
}
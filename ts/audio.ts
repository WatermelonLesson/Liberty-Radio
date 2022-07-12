"use strict";

/************************************************************************************ 
 *                                                                                  *
 * @Function: determineOrigin(fileName : string, strictCheck : boolean) : number  *
 * @Description:                                                                    *
 *      Determines which game the file likely came from:                            *
 *          - (-1) for "Unknown Game Error"                                         *
 *          - (+0) for Grand Theft Auto III                                         *
 *          - (+1) for Grand Theft Auto: Vice City                                  *
 *          - (+2) for Grand Theft Auto: San Andreas                                *
 *                                                                                  *
 *                                                                                  *
 ************************************************************************************/

function determineOrigin(fileName : string)
{
    if (fileName.includes("."))
    {
        if (fileName.includes(".wav"))
        {
            return 0;
        }
        else if (fileName.includes(".adf"))
        {
            return 1;
        }
        else
        {
            return -1;
        }
    }
    else
    {
        return 2;
    }
}

/************************************************************************************************************************
 *                                                                                                                      *
 * @Function: async function decodeFile(file : File, gameOrigin : number, KEY = [2 * 16 + 2] : number[]) : Uint8Array  *
 * @Description:                                                                                                        *
 *      Hello, world. 
 *                                                                                                                      *
 ************************************************************************************************************************/

async function decodeFile(file : File, gameOrigin : number) : Promise<Uint8Array>
{
    let buffer = await file.arrayBuffer();
    let bufferView = new Uint8Array(buffer);
    let KEY = [2 * 16 + 2];

    if (gameOrigin === 2)
    {
        KEY = [
            14 * 16 + 10,  3 * 16 + 10, 12 * 16 +  4, 10 * 16 + 1, 
             9 * 16 + 10, 10 * 16 +  8,  1 * 16 +  4, 15 * 16 + 3,
             4 * 16 +  8, 11 * 16 +  0, 13 * 16 +  7,  2 * 16 + 3,
             9 * 16 + 13, 14 * 16 +  8, 15 * 16 + 15, 15 * 16 + 1];
    }

    if (gameOrigin === 1 || gameOrigin === 2)
    {
        for(let i = 0; i < bufferView.length; ++i)
        {
            bufferView[i] = bufferView[i] ^ KEY[i % KEY.length];
        }

        if (gameOrigin === 2)
        {
            bufferView = bufferView.slice(8068);
        }
    }

    return bufferView;
}

/************************************************************************************
 *                                                                                  *
 * @Function: partitionCollection(bufferView : Uint8Array) : Array                 *
 * @Description:                                                                    *
 *      This function searches through a TypedArray looking for OGG                 *
 * files via the magic numbers 79, 103, 103, 83, 0, 2. Note that these              *
 * are just individual files and not necessarily whole songs. San                   *
 * Andreas splits every song / broadcast into intro, middle, and closing            *
 * sections to allow for more dynamic broadcasts in the state of San                *
 * Andreas.                                                                         *
 *      I have to admit that the algorithmn for this search is just TERRIBLE.       *
 * The algorithmn has time complexity O(n^2) which isn't too bad considering        *
 * the size of the files but the environment we're operating in (JS in browser)     *
 * can't really allow for such inefficient algorithmns IMHO. That being said, this  *
 * algorithmn works. I'm sure there's a better search algorithm possible but I      *
 * just can't be arsed to find it.                                                  *
 *                                                                                  *
 ************************************************************************************/

async function partitionCollection(bufferView : Uint8Array)
{
    let partition = new Array();

    for (let i = 0; i < bufferView.length; ++i)
    {
        for (let j = 0; j < OGG_START.length; ++j)
        {
            if (bufferView[i + j] !== OGG_START[j])
            {
                break;
            }
            else
            {
                if (j === OGG_START.length - 1)
                {
                    partition.push(i);
                }
            }
        }
    }

    console.log("Partition from (partitionCollection)");
    console.log(partition);

    return partition;
}

/************************************************
 *                                              *
 * @Function: currentlyPlaying()                *
 * @Description: N/A                            *
 *                                              *
 ************************************************/

function currentlyPlaying()
{
    if (AUDIO_ELEMENT !== null && AUDIO_ELEMENT.src !== "")
    {
        if (currentGame === 2)
        {
            // -- Just use the currentTrack.
        }
        else
        {
            // -- Have to use the time.
            console.log(AUDIO_ELEMENT.currentTime);
        }
    }
    else
    {
        console.log("[ERROR (currentlyPlaying)]: Either can't find audio element or audio element has no source.");
        console.log("[Suggested Course of Action]: Die?");
    }
}

/********************************************** 
 *
 * @Function: updateAudioOptions()
 * @Description: N/A
 * 
 **********************************************/

function updateAudioOptions()
{
    if (parseInt(LOCATION_SELECT_ELEMENT.value) !== currentGame)
    {
        LOCATION_SELECT_ELEMENT.children[parseInt(LOCATION_SELECT_ELEMENT.value) + 1].removeAttribute("selected");

        
        LOCATION_SELECT_ELEMENT.children[currentGame + 1].removeAttribute("disabled");
        LOCATION_SELECT_ELEMENT.children[currentGame + 1].setAttribute("selected", "");
    }

    // Ensures we always have the EXACT amount of options.
    if (RADIO_SELECT_ELEMENT.children.length !== Object.keys(audioCollection[currentGame]).length)
    {
        if (RADIO_SELECT_ELEMENT.children.length < Object.keys(audioCollection[currentGame]).length)
        {
            console.log("Adding option elements.");
            
            for (let i = 0; i < (Object.keys(audioCollection[currentGame]).length - RADIO_SELECT_ELEMENT.length + 1); ++i)
            {
                RADIO_SELECT_ELEMENT.appendChild(document.createElement("option"));
            }
        }
        else
        {
            console.log("Removing option elements.");

            for (let i = 0; i < (RADIO_SELECT_ELEMENT.length - Object.keys(audioCollection[currentGame]).length); ++i)
            {
                RADIO_SELECT_ELEMENT.removeChild(RADIO_SELECT_ELEMENT.children[RADIO_SELECT_ELEMENT.childElementCount - 1])
            }
        }
    }

    for (let i = 0; i < Object.keys(audioCollection[currentGame]).length; ++i)
    {
        (RADIO_SELECT_ELEMENT.children[i] as HTMLOptionElement).value = Object.keys(audioCollection[currentGame])[i];
        (RADIO_SELECT_ELEMENT.children[i] as HTMLOptionElement).innerText = (audioCollection[currentGame][Object.keys(audioCollection[currentGame])[i]][0] as string);

        console.log(availableStations.findIndex(element => element === Object.keys (audioCollection[currentGame])[i]));

        if (availableStations.includes(Object.keys (audioCollection[currentGame])[i]))
        {
            (RADIO_SELECT_ELEMENT.children[i] as HTMLOptionElement).removeAttribute("disabled");

            if (Object.keys (audioCollection[currentGame])[i] === currentStation)
            {
                (RADIO_SELECT_ELEMENT.children[i] as HTMLOptionElement).setAttribute("selected", "true");
            }
        }
        else
        {
            (RADIO_SELECT_ELEMENT.children[i] as HTMLOptionElement).setAttribute("disabled", "true");
        }

        console.log(Object.keys(audioCollection[currentGame])[i]);
        console.log((audioCollection[currentGame][Object.keys(audioCollection[currentGame])[i]][0] as string));
        console.log(RADIO_SELECT_ELEMENT.children[i]);
    }
}

async function retrieveJSON()
{
    const JSON_FILES = ["JSON/LC_RADIO.JSON", "JSON/VC_RADIO.JSON", "JSON/SA_RADIO.JSON"];

    for (let i = 0; i < JSON_FILES.length; ++i)
    {
        fetch(JSON_FILES[i]).then(
            response => {
                console.log("[SUCCESS (retrieveJSON): Successfully retrieved " + JSON_FILES[i]);
            
                response.json().then(data => {
                    audioInformation[i] = data;
                    ++retrievedFilesCount;
                }, reason => {
                    console.log("[FAILURE (retrieveJSON): Failed to parse JSON file for " + JSON_FILES[i] + ". (Likely invalid JSON). See reason below.");
                    console.log(reason);
                })
            },
            reason => {
                console.log("[FAILURE (retrieveJSON): Failed to retrieve JSON file for " + JSON_FILES[i] + ". See reason below.");
                console.log(reason);
            }
        );
    }
}

function getRandomTrack(station : string = currentStation)
{
    if (currentGame === 2)
    {
        if (retrievedFilesCount > 0)
        {
            console.log("Finding track from " + station);

            let trackKeys = Object.keys(audioInformation[currentGame][station]["track_list"]);

            let min = parseInt(trackKeys[0]);
            let max = parseInt(trackKeys[trackKeys.length - 1]);

            console.log("-- getRandomTrack --");

            console.log("Minimum identifiable track number: " + min);
            console.log("Maximum identifiable track number: " + max);

            console.log("-- getRandomTrack --");

            if (station !== "AA" && station !== "ADVERTS" && station !== "TK")
            {
                // We should occasionally provide transitions, instead of songs.
                let die = randomInteger(1, 5);

                console.log("The die has been cast, and it has rolled a " + die);

                if (die % 4 !== 0)
                {
                    do {
                        currentTrack = randomInteger(min, max);
                    } while (audioInformation[currentGame][station]["track_list"][currentTrack]["role"] !== "middle" 
                        && audioInformation[currentGame][station]["track_list"][currentTrack]["role"] !== "intro"
                        && audioInformation[currentGame][station]["track_list"][currentTrack]["role"] !== "outro");

                    console.log(currentTrack);

                    let songName = audioInformation[currentGame][station]["track_list"][currentTrack]["name"];

                    let intros = new Array<number>();
                    let middle = 0;
                    let outros = new Array<number>();

                    console.log("Selected " + songName + " by " + audioInformation[currentGame][station]["track_list"][currentTrack]["artist"] + ".");
                    console.log("Finding intros and outros...");

                    for (let i = max; i >= min; --i)
                    {
                        if (songName === audioInformation[currentGame][station]["track_list"][i]["name"])
                        {
                            if (audioInformation[currentGame][station]["track_list"][i]["role"] === "intro")
                            {
                                intros.push(i);
                            } 
                            else if (audioInformation[currentGame][station]["track_list"][i]["role"] === "middle")
                            {
                                middle = i;
                            } 
                            else 
                            {
                                outros.push(i);
                            }
                        }
                    }

                    console.log("Intros, middle, and outros found below.");

                    console.log(intros);
                    console.log(middle);
                    console.log(outros);

                    console.log("Selecing random intro and outro.");

                    let randomIntro = intros[randomInteger(0, intros.length)];
                    let randomOutro = outros[randomInteger(0, outros.length)];

                    console.log(randomIntro);
                    console.log(randomOutro);

                    console.log("Filtered intro and outro.");

                    console.log(trackCollection.filter(arr => (arr[0] === station && arr[1] === randomIntro))[0]);
                    console.log(trackCollection.filter(arr => (arr[0] === station && arr[1] === randomOutro))[0]);

                    let introSection = trackCollection.filter(arr => (arr[0] === station && arr[1] === randomIntro))[0][2];
                    let middleSection = trackCollection.filter(arr => (arr[0] === station && arr[1] === middle))[0][2];
                    let outroSection = trackCollection.filter(arr => (arr[0] === station && arr[1] === randomOutro))[0][2];

                    console.log(introSection);
                    console.log(middleSection);
                    console.log(outroSection);

                    return [middle, introSection, middleSection, outroSection];
                }
                else
                {
                    // We'll return a transition instead.

                    do {
                        currentTrack = randomInteger(min, max);
                    } while (audioInformation[currentGame][station]["track_list"][currentTrack]["role"] === "middle" 
                        || audioInformation[currentGame][station]["track_list"][currentTrack]["role"] === "intro"
                        || audioInformation[currentGame][station]["track_list"][currentTrack]["role"] === "outro");

                    let songName = audioInformation[currentGame][station]["track_list"][currentTrack]["name"];

                    let middle = 0;

                    console.log("Selected " + songName + " by " + audioInformation[currentGame][station]["track_list"][currentTrack]["artist"] + ".");

                    console.log(middle);

                    console.log("Filtered intro and outro.");

                    let middleSection = trackCollection.filter(arr => (arr[0] === station && arr[1] === middle))[0][2];

                    console.log(middleSection);

                    return [middle, null, middleSection, null];
                }
            }
            else
            {
                if (station === "AA")
                {
                    return null;
                }
                else if (station === "ADVERTS")
                {
                    let currentTrack = randomInteger(min, max);

                    let middleSection = trackCollection.filter(arr => (arr[0] === station && arr[1] === currentTrack))[0][2];
                    
                    return [currentTrack, null, middleSection, null];
                }
                else
                {
                    do {
                        currentTrack = randomInteger(min, max);
                    } while (audioInformation[currentGame][station]["track_list"][currentTrack]["role"] !== "middle");

                    let introSection = trackCollection.filter(arr => (arr[0] === station && arr[1] === currentTrack + 1))[0][2];
                    let middleSection = trackCollection.filter(arr => (arr[0] === station && arr[1] === currentTrack))[0][2];
                    let outroSection = trackCollection.filter(arr => (arr[0] === station && arr[1] === currentTrack + 2))[0][2];

                    return [currentTrack, introSection, middleSection, outroSection];
                }
            }
        }
        else
        {
            return null;
        }
    }
    else
    {
        console.log("[FAILURE (pickSong): This function is intended only for songs from Grand Theft Auto: San Andreas.");
        console.log("This function is intended to choose a random song from within the audio stream file.");
        
        return null;
    }
}

function buildSong(introSection : any, middleSection : any, outroSection : any) // TODO: Determine more restrictive type for introSection, middleSection, outroSection.
{
    if (currentGame === 2)
    {
        if (introSection !== null && outroSection !== null)
        {
            let mSong = new Uint8Array(introSection.length + middleSection.length);
            let fSong = new Uint8Array(mSong.length + outroSection.length);

            mSong.set(introSection);
            mSong.set(middleSection, introSection.length);
            
            fSong.set(mSong);
            fSong.set(outroSection, mSong.length);

            console.log(fSong);

            return fSong;
        }
        else
        {
            let fSong = new Uint8Array(middleSection.length);
            fSong.set(middleSection);

            return fSong;
        }
    }
    else
    {
        console.log("[FAILURE (buildSong): This function is intended only for songs from Grand Theft Auto: San Andreas.");
        console.log("This function is intended to recombine the separated parts of a song.")

        return null;
    }
}

function playSong(fSong : Uint8Array, trackNumber : number, ad = false)
{
    currentTrack = trackNumber;

    let station = currentStation;

    if (ad)
    {
        station = "ADVERTS";
    }

    AUDIO_ELEMENT.src = URL.createObjectURL(new File([fSong], audioInformation[currentGame][station]["track_list"][currentTrack]["name"] + ".ogg"));

    SPAN_SONG_ELEMENT.innerText = audioInformation[currentGame][station]["track_list"][currentTrack]["name"];
    SPAN_ARTIST_ELEMENT.innerText = audioInformation[currentGame][station]["track_list"][currentTrack]["artist"];
}

function listAllTracks()
{
    const TABLE_ELEMENT = document.createElement("table");

    for (let i = 0; i < trackCollection.length; ++i)
    {
        let tr = document.createElement("tr");

        let td1 = document.createElement("td");
        let td2 = document.createElement("td");
        let td3 = document.createElement("td");

        let audio = document.createElement("audio");
        audio.src = URL.createObjectURL(new File([trackCollection[i][2]], ""));
        audio.controls = true;

        td1.innerText = trackCollection[i][0];
        td2.innerText = trackCollection[i][1];
        td3.appendChild(audio);

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);

        TABLE_ELEMENT.appendChild(tr);
    }

    document.querySelector("body")?.appendChild(TABLE_ELEMENT);
}

function getRawSongs()
{
    let songPointers = new Array();

    if (currentGame === 2)
    {
        let availableTracks = audioInformation[currentGame][currentStation]["track_list"];
        let keys = Object.keys(availableTracks);

        for (let i = parseInt(keys[0]); i < keys.length; ++i)
        {
            if (availableTracks[i]["role"] === "middle")
            {
                let j = i + 2;

                while(availableTracks[j]["role"] !== "outro")
                {
                    ++j;
                }

                songPointers.push([i + 1, i, j]);
            }
        }

        console.log(songPointers);

        let rawSongs = new Array<any>(songPointers.length);

        for (let i = 0; i < rawSongs.length; ++i)
        {
            rawSongs[i] = [buildSong(trackCollection[songPointers[i][0]][2], trackCollection[songPointers[i][1]][2], trackCollection[songPointers[i][2]][2]), songPointers[i][1]];
        }

        console.log(rawSongs);

        return rawSongs;
    }
    else
    {
        console.log("[FAILURE (getRawSongs): This function is intended only for songs from Grand Theft Auto: San Andreas.");
        console.log("This function is intended to retrieve songs without the DJ Chatter.")

        return null;
    }
}

function appendPlaylist()
{
    if (currentGame === 2)
    {
        if (songHistory.length <= 5)
        {
            ++songTracker;

            if (songTracker % 3 !== 0 || (availableStations.includes("ADVERTS")) === false)
            {
                let randomTrackArray = getRandomTrack();

                if ((songHistory.filter(arr => (arr[1] == randomTrackArray![0]))).length !== 0)
                {
                    do {
                        randomTrackArray = getRandomTrack();
                    } while ((songHistory.filter(arr => (arr[1] == randomTrackArray![0]))).length !== 0);
                }

                let song = buildSong(randomTrackArray![1], randomTrackArray![2], randomTrackArray![3]);

                songHistory.push([song, randomTrackArray![0]]);
            }
            else
            {
                let randomTrackArray = getRandomTrack("ADVERTS");
                let song = buildSong(randomTrackArray![1], randomTrackArray![2], randomTrackArray![3]);

                songHistory.push([song, randomTrackArray![0]]);
            }
        }
        else
        {
            console.log("[ERROR (appendPlaylist)]: Cannot add to playlist. Playlist already full.");
        }
    }
}

function removePlaylist()
{
    if (currentGame === 2)
    {
        if (songHistory.length !== 0)
        {
            songHistory.pop();
        }
        else
        {
            console.log("[ERROR (removePlaylist)]: Cannot remove from playlist. Playlist already empty.");
        }
    }
}
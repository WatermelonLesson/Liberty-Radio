"use strict";

/************************************************************
 *                                                          *
 * @Function: handleEvent(event : Event)                    *
 * @Description:                                            *
 *      Handles all events based on the type of event.      *
 *                                                          *
 ************************************************************/

function handleEvent(event : Event)
{
    if (event.target instanceof HTMLInputElement && event.target.type === "submit")
    {
        event.preventDefault();
        
        // TypeScript correctly infers this as FileList, the type is for me to remember that it's a FileList.
        let files : FileList | null = (document.querySelector("input[type=file]") as HTMLInputElement).files; 
        
        if ((files !== null) && (files.length !== 0))
        {
            for (let i = 0; i < files.length; ++i)
            {
                console.log(files[i].name);

                let gameOrigin = determineOrigin(files[i].name);
                let fileName = (files[i].name.includes(".")) ? files[i].name.slice(0, files[i].name.indexOf(".")) : files[i].name;

                if (gameOrigin !== -1)
                {
                    if (fileName !== "AMBIENCE" && fileName !== "BEATS" && fileName !== "CUTSCENE")
                    {
                        let decoded = false;

                        for (let j = 0; j < preparedTracks.length; ++j)
                        {
                            console.log("File name: " + fileName);
                            console.log("Prepared Tracks Name: " + preparedTracks[j][0]);

                            if (preparedTracks[j][0] === fileName)
                            {
                                console.log("[ERROR (" + j + ")]: File by the name of " + fileName + " already present.");
                                decoded = true;
                                break;
                            }
                        }

                        if (decoded)
                        {
                            break;
                        }

                        const promise : Promise<void> = decodeFile(files[i], gameOrigin).then(bufferView => {
                            // ! is the non-null assertion operator. 
                            // Prevents warning that (files) may be null, which we know will not be the 
                            // case based on our if.

                            console.log("[SUCCESS (" + i + ")]: File " + files![i].name + " successfully decoded.");

                            if (gameOrigin === 0 || gameOrigin === 1)
                            {
                                preparedTracks.push([fileName, gameOrigin, new File([bufferView], fileName)]);
                            }
                            else
                            {
                               partitionCollection(bufferView).then(partitions => {
                                    console.log("Partition outside (partitionCollection)");
                                    console.log(partitions);
                                    
                                    for (let j = 0; j < partitions.length; ++j)
                                    {
                                        if (j !== partitions.length - 1)
                                        {
                                            let newArr = bufferView.slice(partitions[j], partitions[j + 1]);
                                            console.log(newArr);
                                            trackCollection.push([fileName, j, newArr]);
                                        }
                                        else
                                        {
                                            let newArr = bufferView.slice(partitions[j]);
                                            console.log(newArr);
                                            trackCollection.push([fileName, j, newArr]);
                                        }
                                    }
                                }, reason => {
                                    console.log("[FAILURE (" + i + ")]: File " + files![i].name + " NOT partitioned. See reason below.");
                                    console.log(reason);
                                })

                                preparedTracks.push([fileName, gameOrigin, new File([bufferView], fileName + ".ogg")]);
                            }

                            availableStations.push(fileName);
                        }, reason => { 
                            console.log("[FAILURE (" + i + ")]: File " + files![i].name + " NOT decoded. See reason below.");
                            console.log(reason);
                        });

                        promisesCollection.push(promise);
                    }
                    else
                    {
                        console.log("WARNING (handleEvent)]: Provided file " + files![i].name + " will NOT be decoded.");
                        console.log("If you wish to decode this file, please enable the decode non-music files.");
                    }
                }
                else
                {
                    console.log("WARNING (handleEvent)]: Provided file " + files![i].name + " is not supported, or presented in an unrecognisable format.");
                    console.log("[Suggested Course of Action]: Ensure that said file is an unedited direct upload from the game folder.");
                    console.log("[Reminder]: This software only supports audio files from Grand Theft Auto III, Grand Theft Auto: Vice City, and Grand Theft Auto: San Andreas.");
                }
            }

            console.log("[SUCCESS]: All files parsed! We have decoded " + preparedTracks.length + " files successfully.");

            Promise.all(promisesCollection).then(() => {
                if (AUDIO_ELEMENT !== null)
                {
                    if (currentGame === -1)
                    {
                        if (preparedTracks.length !== 0)
                        {
                            let stationNumber = 0;

                            do {
                                stationNumber = randomInteger(0, preparedTracks.length);
                                console.log("STATION NUMBER: " + stationNumber);
                            } while (preparedTracks[stationNumber][0] === "AA" || preparedTracks[stationNumber][0] === "ADVERTS");

                            currentGame = preparedTracks[stationNumber][1];
                            currentStation = preparedTracks[stationNumber][0];

                            if (currentGame !== 2)
                            {
                                AUDIO_ELEMENT.src = URL.createObjectURL(preparedTracks[0][2]);
                            }
                            else
                            {
                                updateAudioOptions();

                                removePlaylist();
                                removePlaylist();
                                removePlaylist();

                                appendPlaylist();
                
                                playSong(songHistory[songHistory.length - 1][0], songHistory[songHistory.length - 1][1]);
                            }

                            SPAN_STATION_ELEMENT.innerText = preparedTracks[stationNumber][0];
                        }
                    }
                }
            });
        }
        else
        {
            console.log("[ERROR (handleEvent)]: Either expected FileList and received NULL or FileList has length 0.");
            console.log("[Suggested Course of Action]: Ensure that that there is an input element of type file AND that you've selected files using that element.");
        }
    }
    else if (event.target instanceof HTMLAudioElement)
    {
        console.log(event);

        if (event.type === "ended")
        {
            
            if (songHistory.length >= 5)
            {
                removePlaylist();
            }

            setTimeout(() => {
                appendPlaylist();
                playSong(songHistory[songHistory.length - 1][0], songHistory[songHistory.length - 1][1]);
            }, 250);
        }
    }
}

# Liberty-Radio

An app to play audio files from 3D-era Grand Theft Auto games in the browser.

## Why

I prefer K-Rose to WKRP. Instead of ripping videos from YouTube and dealing with
compression on top of compression, I made a tool to extract the full quality provided
by a licensed copy of the game. This eventually developed into a full-scale project to
recreate how the radio works in the original games, so I still haven't implemented the ability
to just download and export the files easily **(laughs)**.

## How it Works

The 3D era Grand Theft Auto games all handle audio a little differently. GTA III provides the
audio files unencrypted, whereas Vice City and San Andreas both incorporate some form of encryption.
In addition, San Andreas features a dynamic radio which will change over the course of the game and
can respond to changes in weather. 

This app easily reimplements that in-game functionality in the browser using TypeScript and **without**
reverse-engineering the original games.

## Known Bugs

- buildSong concatenation results in audio files which do not support seek functionality and end prematurely.
- On modern systems and browsers, audio files from Grand Theft Auto III fail to play due to the files being
implemented on the DVI ADPCM Codec.
- No support on iOS (likely due to audio being processed as a Blob); Potentially no support on iPadOS.

## Future Improvements

- Implement an aesthetically appleasing design.
- Implement console log information on the page rather than requiring users to open Dev Tools.
- Change the buildSong to correctly concatenate OGG files.
- Transcode GTA III's audio files to a more modern codec for more universal playback.
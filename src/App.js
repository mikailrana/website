import React from 'react';
import {
  ChakraProvider,
  Box,
  Icon,
  Text,
  Link,
  VStack,
  Code,
  Grid,
  theme,
  extendTheme,
  ThemeConfig,
  DarkMode,
  ColorModeScript
} from '@chakra-ui/react';
import { ColorModeSwitcher } from "./ColorModeSwitcher"
import { Logo } from "./Logo"
import  bkgImg  from "../src/assets/img/david-marcu.jpg"
import  albumImage  from "../src/assets/img/miguel-perales.jpg"
import {FaBeer, FaRegPauseCircle, FaRegPlayCircle} from 'react-icons/fa';
import fb from "firebase";
import H5AudioPlayer from "react-h5-audio-player";
import 'react-h5-audio-player/src/styles.scss'

const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
}

let firebase = require("firebase/firebase") ;

const customTheme = extendTheme({
  config,
  styles: {
    global: {
      // styles for the `body`
      body: {
      },
    }
  }
})

function App() {

  const [songs, setSongs] = React.useState(undefined);
  const [selectedSong, setSelectedSong] = React.useState(undefined);
  const audioPlayerRef = React.useRef(undefined)
  const [playerState,setPlayerState] = React.useState("paused");
  const [audioContext,setAudioContext] = React.useState(undefined);
  const [audioAnalyser,setAudioAnalyser] = React.useState(undefined);

  React.useEffect(() => {
    if (audioPlayerRef.current !== null && audioContext === undefined) {
      // @ts-ignore
      audioPlayerRef.current.audio.current.crossOrigin = "anonymous";
    }
  });

  if (songs === undefined) {
    var musicCollectionRef = firebase.firestore().collection("music2");
    musicCollectionRef.get().then(
      (querySnapshot) => {
        var music = Array()
        querySnapshot.forEach((doc) => {
          music.push(doc.data())
        });
        console.log(music);
        setSongs(music);
      })
  }

  var cards = [];

  if (songs !== undefined) {
    songs.forEach(song =>  {
      song.key = song.file
      /*
      if (process.env.NODE_ENV === "development") {
        song.url = song.url.replace(/^https:\/\/firebasestorage.googleapis.com/, '/fbs');
      }
      */

      var icon= FaRegPlayCircle
      var iconWidth = "230px"
      if(selectedSong !== undefined && song.key === selectedSong.key) {
        iconWidth = "300px"
      }
      if (selectedSong !== undefined && playerState === "playing" && song.key === selectedSong.key) {
        icon = FaRegPauseCircle
      }
      cards.push(
        (
          <Box
            minWidth={iconWidth}
            position="relative"
            width="100%"
            paddingLeft="15px"
            paddingRight="15px"
            marginTop="5px"
            flex="0 0 25%"
            key={song.key}
          >
            <Box display="flex"
                 flexDirection="column"
                 position="relative"
            >
              <Box
                backgroundImage={song.imageURL}
                backgroundSize="cover"
                width="100%"
                position="relative"
                _after={{
                  content: `""`,
                  display: "block",
                  paddingBottom: "100%"

                }}
                onClick={() => {
                  if (playerState === "paused") {
                    setSelectedSong(song)
                  }
                  else {
                    if (selectedSong !== undefined && selectedSong.key === song.key) {
                      setSelectedSong(undefined)
                    }
                    else {
                      setSelectedSong(song)
                    }

                  }
                }}

              >
                <Icon
                  as={icon}
                  pos="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  fontSize="3.5em"
                  opacity="1.0"
                  textShadow="rgb(59 89 152) 0px 0px 15px"
                  filter="drop-shadow( 3px 3px 2px rgba(0, 0, 0, .7));"
                />
              </Box>
              <Box pos="relative">
                {song.title}
              </Box>

            </Box>
          </Box>
        )
      )
    })
  }

  return (
    <ChakraProvider theme={customTheme}>
      <DarkMode>
        <Box>
          <Box padding={"24px"} _after={{boxSizing: "border-box"}}>
            <Box minHeight={"50vh"} maxHeight={"200px"}
                 backgroundImage={bkgImg} backgroundSize={"cover"}
                 backgroundPosition={"center center"} position={"relative"}>
              <Box _after={
                {
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  height: "100%", width: "100%", content: `""`,
                  zIndex: 2, display: "block",
                  position: "absolute"
                }}></Box>
              <Box pos="absolute"
                   top="50%"
                   left="50%"
                   zIndex="3"
                   transform="translate(-50%, -50%)"
                   textAlign="center"
                   color="white"
                   width="100%">

                <Box
                  paddingLeft="15px"
                  paddingRight="15px"
                  width="100%"
                  pos="relative">

                  <Box
                    pos="relative"
                    textAlign="center"
                    fontWeight="thin"
                    fontFamily='"Montserrat", "Helvetica", Arial, sans-serif'
                  >
                    <Box
                      marginTop="30px"
                      marginBottom="20px"
                      fontSize="2.5rem"
                      lineHeight="shorter"
                    >
                      Freddie's Music
                    </Box>
                    <Box
                      marginTop="20px"
                      fontSize="xl"
                    >
                      Prod. Freddie
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box
              paddingTop="70px"
              paddingBottom="70px"
              overflowX="auto"
              width="100%"
              paddingLeft="15px"
              paddingRight="15px"
            >
              <Box
                display="flex"
                flexWrap="nowrap"
              >
                {cards}
              </Box>
            </Box>
          </Box>
          <div className="timeline rounded" style={{backgroundColor:'black',paddingBottom:'0px',position:'fixed',left:1,bottom:'0',zIndex:100,width:'100%'}}>
            <div className="rounded" style={{height:'80px',backgroundColor:'white'}}>
              <H5AudioPlayer
                ref={audioPlayerRef}
                src={(selectedSong === undefined) ? "" : selectedSong.audioURL}
                layout={"stacked"}
                onPause={() => {setPlayerState("paused")}}
                onPlay={() => {setPlayerState("playing")
                  //audioContext.resume()
                }}
                onEnded={(e) => {setPlayerState("paused")}}
              />
            </div>
          </div>
        </Box>
      </DarkMode>
    </ChakraProvider>
  );
}

export default App;

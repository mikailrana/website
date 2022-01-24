import React from 'react';
import {
  chakra,
  AspectRatio,
  ChakraProvider,
  Box,
  Icon,
  Link, Image,
  extendTheme,
  DarkMode,
  SimpleGrid
} from '@chakra-ui/react';
import  bkgImg  from "../src/assets/img/david-marcu.jpg"
import {FaRegPauseCircle, FaRegPlayCircle} from 'react-icons/fa';
import {AudioPlayer} from './Player';
import {Scene,Tracker} from './Scene';
import {CircleViz} from "./Viz";
import {isMobileBrowser,getWidthAsPixels} from './Utils'
import {SectionHeader,SectionCategory,MusicCarousel, Projects} from './Components';
import {canvasWidth,iconWidth} from './Constants';

const config = {
  initialColorMode: "light",
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

// the circle visualizer
let viz    = new CircleViz();
// the global audio player object
let player = new AudioPlayer({enableAudioContext:!isMobileBrowser(), decodeAudioBroken:true});
// some problems with state, so track url here
let currentSelectedSongURL = undefined;

// the app component
function App(props) {

  /** We use React.useState and React.useRef to capture state for this component **/

  // we refresh our song list from server (state)
  const [songs, setSongs] = React.useState(undefined);
  // what is the currently selected song (javascript) object (state)
  const [selectedSong, setSelectedSong] = React.useState(undefined);
  // player state (playing,paused,stopped)
  const [playerState,setPlayerState] = React.useState("paused");
  // the canvas object (we create this dynamically during playback to render visualization)
  const canvasRef = React.useRef(null);


  /** playSong callback from onclick handler **/
  let playSong = (songObject)=> {
    if (selectedSong === songObject){
      if (player.isPlaying()) {
        player.pauseSong();
      }
      else{
        player.resumeSong();
      }
    }
    else{
      setSelectedSong(songObject);
      currentSelectedSongURL = songObject.audioURL;
      player.playSong(songObject.audioURL);
    }

  }

  /** setup player state callback to set caputre and update our react state **/
  player.playerStateCallback = function (state,songURL) {
    if (state !== "stopped" || songURL === currentSelectedSongURL) {
      setPlayerState(state);
      if (state === "stopped") {
        setSelectedSong(undefined);
        currentSelectedSongURL = "";
      }
    }
  }

  /** useEffect allows us to initialize the Scene object during component initialization **/
  React.useEffect(() => {
    new Scene(player,viz,canvasRef,canvasWidth);
  });

  /** if songs (state) is undefined, then make a call to firestore to get list of latest songs **/
  if (songs === undefined) {
    // get a collection ref to the music2 collection in firestore
    var musicCollectionRef = firebase.firestore().collection("music2");
    // call the ref's get method (which returns a promise)
    // attach a promise handler (when server call completes asynchronously)
    musicCollectionRef.get().then(
      // callback function invoked by promise (takes querySnapshot object)
      (querySnapshot) => {
        // declare a temporary music array
        var music = []
        // querySnapshot is a snapshot of the music2 collection
        // iterate querySnapshot (contains song objects)
        querySnapshot.forEach((doc) => {
          // append song objects to music Array
          music.push(doc.data())
        });
        //console.log(music);
        setSongs(music);
      })
  }
  /** we are going to create a dictionary (key(name of category),value(array of React object)) songs into categories based on category attribute **/
  let categoryMap = new Map();
  /** for each category, we create a react carousel object **/
  let carouselSections = [];
  /** if songs (state) is defined **/
  if (songs !== undefined) {
    /** walk each song javascript object **/
    songs.forEach(song => {
      // assume unknown category
      let category = "unknown";
      // get categories this object maps to ..
      let categories = song.category.split(",");
      // just take first category for now ...
      if (categories.length) category = categories[0];
      // if categoryMap doesn't have this category yet, add category to dictionary
      if (!categoryMap.has(category))
        categoryMap.set(category, []);
      song.key = song.file

      /*
      if (process.env.NODE_ENV === "development") {
        song.url = song.url.replace(/^https:\/\/firebasestorage.googleapis.com/, '/fbs');
      }
      */

      // default icon is play icon
      var icon = FaRegPlayCircle
      /*
      // expand the size of the selected tile
      if(selectedSong !== undefined && song.key === selectedSong.key) {
        iconWidth = "300px"
      }
      */
      /** we render visualization on a canvas if song is playing **/
      let canvas = undefined;
      // wrap canvas tag as chakra object in case we need to use it ...
      let Canvas = chakra('canvas');

      /** if selectSong (state) is current song and player is playing or loading, then render canvas **/
      if (selectedSong !== undefined && (playerState === "playing" || playerState === "loading") && song.key === selectedSong.key) {
        // set icon to puase
        icon = FaRegPauseCircle
        // set canvas variable to actually contain a Canvas object
        canvas = (
          <Canvas
            opacity={".7"}
            pos="absolute"
            zIndex={1000}
            id='Player-canvas'
            key='Player-canvas'
            ref={canvasRef}
            width={getWidthAsPixels(canvasWidth)}
            height={getWidthAsPixels(canvasWidth)}
            onClick={() => {
              playSong(song);
            }}

          >
          </Canvas>);
      }

      /** render tile for current song **/
      let tile = (
        <Box
          minWidth={getWidthAsPixels(iconWidth)}
          maxWidth={getWidthAsPixels(iconWidth)}
          position="relative"
          width="100%"
          paddingRight="15px"
          marginTop="5px"
          flex="0 0 25%"
          key={song.key}
        >
          {canvas}

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
                playSong(song);
              }}

            >
              <Icon
                as={icon}
                color={"white"}
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
            <Box pos="relative"
                 fontSize={"14px"}
                 fontWeight={700}
                 textAlign={"center"}
                 marginTop={"15px"}
                 textTransform={"uppercase"}
            >
              {song.title}
            </Box>

          </Box>
        </Box>
      );
      // add the tile to the appropriate category
      categoryMap.get(category).push(tile);
    })
    /** once we are done building our category dictionary, walk it, and build our carousel objects **/
    for (const [category,cards] of categoryMap) {
      carouselSections.push((<SectionCategory title={category} />));
      carouselSections.push((
            <MusicCarousel>
              {cards}
            </MusicCarousel>));
    }
  }

  /** always render audio elemenet (to play audio **/
  let audioElement = player.renderAudioElement();
  /** actually render the page **/
  return (
    <ChakraProvider theme={customTheme}>
      <DarkMode>
        {audioElement}
        <Box fontFamily={"Roboto"}>
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
                      Mikail's Music & Projects
                    </Box>
                    <Box
                      marginTop="20px"
                      fontSize="xl"
                    >
                      Prod. Mikail
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>

            <SectionHeader title={"Featured Music"}/>
              {carouselSections}
            <Projects enabled={false}/>

            <Box paddingTop={"40px"}/>
          </Box>
        </Box>
      </DarkMode>
    </ChakraProvider>
  );
}

export default App;

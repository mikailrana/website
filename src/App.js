import React from 'react';
import {
  ChakraProvider,
  Box,
  extendTheme,
  DarkMode,
} from '@chakra-ui/react';
import  bkgImg  from "../src/assets/img/david-marcu.jpg"
import {AudioPlayer} from './Player';
import {Scene} from './Scene';
import {CircleViz} from "./Viz";
import {isMobileBrowser} from './Utils'
import {SectionHeader,SectionCategory,MusicCarousel, Projects, MusicTile} from './Components';
import {canvasWidth} from './Constants';

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
let currentSelectedSongTileId = undefined;

/** create a category dictionary given songs array
 *
 * Basically, walk songs array and split by category and assign tile id and
 * other information upfront
 * **/
function buildCategoryDictionary(songsArray) {

  let lastTileId = 0;

  /** we are going to create a dictionary (key(name of category),value(array of React object)) songs into categories based on category attribute **/
  let categoryMap = new Map();

  /** walk each song javascript object **/
  songsArray.forEach(song => {
    // get categories this object maps to ..
    let categories = song.category.split(",");

    song.key = song.file

    /*
    if (process.env.NODE_ENV === "development") {
      song.url = song.url.replace(/^https:\/\/firebasestorage.googleapis.com/, '/fbs');
    }
    */

    for (let category of categories) {
      /** assign tile id **/
      let tileId = lastTileId++;

      /** Stash placeholder in appropriate category array. **/
      category = category.trim()
      // if categoryMap doesn't have this category yet, add category to dictionary
      if (!categoryMap.has(category))
        categoryMap.set(category, []);
      // get the array
      let categoryArray = categoryMap.get(category)
      /** Capture tile id, is selected, and song object, and store it in category array. **/
      let songInfo = {tileId, song, category, index: categoryArray.length}

      // add the tile to the appropriate category
      categoryMap.get(category).push(songInfo);
    }
  })
  return categoryMap;
}

let categoryDictionary = undefined;

// the app component
function App() {

  /** We use React.useState and React.useRef to capture state for this component **/

  // we refresh our song list from server (state)
  const [songs, setSongs] = React.useState(undefined);
  // what is the currently selected song (javascript) object (state)
  const [selectedTileId, setSelectedTileId] = React.useState(undefined);
  // player state (playing,paused,stopped)
  const [playerState,setPlayerState] = React.useState("paused");
  // the canvas object (we create this dynamically during playback to render visualization)
  const canvasRef = React.useRef(null);


  /** playSong callback from onclick handler **/
  let playSong = (songObject, tileId, category, index)=> {
    if (selectedTileId === tileId){
      if (player.isPlaying()) {
        player.pauseSong();
      }
      else{
        player.resumeSong();
      }
    }
    else{
      setSelectedTileId(tileId);
      currentSelectedSongTileId = tileId;
      player.playSong(songObject.audioURL,tileId, {category, index});
    }

  }

  /** setup player state callback to set caputre and update our react state **/
  player.playerStateCallback = function (state,songId, songInfo) {
    if (state !== "stopped" || songId === currentSelectedSongTileId) {
      setPlayerState(state);
      if (state === "stopped") {
        // get current category array.
        let songArray = categoryDictionary.get(songInfo.category);
        // check if current song index != last index
        if(songInfo.index < songArray.length -1) {
          // Get next song info
          let nextSongInfo = songArray[songInfo.index + 1]
          // Play next song
          playSong(nextSongInfo.song, nextSongInfo.tileId, nextSongInfo.category, nextSongInfo.index);
        }
        else {
          setSelectedTileId(undefined);
          currentSelectedSongTileId = undefined;
        }
      }
    }
  }

  /** useEffect allows us to initialize the Scene object during component initialization **/
  React.useEffect(() => {
    new Scene(player,viz,canvasRef,canvasWidth);
  });

  /** for each category, we create a react carousel object **/
  let carouselSections = [];

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

        // populate category dictionary
        categoryDictionary = buildCategoryDictionary(music);

      })
  }
  else {
    /** if songs (state) is defined **/
    if (songs !== undefined && categoryDictionary !== undefined) {
      let categoryMap = new Map()

      /** Populate music tiles **/
      for (const [category, cards] of categoryDictionary) {
        /** Add empty cards array to category map dictionary based on category name. **/
        let tiles = []
        categoryMap.set(category, tiles);
        for (let index = 0; index < cards.length; index++) {
          let current = cards[index];

          /** check if selected **/
          let isSelected = (selectedTileId === current.tileId)

          /** render tile for current song **/
          let tile = (<MusicTile song={current.song}
                                 playSong={playSong}
                                 tileId={current.tileId}
                                 isSelected={isSelected}
                                 playerState={playerState}
                                 canvasRef={canvasRef}
                                 category={current.category}
                                 index={current.index}
          />)

          /** Add tile object to cards array. **/
          tiles.push(tile)
        }
      }


      /** once we are done building our category dictionary, walk it, and build our carousel objects **/
      let sortedCategories = []
      console.log(categoryMap);
      if (categoryMap.get("Featured") !== undefined) {
        const cards = categoryMap.get("Featured")
        sortedCategories.push({ category: "Featured", cards })
        categoryMap.delete("Featured")
      }
      for (const [category, cards] of categoryMap) {
        sortedCategories.push({ category, cards })
      }
      console.log(sortedCategories)
      for (const obj of sortedCategories) {
        carouselSections.push((<SectionCategory title={obj.category}/>));
        carouselSections.push((
          <MusicCarousel>
            {obj.cards}
          </MusicCarousel>));
      }
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
                }}/>
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

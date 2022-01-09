import React from 'react';
import {
  chakra,
  AspectRatio,
  ChakraProvider,
  Box,
  Icon,
  Text,
  Link, Image,
  VStack,
  Code,
  Grid,
  theme,
  extendTheme,
  ThemeConfig,
  DarkMode,
  ColorModeScript,
  SimpleGrid
} from '@chakra-ui/react';
import { ColorModeSwitcher } from "./ColorModeSwitcher"
import { Logo } from "./Logo"
import  bkgImg  from "../src/assets/img/david-marcu.jpg"
import  albumImage  from "../src/assets/img/miguel-perales.jpg"
import {FaBeer, FaRegPauseCircle, FaRegPlayCircle} from 'react-icons/fa';
import fb from "firebase";
import {CircleViz,Scene,AudioPlayer} from "./Viz.js"

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

let iconWidth="230px"
let iconWidth_Buffer="250px"
let canvasWidth=215;

function SectionButton(props) {
    return (
        <Link href={props.linkURL}
              width={['100%','100%',iconWidth - 15]}
              minWidth={iconWidth}
        >
          <AspectRatio maxW={['100%','100%',iconWidth]} ratio={1 / 1}>
            <Image
                maxHeight={"100%"}
                maxWidth={"auto"}
                paddingLeft={"5px"}
                paddingRight={"5px"}
                aspectRatio={"1"}
                margin={"0 auto"}
            textDecoration='none'
            src={props.imageURL}/>
          </AspectRatio>
            <Box
                fontWeight={"700"}
                fontSize={"14px"}
                textAlign={"center"}
                color={"black"}
                >
                {props.text}
            </Box>
        </Link>
    )
}

function SectionHeader(props) {
  return (
      <Box
          m={"30px 0 15px 0"}
          fontFamily={"'Raleway', sans-serif"}
          fontWeight={700}
          fontSize={"40px"}
          lineHeight={"100%"}>
        {props.title}
      </Box>
  )
}

function SectionCategory(props) {
  return (
      <Box
          fontSize={"19px"}
          fontWeight={300}
      >{props.title}</Box>
  )
}

function MusicCarousel(props) {
  return (

      <Box
          minHeight={iconWidth_Buffer}
          paddingTop="20px"
          marginBottom={"20px"}
          overflowX="auto"
          width="100%"
          paddingRight="15px"
      >
        <Box
            display="flex"
            flexWrap="nowrap"
        >
          {props.children}
        </Box>
      </Box>
  )
}


let viz    = new CircleViz();
let player = new AudioPlayer();

function App() {

  const [songs, setSongs] = React.useState(undefined);
  const [selectedSong, setSelectedSong] = React.useState(undefined);
  const [playerState,setPlayerState] = React.useState("paused");
  const [audioContext,setAudioContext] = React.useState(undefined);
  const [audioAnalyser,setAudioAnalyser] = React.useState(undefined);
  const canvasRef = React.useRef(null);
  let scene = undefined;

  let playSong = (songObject)=> {
    setSelectedSong(songObject);
    player.playSong(songObject.audioURL,viz);
  }

  React.useEffect(() => {
    scene  = new Scene(player,viz,canvasRef,canvasWidth);
    player.playerStateCallback = (state) => {
      setPlayerState(state);
    }

    /*
    if (audioElementRef.current !== null && audioContext === undefined) {
      // @ts-ignore
      audioElementRef.current.audio.current.crossOrigin = "anonymous";
    }
    */
  });

  if (songs === undefined) {
    var musicCollectionRef = firebase.firestore().collection("music2");
    musicCollectionRef.get().then(
      (querySnapshot) => {
        var music = Array()
        querySnapshot.forEach((doc) => {
          music.push(doc.data())
        });
        //console.log(music);
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
      /*
      if(selectedSong !== undefined && song.key === selectedSong.key) {
        iconWidth = "300px"
      }
      */
      let canvas = undefined;
      let Canvas = chakra('canvas');
      console.log({playerState});
      if (selectedSong !== undefined && playerState === "playing" && song.key === selectedSong.key) {
        icon = FaRegPauseCircle
        canvas = (
          <Canvas
            opacity={".5"}
            pos="absolute"
            zIndex={1000}
            id='Player-canvas'
            key='Player-canvas'
            ref={canvasRef}
            width={iconWidth}
            height={iconWidth} >
          </Canvas>);
      }
      cards.push(
        (
          <Box
            minWidth={iconWidth}
            maxWidth={iconWidth}
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
        )
      )
    })
  }

  return (
    <ChakraProvider theme={customTheme}>
      <DarkMode>
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

            <SectionHeader title={"Featured Music"}/>
            <SectionCategory title={"Synth Beats"} />
            <MusicCarousel>
                {cards}
            </MusicCarousel>

            <SectionHeader title={"Projects"}/>
            <SectionCategory title={"Made in JS and Python"} />
            <SimpleGrid columns={[1,2]} >
              <SimpleGrid columns={[1,2,3,4]} width={["100%","480px","720px","920px"]} columnGap={"15px"} maxWidth={iconWidth * 4} >
                <SectionButton text={"Text Description"}
                               imageURL={"https://firebasestorage.googleapis.com/v0/b/mikmusic-8c7e3.appspot.com/o/NewStuff%2FChecks%20Image.jpg?alt=media"}
                               linkURL={"https://chakra-ui.com/"} />
                <SectionButton text={"Text Description"}
                               imageURL={"https://firebasestorage.googleapis.com/v0/b/mikmusic-8c7e3.appspot.com/o/NewStuff%2FChecks%20Image.jpg?alt=media"}
                               linkURL={"https://chakra-ui.com/"} />
                <SectionButton text={"Text Description"}
                               imageURL={"https://firebasestorage.googleapis.com/v0/b/mikmusic-8c7e3.appspot.com/o/NewStuff%2FChecks%20Image.jpg?alt=media"}
                               linkURL={"https://chakra-ui.com/"} />
                <SectionButton text={"Text Description"}
                               imageURL={"https://firebasestorage.googleapis.com/v0/b/mikmusic-8c7e3.appspot.com/o/NewStuff%2FChecks%20Image.jpg?alt=media"}
                               linkURL={"https://chakra-ui.com/"} />

              <SectionButton text={"Text Description"}
                             imageURL={"https://firebasestorage.googleapis.com/v0/b/mikmusic-8c7e3.appspot.com/o/NewStuff%2FChecks%20Image.jpg?alt=media"}
                             linkURL={"https://chakra-ui.com/"} />
              </SimpleGrid>
              <Box width={["0px","1px"]} />
            </SimpleGrid>
            <Box paddingTop={"40px"}/>
          </Box>
        </Box>
      </DarkMode>
    </ChakraProvider>
  );
}

export default App;

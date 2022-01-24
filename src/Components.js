import React from 'react';
import {
  chakra,
  AspectRatio,
  Box,
  Icon,
  Link, Image,
  SimpleGrid
} from '@chakra-ui/react';
import { iconWidth, canvasWidth, iconWidth_Buffer } from './Constants';
import {getWidthAsPixels} from './Utils';
import {FaRegPauseCircle, FaRegPlayCircle} from 'react-icons/fa';

export function SectionButton(props) {
  return (
    <Link href={props.linkURL}
          width={['100%','100%',getWidthAsPixels(iconWidth) - 15]}
          minWidth={getWidthAsPixels(iconWidth)}
    >
      <AspectRatio maxW={['100%','100%',getWidthAsPixels(iconWidth)]} ratio={1 / 1}>
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

export function SectionHeader(props) {
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

export function SectionCategory(props) {
  return (
    <Box
      fontSize={"19px"}
      fontWeight={300}
    >{props.title}</Box>
  )
}

export function MusicCarousel(props) {
  return (

    <Box
      minHeight={getWidthAsPixels(iconWidth + iconWidth_Buffer)}
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

export function Projects(props) {
  if (props.enabled) {
    return (
      <Box>
        <SectionHeader title={"Projects"}/>
        <SectionCategory title={"Made in JS and Python"}/>
        <SimpleGrid columns={[1, 2]}>
          <SimpleGrid columns={[1, 2, 3, 4]} width={["100%", "480px", "720px", "920px"]} columnGap={"15px"}
                      maxWidth={getWidthAsPixels(iconWidth) * 4}>
            <SectionButton text={"Text Description"}
                           imageURL={"https://firebasestorage.googleapis.com/v0/b/mikmusic-8c7e3.appspot.com/o/NewStuff%2FChecks%20Image.jpg?alt=media"}
                           linkURL={"https://chakra-ui.com/"}/>
            <SectionButton text={"Text Description"}
                           imageURL={"https://firebasestorage.googleapis.com/v0/b/mikmusic-8c7e3.appspot.com/o/NewStuff%2FChecks%20Image.jpg?alt=media"}
                           linkURL={"https://chakra-ui.com/"}/>
            <SectionButton text={"Text Description"}
                           imageURL={"https://firebasestorage.googleapis.com/v0/b/mikmusic-8c7e3.appspot.com/o/NewStuff%2FChecks%20Image.jpg?alt=media"}
                           linkURL={"https://chakra-ui.com/"}/>
            <SectionButton text={"Text Description"}
                           imageURL={"https://firebasestorage.googleapis.com/v0/b/mikmusic-8c7e3.appspot.com/o/NewStuff%2FChecks%20Image.jpg?alt=media"}
                           linkURL={"https://chakra-ui.com/"}/>

            <SectionButton text={"Text Description"}
                           imageURL={"https://firebasestorage.googleapis.com/v0/b/mikmusic-8c7e3.appspot.com/o/NewStuff%2FChecks%20Image.jpg?alt=media"}
                           linkURL={"https://chakra-ui.com/"}/>
          </SimpleGrid>
          <Box width={["0px", "1px"]}/>
        </SimpleGrid>
      </Box>
    )
  }
  else {
    return null;
  }
}

export function MusicTile(props) {

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
  if ((props.playerState === "playing" || props.playerState === "loading") && props.isSelected) {
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
            ref={props.canvasRef}
            width={getWidthAsPixels(canvasWidth)}
            height={getWidthAsPixels(canvasWidth)}
            onClick={() => {
              props.playSong(props.song,props.tileId);
            }}

        >
        </Canvas>);
  }

  return(
      <Box
          minWidth={getWidthAsPixels(iconWidth)}
          maxWidth={getWidthAsPixels(iconWidth)}
          position="relative"
          width="100%"
          paddingRight="15px"
          marginTop="5px"
          flex="0 0 25%"
          key={props.song.key}
      >
        {canvas}

        <Box display="flex"
             flexDirection="column"
             position="relative"
        >
          <Box
              backgroundImage={props.song.imageURL}
              backgroundSize="cover"
              width="100%"
              position="relative"
              _after={{
                content: `""`,
                display: "block",
                paddingBottom: "100%"

              }}
              onClick={() => {
                if (props.playSong  !== undefined){
                  props.playSong(props.song, props.tileId);
                }
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
            {props.song.title}
          </Box>

        </Box>
      </Box>
  );
}

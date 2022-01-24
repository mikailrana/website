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
import { iconWidth, canvasWidth, iconWidth_Buffer } from './Constants';
import {getWidthAsPixels} from './Utils';

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

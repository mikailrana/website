import React from 'react';
import {
    Box,
    Button,
    ButtonGroup
} from '@chakra-ui/react';
import * as Tone from 'tone'

//create a synth and connect it to the main output (your speakers)
const synth = new Tone.Synth().toDestination();

function doSomeToneJSStuff() {
    //play a middle 'C' for the duration of an 8th note
    synth.triggerAttackRelease("C4", "8n");
}

export function ToneExperiment () {


    return (<Button colorScheme='blue'
                    onClick={() => { doSomeToneJSStuff(); }} >Button</Button>);
}
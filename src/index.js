import { ColorModeScript } from '@chakra-ui/react';
import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorker from './serviceWorker';

// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
var firebase = require("firebase/firebase");

// Add the Firebase services that you want to use
require("firebase/auth");
require("firebase/firestore");


const firebaseConfig = {
  apiKey: "AIzaSyDQorlDZYTdtlhuHkQ1H3iK60R5ykdLVMU",
  authDomain: "mikmusic-8c7e3.firebaseapp.com",
  databaseURL: "https://mikmusic-8c7e3.firebaseio.com",
  projectId: "mikmusic-8c7e3",
  storageBucket: "mikmusic-8c7e3.appspot.com",
  messagingSenderId: "654093933741",
  appId: "1:654093933741:web:f0642ac76673d86a40fa24",
  measurementId: "G-6BSKPCYWMY"
};


firebase.initializeApp(firebaseConfig);


ReactDOM.render(
  <StrictMode>
    <ColorModeScript />
    <App />
  </StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorker.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

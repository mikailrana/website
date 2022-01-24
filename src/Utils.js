// add a script to detect if we are on a mobile browser
//https://stackoverflow.com/questions/58141018/mobile-device-detection
export function isMobileBrowser() {
  let hasTouchScreen = false;
  if ("maxTouchPoints" in navigator) {
    hasTouchScreen = navigator.maxTouchPoints > 0;
  } else if ("msMaxTouchPoints" in navigator) {
    hasTouchScreen = navigator['msMaxTouchPoints'] > 0;
  } else {
    let mQ = window.matchMedia && matchMedia("(pointer:coarse)");
    if (mQ && mQ.media === "(pointer:coarse)") {
      hasTouchScreen = !!mQ.matches;
    } else if ('orientation' in window) {
      hasTouchScreen = true; // deprecated, but good fallback
    }
  }

  //const md = new MobileDetect(window.navigator.userAgent);
  //const isMobileDetected = Object.isNotNull(md.mobile()) || Object.isNotNull(md.phone()) || Object.isNotNull(md.tablet());

  return hasTouchScreen;
}

export function getWidthAsPixels(width) {
  return width +"px";
}

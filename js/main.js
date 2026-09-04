"use strict";

const markerButton =
    document.getElementById("markerARButton");

const markerlessButton =
    document.getElementById("markerlessARButton");


markerButton.addEventListener(
    "click",
    () => {

        window.location.href =
            "marker-ar.html";

    }
);


markerlessButton.addEventListener(
    "click",
    () => {

        window.location.href =
            "markerless-ar.html";

    }
);
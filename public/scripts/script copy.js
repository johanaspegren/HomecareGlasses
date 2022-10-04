// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getDatabase, set, ref, update , onValue } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBWzesKe74C0tws0YtvdEOlQxHXq8DjVo0",
    authDomain: "homecareglasses.firebaseapp.com",
    databaseURL: "https://homecareglasses-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "homecareglasses",
    storageBucket: "homecareglasses.appspot.com",
    messagingSenderId: "660177405798",
    appId: "1:660177405798:web:9ac41d588ca1b48124eaa7"
  };

// Initialize Firebase
console.log("Initialize Firebase");
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Handle errors.
let handleError = function(err){
    console.log("Error: ", err);
};

// Query the container to which the remote stream belong.
let remoteContainer = document.getElementById("remote-container");

// Add video streams to the container.
function addVideoStream(elementId){
    // Creates a new div for every stream
    let streamDiv = document.createElement("div");
    // Assigns the elementId to the div.
    streamDiv.id = elementId;
    // Takes care of the lateral inversion
    streamDiv.style.transform = "rotateY(180deg)";
    // Adds the div to the container.
    remoteContainer.appendChild(streamDiv);
};

// Remove the video stream from the container.
function removeVideoStream(elementId) {
    let remoteDiv = document.getElementById(elementId);
    if (remoteDiv) remoteDiv.parentNode.removeChild(remoteDiv);
};

console.log("Check client");
let client = AgoraRTC.createClient({
    mode: "rtc",
    codec: "vp8",
});

// debug
let videoToken = null // "007eJxTYPinKC7hIXpIcEfVe0O7eKFZshH6Imfa5vLdlRNVVPspIqDAkGJhbG6RmpSSaGBuYGKYammRmGySnJRqYJFqYphiYJL6oM8mOeGBbbKO6iJmRgYIBPG5GZITc3IS80qLilONGBgA90wfzg==";


// wait for token
console.log("call fetch token")

const videoTokenRef = ref(database, 'videocall/currentToken');
onValue(videoTokenRef, (snapshot) => {
    videoToken = snapshot.val();
    console.log("videoToken " + videoToken)
    document.getElementById("textToken").innerText = videoToken

    callInit(videoToken)
    let _localStream = clientInit()
    initLocalStream(_localStream)  
});




console.log("callED fetch token")


// init the call
function callInit() {
    client.init("d8378ebda07041e98ac4cbe08e41d04e", function() {
        console.log("client initialized");
    }, function(err) {
        console.log("client init failed ", err);
    });        
}


function clientInit() {
    client.join(videoToken, 
    "callanurse2", null, (uid)=>{
        // Create a local stream
    }, handleError);

    let localStream = AgoraRTC.createStream({
        audio: true,
        video: true,
    });
    return localStream
}


// Initialize the local stream
function initLocalStream(localStream) {
    localStream.init(()=>{
        // Play the local stream
        localStream.play("me");
        // Publish the local stream
        client.publish(localStream, handleError);
    }, handleError);    
}




// LISTENERS BELOW

// Subscribe to the remote stream when it is published
client.on("stream-added", function(evt){
    client.subscribe(evt.stream, handleError);
});
// Play the remote stream when it is subscribed
client.on("stream-subscribed", function(evt){
    let stream = evt.stream;
    let streamId = String(stream.getId());
    addVideoStream(streamId);
    stream.play(streamId);
});


// Remove the corresponding view when a remote user unpublishes.
client.on("stream-removed", function(evt){
    let stream = evt.stream;
    let streamId = String(stream.getId());
    stream.close();
    removeVideoStream(streamId);
});
// Remove the corresponding view when a remote user leaves the channel.
client.on("peer-leave", function(evt){
    let stream = evt.stream;
    let streamId = String(stream.getId());
    stream.close();
    removeVideoStream(streamId);
});

if(false){

// create listener for leave button
document.getElementById("btnLeaveOnCLick").addEventListener("click", function() {
    let leave = confirm("Leave call?");
    console.log("leaving?" + leave)
    if(leave) {
        console.log("leaving!")
    } else {
        console.log("naa, changed my mind")
    }
});

// create listener for journal note button
document.getElementById("btnJournalNoteOnCLick").addEventListener("click", function() {
    let makeNote = confirm("Make note?");
    console.log("leaving?" + makeNote)
    if(makeNote) {
        console.log("open up notemaker")
    } else {
        console.log("naa, changed my mind")
    }
});

}

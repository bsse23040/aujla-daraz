// global variables
let currentSong = new Audio();
let songs;
let currFolder;

// time formatting function
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }
    let totalSeconds = Math.round(seconds);
    let minutes = Math.floor(totalSeconds / 60);
    let secs = totalSeconds % 60;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    secs = secs < 10 ? '0' + secs : secs;
    return minutes + ':' + secs;
}

// getting songs in array from folder
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/assets/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/assets/${currFolder}/`)[1]);
        }
    }




    // show all songs in the playlist
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = ""
    for (const song of songs) {
        let index1 = song.indexOf("Artist");
        let index2 = song.indexOf(".mp3");

        let mysongname = '';
        let myartistname = '';

        if (index1 !== -1 && index2 !== -1 && index1 < index2) {
            mysongname = song.substring(0, index1).replaceAll("%20", " ");
            myartistname = song.substring((index1 + 6), index2).replaceAll("%20", " ");
        }

        songUL.innerHTML += `<li>
                                <img class="invert" src="assets/svgs/music.svg" alt="music icon">
                                <div class="info">
                                    <div class="mySongName">${mysongname}</div>
                                    <div>${myartistname}</div>
                                </div>
                                <div class="playnow">
                                    <span>Play Now</span>
                                    <img class="invert" height="22px" src="assets/svgs/playnow.svg" alt="play icon">
                                </div>
                             </li>`;
    }

    // attach an event listner to song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            let songName = e.querySelector(".info div:first-child").textContent.trim();
            let artistName = e.querySelector(".info div:last-child").textContent.trim();
            playMusic(`${songName} Artist ${artistName}.mp3`);
        });
    });



    return songs;
}

// music playing function
const playMusic = (track, pause = false) => {
    currentSong.src = `/assets/${currFolder}/${track}`;
    console.log(currentSong.src)
    if (!pause) {
        currentSong.play();
    }
    document.getElementById("play-wrapper").innerHTML = ``;
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

}



async function displayAlbums() {
    let a = await fetch(`/assets/musics/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors);
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
        if (e.href.includes("/musics") && !e.href.includes(".htaccess")) {
            let folder = e.href.split('/').slice(-2)[0]
            // get meta data of each folder
            let a = await fetch(`/assets/musics/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <img src="https://img.icons8.com/sf-black-filled/64/play.png" alt="play" />
                        </div>
                        <img src="assets/musics/${folder}/cover.jpeg" alt="cover pic">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    

    // load the event when ever the card is played
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            await getSongs(`musics/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])
        })
    })
}


// main function
async function main() {
    songs = await getSongs('musics/Karan_Aujla');
    playMusic(songs[0], true);
    // Display the list of all the songs
    displayAlbums();



    // song play pause on click
    const playWrapper = document.getElementById("play-wrapper");
    playWrapper.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playWrapper.innerHTML = ``;
        } else {
            currentSong.pause();
            playWrapper.innerHTML = `<img id="play" src="assets/svgs/play.svg" alt="play">`;
        }
    });



    //song play pause on space bar
    document.addEventListener('keydown', function (event) {
        if (event.code === 'Space') {
            if (currentSong.paused) {
                currentSong.play();
                playWrapper.innerHTML = ``;
            } else {
                currentSong.pause();
                playWrapper.innerHTML = `<img id="play" src="assets/svgs/play.svg" alt="play">`;
            }
        }
    });



    // listen for time update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });



    // add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration) * percent / 100;
    });
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });



    // add event listener to previous and next button
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index < (songs.length) - 1) {
            playMusic(songs[index + 1]);
        }
    });



    // Adjusting the volume and updating the volume image on input change
document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
    const volumeImg = document.querySelector(".volume > img");
    if (currentSong.volume === 0) {
        volumeImg.src = "assets/svgs/mute.svg";
    } else {
        volumeImg.src = "assets/svgs/volume.svg";
    }
});



// Volume range colorer
document.querySelector('.my-range').addEventListener('input', function () {
    this.style.setProperty('--value', this.value + '%');
});
document.querySelector('.volume').addEventListener('click', function () {
    let thiss = document.querySelector(".my-range")
    thiss.style.setProperty('--value', thiss.value + '%');
});



// Controlling the visibility of the volume range
document.querySelector('.volume').addEventListener('click', function () {
    const rangeElement = document.querySelector('.range');
    if (rangeElement.style.visibility === 'hidden') {
        rangeElement.style.visibility = 'visible';
    } else {
        rangeElement.style.visibility = 'hidden';
    }
});

}

main();

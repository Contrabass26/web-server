const CORRECT_FADE_LENGTH = 200;
const CORRECT_STAY_LENGTH = 1000;
const CORRECT_DELAY = 100;

let selected = 0;
let userGuess = Array(8).fill(" ");
let correct = null;
let animationStart = null;

function updateGuessCanvas() {
    let guessCanvas = document.getElementById("guess");
    if (guessCanvas.getContext) {
        // Draw stuff
        const context = guessCanvas.getContext("2d");
        context.clearRect(0, 0, guessCanvas.width, guessCanvas.height);
        context.fillStyle = "#e6edf3";
        context.font = "48px Mona Sans";
        for (let i = 0; i < 8; i++) {
            // Box
            context.lineWidth = selected === i ? 6 : 4;
            let x = 5 + 90 * i;
            context.strokeStyle = "#e6edf3";
            context.beginPath();
            context.roundRect(x, 5, 80, 100, 5);
            context.stroke();
        }
        // Overlay for (in)correct answer
        if (correct != null) {
            let frame = new Date().getTime() - animationStart;
            if (frame >= CORRECT_DELAY * 8 + CORRECT_FADE_LENGTH + CORRECT_STAY_LENGTH) {
                correct = null;
                animationStart = null;
            } else {
                for (let i = 0; i < 8; i++) {
                    let progress = frame - i * CORRECT_DELAY;
                    if (progress >= 0) {
                        if (progress <= CORRECT_FADE_LENGTH) {
                            let opacity = progress / CORRECT_FADE_LENGTH;
                            context.fillStyle = correct ? `rgba(57, 136, 116, ${opacity})` : `rgba(130, 4, 4, ${opacity})`
                        } else if (progress <= CORRECT_FADE_LENGTH + CORRECT_STAY_LENGTH) {
                            context.fillStyle = correct ? "rgb(57, 136, 116)" : "rgb(130, 4, 4)"
                        } else {
                            continue;
                        }
                        let x = 5 + 90 * i;
                        context.beginPath();
                        context.roundRect(x, 5, 80, 100, 5);
                        context.stroke();
                        context.fill();
                    }
                }
                requestAnimationFrame(updateGuessCanvas)
            }
        }
        // Text
        for (let i = 0; i < 8; i++) {
            let x = 5 + 90 * i;
            let textWidth = context.measureText(userGuess[i]).width;
            context.strokeStyle = "#e6edf3";
            context.fillStyle = "#e6edf3";
            context.fillText(userGuess[i], x + 40 - textWidth / 2, 5 + 65);
        }
    }
}

function onLoad(pPossibilities) {
    let possibilities = JSON.parse(pPossibilities);
    console.log(possibilities);
    let guess = possibilities[0].guess;
    let feedback = possibilities[0].feedback;
    let answer = possibilities[0].answer;
    const informationCanvas = document.getElementById("information");
    if (informationCanvas.getContext) {
        // Draw stuff
        const context = informationCanvas.getContext("2d");
        context.lineWidth = 4;
        context.font = "48px Mona Sans";
        for (let i = 0; i < 8; i++) {
            let x = 5 + 90 * i;
            // Box
            context.fillStyle = feedback[i] === "G" ? "#398874" : "#820458";
            context.strokeStyle = "#e6edf3";
            context.beginPath();
            context.roundRect(x, 5, 80, 100, 5);
            context.stroke();
            context.fill();
            // Text
            context.fillStyle = "#e6edf3";
            let textWidth = context.measureText(guess[i]).width;
            context.fillText(guess[i], x + 40 - textWidth / 2, 5 + 65);
        }
    }

    const guessCanvas = document.getElementById("guess");
    if (guessCanvas.getContext) {
        // Draw stuff
        const context = guessCanvas.getContext("2d");
        for (let i = 0; i < 8; i++) {
            context.lineWidth = i === 0 ? 6 : 4;
            let x = 5 + 90 * i;
            context.strokeStyle = "#e6edf3";
            context.beginPath();
            context.roundRect(x, 5, 80, 100, 5);
            context.stroke();
        }
    }

    guessCanvas.addEventListener("click", function(event) {
        if (guessCanvas.contains(event.target)) {
            let canvasPos = guessCanvas.getBoundingClientRect();
            let relativeX = event.x - canvasPos.x;
            selected = Math.min(Math.floor((relativeX - 5) / 90), 7);
            updateGuessCanvas();
        }
    })

    document.addEventListener("keydown", function(event) {
        if ("0123456789+-*/=".includes(event.key)) {
            userGuess[selected] = event.key;
            for (let i = selected + 1; i <= 7; i++) {
                if (userGuess[i] === " ") {
                    selected = i;
                    break;
                }
            }
            updateGuessCanvas();
        }
        if (event.key === "ArrowLeft" && selected > 0) {
            selected--;
            updateGuessCanvas();
        }
        if (event.key === "ArrowRight" && selected < 7) {
            selected++;
            updateGuessCanvas();
        }
        if (event.key === "Backspace") {
            userGuess[selected] = " ";
            if (selected > 0) {
                selected--;
            }
            updateGuessCanvas();
        }
        if (event.key === "Enter") {
            let promise = sha1(userGuess.join(""));
            promise.then(function (finalGuess) {
                correct = finalGuess === answer;
                animationStart = new Date().getTime();
                updateGuessCanvas();
            });
        }
    });
}

async function sha1(str) {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-1', enc.encode(str));
  return Array.from(new Uint8Array(hash))
    .map(v => v.toString(16).padStart(2, '0'))
    .join('');
}
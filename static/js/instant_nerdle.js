const FADE_LENGTH = 200;
const DELAY = 50;
const TITLE_BASE_TEXT = "Instant Nerdle"

let currentProblem = 0;
let problems = Array(10);
let selected = 0;
let userGuess = Array(8).fill(" ");
let correct = null;
let animationStart = null;
let intervalId = null;
let timer = null;

function updateGuessCanvas() {
    let guessCanvas = document.getElementById("guess");
    if (guessCanvas.getContext) {
        // Draw stuff
        const context = guessCanvas.getContext("2d");
        context.clearRect(0, 0, guessCanvas.width, guessCanvas.height);
        // Overlay for (in)correct answer
        if (correct != null) {
            let frame = new Date().getTime() - animationStart;
            if (frame >= DELAY * 8 + FADE_LENGTH * 2) {
                if (correct) {
                    if (currentProblem !== -1) {
                        currentProblem++;
                        if (currentProblem < 10) {
                            onLoad(null);
                        } else if (currentProblem === 10) {
                            stopTimer();
                            document.getElementById("nerdle-title").innerText = `${TITLE_BASE_TEXT} - ${Math.floor(timer / 60)}:${timer % 60} - ${currentProblem}/10`
                            currentProblem = -1;
                            userGuess = new Array(8).fill(" ");
                        }
                    }
                }
                correct = null;
                animationStart = null;
            } else {
                for (let i = 0; i < 8; i++) {
                    let progress = frame - i * DELAY;
                    if (progress >= 0) {
                        if (progress <= FADE_LENGTH * 2) {
                            let opacity = progress / FADE_LENGTH;
                            opacity = 1 - Math.abs(opacity - 1);
                            context.fillStyle = correct ? `rgba(57, 136, 116, ${opacity})` : `rgba(130, 4, 4, ${opacity})`
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
        // Boxes
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

function startTimer() {
    timer = 600;
    intervalId = setInterval(decrementTimer, 1000);
}

function stopTimer() {
    clearInterval(intervalId);
    intervalId = null;
}

function decrementTimer() {
    timer--;
    if (timer <= 0) {
        stopTimer();
    }
    document.getElementById("nerdle-title").innerText = `${TITLE_BASE_TEXT} - ${Math.floor(timer / 60)}:${timer % 60} - ${currentProblem}/10`
}

function onLoad(pPossibilities) {
    if (pPossibilities != null) {
        currentProblem = 0;
        problems = JSON.parse(pPossibilities);
        console.log(problems);
        startTimer();
    }
    selected = 0;
    userGuess = Array(8).fill(" ");
    let guess = problems[currentProblem].guess;
    let feedback = problems[currentProblem].feedback;
    let answer = problems[currentProblem].answer;
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

    if (pPossibilities != null) {
        guessCanvas.addEventListener("click", function (event) {
            if (guessCanvas.contains(event.target)) {
                let canvasPos = guessCanvas.getBoundingClientRect();
                let relativeX = event.x - canvasPos.x;
                selected = Math.min(Math.floor((relativeX - 5) / 90), 7);
                updateGuessCanvas();
            }
        })

        document.addEventListener("keydown", function (event) {
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
            if (event.key === "Enter" && intervalId != null) {
                let promise = sha1(userGuess.join(""));
                promise.then(function (finalGuess) {
                    correct = finalGuess === answer;
                    animationStart = new Date().getTime();
                    updateGuessCanvas();
                });
            }
        });
    }
}

async function sha1(str) {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-1', enc.encode(str));
  return Array.from(new Uint8Array(hash))
    .map(v => v.toString(16).padStart(2, '0'))
    .join('');
}
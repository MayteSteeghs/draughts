//const ws = new WebSocket("ws://localhost:3000")
//ws.addEventListener("open", () => console.log("We are connected!"))

document.getElementById("resign").addEventListener("click", () => ws.send("RESIGN"))

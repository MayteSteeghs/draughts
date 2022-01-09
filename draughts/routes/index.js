const router = require("express").Router()
const root = "./public"

/* GET home page */
router.get("/", (_, res) => res.sendFile("splash.html", { root: root }))
router.get("/play", (_, res) => res.sendFile("game.html", { root: root }))

module.exports = router

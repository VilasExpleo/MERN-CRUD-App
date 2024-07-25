//Load env Variable
// if (process.env.NODE_ENV != "production") {
// 	require("dotenv").config
// }
require("dotenv").config
// import dependencies
const express = require("express")
const connectToDb = require("./config/connectToDb")
const Note = require("./models/node")

// Create an express app

const app = express()

//Configure an express app
app.use(express.json())

//connect To Database
connectToDb()

//Routing
app.get("/", (req, res) => {
	res.json({ Writing: "hello" })
})

app.get("/notes", async (req, res) => {
	//fetch data
	const notes = await Note.find()
	//respose data
	res.json({ data: notes })
})

app.get("/notes/:id", async (req, res) => {
	//fetch data
	const notes = await Note.find()
	//respose data
	res.json({ data: notes })
})

app.post("/notes", async (req, res) => {
	//Get the sent the in data off request body
	const title = req.body.title
	const body = req.body.body
	//Create a note with it
	const note = await Note.create({
		title: title,
		body: body,
	})

	res.json({ note: note })
	//respond with the new
})

//Start Our
app.listen(3000)

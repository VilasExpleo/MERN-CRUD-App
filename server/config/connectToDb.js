// getting-started.js
const mongoose = require("mongoose")
//Load env Variable
if (process.env.NODE_ENV != "production") {
	require("dotenv").config
}

async function connectToDb() {
	try {
		await mongoose.connect(
			"mongodb+srv://jvilas10:o5NuZTxCydBx2Iql@cluster0.78nqiry.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
		)
		console.log("Connect to database")
	} catch (err) {
		console.log(err)
	}
}

module.exports = connectToDb

//npm modules
const express = require('express')
const cors = require('cors')
//my modules
const ctrl = require('../ctrls/mainCtrl')
//
//Establish app()
const app = express()
const port = process.env.PORT || 5555
//Middleware(s)
app.use(express.json())
   .use(express.urlencoded({ extended: true }))
   .use(express.static(__dirname + '/public'))
   .use(cors())
//
//Routes (View)
app.get('/welcomeMsg/:id', ctrl.welcomeMsg)
app.get('/getPlaylists/:id', ctrl.getPlaylists)
app.get('/tracksOfPL/:id&:pl_id', ctrl.tracksOfPL)
app.get('/UsersTopArtists/:id', ctrl.UsersTopArtists)
app.get('/getHistory/:id', ctrl.getHistory)
//
//Routes (Functionality)
app.get('/makePLbyArtist/:id&:art_id', ctrl.makePLbyArtist)
app.post('/mergeMyPlaylists/:id', ctrl.mergeMyPlaylists)
//
//Run the server
app.listen(port,
   () => console.log(`Express server ready on port: ${port}`))
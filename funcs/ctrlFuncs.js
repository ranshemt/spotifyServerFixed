/**
 * @ctrlFuncs .js
 * implementations of controller functions
 * on error all functions will return object:
 * {statusCode, message, uri}
 * (will be used by mainCtrl)
 */
const User = require ('../DB/user')
const rp = require ('request-promise')
const tFuncs = require ('../funcs/toolFuncs')
const uFuncs = require ('../funcs/utilFuncs')
//
//return {un, img}
async function _welcomeMsg (uid){
return new Promise(async (resolve, reject) => {
    try{
        let foundUser = await User.findOne({id: uid}).exec()
        if(!foundUser)
            return reject(tFuncs.handleMongo404('id'))
        let JSONuser = JSON.parse(JSON.stringify(foundUser))
        let name, img = '#'
        if(JSONuser.hasOwnProperty('img'))
            img = JSONuser.img
        if(JSONuser.hasOwnProperty('name'))
            name = JSONuser.name
        else
            return reject(tFuncs.handleMongoNoProp('name'))
        return resolve({un: name, img})
    }
    catch(err){
        return reject(tFuncs.handleMongoErr(err))
    }
})}
//
//return {playlists: [{id, name, img}]}
async function _getPlaylists(uid, AT){
return new Promise(async (resolve, reject) => {
    //Spotify API call
    let body
    try{
        let url_api = `https://api.spotify.com/v1/users/${uid}/playlists`
        let options = {
            url: url_api,
            headers: { 'Authorization': 'Bearer ' + AT },
            json: true
        }
        body = await rp(options)
    }
    catch(err){
        return reject(tFuncs.handleSpotifyErr(err))
    }
    //
    let playlists = body.items.map((item, i) => ({
        id: item.hasOwnProperty('id') ? item.id : `error_playlist_id.${i}`,
        name: item.hasOwnProperty('name') ? item.name : `error_playlist_name.${i}`,
        img: (item.hasOwnProperty('images') && item.images.length > 0) ? item.images[0].url : '#'
    }))
    return resolve({playlists})
})}
//
//return {tracks: [{id, name, artistArr [], artists}]}
async function _tracksOfPL(pl_id, AT){
return new Promise(async (resolve, reject) => {
    //Spotify API call
    let body
    try{
        let url_api = `https://api.spotify.com/v1/playlists/${pl_id}/tracks`
        let options = {
            url: url_api,
            headers: { 'Authorization': 'Bearer ' + AT },
            json: true
        }
        body = await rp(options)
    }
    catch(err){
        return reject(tFuncs.handleSpotifyErr(err))
    }
    //including validation to prevent undefined / null pointer
    let tracks = body.items.map((item, i) => ({
        id: (item.hasOwnProperty('track') && item.track.hasOwnProperty('id')) ? item.track.id : `error_track_id.${i}`,
        name: (item.hasOwnProperty('track') && item.track.hasOwnProperty('name')) ? item.track.name : `error_track_name.${i}`,
        artistsArr: (item.hasOwnProperty('track') && item.track.hasOwnProperty('artists')) ? item.track.artists.map(item => item.name) : [],
        artists: (item.hasOwnProperty('track') && item.track.hasOwnProperty('artists')) ? item.track.artists.map(item => item.name).join(', ') : 'no artists for track'
    }))
    return resolve(tracks)
})}
//
//return {artists: [id, name, popu]}
async function _UsersTopArtists(AT){
return new Promise(async (resolve, reject) => {
    //Spotify API call
    let body
    try{
        let url_api = 'https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=5'
        let options = {
            url: url_api,
            headers: { 'Authorization': 'Bearer ' + AT },
            json: true
        }
        body = await rp(options)
    }
    catch(err){
        return reject(tFuncs.handleSpotifyErr(err))
    }
    //
    let artists = body.items.map((item, i) => ({
        id: item.hasOwnProperty('id') ? item.id : `error_artist_id.${i}`,
        name: item.hasOwnProperty('name') ? item.name : `error_artist_name.${i}`,
        popu: item.hasOwnProperty('popularity') ? item.popularity : `error_artist_popularity.${i}`
    }))
    return resolve(artists)
})}
//
//return {len, history[{}]}
async function _getHistory(uid){
return new Promise(async (resolve, reject) => {
    try{
        let foundUser = await User.findOne({id: uid}).exec()
        if(!foundUser)
            return reject(tFuncs.handleMongo404('id'))
        let JSONuser = JSON.parse(JSON.stringify(foundUser))
        let history = {
            len: JSONuser.hasOwnProperty('history') ? JSONuser.history.length : 0,
            history: JSONuser.hasOwnProperty('history') ? [...JSONuser.history] : []
        }
        return resolve(history)
    }
    catch(err){
        return reject(tFuncs.handleMongoErr(err))
    }
})}
//
//return {name, id, length, historyErr, error?}
async function _makePLbyArtist(uid, art_id, AT){
return new Promise(async (resolve, reject) => {
    //artist name
    let art_name
    try{
        art_name = await uFuncs.getArtName(art_id, AT)
    }
    catch(err){
        return reject(err)
    }
    //top tracks
    let topTracks
    try{
        topTracks = await uFuncs.artistTopTracks(art_id, AT)
    }
    catch(err){
        return reject(err)
    }
    //new playlist
    let pl_name = `${art_name.name} top tracks`
    let pl_desc = `This playlist is based on ${art_name.name} with ${topTracks.tracks.length} top tracks`
    let pl_body = {name: pl_name, description: pl_desc}
    let newPL
    try{
        newPL = await uFuncs.newEmptyPL(uid, pl_body, AT)
    }
    catch(err){
        return reject(err)
    }
    //add tracks uris to playlist
    let tracksURIS = topTracks.tracks.map(item => `spotify:track:${item}`)
    let snapID
    try{
        snapID = await uFuncs.addToPL(newPL.id, {uris: tracksURIS}, AT)
    }
    catch(err){
        return reject(err)
    }
    //add command to history
    try{
        let historyObj = {
            command: 3,
            desc: `${art_name.name} top tracks new playlist`,
            pl_1: newPL.id,
            art_id,
            art_name: art_name.name
        }
        await uFuncs.addHistory(uid, historyObj)
    }
    catch(err){
        return resolve({
            name: pl_name,
            id: newPL.id,
            length: tracksURIS.length,
            historyErr: true,
            error: err
        })
    }
    return resolve({
        name: pl_name,
        id: newPL.id,
        length: tracksURIS.length,
        historyErr: false,
    })
})}
//
//return {pl1_id, pl2_id, pl_new, pl_length, historyCommand}
async function _mergeMyPlaylists(uid, bodyObj, AT){
return new Promise(async (resolve, reject) => {
    //validate body object
    let pl1_id   = bodyObj.hasOwnProperty('pl1_id'  ) ? bodyObj.pl1_id   : null
    let pl2_id   = bodyObj.hasOwnProperty('pl2_id'  ) ? bodyObj.pl2_id   : null
    let pl1_name = bodyObj.hasOwnProperty('pl1_name') ? bodyObj.pl1_name : null
    let pl2_name = bodyObj.hasOwnProperty('pl2_name') ? bodyObj.pl2_name : null
    let newPL_name = bodyObj.hasOwnProperty('newPL_name') ? bodyObj.newPL_name : null
    if(pl1_id == null || pl2_id == null || pl1_name == null || pl2_name == null){
        let msg = `[${f_name} FAILED with message --body object invalid--]`
        return reject(tFuncs.handleSelfNoProp('body request incorrect'))
    }
    //tracks of 1 playlist
    let pl1_tracks
    try{
        pl1_tracks = await _tracksOfPL(pl1_id, AT)
    }
    catch(err){
        return reject(err)
    }
    //tracks of 2 playlists
    let pl2_tracks
    try{
        pl2_tracks = await _tracksOfPL(pl2_id, AT)
    }
    catch(err){
        return reject(err)
    }
    //create merged uris & name
    let mergedPL = pl1_tracks.map(item => `spotify:track:${item.id}`)
    mergedPL.concat(pl2_tracks.map(item => `spotify:tracks${item.id}`))
    if(newPL_name === null){
        newPL_name = pl1_name.replace(/ .*/, '') + pl2_name.replace(/ .*/, '')
    }
    let newPL_desc = `This playlist with ${mergedPL.length} tracks is a copy (merged) of 2 playlists:`
    newPL_desc += ` ${pl1_name} & ${pl2_name}. Created using Spotify service for REST course`
    //create new playlist
    let newPL_ID
    try{
        newPL_ID = await uFuncs.newEmptyPL(uid, {name: newPL_name, description: newPL_desc}, AT)
    }
    catch(err){
        return reject(err)
    }
    //add uris to new playlist
    let snapID
    try{
        snapID = await uFuncs.addToPL(newPL_ID.id, {uris: mergedPL}, AT)
    }
    catch(err){
        return reject(err)
    }
    //add to history
    try{
        let historyObj = {
            command: 1,
            desc: `${newPL_name} new merged playlist`,
            pl1_id,
            pl2_id,
            pl_newL: newPL_ID,
            pl_length: mergedPL.length
        }
        await uFuncs.addHistory(uid, historyObj)
    }
    catch(err){
        return resolve({
            name: newPL_name,
            id: newPL_ID.id,
            length: mergedPL.length,
            historyErr: true,
            error: err
        })
    }
    return resolve({
        name: newPL_name,
        id: newPL_ID.id,
        length: mergedPL.length,
        historyErr: false,
    })
})}
//
//
module.exports = {
    _welcomeMsg,
    _getPlaylists,
    _tracksOfPL,
    _UsersTopArtists,
    _getHistory,
    _makePLbyArtist,
    _mergeMyPlaylists
}
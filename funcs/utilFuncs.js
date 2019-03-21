/**
 * @utilFuncs .js
 * implementations of utilities functions
 * will be used by ctrlFuncs
 * on error all functions will return object:
 * {statusCode, message, uri}
 */
const User = require ('../DB/user')
const rp = require ('request-promise')
const tFuncs = require ('./toolFuncs')
//
//return {historyObj}
async function addHistory(uid, bodyObj){
return new Promise(async (resolve, reject) => {
    let r = {command: 0}
    //verify body object
    if(!bodyObj.hasOwnProperty('command')){
        return reject(tFuncs.handleMongoNoProp('command'))
    }
    r.command = bodyObj.command
    if(bodyObj.hasOwnProperty('desc'       )) r.desc       = bodyObj.desc
    if(bodyObj.hasOwnProperty('pl_1'       )) r.pl_1       = bodyObj.pl_1
    if(bodyObj.hasOwnProperty('pl_2'       )) r.pl_2       = bodyObj.pl_2
    if(bodyObj.hasOwnProperty('pl_new'     )) r.pl_new     = bodyObj.pl_new
    if(bodyObj.hasOwnProperty('uid_shares' )) r.uid_shares = bodyObj.uid_shares
    if(bodyObj.hasOwnProperty('art_id'     )) r.art_id     = bodyObj.art_id
    if(bodyObj.hasOwnProperty('art_name'   )) r.art_name   = bodyObj.art_name
    //
    try{
        let updatedUser = await User.findOneAndUpdate({id: uid}, {$push: {history: r}}).exec()
        if(!updatedUser)
            return reject(tFuncs.handleMongo404('id'))
    }
    catch(err){
        return reject(tFuncs.handleMongoErr(err))
    }
    return resolve(r)
})}
//
//return {tracks: []}
async function artistTopTracks(art_id, AT){
return new Promise(async (resolve, reject) => {
    //Spotify API call
    let body
    try{
        let api_url = 'https://api.spotify.com/v1/artists/' + art_id + '/top-tracks?country=IL'
        let options = {
            url: api_url,
            headers: { 'Authorization': 'Bearer ' + AT },
            json: true
        }
        body = await rp(options)
    }
    catch(err){
        return reject(tFuncs.handleSpotifyErr(err))
    }
    let r = {tracks: []}
    let tracks = body.tracks.map(trackObj => trackObj.id)
    return resolve({tracks})
})}
//
//bodyObj {name?, description?, public?, collaborative?}
//return  {id, name}
async function newEmptyPL(uid, bodyObj, AT){
return new Promise(async (resolve, reject) => {
    //validate body object
    const name          = bodyObj.hasOwnProperty('name'         ) ? bodyObj.name          : "default name"
    const public        = bodyObj.hasOwnProperty('public'       ) ? bodyObj.public        : true
    const collaborative = bodyObj.hasOwnProperty('collaborative') ? bodyObj.collaborative : false
    const description   = bodyObj.hasOwnProperty('description'  ) ? bodyObj.description   : "some nice description"
    //Spotify API call
    let body
    try{
        let api_uri = `https://api.spotify.com/v1/users/${uid}/playlists`
        let options = {
            method: 'POST',
            uri: api_uri,
            headers: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + AT
            },
            body: {name, public, collaborative, description},
            json: true
        }
        body = await rp(options)
    }
    catch(err){
        return reject(tFuncs.handleSpotifyErr(err))
    }
    let newPL = {}
    newPL.id   = body.hasOwnProperty('id'  ) ? body.id   : 'no id for new playlist'
    newPL.name = body.hasOwnProperty('name') ? body.name : 'no name for new playlist'
    return resolve(newPL)
})}
//
//bodyObj {uris: [?, ?..]}
//return {snapshot_id}
async function addToPL(pl_id, bodyObj, AT){
return new Promise(async (resolve, reject) => {
    //body object data
    let default_track = ["spotify:track:1JLLDS0KN1ITeYL9ikHKIr"]
    const uris = bodyObj.hasOwnProperty('uris') ? bodyObj.uris : default_track
    //Spotify API call
    let body
    try{
        let api_uri = `https://api.spotify.com/v1/playlists/${pl_id}/tracks`
        let options = {
            method: 'POST',
            uri: api_uri,
            headers: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + AT
            },
            body: {uris},
            json: true
        }
        body = await rp(options)
    }
    catch(err){
        return reject(tFuncs.handleSpotifyErr(err))
    }
    //
    let r = {}
    r.snapshot_id = body.hasOwnProperty('snapshot_id') ? body.snapshot_id   : 'error_snapshot_id'
    return resolve(r)
})}
//
//return {name}
async function getArtName(art_id, AT){
return new Promise(async (resolve, reject) => {
    //Spotify API call
    let body
    try{
        let api_url = `https://api.spotify.com/v1/artists/${art_id}`
        let options = {
            url: api_url,
            headers: { 'Authorization': 'Bearer ' + AT },
            json: true
        }
        body = await rp(options)
    }
    catch(err){
        return reject(tFuncs.handleSpotifyErr(err))
    }
    let r = {}
    r.name = body.hasOwnProperty('name') ? body.name : 'name not found'
    return resolve(r)
})}
//
//return {name}
async function updateUserDB(bodyObj, AT, RT) {
return new Promise(async (resolve, reject) => {
    let img = '#', id, name
    //validate body object
    if(bodyObj.hasOwnProperty('images') && bodyObj.images.length > 0)
        img = bodyObj.images[0].url
    if(bodyObj.hasOwnProperty('id'))
        id = bodyObj.id
    else
        return reject(tFuncs.handleSelfNoProp('id'))
    if(bodyObj.hasOwnProperty('name'))
        name = bodyObj.name
    else
        return reject(tFuncs.handleSelfNoProp('name'))
    //
    try{
        let updatedUser = await User.findOneAndUpdate(
            {id},
            {$set: {id, name, img, AT, RT}},
            {upsert: true})
            .exec()
        if(!updatedUser)
            return reject(tFuncs.handleMongo404('id'))
    }
    catch(err){
        return reject(tFuncs.handleMongoErr(err))
    }
    return resolve({name})
})}
//
//
module.exports = {
    addHistory,
    artistTopTracks,
    newEmptyPL,
    addToPL,
    getArtName,
    updateUserDB
}
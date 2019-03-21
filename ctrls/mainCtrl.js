/**
 * @mainCtrl .js
 * implementations of api routes using ctrlFuncs!
 * on error all functions will return object:
 * {statusCode, message, uri}
 */
const cFuncs = require ('../funcs/ctrlFuncs')
const aFuncs = require ('../funcs/authFuncs')
//
//GET
var welcomeMsg = async (req, res, next) => {
    const {id = null} = req.params
    //
    try{
        let msg = await cFuncs._welcomeMsg(id)
        return res.status(200).json(msg)
    }
    catch(err){
        return res.status(err.statusCode).json(err)
    }
}
//
//GET
var getPlaylists = async (req, res, next) => {
    const {id = null} = req.params
    let AT, playlists
    //
    try{
        AT = await aFuncs.getValidAT(id)
    }
    catch(err){
        return res.status(err.statusCode).json(err)
    }
    //
    try{
        playlists = await cFuncs._getPlaylists(id, AT.AT)
    }
    catch(err){
        return res.status(err.statusCode).json(err)
    }
    return res.status(200).json(playlists)
}
//
//GET
var tracksOfPL = async (req, res, next) => {
    const {id = null} = req.params
    const {pl_id = null} = req.params
    let AT, tracks
    //
    try{
        AT = await aFuncs.getValidAT(id)
    }
    catch(err){
        return res.status(err.statusCode).json(err)
    }
    //
    try{
        tracks = await cFuncs._tracksOfPL(pl_id, AT.AT)
    }
    catch(err){
        return res.status(err.statusCode).json(err)
    }
    return res.status(200).json(tracks)
}
//
//GET
var UsersTopArtists = async (req, res, next) => {
    const {id = null} = req.params
    let AT, artists
    //
    try{
        AT = await aFuncs.getValidAT(id)
    }
    catch(err){
        return res.status(err.statusCode).json(err)
    }
    //
    try{
        artists = await cFuncs._UsersTopArtists(AT.AT)
    }
    catch(err){
        return res.status(err.statusCode).json(err)
    }
    return res.status(200).json(artists)
}
//
//GET
var getHistory = async (req, res, next) => {
    const {id = null} = req.params
    let history
    try{
        history = await cFuncs._getHistory(id)
    }
    catch(err){
        return res.status(err.statusCode).json(err)
    }
    return res.status(200).json(history)
}
//
//GET
var makePLbyArtist = async (req, res, next) => {
    const {id = null} = req.params
    const {art_id = null} = req.params
    let AT, newPL
    //
    try{
        AT = await aFuncs.getValidAT(id)
    }
    catch(err){
        return res.status(err.statusCode).json(err)
    }
    //
    try{
        newPL = await cFuncs._makePLbyArtist(id, art_id, AT.AT)
    }
    catch(err){
        return res.status(err.statusCode).json(err)
    }
    return res.status(200).json(newPL)
}
//
//POST
var mergeMyPlaylists = async (req, res, next) => {
    const {id = null} = req.params
    let body = req.body
    let AT, newPL
    //
    try{
        AT = await aFuncs.getValidAT(id)
    }
    catch(err){
        return res.status(err.statusCode).json(err)
    }
    //
    try{
        newPL = await cFuncs._mergeMyPlaylists(id, body, AT.AT)
    }
    catch(err){
        return res.status(err.statusCode).json(err)
    }
    return res.status(200).json(newPL)
}
//
//
module.exports = {
    welcomeMsg,
    getPlaylists,
    tracksOfPL,
    UsersTopArtists,
    getHistory,
    makePLbyArtist,
    mergeMyPlaylists
}
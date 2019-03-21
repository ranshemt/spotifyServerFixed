/** 
 * @loginCtrl .js
 * implementations of login routes
 */
const querystring = require('querystring')
const rp = require ('request-promise')
const uFuncs = require ('../funcs/utilFuncs')
const tFuncs = require ('../funcs/toolFuncs')
//scope requesting access to
let playlists_scope = 'playlist-read-private playlist-modify-private playlist-modify-public playlist-read-collaborative'
let history_scope = 'user-top-read user-read-recently-played'
let user_scope = 'user-read-email user-read-private'
let library_scope = 'user-library-modify user-library-read'
let SCOPE = playlists_scope + ' ' + history_scope + ' ' + user_scope + ' ' + library_scope
//
let stateKey = 'spotify_auth_state'
//
//
var loginRoute = async (req, res, next) => {
    let state = tFuncs.generateRandomString(16)
    res.cookie(stateKey, state)
    // your application requests authorization
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            client_id: process.env.client_id,
            response_type: 'code',
            redirect_uri: process.env.redirect_uri,
            state,
            scope: SCOPE,
            show_dialog: true
    }))
}
//
//
var callbackRoute = async (req, res, next) => {
    // your application requests refresh and access tokens
    // after checking the state parameter
    let code = req.query.code || null
    let state = req.query.state || null
    let storedState = req.cookies ? req.cookies[stateKey] : null
    //
    if (state === null || state !== storedState) {
        console.log(`state = ${state}. storedState = ${storedState}`)
        console.log(`error: state_mismatch`)
        res.redirect(process.env.client_uri + '/Err');
    }
    //Spotify API call
    let body
    try{
        res.clearCookie(stateKey);
        let options = {
            method: 'POST',
            uri: 'https://accounts.spotify.com/api/token',
            form: {
                grant_type: 'authorization_code',
                code,
                redirect_uri: process.env.redirect_uri
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(process.env.client_id + ':' + process.env.client_secret).toString('base64'))
            },
            json: true
        }
        body = await rp(options)
    }
    catch(err){
        console.log(tFuncs.handleSpotifyErr(err))
        res.redirect(process.env.client_uri + '/Err')
    }
    //
    try{
        let updatedUser_func = await uFuncs.updateUserDB(body, body.access_token, body.refresh_token)
        //for validation pass the data to querystring
        res.redirect(process.env.client_uri + 'App/UID=' + body.id)
    }
    catch(err){
        console.log(JSON.stringify(err))
        res.redirect(process.env.client_uri + '/Err')
    }
}
//
//
module.exports = {
    loginRoute,
    callbackRoute
}
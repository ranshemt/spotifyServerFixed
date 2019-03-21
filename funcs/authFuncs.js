/** 
 * @authFuncs .js
 * implementations of tokens authentication functions
 * on error all functions will return object
 * {statusCode, message, uri}
 */
const tFuncs = require ('./toolFuncs')
const User = require ('../DB/user')
const rp = require ('request-promise')
//type needs to be String 'AT' / 'RT'
//success: return {AT} / {RT}
async function getTokenDB(type, uid){
return new Promise(async (resolve, reject) => {
    try{
        let foundUser = await User.findOne({id: uid}).exec()
        if(!foundUser)
            return reject(tFuncs.handleMongo404('id'))
        //
        let JSONuser = JSON.parse(JSON.stringify(foundUser))
        if(JSONuser.hasOwnProperty(type)){
            let successObj = {}
            successObj[type] = foundUser[type]
            return resolve(successObj)
        }
        else { return reject(tFuncs.handleMongoNoProp(type))}
    }
    catch(err){
        return reject(tFuncs.handleMongoErr(err))
    }
})}
//
//creates new AT for user and updates it in DB
//success: return {AT}
async function makeNewAT(uid){
return new Promise(async (resolve, reject) => {
    //get RT
    let token, body
    try{
        token = await getTokenDB('RT', uid)
    }
    catch(err){
        return reject(err)
    }
    //Spotify API call
    try{
        let options = {
            method: 'POST',
            uri: 'https://accounts.spotify.com/api/token',
            form: {
                grant_type: 'refresh_token',
                refresh_token: token.RT
            },
            headers: {
                'Authorization' : 'Basic ' + (new Buffer.from(process.env.client_id + ':' + process.env.client_secret).toString('base64'))
            },
            json: true
        }
        body = await rp(options)
    }
    catch(err){
        return reject(tFuncs.handleSpotifyErr(err))
    }
    let newAT = body.access_token
    //update in DB
    try{
        let updatedUser = User.updateOne({id: uid}, {$set: {AT: newAT}}).exec()
        if(!updatedUser)
            return reject(tFuncs.handleMongo404('id'))
    }
    catch(err){
        return reject(tFuncs.handleMongoErr(err))
    }
    return resolve({AT: newAT})
})}
//
//
async function getValidAT(uid){
return new Promise(async (resolve, reject) => {
    //check this link
    //ALSO: reduce the time by 5 seconds to prevent token expiration while working
    //https://stackoverflow.com/questions/30826726/how-to-identify-if-the-oauth-token-has-expired
    try{
        let ATobj = await makeNewAT(uid)
        return resolve(ATobj)
    }
    catch(err){
        return reject(err)
    }
})}
//
//
module.exports = {
    getTokenDB,
    makeNewAT,
    getValidAT
}
/**
 * @toolFuncs .js
 * implementations of error handling functions
 * and more tools
 */
var isObj = function(variable){
    if(typeof variable === 'object' && !Array.isArray(variable))
        return true
    return false
}
function handleSpotifyErr(errObj){
    let statusCode  = errObj.hasOwnProperty('statusCode') ? errObj.statusCode : 500
    let message     = errObj.hasOwnProperty('message'   ) ? errObj.message    : 'err: no message property'
    let uri = 'spotify API call'
    if(errObj.hasOwnProperty('options') && errObj.options.hasOwnProperty('uri'))
        uri = errObj.options.uri
    return {
        statusCode,
        message,
        uri
    }
}
function handleMongoErr(errVal){
    let statusCode  = 500
    let uri = 'mongoose query'
    let message = 'unknow error'
    if(isObj(errVal)){
        if(errVal.hasOwnProperty('statusCode'))
            statusCode = errVal.statusCode
        if(errVal.hasOwnProperty('message'))
            message = errVal.message
    }
    else{
        message = errVal
    }
    return {
        statusCode,
        message,
        uri
    }
}
function handleMongo404(propToCheck = 'unknownProp'){
    return {
        statusCode: 404,
        message:`not found in mongoDB when checking for property: ${propToCheck}`,
        uri: 'mongo query'
    }
}
function handleMongoNoProp(prop){
    return {
        statusCode: 500,
        message: `property not found: ${prop}`,
        uri: 'mongo query'
    }
}
function handleSelfNoProp(prop){
    return {
        statusCode: 500,
        message: `property not found: ${prop}`,
        uri: 'self API function'
    }
}
function generateRandomString(length) {
    let text = ''
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for(let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}
module.exports = {
    isObj,
    handleSpotifyErr,
    handleMongo404,
    handleMongoErr,
    handleMongoNoProp,
    handleSelfNoProp,
    generateRandomString
}
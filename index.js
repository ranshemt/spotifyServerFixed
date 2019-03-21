if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
    require ('./DB/db_connection')
    require ('./devOnly/serverDev')
}
else{
    require ('./DB/db_connection')
    require ('./server')
}
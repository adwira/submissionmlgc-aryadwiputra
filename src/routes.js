const { predictResult, getAll } = require('./handlers')

const routes = [
    {
        method : 'POST',
        path : '/predict',
        handler : predictResult,
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                maxBytes: 10000000, // Maksimum payload 10MB
                
                // Mengembalikan data dalam bentuk buffer
            }
        },
    }
]

module.exports = routes;
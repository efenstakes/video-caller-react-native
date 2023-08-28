// const jwt = require('jsonwebtoken')
const jwt = require("jwt-decode")

export const authenticate = (token) => {
    console.log()
    console.log("token ", token)
    console.log()
    console.log("process.env.ACCESS_TOKEN_SECRET ")
    console.log(process.env.ACCESS_TOKEN_SECRET)
    console.log()
    try {
        const payload = jwt(token)
    //   const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
      console.debug('payload ', payload['account'])
      return JSON.parse(payload['account'])
    } catch(e) {
        console.log("an error occurred while verifying token ", e)
        return null
    }
}


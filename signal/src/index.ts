import cors from "cors"
import express from "express"
import { createServer } from "http"
import morgan from "morgan"
import { Server } from "socket.io"
import dotenv from 'dotenv'
// import { authenticate } from "./utils/auth"


// load environment variables
dotenv.config()


// store this in redis or an appropriate db
let users: string[] = []


// create server
const app = express()
const httpServer = createServer(app)

// create socket io server
const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
})


app.use(cors())
app.use(morgan('combined'))
app.use(express.json())


// console.log("process.env.ACCESS_TOKEN_SECRET ", process.env.ACCESS_TOKEN_SECRET)
// authenticate("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50Ijoie1wiaWRcIjpcIjY0OTA4YjEzN2ZhMDExYWUxNDI4MmVhM1wiLFwiY3JlYXRlZF9hdFwiOlwiMjAyMy0wNi0xOVQxNzowNjoyNy43NzMyMDMzWlwiLFwidXBkYXRlZF9hdFwiOlwiMjAyMy0wNi0xOVQxNzowNjoyNy43NzMyMDMzWlwiLFwibmFtZVwiOlwiTGlzYSBLZXlzXCIsXCJwYXNzd29yZFwiOlwiXCIsXCJlbWFpbFwiOlwibGlzYUBtYWlsLmNvbVwiLFwic2x1Z1wiOlwiTGlzYS1LZXlzXCIsXCJqb2luZWRPblwiOlwiXCIsXCJ1cGRhdGVkT25cIjpcIlwiLFwibGFzdEFjdGl2ZVwiOlwiXCIsXCJibG9ja2VkXCI6W119IiwiaXNzIjoiTWVzc2VuZ2VyIiwiZXhwIjoxNjg5Nzg2Mzg4fQ.ZNuX4nyhTO4RENDzjKkYGy9W1rNmbo9VmyEsikPL9Ls")


app.post("/a", (req, res) => {
    const token = req.body.token
    // const user = authenticate(token)

    res.json({
        token,
        // user,
    })
})

app.get("/users", (req, res) => {
    
    res.json({
        users,
    })
})


// when user connects the first time,..
// we can authenticate them using
//          socket.handshake.auth
//      we can add a token jwt in { token: "JWT" }
//      and get it using 
//          socket.handshake.auth.token
// we check if valid then call next or
// call next(error) with any error otherwise
// in this case we just get users id, which we call callerId
// no auth is done but this can be added later
io.use((socket, next) => {
    console.log("socket.handshake ", socket.handshake.auth)
    // console.log("socket.handshake ", (socket.handshake as any)?.name)
    
    if( socket.handshake.auth.token ) {
        const token = socket.handshake.auth.token
        // const user = authenticate(token)

        if( !token ) {
            console.log("Inner No token found")
            next(new Error("No token found"))
        }
        
        // authenticate(token)
        // socket['user'] = socket.handshake.query.callerId
        socket['owner'] = token
        socket['user'] = token
        next()
    } else {
        console.log("No token found")
        next(new Error("No token found"))
    }
})

// listen for socket connections & events
io.on('connection', (socket)=> {
    console.log("new connection on socker server user is ", socket['user'])

    if( !users.includes(socket['user']) ) {
        
        users.map((user)=> {
            
            io.to(user).emit("new-user", { user: socket['user'], })
        })
        users.push(socket['user'])
    }

    socket.join(socket['user'])

    io.to(socket['user']).emit("server-check", { message: "hola" })
    
    // when we get a call to start a call
    socket.on('check-in', ({ message })=> {
        console.log("client checking in from  ", socket['user'], " message ", message)

        io.to(socket['user']).emit("server-check-reply", { message: "hola" })
    })

    // when we get a call to start a call
    socket.on('start-call', ({ to, offer })=> {
        console.log("initiating call request to ", to, " from  ", socket['user'])
        console.log("starting call with offer ", offer)

        io.to(to).emit("incoming-call", { from: socket['user'], offer })
    })

    // when an incoming call is accepted
    socket.on("accept-call", ({ to, answer })=> {
        console.log("call accepted by ", socket['user'], " from ", to)

        io.to(to).emit("call-accepted", { to, answer, })
    })
    
    // when an incoming call is denied
    socket.on("deny-call", ({ to })=> {
        console.log("call denied by ", socket['user'], " from ", to)

        io.to(to).emit("call-denied", { from: socket['user'] })
    })
    
    // when a party leaves the call
    socket.on("end-call", ({ to })=> {
        console.log("left call mesg by ", socket['user'], " from ", to)

        io.to(to).emit("left-call", { from: socket['user'] })
    })

    // when an incoming call is accepted,..
    // caller sends their webrtc offer
    socket.on("offer", ({ to, offer })=> {
        console.log("offer from ", socket['user'], " to ", to)

        io.to(to).emit("offer", { to, offer })
    })

    // when an offer is received,..
    // receiver sends a webrtc offer-answer
    socket.on("offer-answer", ({ to, answer })=> {
        console.log("offer answer from ", socket['user'], " to ", to)

        io.to(to).emit("offer-answer", { to, answer })
    })
    

    // when an ice candidate is sent
    socket.on("ice-candidate", ({ to, candidate })=> {
        console.log("ice candidate from ", socket['user'], " to ", to)

        io.to(to).emit("ice-candidate", { to, candidate })
    })
    
    // when message sent
    socket.on("send-message", ({ to, text })=> {
        const from = socket['user']
        console.log("ice candidate from ", socket['user'], " to ", to)

        io.to(to).emit("incoming-message", { from, to, text, })
    })


    // when a socker disconnects
    socket.on("disconnect", (reason)=> {
        users = users.filter((u)=> u != socket['user'])

        users.map((user)=> {
            
            io.to(user).emit("user-left", { user: socket['user'], })
        })
        console.log("a socker disconnected ", socket['user'])
    })

})



// create index route endpoint
app.get('/', (_req, res) => {
    res.json({
        server: 'Signal #T90',
        running: true,
    })
})


// get server port
const PORT = process.env.PORT || 8088

// start server
httpServer.listen(PORT, ()=> {
    console.log(`listening on port ${PORT}`)
})


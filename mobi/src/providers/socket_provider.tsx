import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';

import { io } from 'socket.io-client';
import { SERVER_URL } from '../utility/constants';


// Create the context
export const SocketContext = createContext({
    socket: null,
    setSocketName: (v)=> {},
    connect: (n)=> {},
})

const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState(null)
    const [name, setName] = useState(null)


    const setSocketName = (na)=> {
        setName(na)
        // connect(na)
    }

    const connect = useCallback(
        (name)=> {
            console.log("connect to sockets with name ", name)
            let soc = (io as any).connect(SERVER_URL, {
                auth: { token: name }
            })
            soc?.connect()
            setSocket(soc)
        },
        []
    )


    // Retrieve user data from local storage on initial render
    useEffect(() => {
        
        if( name && name.trim() != null ) {
            connect(name)
        }
    }, [ name ])

    
    const value = useMemo(
        () => ({ socket, setSocketName, connect, }), 
        [socket, setSocketName, connect, ]
    )
    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    )
}

export default SocketProvider




// import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';

// import { io } from 'socket.io-client';


// // Create the context
// export const SocketContext = createContext({
//     socket: null,
//     connect: (n)=> {},
//     setSocketName: (v)=> {}
// })


// const SocketProvider = ({ children }: { children: React.ReactNode }) => {
//     const [socket, setSocket] = useState(null)
//     const [name, setName] = useState(null)


//     const setSocketName = (na)=> {
//         setName(na)
//         // connect(na)
//     }

//     const connect = useCallback(
//         (name)=> {
//             console.log("connect to sockets with name ", name)
//             let soc = (io as any).connect("https://b965-105-163-2-229.ngrok-free.app", {
//                 auth: { token: name }
//             })
//             soc?.connect()
//             setSocket(soc)
//         },
//         []
//     )

//     // Retrieve user data from local storage on initial render
//     useEffect(() => {
        
//         if( name && name.trim() != null ) {
//             connect(name)
//         }
//     }, [ name ])

    
//     const value = useMemo(
//         () => ({ socket, setSocketName, connect, }), 
//         [socket, setSocketName, connect]
//     )
//     return (
//         <SocketContext.Provider value={value}>
//             {children}
//         </SocketContext.Provider>
//     )
// }

// export default SocketProvider

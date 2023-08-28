import React, { createContext, useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { SocketContext } from './socket_provider';



// Create the context
export const ProfileContext = createContext({
    name: null,
    isLoading: true,
    hasError: false,
    updateName: (u)=> {},
})

const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [hasError, setHasError] = useState<boolean>(false)
    const [name, setName] = useState<string>(null)

    const { setSocketName, } = useContext(SocketContext)

    // Function to update user data
    const updateName = (name) => {
        setName(name)
        setIsLoading(false)
        setSocketName(name)
    }

    
    const value = useMemo(
        () => ({ name, updateName, isLoading, hasError, }), 
        [name, isLoading, hasError, updateName, ]
    )
    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    )
}

export default ProfileProvider



// import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';



// // Create the context
// export const ProfileContext = createContext({
//     name: null,
//     receiver: null,
//     isLoading: true,
//     hasError: false,
//     updateName: (u)=> {},
//     updateReceiver: (u)=> {},
// })


// const ProfileProvider = ({ children }: { children: React.ReactNode }) => {

//     const [isLoading, setIsLoading] = useState<boolean>(true)
//     const [hasError, setHasError] = useState<boolean>(false)
//     const [name, setName] = useState<string>(null)
//     const [receiver, setReceiver] = useState<string>(null)

//     // Function to update user data
//     const updateName = (name) => {
//         setName(name)
//         setIsLoading(false)
//     }

//     // Function to update user data
//     const updateReceiver = (name) => {
//         setReceiver(name)
//         setIsLoading(false)
//     }


    
//     const value = useMemo(
//         () => ({ name, receiver, updateName, updateReceiver, isLoading, hasError, }), 
//         [name, receiver, isLoading, hasError, updateName, updateReceiver, ]
//     )
//     return (
//         <ProfileContext.Provider value={value}>
//             {children}
//         </ProfileContext.Provider>
//     )
// }

// export default ProfileProvider

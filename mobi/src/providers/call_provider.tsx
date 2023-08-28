import React, { createContext, useState, useMemo, } from 'react';


type CallInfoType = {
    receiver?: string
    offer?: string
    isCaller?: boolean
    isIncoming?: boolean
}

// Create the context
export const CallContext = createContext({
    receiver: null,
    offer: null,
    hasIncomingCall: false,
    isCaller: false,
    setCallInfo: (o: { receiver: any, offer: any, isCaller: boolean, isIncoming: boolean, })=> {},
    endCall: ()=> {},
    updateReceiver: (v)=> {},
    updateIsCaller: (v)=> {},
    updateOffer: (v)=> {},
})

const CallProvider = ({ children }: { children: React.ReactNode }) => {
    const [receiver, setReceiver] = useState(null)
    const [offer, setOffer] = useState(null)
    const [hasIncomingCall, setHasIncomingCall] = useState(false)
    const [isCaller, setIsCaller] = useState(false)


    const endCall = ()=> {
        setReceiver(null)
        setHasIncomingCall(false)
        setOffer(null)
    }

    const setCallInfo = ({ receiver, offer, isCaller = false, isIncoming = false }: CallInfoType)=> {
        console.log("set receiver to ", receiver)
        setReceiver(receiver)

        if( offer ) {
            setOffer(offer)
        }
        
        setHasIncomingCall(isIncoming)
        setIsCaller(isCaller)
    }

    const updateReceiver = (r)=> {
        setReceiver(r)
    }

    const updateIsCaller = (r)=> {
        setIsCaller(r)
        setHasIncomingCall(!r)
    }

    const updateOffer = (r)=> {
        setOffer(r)
    }


    const value = useMemo(
        () => ({ setCallInfo, receiver, offer, hasIncomingCall, endCall, isCaller, updateReceiver, updateIsCaller, updateOffer, }), 
        [setCallInfo, receiver, offer, hasIncomingCall, endCall, isCaller, updateReceiver, updateIsCaller, updateOffer, ]
    )
    return (
        <CallContext.Provider value={value}>
            {children}
        </CallContext.Provider>
    )
}

export default CallProvider

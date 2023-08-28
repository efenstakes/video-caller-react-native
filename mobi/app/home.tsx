import { StyleSheet, Text, TouchableHighlight, TouchableOpacity, View, } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'

import Ionicons from '@expo/vector-icons/Ionicons';

import { ProfileContext } from '../src/providers/profile_provider';
import { SocketContext } from '../src/providers/socket_provider';
import { FlatList, } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { CallContext } from '../src/providers/call_provider';
import { SERVER_URL } from '../src/utility/constants';


const Home = () => {
    const router = useRouter()
    const [users, setUsers] = useState([])

    const { name, } = useContext(ProfileContext)
    const { socket, } = useContext(SocketContext)
    const { receiver, setCallInfo, hasIncomingCall, endCall, } = useContext(CallContext)


    useEffect(() => {

        getUsers()
    }, [])

    const getUsers = async ()=> {
        const req = await fetch(`${SERVER_URL}/users`)
        const data = await req.json()

        console.log('====================================');
        console.log("got users data ", data)
        console.log('====================================');
        setUsers([ ...data.users.filter((u)=> u != name) ])
    }

    useEffect(() => {
        if( !socket ) {
            console.log("no socket")
            return
        }

        socket.on('new-user', ({ user, })=> {
            console.log('====================================');
            console.log("new user ", user);
            console.log('====================================');
            
            setUsers([ ...users, user ])
        });

        socket.on('user-left', ({ user, })=> {
            console.log('====================================');
            console.log("a user left ", user);
            console.log('====================================');
            
            setUsers((state)=> {

                return state.filter((u)=> u != user)
            })
        });

        socket.on('connect', (data)=> {
            console.log("connected with data ", data)
        })

        socket.on('disconnect', (data)=> {
            console.log("disconnected with data ", data)
        })

        socket.on('incoming-call', ({ from: receiver, offer, })=> {
            console.log('====================================');
            console.log('====================================');
            console.log('====================================');
            console.log("incoming call from ", receiver, offer)
            console.log('====================================');
            console.log('====================================');
            console.log('====================================');

            setCallInfo({ offer, receiver, isCaller: false, isIncoming: true, })
        });


        return () => {
            socket.off('connect', null);
            socket.off('disconnect', null);
            
            socket.off('incoming-call', null);

            socket.off('server-check', null);
            socket.off('server-check-reply', null);
        };
    }, [socket])

    const startCall = (receiver)=> {

        console.log('====================================');
        console.log("call ", receiver);
        console.log('====================================');

        setCallInfo({ offer: null, receiver: receiver, isCaller: true, isIncoming: false, })
        router.push("/call")
    }

    const rejectCall = ()=> {
        console.log("reject call now")
        socket?.emit("deny-call", { to: receiver, })
        endCall()
    }

    const acceptCall = ()=> {
        console.log("accept call now")
        router.push("/call")
    }


    return (
        <View style={styles.screen}>
            
            {
                users.length > 0 &&
                    <Text style={styles.title1}>
                        Pals { receiver}
                    </Text>   
            }

            {
                hasIncomingCall &&
                    <IncomingCallScreen name={receiver} onAccept={acceptCall} onReject={rejectCall} />
            }

            <FlatList
                data={users}
                renderItem={
                    ({ item })=> {

                        return (
                            <TouchableHighlight
                                style={styles.userCard}
                                onPress={()=> startCall(item)}
                            >
                                <Text> {item} </Text>
                            </TouchableHighlight>
                        )
                    }
                }
                ListEmptyComponent={
                    ()=> {

                        return <NoPals />
                    }
                }
                ItemSeparatorComponent={
                    ()=> {

                        return (
                            <View style={styles.vSpace} />
                        )
                    }
                }
            />
        </View>
    )
}


const NoPals = ()=> {

    return (
        <View style={styles.noPalsContainer}>

            <Text style={styles.noPalsContainerTitle}>
                No Pals Are Online Now.
            </Text>

            <Text style={styles.noPalsContainerText}>
                Maybe you can tell them to hop in telepathically, or call a magician to see what they can do 😂. I could keep you company but bye.
            </Text>

        </View>
    )
}

const IncomingCallScreen = ({ name, onAccept, onReject, })=> {

    return (
        <View style={styles.incomingCallContainer}>

            <Text style={{ ...styles.title1, ...styles.incomingCallTitle }}> {name} </Text>
            <Text style={styles.incomingCallText}> Is calling.. </Text>

            {/* ctas */}
            <View style={styles.ctas}>
                <TouchableOpacity onPress={onAccept} style={{ ...styles.iconButton, ...styles.acceptCallIconButton }}>
                    <Ionicons name="md-call-outline" size={24} color="white" />
                </TouchableOpacity>

                <TouchableOpacity onPress={onReject} style={{ ...styles.iconButton, ...styles.denyCallIconButton }}>
                    <Ionicons name="md-call-outline" size={24} color="white" />
                </TouchableOpacity>

            </View>
            
        </View>
    )
}

export default Home

const styles = StyleSheet.create({

    
    screen: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },

    container: {
        width: '100%',

    },

    textInput: {
        borderColor: '#1e1e1e',
        borderWidth: 1,
        borderRadius: 4,
        // width: '100%',
        paddingHorizontal: 10,
        paddingVertical: 4,
    },

    vSpace: {
        marginTop: 40,
    },

    ctas: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },

    denyCallButton: {},

    title1: {
        fontSize: 32,
    },

    localStreamView: {
        position: 'absolute',
        bottom: '5%',
        right: '5%',
        zIndex: 10,
        backgroundColor: 'teal',
        overflow: 'hidden',
        // width: 200,
        // height: 200,
        borderRadius: 6,
    },

    remoteStreamView: {
        backgroundColor: '#1e1e1e',
        flex: 1,
        height: 800,
        justifyContent: 'center',
        alignItems: 'center',
    },

    noRemoteStreamText: {
        color: 'white',
    },

    userCard: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderColor: '#1e1e1e',
        borderWidth: 1,
    },

    incomingCallContainer: {
        position: 'absolute',
        top: '1%',
        left: 16,
        right: 16,
        paddingVertical: 24,
        paddingTop: 12,
        backgroundColor: '#1e1e1e',
        borderRadius: 12,

        alignItems: 'center',

        zIndex: 200,
    },

    incomingCallTitle: {
        color: 'whitesmoke',
    },

    incomingCallText: {
        color: 'whitesmoke',
    },

    iconButton: {
        padding: 12,
        borderRadius: 200,
    },

    acceptCallIconButton: {
        backgroundColor: 'darkgreen',
    },

    denyCallIconButton: {
        backgroundColor: 'tomato',
    },


    noPalsContainer: {
        justifyContent: 'center',
        alignItems: 'center',

        paddingVertical: 20,
        paddingHorizontal: 12,

        backgroundColor: 'tomato',
        borderRadius: 10,

        alignSelf: 'center',
        marginTop: '60%',
    },

    noPalsContainerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: 'white',
    },

    noPalsContainerText: {
        color: 'white',
        textAlign: 'center',
    },

})

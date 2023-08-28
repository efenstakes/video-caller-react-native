import {  StyleSheet, Text,TouchableOpacity, View, useWindowDimensions } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    RTCPeerConnection,
    RTCView,
    mediaDevices,
    RTCIceCandidate,
    RTCSessionDescription,
} from 'react-native-webrtc';

import { ProfileContext } from '../src/providers/profile_provider';
import { SocketContext } from '../src/providers/socket_provider';
import { ScrollView } from 'react-native-gesture-handler';
import { CallContext } from '../src/providers/call_provider';
import { useRouter } from 'expo-router';


const configuration = {
    iceServers: [
      {
        urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
      },
    ],
    iceCandidatePoolSize: 10,
}
const Home = () => {
    const router = useRouter()
    const {width, height,} = useWindowDimensions()
    const { name, } = useContext(ProfileContext)
    const { receiver, offer, setCallInfo, hasIncomingCall, isCaller, endCall: endCallInProvider, } = useContext(CallContext)
    const { socket, } = useContext(SocketContext)

    
    const localStream = useRef(null)
    // const [localStream, setLocalStream] = useState(null)
    const [remoteStream, setRemoteStream] = useState(null);


    // const localPC = new RTCPeerConnection(configuration);
    const cachedLocalPC = useRef(new RTCPeerConnection(configuration))

    const [isMuted, setIsMuted] = useState(false)
    const [isShowingFrontView, setIsShowingFrontView] = useState(true)
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [events, setEvents] = useState([]);


    useEffect(() => {
        console.log("Fist useEffect socket is ", socket)

        checkPeerConnection()

        cachedLocalPC.current.oniceconnectionstatechange = () => {
            if (cachedLocalPC.current.iceConnectionState === 'disconnected' || cachedLocalPC.current.iceConnectionState === 'failed') {
                // Remote user disconnected
                console.log('====================================');
                console.log("Remote user disconnected");
                console.log('====================================');

                endCallCb()
            }
          };

        if( !socket ) {
            console.log("no socket")
            // return
            router.back()
        }

        socket.on('connect', (data)=> {
            console.log("connected with data ", data)
        });
        socket.on('disconnect', (data)=> {
            console.log("disconnected with data ", data)
        })

        // Listen for remote answer
        socket.on("call-accepted", async ({ answer })=> {
            console.log('====================================');
            console.log('====================================');
            console.log('====================================');
            console.log("from ", receiver, " to ", name)
            console.log("call accepted answer ", answer)
            console.log('====================================');
            console.log('====================================');
            console.log('====================================');

            setEvents((state)=> {
                return [
                    ...state, "Call accepted by "+ receiver
                ]
            })

            try {
                if( cachedLocalPC.current.signalingState == "stable" ) {
                    console.log("we already are stable ")
                    setEvents((state)=> {
                        return [
                            ...state, "Stability achieved in call-accepted "
                        ]
                    })
                    return
                }
                const rtcSessionDescription = new RTCSessionDescription(answer);
                await cachedLocalPC.current.setRemoteDescription(rtcSessionDescription)

                setEvents((state)=> {
                    return [
                        ...state, "call accept set remote description "
                    ]
                })
            } catch (e) {
                console.log('====================================');
                console.log('====================================');
                console.log('====================================');
                console.log("Error setting remote description ", e)
                console.log('====================================');
                console.log('====================================');
                console.log('====================================');

                setEvents((state)=> {
                    return [
                        ...state, "Error in call accept setting remote description "
                    ]
                })

            }
        })

        socket?.on("call-denied", ({ from })=> {

            console.log('====================================');
            console.log("call ended by ", from);
            console.log('====================================');

            endCallCb()
        })


        // when other user leaves
        socket?.on("left-call", ({ from, })=> {

            console.log('====================================');
            console.log("call ended by ", from);
            console.log('====================================');

            endCallCb()
        })
    
        // when answered, add candidates to peer 
        socket.on("ice-candidate", async ({ candidate })=> {
            console.log('====================================');
            console.log('====================================');
            console.log('====================================');
            console.log("useEffect :: got ice-candidate from SIGNAL candidate ", candidate)
            console.log("useEffect :: from ", receiver, " to ", name)
            console.log("useEffect :: cachedLocalPC ", cachedLocalPC)
            console.log('====================================');
            console.log('====================================');
            console.log('====================================');

            setEvents((state)=> {
                return [ ...state, "Got ice candidate from "+ receiver ]
            })

            try {
                // WAS
                // await cachedLocalPC.current.addIceCandidate(new RTCIceCandidate(candidate))
                cachedLocalPC.current.addIceCandidate(new RTCIceCandidate(candidate))
            } catch(e) {

                console.log('====================================');
                console.log('====================================');
                console.log('====================================');
                console.log("useEffect :: Error adding candidate  ", e)
                console.log('====================================');
                console.log('====================================');
                console.log('====================================');

                setEvents((state)=> {
                    return [ ...state, "Got ice candidate Error startCall :: " ]
                })
            }
        })


        // initialize our stream
        startLocalStream({ name: name, receiver, })

        return ()=> {

            socket?.off('connect', null);
            socket?.off('disconnect', null);
            socket?.off("ice-candidate", null)
            
            socket?.off('incoming-call', null);
            socket?.off('call-accepted', null);
            socket?.off('ice-candidate', null);

            socket?.on("left-call", null)

            cachedLocalPC.current?.close()

            if (localStream.current) {
                // Stop tracks before closing the stream
                localStream?.current?.getTracks().forEach(track => track.stop())
                // setLocalStream(null)
                localStream.current = null
            }

            if (remoteStream) {
                // Stop tracks before closing the stream
                remoteStream?.getTracks().forEach(track => track.stop())
                setRemoteStream(null)
            }
        }
    }, [])


    const checkPeerConnection = ()=> {
        if (!cachedLocalPC.current) {
            cachedLocalPC.current = new RTCPeerConnection(configuration);
        }
    }

    const startLocalStream = async ({ name, receiver }) => {
        checkPeerConnection()
        
        try {
            const devices = await mediaDevices.enumerateDevices();

            const facing = isShowingFrontView ? "front" : "environment";
            const videoSourceId = (devices as Array<any>).find(
                (device) => device.kind === "videoinput" && device.facing === facing
            );

            const facingMode = isShowingFrontView ? "user" : "environment";
            const constraints = {
                audio: false,
                video: {
                    mandatory: {
                        minWidth: 500, // Provide your own width, height and frame rate here
                        minHeight: 300,
                        minFrameRate: 30,
                    },
                    facingMode,
                    optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
                },
            };
            const newStream = await mediaDevices.getUserMedia(constraints);
            // setLocalStream(newStream)
            localStream.current = newStream

            setEvents((state)=> {
                return [ ...state, "Created My Stream" ]
            })
            


            console.log('====================================');
            console.log('====================================');
            console.log('====================================');
            console.log("startLocalStream :: about to add tracks to peer connection ", localStream?.current)
            console.log("startLocalStream :: about to add tracks to peer connection ", localStream?.current?.getTracks())
            console.log('====================================');
            console.log('====================================');
            console.log('====================================');

            localStream.current?.getTracks().forEach((track) => {
                
                try {
                    cachedLocalPC.current?.addTrack(track, localStream.current)
                } catch (error) {
                    console.log('====================================');
                    console.log("startLocalStream :: error adding local track ", error);
                    console.log('====================================');
                }
            })

            cachedLocalPC.current.addEventListener("icecandidate", (e: any) => {
                console.log('====================================');
                console.log('====================================');
                console.log('====================================');
                console.log("startLocalStream :: got ice candidate name ", name, " candidate ", e)
                console.log('====================================');
                console.log('====================================');
                console.log('====================================');

                setEvents((state)=> {
                    return [ ...state, "startLocalStream :: got ice candidate name "+ name +" candidate " ]
                })
                if (!e.candidate) {
                    console.log('====================================');
                    console.log('====================================');
                    console.log('====================================');
                    console.log("startLocalStream :: No final candidate!");
                    console.log('====================================');
                    console.log('====================================');
                    console.log('====================================');
                    return;
                }
                
                // send to caller
                socket.emit("ice-candidate", { from: name, to: receiver, candidate: e?.candidate })
            });

            cachedLocalPC.current.ontrack = (e: any) => {
                console.log('====================================');
                console.log('====================================');
                console.log('====================================');
                console.log("startLocalStream :: got remote stream ", e)
                console.log('====================================');
                console.log('====================================');
                console.log('====================================');
                console.log('====================================');
                // const newStream = new MediaStream();
                // e.streams[0].getTracks().forEach((track) => {
                //     newStream.addTrack(track);
                // });
                // setRemoteStream(newStream);

                setEvents((state)=> {
                    return [ ...state, "startLocalStream:: Got remote track from "+ receiver ]
                })

                if (e.track.kind === 'video') {
                    setRemoteStream(e.streams[0]);
                }

                // setRemoteStream(e.streams[0])
            };


            if( isCaller ) {

                setEvents((state)=> {
                    return [ ...state, "We the callers, starting call from :: startLocalStream" ]
                })
                startCall(receiver)
            } else {

                setEvents((state)=> {
                    return [ ...state, "We the receivers, join the call from :: startLocalStream" ]
                })
                joinCall({ offer, })
            }
        } catch(e) {

            console.log('====================================');
            console.log('====================================');
            console.log('====================================');
            console.log("startLocalStream error :: could not start stream ", e)
            console.log('====================================');
            console.log('====================================');
            console.log('====================================');
        }
    }


    // caller here
    const startCall = async (receiver) => {
        checkPeerConnection()

        const offer = await cachedLocalPC.current.createOffer(null)
        await cachedLocalPC.current.setLocalDescription(offer)
    
        // start call and send offer over sockets
        socket.emit("start-call", { to: receiver, offer, })

        console.log('====================================');
        console.log('====================================');
        console.log('====================================');
        console.log("startCall :: Call ", receiver, " socket is ", socket)
        console.log('====================================');
        console.log('====================================');
        console.log('====================================');

        setEvents((state)=> {
            return [ ...state, "Making Call to "+ receiver ]
        })
    }


    //join call function
    const joinCall = async ({ offer }) => {
        checkPeerConnection()


        await cachedLocalPC.current.setRemoteDescription(new RTCSessionDescription(offer));

        // create answer
        const answer = await cachedLocalPC.current.createAnswer();
        // set it as my local description
        await cachedLocalPC.current.setLocalDescription(answer);

        // send answer to caller
        socket.emit("accept-call", { answer, from: name, to: receiver })
    }

    
      const switchCamera = async () => {

        if( !localStream.current ) {

            console.log('====================================');
            console.log('====================================');
            console.log('====================================');
            console.log("switchCamera:: Error no localStream  ", localStream.current)
            console.log('====================================');
            console.log('====================================');
            console.log('====================================');
            return
        }

        localStream.current?.getTracks().forEach(track => track.stop());

        // Get the new camera source based on the current camera
        const newCameraSource = isShowingFrontView ? 'environment' : 'user';
        const newStream = await mediaDevices.getUserMedia({ video: { facingMode: newCameraSource }, audio: !isMuted });

        // set new stream
        localStream.current = newStream
        
        setIsShowingFrontView(!isShowingFrontView)
      };
    
      // Mutes the local's outgoing audio
      const toggleMute = () => {
        // if (!remoteStream) {
        //   return;
        // }
        localStream.current?.getAudioTracks().forEach((track) => {
          track.enabled = !track.enabled;
          setIsMuted(!track.enabled);
        });
      };
    
      const toggleCamera = () => {
        if( !localStream.current ) {

            console.log('====================================');
            console.log('====================================');
            console.log("toggleCamera :: no local stream ", localStream.current);
            console.log("toggleCamera ", localStream.current);
            console.log('====================================');
            console.log('====================================');

            return
        }

        console.log('====================================');
        console.log('====================================');
        console.log("toggleCamera ", localStream.current?.getVideoTracks());
        console.log('====================================');
        console.log('====================================');

        const videoTrack = localStream.current?.getVideoTracks()[0]
        videoTrack.enabled = !isCameraOff
        setIsCameraOff(!isCameraOff);

        // localStream.current.getVideoTracks()[0].enabled = false

        console.log('====================================');
        console.log('====================================');
        // console.log("videoTrack ", videoTrack)
        console.log('====================================');
        console.log('====================================');
        // localStream.current?.getVideoTracks().forEach((track) => {
        //   track.enabled = !track.enabled;
        //   setIsCameraOff(!isCameraOff);
        // });
      }
    

    async function endCall() {
        // send end call to other party
        socket?.emit("end-call", { to: receiver, })

        endCallCb()
    }

    const endCallCb = ()=> {
        if (cachedLocalPC.current) {
            const senders = cachedLocalPC?.current.getSenders();
            senders.forEach((sender) => {
              cachedLocalPC.current?.removeTrack(sender);
            });
            cachedLocalPC.current?.close();
        }
    
        // setLocalStream(null)
        localStream.current = null
        setRemoteStream(null)
        // setCachedLocalPC(null)

        // reset call info
        endCallInProvider()
  
        // navigate home
        router.back()
    }


    return (
        <View style={{ ...styles.screen, height, }}>

            {/* logs */}
            <ScrollView style={styles.logsContainer} scrollEnabled>
                
                {/* socket state */}
                <Text>
                    socket state {socket != null ? "Connected" : "Not Connected"}
                </Text>

                {/* my name */}
                <Text>
                    My name {name}
                </Text>

                {/* receivers name */}
                <Text>
                    Receiver name { receiver }
                </Text>

                {/* if we have an incoming call */}
                <Text>
                    hasincoming call { hasIncomingCall ? "True" : "False" }
                </Text>

                {/* if we are the caller */}
                <Text>
                    Are We the callers? { isCaller ? "Yes" : "NO" }
                </Text>


                <Text>
                    WebRTC Events
                </Text>
                {
                    events.map((e, i)=> {

                        return (
                            <Text key={i}>
                                {e}
                            </Text>
                        )
                    })
                }

                {/* height */}
                <Text> Screen Height {height} </Text>


                {
                    remoteStream != null
                        ? <Text>We have remote stream</Text>
                        : <Text>We have no remote stream</Text>
                }

                {
                    !localStream.current &&
                        <Text> No Local Stream </Text>
                }

            </ScrollView>

            {/* remote stream */}
            <View style={{ ...styles.remoteStreamView, height, }}>
                {
                    !remoteStream &&
                        <Text style={styles.noRemoteStreamText}>
                            { isCaller ? `Calling ${receiver}..` : "receiver" }
                        </Text>
                }
                {
                    remoteStream &&
                        <RTCView
                            streamURL={remoteStream.toURL()}
                            // streamURL={null}
                            // style={styles.remoteStreamView}
                            style={{
                                width: '100%',
                                height: '100%',
                            }}
                            objectFit='cover'
                            mirror
                            zOrder={0}
                        />
                }
                {
                    (remoteStream?.getVideoTracks()?.length > 0 && remoteStream?.getVideoTracks()[0].enabled == false) && 
                        <View style={styles.remoteStreamViewVideoPaused}>
                             <Text style={styles.remoteStreamViewVideoPausedText}>
                                { isCaller ? `Calling ${receiver}..` : "receiver" }
                            </Text>
                        </View>
                }
            </View>



            {/* local stream */}
            {
                localStream.current &&
                    <View style={{ ...styles.localStreamView, width: width * .42, height: width * .5, }}>
                        <RTCView
                            streamURL={localStream.current?.toURL()}
                            style={{
                                width: '100%', // width * .4 + 10,
                                height: '100%', // width * .4 + 10,
                                backgroundColor: 'blue',
                                zIndex: 200000,
                            }}
                            zOrder={1}
                            objectFit='cover'
                            mirror={isShowingFrontView}
                        />
                    </View>
            }

            {/* controls */}
            <View style={styles.callControlsContainer}>

                {/* mute / unmute */}
                {/* microphone-off */}
                <TouchableOpacity onPress={toggleMute} style={{ ...styles.iconButton, }}>
                    <MaterialCommunityIcons name={ isMuted ? "microphone-outline" : "microphone-off" } size={18} color="white" />
                </TouchableOpacity>

                {/* close / open video */}
                {/* video-off-outline | video-outline */}
                <TouchableOpacity onPress={toggleCamera} style={{ ...styles.iconButton, }}>
                    <MaterialCommunityIcons name={ isCameraOff ? "video-off-outline" : "video-outline" } size={18} color="white" />
                </TouchableOpacity>

                {/* turn video */}
                <TouchableOpacity onPress={switchCamera} style={{ ...styles.iconButton, }}>
                    <MaterialCommunityIcons name="sync" size={18} color="white" />
                </TouchableOpacity>

                {/* end call */}
                <TouchableOpacity onPress={endCall} style={{ ...styles.iconButton, ...styles.endCallIconButton, }}>
                    <MaterialCommunityIcons name="phone-hangup-outline" size={18} color="white" />
                </TouchableOpacity>

            </View>

            
        </View>
    )
}


export default Home

const styles = StyleSheet.create({

    
    screen: {
        flex: 1,
    },

    logsContainer: {
        position: 'absolute',
        top: '10%',
        left: 16,
        // right: '20%',
        backgroundColor: 'white',
        opacity: .4,
        
        zIndex: 200,
        

        padding: 10,
        borderRadius: 10,
    },

    container: {
        width: '100%',
    },

    vSpace: {
        marginTop: 40,
    },

    localStreamView: {
        position: 'absolute',
        bottom: 72,
        right: 12,
        zIndex: 250000,
        backgroundColor: 'brown',
        overflow: 'hidden',
        // width: 200,
        // height: 200,
        borderRadius: 6,
        // borderRadius: 20,
    },

    remoteStreamView: {
        backgroundColor: '#1e1e1e',
        flex: 1,
        height: 800,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 0,
    },

    noRemoteStreamText: {
        color: 'white',
    },

    callControlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',

        padding: 12,
    },

    iconButton: {
        padding: 12,
        borderRadius: 200,
        backgroundColor: '#1e1e1e',
    },

    switchCameraIconButton: {
        backgroundColor: 'darkgreen',
    },

    endCallIconButton: {
        backgroundColor: 'tomato',
    },

    muteAudioIconButton: {
        backgroundColor: 'tomato',
    },

    unmuteAudioIconButton: {
        backgroundColor: 'tomato',
    },

    remoteStreamViewVideoPaused: {
        width: '100%',
        height: '100%',

        justifyContent: 'center',
        alignItems: 'center',
    },

    remoteStreamViewVideoPausedText: {
        fontWeight: '600',
    },

})

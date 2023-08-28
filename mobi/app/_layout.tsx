import React from 'react'
import { Stack } from 'expo-router/stack'
import SocketProvider from '../src/providers/socket_provider'
import ProfileProvider from '../src/providers/profile_provider'
import CallProvider from '../src/providers/call_provider'

const AppLayout = () => {
    return (
        <ProfileProvider>
            <SocketProvider>
                <CallProvider>
                    <Stack>
                        
                        <Stack.Screen name="index" options={{ headerShown: false }} />
                        <Stack.Screen
                            name="home"
                            options={{
                                headerTitle: 'My Friends',
                                headerTitleAlign: 'center',
                            }}
                        />
                        <Stack.Screen
                            name="call"
                            options={{
                                headerShown: false,
                            }}
                        />
                        
                    </Stack>
                </CallProvider>
            </SocketProvider>
        </ProfileProvider>
    )
}

export default AppLayout

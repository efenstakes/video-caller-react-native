import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useContext, useState } from 'react'
import { useRouter } from 'expo-router'
import { ProfileContext } from '../src/providers/profile_provider'
import { SocketContext } from '../src/providers/socket_provider'


function getRandomItem(arr) {

    // get random index value
    const randomIndex = Math.floor(Math.random() * arr.length);

    // get random item
    const item = arr[randomIndex];

    return item;
}

const suggestedNames = [
"Amy", "Ben", "Eva", "Joe", "Ana", "Max", "Sue", "Leo", "Mia", "Sam",
  "Zoe", "Jay", "Eli", "Kim", "Dan", "Lia", "Tim", "Joy", "Jon", "May",
  "Raj", "Ava", "Art", "Meg", "Ian", "Liv", "Pam", "Cal", "Jax", "Kay",
  "Kai", "Ray", "Ada", "Lux", "Lou", "Jon", "Roy", "Ken", "Nat", "Eve",
  "Ali", "Ari", "Tom", "Sky", "Ann", "Leo", "Ivy", "Ben", "Zia", "Gus"
]


const Index = () => {
    const router = useRouter()
    const [name, setName] = useState(getRandomItem(suggestedNames))
    const { updateName, } = useContext(ProfileContext)
    const {setSocketName } = useContext(SocketContext)


    const goToHome = ()=> {
        updateName(name)
        setSocketName(name)
        console.log("go")
        router.replace("/home")
    }

    return (
        <View style={styles.screen}>

            <Text style={styles.text}> Hola </Text>
            <Text style={styles.name}> {name} </Text>
            <TextInput
                value={name}
                placeholder='Enter Name'
                onChangeText={
                    (e)=> setName(e)
                }
                placeholderTextColor="white"
                style={styles.textInput}
            />

            <View
                style={{
                    marginTop: 40,
                }}
            />
            <Pressable style={styles.button} onPress={goToHome}>
                <Text style={styles.buttonText}>
                    Proceed
                </Text>
            </Pressable>
            
        </View>
    )
}

export default Index

const styles = StyleSheet.create({

    screen: {
        flex: 1,
        paddingHorizontal: 16,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1e1e1e',
    },

    text: {
        color: 'white',
        fontSize: 24,
        marginTop: 12,
    },

    name: {
        color: 'white',
        fontSize: 64,
        // marginTop: 12,
        marginBottom: 24,
        textTransform: 'capitalize',
    },

    textInput: {
        borderColor: 'white',
        color: 'white',
        borderWidth: 1,
        borderRadius: 4,
        width: '100%',
        paddingHorizontal: 10,
        paddingVertical: 8,
    },

    button: {
        width: '100%',
        backgroundColor: 'teal',
        padding: 10,

        borderRadius: 6,
    },

    buttonText: {
        textAlign: 'center',
        fontWeight: '600',
        color: 'white',
    }

})
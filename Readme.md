# React Native Expo WebRTC App

The code in this repo consists of the components required to build a fully functional webrtc app in react native.

## 🚀 Mobi

This folder contains the mobile application. It uses the latest version of expo and socket io for websockets. To start it run:

```sh
npx expo start --dev-client
```


If you want to reproduce my work to perhaps rebuild your own version, run (to create a new expo app):

```sh
npx create-expo-app -e with-router
```


## Signal

This folder contains the server that powers the mobile application. It uses the latest version of typescript, nodejs and socket io for websockets. To start it run:

```sh
yarn dev
```

## 📝 Todo

Add logic to allow renegotiation after user switches their camera.

Add a golang pion server that can allow group calls.

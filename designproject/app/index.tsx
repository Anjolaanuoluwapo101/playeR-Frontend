import React, { useState, useEffect, useReducer } from "react";
import { ScrollView, View, Text, Button, ActivityIndicator, StyleSheet } from "react-native";
import axios from "axios";

import Form from "@/components/Form";
import { setCookie, getCookie, deleteCookie } from '@/components/Cookies';

export default function Index() {

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [youtubeStatus, setYoutubeStatus] = useState("Login to Youtube")
  const [spotifyStatus, setSpotifyStatus] = useState("Login to Spotify")

  type PlatformType = "spotify" | "youtube" | 0;
  const [dsp, setDsp] = useState<PlatformType>(0)


  useEffect(() => {
    const checkStatus = () => {
      let loginType = "";
      try {

        const statusYT = getCookie('playeRCookieYT')
        if (statusYT) {
          setYoutubeStatus("Logged In On Youtube!");
          loginType = "youtube";
        }

        const statusSF = getCookie('playeRCookieSF')
        if (statusSF) {
          setSpotifyStatus("Logged In On Spotify!");
          loginType = "spotify";
        }

        if (statusSF && statusYT) {
          setLoggedIn(true);
        }
      } catch (err) {
        console.error(`Error logging into ${loginType}:`, err);
      }
    };

    checkStatus(); // Call the async function inside useEffect

  }, [setSpotifyStatus, setYoutubeStatus]);

  const handleSpotifyLogin = async () => {
    return window.location.href = 'http://localhost:8000/spotify/login';
  };

  const handleYoutubeLogin = async () => {
    return window.location.href = 'http://localhost:8000/youtube/auth';
  };



  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }}
        keyboardShouldPersistTaps="handled"
      >

        <Text style={styles.centerComponents}>Playlist Converter</Text>

        <View style={!loggedIn ? [styles.loginButtons, styles.visible] : [styles.loginButtons, styles.hidden]}>
          {loading && <ActivityIndicator size="large" color="#0000ff" />}
          <Button title={spotifyStatus} onPress={handleSpotifyLogin} />
          <Button title={youtubeStatus} onPress={handleYoutubeLogin} />
          <Text>{message}</Text>
        </View>

        <View style={loggedIn ? [styles.loginButtons, styles.visible] : [styles.loginButtons, styles.hidden]}>

          <View style={styles.centerComponents}>
            <Button title="Convert Spotify Playlist To Youtube" onPress={() => { setDsp('spotify') }} />
            <Button title="Convert Youtube Playlist To Spotify" onPress={() => { setDsp('youtube') }} />
          </View>

          < View>
            <>{dsp ? <Form dsp={dsp} /> : null}</>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  loginButtons: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  centerComponents: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 200
  },
  visible: {
    display: "flex"
  },
  hidden: {
    display: "none"
  },
});

import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  Button,
  ActivityIndicator,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import { Image, type ImageSource } from 'expo-image';
import Form from "@/components/Form";
import { getCookie } from "@/components/Cookies";
import Conversion  from "@/components/Conversion";

const youtubeLogo = require('@/assets/images/youtubelogo.png');
const spotifyLogo = require('@/assets/images/spotifylogo.png');

/**
 * The `Index` component serves as the main entry point for the application.
 * It provides functionality for user authentication, animations, and navigation
 * between different views (e.g., menu, conversion results, and playlist conversion forms).
 *
 * @component
 *
 * @returns {JSX.Element} The rendered component.
 *
 * @remarks
 * - This component uses React hooks (`useState`, `useEffect`) for state management and side effects.
 * - It includes animations using the `Animated` API from React Native.
 * - The component dynamically updates its UI based on the user's authentication status and selected options.
 *
 * @state
 * - `loading` (`boolean`): Indicates whether a loading spinner should be displayed.
 * - `message` (`string`): Stores a message for potential future use.
 * - `loggedIn` (`boolean`): Tracks whether the user is logged in to both Spotify and YouTube.
 * - `showTab` (`boolean`): Determines whether the "View Conversions" tab is displayed.
 * - `youtubeStatus` (`string`): Displays the user's YouTube login status.
 * - `spotifyStatus` (`string`): Displays the user's Spotify login status.
 * - `dsp` (`"spotify" | "youtube" | 0`): Tracks the selected digital service provider for playlist conversion.
 *
 * @animations
 * - `fadeAnim` (`Animated.Value`): Controls the fade-in effect for the title text.
 * - `buttonScale` (`Animated.Value`): Controls the scaling effect for button press animations.
 *
 * @methods
 * - `checkStatus`: Checks the user's login status for Spotify and YouTube by reading cookies.
 * - `communicateWithParent`: Handles communication with a parent component by processing a response object.
 * - `handleButtonPressIn`: Triggers a scaling animation when a button is pressed.
 * - `handleButtonPressOut`: Reverts the scaling animation when a button is released.
 *
 * @effects
 * - `useEffect`: Runs the `checkStatus` function and triggers the fade-in animation when the `showTab` state changes.
 *
 * @children
 * - Displays login buttons for Spotify and YouTube if the user is not logged in.
 * - Shows playlist conversion options if the user is logged in.
 * - Renders a `Form` component for playlist conversion based on the selected DSP.
 *
 * @dependencies
 * - `getCookie`: Utility function to retrieve cookies for authentication status.
 * - `Form`: A child component used for playlist conversion.
 *
 * @styles
 * - Uses `styles` object for styling various elements, including buttons, text, and containers.
 */
export default function Index() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [showTab, setShowTab] = useState(false);
  const [conversionData, setConversionData] = useState(null);
  const [youtubeStatus, setYoutubeStatus] = useState("Login to Youtube");
  const [spotifyStatus, setSpotifyStatus] = useState("Login to Spotify");
  const [dsp, setDsp] = useState<"spotify" | "youtube" | 0>(0);
  const [theme, setTheme] = useState('dark'); // Theme state
  const styles = theme === 'dark' ? darkStyles : lightStyles;
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [showTag, setShowTag] = useState(false);
  const [jiggleAnim] = useState(new Animated.Value(0));
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [randomMusic, setRandomMusic] = useState<string>("Loading...");
  const musicData = [
    "Song: Blinding Lights - Artist: The Weeknd",
    "Song: Levitating - Artist: Dua Lipa",
    "Song: Peaches - Artist: Justin Bieber",
    "Song: Save Your Tears - Artist: The Weeknd",
    "Song: Stay - Artist: The Kid LAROI & Justin Bieber",
  ];

  // Animations
  const fadeAnim = new Animated.Value(0);
  const buttonScale = new Animated.Value(1);

  // Confirms if a user is logged in....
  const checkStatus = () => {
    try {
      if (getCookie("playeRCookieYT")) {
        setYoutubeStatus("Logged In On Youtube!");
      }else{
        setYoutubeStatus("Login to Youtube");
      }
      if (getCookie("playeRCookieSF")) {
        setSpotifyStatus("Logged In On Spotify!");
      }else{
        setSpotifyStatus("Login to Spotify");
      }

      if (getCookie("playeRCookieYT") && getCookie("playeRCookieSF")) {
        setLoggedIn(true);
      }else{
        setLoggedIn(false)
      }
    } catch (err) {
      console.error("Error checking login:", err);
    }
  };

  useEffect(() => {

    //check for the validity of the cookies at the frontend
    //note that the cookies are not sensitive data but just serves as the period after which the senstive token at the backend as expired.
    setInterval(() => {
      checkStatus();
    }, 2000);
    
    // Fade in effect
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [showTab]);

  // Trigger animation when conversion data changes
  useEffect(() => {
    if (conversionData) {
      setShowTag(true);
      Animated.sequence([
        Animated.timing(jiggleAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(jiggleAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(jiggleAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => setTimeout(() => setShowTag(false), 5000)); // Hide tag after 3 seconds
    }
  }, [conversionData]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * musicData.length);
      setRandomMusic(musicData[randomIndex]);
    }, 3000); // Change music data every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const handleButtonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonClick = (buttonId: string) => {
    setActiveButton(buttonId);
    setTimeout(() => setActiveButton(null), 200); // Reset the active button after 200ms
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.themeToggleButton}
        onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        <Text style={styles.themeToggleText}>
          Switch to {theme === 'dark' ? 'Light' : 'Dark'} Theme
        </Text>
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
          Playlist Converter 🔥
        </Animated.Text>

        <View style={styles.rowContainer}>
          <TouchableOpacity
            style={[
              styles.buttonNoFlex,
              activeButton === "menu" && styles.activeButton,
            ]}
            onPress={() => {
              setShowTab(false);
              handleButtonClick("menu");
            }}
          >
            <Text style={styles.buttonText}>Menu</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.buttonNoFlex,
              activeButton === "viewConversions" && styles.activeButton,
            ]}
            onPress={() => {
              setShowTab(true);
              handleButtonClick("viewConversions");
            }}
          >
            <Text style={styles.buttonText}>View Conversions</Text>
            {showTag && (
              <Animated.View
                style={[
                  styles.tag,
                  { transform: [{ translateX: jiggleAnim }] },
                ]}
              >
                <Text style={styles.tagText}>New!</Text>
              </Animated.View>
            )}
          </TouchableOpacity>
        </View>

          {/* If not logged In  */}
          <View style={!loggedIn && !showTab ? [styles.loginButtons, styles.visible] : [styles.hidden]}>
          {loading && <ActivityIndicator size="large" color="#00ffcc" />}
          <TouchableOpacity
            onPress={() => (window.location.href = "https://player-backend-qz31.onrender.com/spotify/login") } // Use env variable
            // onPress={() => (window.location.href = "http://localhost:8001/spotify/login") } // Use env variable
            
            onPressIn={handleButtonPressIn}
            onPressOut={handleButtonPressOut}
          >
            <Animated.View style={[styles.button, { transform: [{ scale: buttonScale }] }]}>
              <Text style={styles.buttonText}>{spotifyStatus}</Text>
              <Image source={spotifyLogo} style={styles.image} />
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => (window.location.href = "https://player-backend-qz31.onrender.com/youtube/auth")} // Use env variable
            onPressIn={handleButtonPressIn}
            onPressOut={handleButtonPressOut}
          >
            <Animated.View style={[styles.button, { transform: [{ scale: buttonScale }] }]}>
              <Text style={styles.buttonText}>{youtubeStatus}</Text>
              <Image source={youtubeLogo} style={styles.image} />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* The results View */}
        <View style={!showTab ? styles.hidden : styles.visible}>
        <Conversion data={conversionData} ></Conversion>
        </View>

        {/* Once logged in */}
        {(loggedIn && !showTab) && (
          <View style={styles.centerComponents}>
            <TouchableOpacity onPress={() => setDsp("spotify")}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>Convert Spotify Playlist To Youtube</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setDsp("youtube")}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>Convert Youtube Playlist To Spotify</Text>
                <Text></Text>
              </View>
            </TouchableOpacity>

            <View>{dsp ? <Form dsp={dsp} checkStatus={checkStatus} callback1={setConversionData}  /> : null}</View>
          </View>
        )}

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.sectionText}>
            Welcome to Playlist Converter! This platform allows you to seamlessly convert playlists between Spotify and YouTube. Enjoy a smooth and intuitive experience.
          </Text>
        </View>

        {/* Future Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Future Features</Text>
          <Text style={styles.futureFeatureText}>- AI-based playlist recommendations</Text>
          <Text style={styles.futureFeatureText}>- Collaborative playlist editing</Text>
          <Text style={styles.futureFeatureText}>- Integration with Apple Music</Text>
          <Text style={styles.futureFeatureText}>- Offline playlist conversion</Text>
        </View>

        {/* Random Music Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Random Music Data</Text>
          <Text style={styles.randomMusic}>{randomMusic}</Text>
        </View>

        {/* Dropdown Example */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RATE YOUR EXPERIENCE</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setSelectedOption(selectedOption === "Option 1" ? null : "Option 1")}
          >
            <Text style={styles.dropdownText}>OK</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setSelectedOption(selectedOption === "Option 2" ? null : "Option 2")}
          >
            <Text style={styles.dropdownText}>GOOD</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setSelectedOption(selectedOption === "Option 3" ? null : "Option 3")}
          >
            <Text style={styles.dropdownText}>EXCELLENT</Text>
          </TouchableOpacity>
          {selectedOption && (
            <Text style={styles.selectedOption}>You selected: {selectedOption}</Text>
          )}
        </View>

      
      </ScrollView>
    </View>
  );
}

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0d",
  },
  scrollContainer: {
    // flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28, // Larger font size for the main title
    color: "#00ffcc",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 20,
    fontFamily: "Impact",
  },
  loginButtons: {
    alignItems: "center",
  },
  button: {
    backgroundColor: "#111",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#00ffcc",
    shadowColor: "#00ffcc",
    shadowOpacity: 0.6,
    shadowRadius: 10,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  buttonText: {
    fontSize: 16,
    color: "#00ffcc",
    textAlign: "center",
    fontFamily: "Helvetica",
  },
  hidden: {
    display: "none",
  },
  visible: {
    display: "flex",
  },
  centerComponents: {
    alignItems: "center",
  },
  image: {
    width: 30,
    height: 30,
    resizeMode: "cover",
    borderRadius: 18,
    margin: 10,
  },
  rowContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  buttonNoFlex: {
    backgroundColor: "#111",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#00ffcc",
    margin: 7,
    alignItems: 'center',
    justifyContent: "center",
  },
  border: {
    backgroundColor: "#111",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#00ffcc",
  },
  themeToggleButton: {
    backgroundColor: "#111",
    padding: 10,
    borderRadius: 10,
    margin: 10,
    alignItems: 'center',
  },
  themeToggleText: {
    color: "#00ffcc",
    fontSize: 16,
  },
  activeButton: {
    backgroundColor: "#00ffcc",
    borderColor: "#0d0d0d",
  },
  tag: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "#00ffcc",
    padding: 5,
    borderRadius: 5,
    zIndex: 10,
  },
  tagText: {
    color: "#0d0d0d",
    fontSize: 12,
    fontWeight: "bold",
  },
  section: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: "#111",
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 22, // Larger font size for titles
    fontWeight: "bold",
    marginBottom: 10,
    color: "#00ffcc",
    fontFamily: "Arial",
  },
  sectionText: {
    fontSize: 14, // Smaller font size for body text
    color: "#00ffcc",
    lineHeight: 20,
    fontFamily: "Verdana",
  },
  futureFeatureText: {
    fontSize: 16, // Medium font size for feature items
    color: "#007BFF",
    marginBottom: 5,
    fontFamily: "Courier New",
  },
  randomMusic: {
    fontSize: 18, // Slightly larger font for emphasis
    fontStyle: "italic",
    color: "#FF4500",
    fontFamily: "Georgia",
  },
  dropdown: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  dropdownText: {
    fontSize: 16,
    color: "#00ffcc",
    fontFamily: "Tahoma",
  },
  selectedOption: {
    marginTop: 10,
    fontSize: 16,
    color: "#00ffcc",
    fontFamily: "Verdana",
  },
});

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContainer: {
    // flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28, // Larger font size for the main title
    color: "#000000",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 20,
    fontFamily: "Impact",
  },
  loginButtons: {
    alignItems: "center",
  },
  button: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000000",
    shadowColor: "#000000",
    shadowOpacity: 0.6,
    shadowRadius: 10,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  buttonText: {
    fontSize: 16,
    color: "#ffffff",
    textAlign: "center",
    fontFamily: "Helvetica",
  },
  hidden: {
    display: "none",
  },
  visible: {
    display: "flex",
  },
  centerComponents: {
    alignItems: "center",
  },
  image: {
    width: 30,
    height: 30,
    resizeMode: "cover",
    borderRadius: 18,
    margin: 10,
  },
  rowContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  buttonNoFlex: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#000000",
    margin: 7,
    alignItems: 'center',
    justifyContent: "center",
  },
  border: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#000000",
  },
  themeToggleButton: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 10,
    margin: 10,
    alignItems: 'center',
  },
  themeToggleText: {
    color: "#000000",
    fontSize: 16,
  },
  activeButton: {
    backgroundColor: "#000000",
    borderColor: "#ffffff",
  },
  tag: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "#000000",
    padding: 5,
    borderRadius: 5,
    zIndex: 10,
  },
  tagText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  section: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  sectionTitle: {
    fontSize: 22, // Larger font size for titles
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    fontFamily: "Arial",
  },
  sectionText: {
    fontSize: 14, // Smaller font size for body text
    color: "#555",
    lineHeight: 20,
    fontFamily: "Verdana",
  },
  futureFeatureText: {
    fontSize: 16, // Medium font size for feature items
    color: "#007BFF",
    marginBottom: 5,
    fontFamily: "Courier New",
  },
  randomMusic: {
    fontSize: 18, // Slightly larger font for emphasis
    fontStyle: "italic",
    color: "#FF4500",
    fontFamily: "Georgia",
  },
  dropdown: {
    backgroundColor: "#e0e0e0",
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Tahoma",
  },
  selectedOption: {
    marginTop: 10,
    fontSize: 16,
    color: "#007BFF",
    fontFamily: "Verdana",
  },
});

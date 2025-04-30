import { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Platform, // Add Platform import
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { deleteCookie } from "./Cookies";

type PlatformType = "spotify" | "youtube" | 0;
type ModeType = "update" | "create" | null;

type Props = {
  dsp: "spotify" | "youtube" | 0;
  callback1: ({ response }: any) => void;
  checkStatus: () => void;

};

/**
 * A React functional component that renders a dynamic form for creating or updating playlists
 * based on the selected Digital Service Provider (DSP) and user input.
 *
 * @component
 * @param {Props} props - The props object.
 * @param {string} props.dsp - The selected DSP (e.g., "spotify" or "youtube").
 * @param {Function} props.updateParentState - Callback function to update the parent component's state.
 * @param {Function} props.checkStatus - Callback function to check the user's authentication status.
 *
 * @returns {JSX.Element | null} The rendered form component or null if no DSP is selected.
 *
 * @remarks
 * - The form dynamically adjusts its fields based on the selected DSP and mode (create or update).
 * - The component uses React state and animations for smooth transitions.
 * - Form submission triggers API calls to convert playlists between Spotify and YouTube.
 *
 * @example
 * ```tsx
 * <Form
 *   dsp="spotify"
 *   updateParentState={(data) => console.log(data)}
 *   checkStatus={() => console.log("Checking status...")}
 * />
 * ```
 *
 * @typedef {Object} Props
 * @property {string} dsp - The selected DSP.
 * @property {Function} updateParentState - Callback to update parent state.
 * @property {Function} checkStatus - Callback to check authentication status.
 *
 * @typedef {("update" | "create")} ModeType - The mode of the form, either "update" or "create".
 *
 * @typedef {Object} Field
 * @property {string} name - The name of the form field.
 * @property {string} type - The type of the form field (e.g., "text", "textarea", "select").
 *
 * @typedef {Record<string, Field[]>} AllFields
 * A mapping of DSPs to their respective form fields.
 *
 * @function handleChange
 * Updates the form data state when the user modifies a field.
 *
 * @function handleNext
 * Advances to the next form field or submits the form if on the last step.
 *
 * @function handlePrevious
 * Returns to the previous form field.
 *
 * @function handleSubmitSF
 * Submits the form data to the Spotify-to-YouTube conversion API.
 *
 * @function handleSubmitYT
 * Submits the form data to the YouTube-to-Spotify conversion API.
 *
 * @function processErrors
 * Handles errors during API calls, including network issues and server errors.
 *
 * @see {@link https://reactjs.org/docs/hooks-intro.html | React Hooks Documentation}
 * @see {@link https://axios-http.com/docs/intro | Axios Documentation}
 */
export default function Form({ dsp, checkStatus,  callback1 }: Props) {
  if (dsp === 0) return null; // Prevent rendering when no platform is selected

  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<ModeType>(null);
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const fadeAnim = useState(new Animated.Value(0))[0];
  const buttonScale = useState(new Animated.Value(1))[0];
  const [theme, setTheme] = useState('dark'); // Theme state
  const styles = theme === 'dark' ? darkStyles : lightStyles;
  const [isSubmitting, setIsSubmitting] = useState(false); // Loader state


  const allFields: Record<string, { name: string; type: string }[]> = {
    spotify: [
      { name: "Spotify Playlist Link", type: "text" },
      { name: "Existing Youtube Playlist Link", type: "text" },
      { name: "Name of New Playlist", type: "text" },
      { name: "Collaborative", type: "select" },
      { name: "Description Of The Playlist", type: "textarea" },
      { name: "Make Your Playlist Available To The Public", type: "select" },
    ],
    youtube: [
      { name: "Youtube Playlist Link", type: "text" },
      { name: "Existing Spotify Playlist Link", type: "text" },
      { name: "Name of New Playlist", type: "text" },
      { name: "Description Of The Playlist", type: "textarea" },
    ],
  };

  // Filter fields based on mode
  const formFields = allFields[dsp]?.filter((field) => {
    if (mode === "update" && ["Name of New Playlist", "Description Of The Playlist", "Collaborative", "Make Your Playlist Available To The Public"].includes(field.name)) {
      return false; // Skip these fields in update mode
    }
    if (mode === "create" && ["Existing Youtube Playlist Link", "Existing Spotify Playlist Link"].includes(field.name)) {
      return false; // Skip existing playlist fields in create mode
    }
    return true;
  }) || [];

  useEffect(() => {
    setStep(0);
    setFormData({});
    setMode(null); // Reset mode on DSP change

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500, // Smooth fade-in
      useNativeDriver: true,
    }).start();
  }, [dsp]);

  // If mode isn't chosen yet, show the selection screen
  if (!mode) {
    return (
      <View style={styles.selectionContainer}>
        <Text style={styles.label}>Do you want to update an existing playlist or create a new one?</Text>

        <TouchableOpacity onPress={() => setMode("update")} style={styles.selectionButton}>
          <Text style={styles.buttonText}>Update Existing Playlist</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode("create")} style={styles.selectionButton}>
          <Text style={styles.buttonText}>Create New Playlist</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentField = formFields[step] || null;

  if (!currentField) return null; //Prevent crashing if no fields exist


  const handleChange = (text: string) => {
    setFormData({ ...formData, [currentField.name]: text });
  };

  const handleNext = async () => {
    if (!formData[currentField.name]) {
      alert(`Please fill in the ${currentField.name} field.`);
      return; // Prevent proceeding if the field is empty
    }
    if (step < formFields.length - 1) {
      setStep(step + 1);
    } else {
      console.log("Form Submitted:", formData);
      dsp === "spotify" ? await handleSubmitSF() : await handleSubmitYT();
    }
  };


  const handlePrevious = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmitSF = async () => {
    setIsSubmitting(true); // Show loader
    try {
      axios.get("https://player-backend-qz31.onrender.com/player/convertSpotifyToYoutube", {
        params: {
          param: formData["Spotify Playlist Link"] || null,
          existing_param: formData["Existing Youtube Playlist Link"] || null,
          name: formData["Name of New Playlist"] || null,
          description: formData["Description Of The Playlist"] || null,
          collaborative: formData["Collaborative"] || null,
        },
        withCredentials: true,
      })
        .then((response) => {
          let data = processResponses(response)
          callback1(data);
        }).catch((error) => {
          console.log("This runs")
          processErrors(error, "SF")
        })
    } catch (error) {
      processErrors(error, "SF")
    } finally {
      setIsSubmitting(false); // Hide loader
    }
  };

  const handleSubmitYT = async () => {
    setIsSubmitting(true); // Show loader
    try {
      axios.get("https://player-backend-qz31.onrender.com/player/convertYoutubeToSpotify", {
        params: {
          param: formData["Youtube Playlist Link"] || null,
          existing_param: formData["Existing Spotify Playlist Link"] || null,
          name: formData["Name of New Playlist"] || null,
          description: formData["Description Of The Playlist"] || null,
        },
        withCredentials: true,
      })
      .then((response) => {
        let data = processResponses(response)
        console.log(data)
        callback1(data);
      }).catch((error) => {
        console.log("This runs")
        processErrors(error, "YT")
      })
    } catch (error) {
      return processErrors(error, "YT")
    } finally {
      setIsSubmitting(false); // Hide loader
    }
  };

  const processResponses =  (response: any) => {
    let data;
    if (typeof response.data === "string") {
      try {
        data == JSON.parse(response.data)
      } catch (error) {
        console.error("Failed to parse JSON string:", error);
      }
    } else if (typeof response.data === "object") {
      data = response.data
    }

    return data;
  }

  const processErrors = (error: any, source: string) => {
    console.log(error)
    if (error.response) {
      // Server responded with an error status
      console.error("Server Error:", {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      // Possible CORS issue or network failure
      console.error("Network Error or No Response Received!");
      if (error.message.includes("Network") || error.message.includes("CORS")) {
        if (source === "YT") {
          // deleteCookie("playeRCookieYT");
          // deleteCookie("tokenTimeYT");
        } else {
          // deleteCookie("playeRCookieSF");
          // deleteCookie("tokenTimeSF");
        }
        checkStatus();
        if (Platform.OS !== "web") {
          window.location.reload(); // Refresh the DOM to show the login screen
        }
      } else {
        console.error("Error Message:", error.message);
      }
    } else {
      // Other unexpected errors
      console.error("Unexpected Error:", error.message);
    }
  }

  return (
    <>
      {isSubmitting && (
        <View style={styles.loaderMask}>
          <ActivityIndicator size="large" color="#00ffcc" />
        </View>
      )}
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <TouchableOpacity
            style={styles.themeToggleButton}
            onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
            <Text style={styles.themeToggleText}>
                Switch to {theme === 'dark' ? 'Light' : 'Dark'} Theme
            </Text>
        </TouchableOpacity>
      <ScrollView contentContainerStyle={{ padding: 20 }}>


        {/* Form Starts Below */}
        <Text style={styles.label}>{currentField.name}</Text>

        {currentField.type === "text" || currentField.type === "number" ? (
          <TextInput
            style={styles.input}
            value={formData[currentField.name] || ""}
            placeholder={`Enter ${currentField.name}`}
            placeholderTextColor="#aaa"
            onChangeText={handleChange}
            keyboardType={currentField.type === "number" ? "numeric" : "default"}
          />
        ) : currentField.type === "textarea" ? (
          <TextInput
            style={[styles.input, { height: 100 }]}
            value={formData[currentField.name] || ""}
            placeholder={`Enter ${currentField.name}`}
            placeholderTextColor="#aaa"
            onChangeText={handleChange}
            multiline
          />
        ) : currentField.type === "select" ? (
          <Picker
            selectedValue={formData[currentField.name]}
            style={styles.picker}
            onValueChange={handleChange}
          >
          <Picker.Item label="Choose" value="" />
            <Picker.Item label="Yes" value="Public" />
            <Picker.Item label="No" value="Private" />
          </Picker>
        ) : null}

        <View style={styles.buttonContainer}>
          {step > 0 && (
            <TouchableOpacity style={styles.selectionButton} onPress={handlePrevious}>
              <Text style={styles.buttonText}>Previous</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.selectionButton} onPress={handleNext}>
            <Text style={styles.buttonText}>{step < formFields.length - 1 ? "Next" : "Submit"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Animated.View>
    </>
  );
}

// Define reusable constants for styles
const COLORS = {
    darkBackground: "#0d0d0d",
    lightBackground: "#ffffff",
    darkText: "#00ffcc",
    lightText: "#000000",
    darkButton: "#111",
    lightButton: "#f0f0f0",
    borderDark: "#00ffcc",
    borderLight: "#000000",
};

const SPACING = {
    padding: 20,
    margin: 10,
    borderRadius: 10,
};

const FONT_SIZES = {
    small: 14,
    medium: 16,
    large: 24,
};

const darkStyles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.darkBackground,
        padding: SPACING.padding,
        borderRadius: SPACING.borderRadius,
        marginVertical: SPACING.margin,
    },
    themeToggleButton: {
        backgroundColor: COLORS.darkButton,
        padding: SPACING.margin,
        borderRadius: SPACING.borderRadius,
        margin: SPACING.margin,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderDark,
    },
    themeToggleText: {
        color: COLORS.darkText,
        fontSize: FONT_SIZES.medium,
    },
    selectionContainer: {
        backgroundColor: COLORS.darkButton,
        padding: SPACING.padding,
        borderRadius: SPACING.borderRadius,
        alignItems: "center",
    },
    selectionButton: {
        backgroundColor: COLORS.darkButton,
        padding: SPACING.margin,
        borderRadius: SPACING.borderRadius,
        marginVertical: SPACING.margin,
        borderWidth: 1,
        borderColor: COLORS.borderDark,
    },
    label: {
        color: COLORS.darkText,
        marginBottom: SPACING.margin,
    },
    input: {
        borderWidth: 1,
        padding: SPACING.margin,
        color: COLORS.darkText,
        backgroundColor: COLORS.darkButton,
        borderColor: COLORS.borderDark,
        borderRadius: SPACING.borderRadius,
    },
    buttonText: {
        color: COLORS.darkText,
        textAlign: "center",
    },
    picker: {
        backgroundColor: COLORS.darkButton,
        color: COLORS.darkText,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: SPACING.margin,
    },
    loaderMask: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
    },
});

const lightStyles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.lightBackground,
        padding: SPACING.padding,
        borderRadius: SPACING.borderRadius,
        marginVertical: SPACING.margin,
    },
    themeToggleButton: {
        backgroundColor: COLORS.lightButton,
        padding: SPACING.margin,
        borderRadius: SPACING.borderRadius,
        margin: SPACING.margin,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    themeToggleText: {
        color: COLORS.lightText,
        fontSize: FONT_SIZES.medium,
    },
    selectionContainer: {
        backgroundColor: COLORS.lightButton,
        padding: SPACING.padding,
        borderRadius: SPACING.borderRadius,
        alignItems: "center",
    },
    selectionButton: {
        backgroundColor: COLORS.lightButton,
        padding: SPACING.margin,
        borderRadius: SPACING.borderRadius,
        marginVertical: SPACING.margin,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    label: {
        color: COLORS.lightText,
        marginBottom: SPACING.margin,
    },
    input: {
        borderWidth: 1,
        padding: SPACING.margin,
        color: COLORS.lightText,
        backgroundColor: COLORS.lightButton,
        borderColor: COLORS.borderLight,
        borderRadius: SPACING.borderRadius,
    },
    buttonText: {
        color: COLORS.lightText,
        textAlign: "center",
    },
    picker: {
        backgroundColor: COLORS.lightButton,
        color: COLORS.lightText,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: SPACING.margin,
    },
    loaderMask: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
    },
});

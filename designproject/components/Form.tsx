// import { useState, useEffect } from "react";
// import { ScrollView, View, StyleSheet, Button, Text, TextInput } from "react-native";
// import axios from "axios";

// type PlatformType = "spotify" | "youtube" | 0;

// export default function Form({ dsp }: { dsp: PlatformType }) {
//     if (dsp == 0) {
//         return null;
//     }

//     const [spotifyParam, setSpotifyParam] = useState({ param: "", existing_param: 0 });
//     const [youtubeParam, setYoutubeParam] = useState({ param: "", existing_param: 0 });
//     const [step, setStep] = useState(0);
//     const [formData, setFormData] = useState<{ [key: string]: string }>({});


//     const formFields = {
//         spotify: ["Spotify Playlist Link or ID", "Existing Youtube Playlist Link or ID", "Name of New Playlist", "Collaborative", "Description Of The Playlist", "Public or Private"],
//         youtube: ["Youtube Playlist Link or ID", "Existing Spotify Playlist Link Or ID", "Name of New Playlist", "Description Of The Playlist"],  // 5 fields
//     };
//     const inputs = formFields[dsp] || []; // Select fields based on platform

//     // Reset form when platform changes
//     //If the state is not returned back to default,it wont unmount
//     useEffect(() => {
//         setStep(0); // Reset step
//         setFormData({}); // Clear form data
//     }, [dsp]);

//     //configure what gets sent to the backend
//     type ParamProps = {
//         link: string;
//         param: string; //the playlist id or link to be converted to another 
//         existing_param?: string; // playlist id or link => if this is provided,it
//     }

//     const handleChangeSF = (event: { target: { name: any; value: string; }; }) => {
//         const name = event.target.name;
//         const value = event.target.value;
//         setSpotifyParam((values: any) => ({ ...values, [name]: value }))
//     }

//     const handleChangeYT = (event: { target: { name: any; value: string; }; }) => {
//         const name = event.target.name;
//         const value = event.target.value;
//         setYoutubeParam((values: any) => ({ ...values, [name]: value }))
//     }

//     const handleSubmitSF = async () => {

//         let param = formData["Spotify Playlist Link or ID"];
//         let existing_param = formData["Existing Youtube Playlist Link or ID"] || "";
//         let name = formData["Name of New Playlist"];
//         let description = formData["Description Of The Playlist"];
//         let collaborative = formData["Collaborative"];

//         try {
//             const response = await axios.get("http://localhost:8000/player/convertSpotifyToYoutube", {
//                 params: {
//                     param: param,
//                     existing_param: existing_param,
//                     name: name,
//                     description: description,
//                     collaborative: collaborative,
//                 },
//                 withCredentials: true, // Ensures cookies are sent
//             });

//             console.log("Response:", response.data);
//         } catch (error) {
//             console.error("Error submitting form:", error);
//         }
//     }

//     const handleSubmitYT = async () => {

//         let param = formData["Youtube Playlist Link or ID"];
//         let existing_param = formData["Existing Spotify Playlist Link or ID"] || "";
//         let name = formData["Name of New Playlist"];
//         let description = formData["Description Of The Playlist"];

//         try {
//             const response = await axios.get("http://localhost:8000/player/convertYoutubeToSpotify", {
//                 params: {
//                     param: param,
//                     existing_param: existing_param,
//                     name: name,
//                     description: description,

//                 },
//                 withCredentials: true, // Ensures cookies are sent
//             });

//             console.log("Response:", response.data);
//         } catch (error) {
//             console.error("Error submitting form:", error);
//         }
//     }



//     const handleChange = (text: string) => {
//         setFormData({ ...formData, [inputs[step]]: text });
//     };


//     const handleNext = async (event: { preventDefault: () => void; }) => {
//         event.preventDefault();
//         if (step < inputs.length - 1) {
//             setStep(step + 1);
//         } else {
//             console.log("Form Submitted:", formData);
//             if (dsp == "spotify") {
//                 handleSubmitSF();
//             } else if (dsp == "youtube") {
//                 handleSubmitYT();
//             }
//         }
//     }

//         const handlePrevious = async (event: { preventDefault: () => void; }) => {
//             event.preventDefault();
//             if (step >= 1) {
//                 setStep(step - 1);
//             }
//         };


//         return (
//             <>
//                 <View style={styles.container}>
//                     <form onSubmit={handleNext}>
//                         <View style={{ padding: 20 }}>
//                             <Text>{inputs[step]}</Text>
//                             <TextInput
//                                 style = {{ borderWidth: 1, padding: 10, marginVertical: 10 }}
//                                 value = {formData[formFields[dsp][step]] || ""}
//                                 placeholder={`Enter ${inputs[step]}`}
//                                 onChangeText={handleChange}
//                             />
//                             <Button title={step < inputs.length - 1 ? "Next" : "Submit"} onPress={handleNext} />
//                             <Button title="Previous" onPress={handlePrevious} />
//                         </View>
//                     </form>
//                 </View>
//             </>
//         )

//     }


//     const styles = StyleSheet.create({
//         container: {
//             flex: 1,
//             //   backgroundColor: '#25292e',
//             alignItems: 'center',
//             justifyContent: 'center',
//         },
//         visible: {
//             display: "flex"
//         },
//         hidden: {
//             display: "none"
//         },
//     });

import { useState, useEffect } from "react";
import { ScrollView, View, StyleSheet, Button, Text, TextInput} from "react-native";
import { Picker } from '@react-native-picker/picker';
import axios from "axios";

type PlatformType = "spotify" | "youtube" | 0;

export default function Form({ dsp }: { dsp: PlatformType }) {
    if (dsp == 0) {
        return null;
    }

    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState<{ [key: string]: string }>({});

    const formFields: Record<string, { name: string; type: string }[]> = {
        spotify: [
            { name: "Spotify Playlist Link or ID", type: "text" },
            { name: "Existing Youtube Playlist Link or ID", type: "text" },
            { name: "Name of New Playlist", type: "text" },
            { name: "Collaborative", type: "select" },
            { name: "Description Of The Playlist", type: "textarea" },
            { name: "Make Your Playlist Available To The Public", type: "select" }
        ],
        youtube: [
            { name: "Youtube Playlist Link or ID", type: "text" },
            { name: "Existing Spotify Playlist Link Or ID", type: "text" },
            { name: "Name of New Playlist", type: "text" },
            { name: "Description Of The Playlist", type: "textarea" }
        ],
        0:[

        ]
    };

    useEffect(() => {
        setStep(0);
        setFormData({});
    }, [dsp]);

    const inputs = formFields[dsp] || [];
    const currentField = inputs[step];

    const handleChange = (text: string) => {
        setFormData({ ...formData, [currentField.name]: text });
    };

    const handleNext = async () => {
        if (step < inputs.length - 1) {
            setStep(step + 1);
        } else {
            console.log("Form Submitted:", formData);
            if (dsp === "spotify") {
                await handleSubmitSF();
            } else if (dsp === "youtube") {
                await handleSubmitYT();
            }
        }
    };

    const handlePrevious = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    
    const handleSubmitSF = async () => {

        let param = formData["Spotify Playlist Link or ID"];
        let existing_param = formData["Existing Youtube Playlist Link or ID"] || "";
        let name = formData["Name of New Playlist"];
        let description = formData["Description Of The Playlist"];
        let collaborative = formData["Collaborative"];

        try {
            const response = await axios.get("http://localhost:8000/player/convertSpotifyToYoutube", {
                params: {
                    param: param,
                    existing_param: existing_param,
                    name: name,
                    description: description,
                    collaborative: collaborative,
                },
                withCredentials: true, // Ensures cookies are sent
            });

            console.log("Response:", response.data);
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    }

    const handleSubmitYT = async () => {

        let param = formData["Youtube Playlist Link or ID"];
        let existing_param = formData["Existing Spotify Playlist Link or ID"] || "";
        let name = formData["Name of New Playlist"];
        let description = formData["Description Of The Playlist"];

        try {
            const response = await axios.get("http://localhost:8000/player/convertYoutubeToSpotify", {
                params: {
                    param: param,
                    existing_param: existing_param,
                    name: name,
                    description: description,

                },
                withCredentials: true, // Ensures cookies are sent
            });

            console.log("Response:", response.data);
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text>{currentField.name}</Text>

                {currentField.type === "text" || currentField.type === "number" ? (
                    <TextInput
                        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
                        value={formData[currentField.name] || ""}
                        placeholder={`Enter ${currentField.name}`}
                        onChangeText={handleChange}
                        keyboardType={currentField.type === "number" ? "numeric" : "default"}
                    />
                ) : currentField.type === "textarea" ? (
                    <TextInput
                        style={{ borderWidth: 1, padding: 10, marginVertical: 10, height: 100 }}
                        value={formData[currentField.name] || ""}
                        placeholder={`Enter ${currentField.name}`}
                        onChangeText={handleChange}
                        multiline
                    />
                ) : currentField.type === "select" ? (
                    <Picker selectedValue={formData[currentField.name]} onValueChange={handleChange}>
                        <Picker.Item label="Yes" value="Public" />
                        <Picker.Item label="No" value="Private" />
                    </Picker>
                ) : null}

                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
                    {step > 0 && <Button title="Previous" onPress={handlePrevious} />}
                    <Button title={step < inputs.length - 1 ? "Next" : "Submit"} onPress={handleNext} />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});

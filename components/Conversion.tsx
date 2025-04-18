import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';

type Data = {
    result: {
        status: string;
        message: string;
    };
    'Tracks Deleted':  { track: string; artist: string }[];
    'New Tracks Detected': { track: string; artist: string }[];
} | null;

export default function Conversion({ data }: { data: Data }) {
    if (data == null) {
        return null;
    }

    const [activeTab, setActiveTab] = useState('result'); // Default tab
    const [theme, setTheme] = useState('dark'); // Theme state
    const [jiggleAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        if (data) {
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
            ]).start();
        }
    }, [data]);

    const styles = theme === 'dark' ? darkStyles : lightStyles;

     // Convert object keys to an array for easier rendering
     const newTracksArray = Object.entries(data['New Tracks Detected']);
     const deletedTracksArray = Object.entries(data['Tracks Deleted']);

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ translateX: jiggleAnim }] },
            ]}
        >
            {/* Theme Toggle Button */}
            <TouchableOpacity
                style={styles.themeToggleButton}
                onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
                <Text style={styles.themeToggleText}>
                    Switch to {theme === 'dark' ? 'Light' : 'Dark'} Theme
                </Text>
            </TouchableOpacity>

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'result' && styles.activeTabButton]}
                    onPress={() => setActiveTab('result')}
                >
                    <Text style={styles.tabButtonText}>Result</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'table' && styles.activeTabButton]}
                    onPress={() => setActiveTab('table')}
                >
                    <Text style={styles.tabButtonText}>Tracks Table</Text>
                </TouchableOpacity>
            </View>

            {/* Result View */}
            {activeTab === 'result' && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultText}>Status: {data.result.status}</Text>
                    <Text style={styles.resultText}>Message: {data.result.message}</Text>
                </View>
            )}

            {/* Unified Table View */}
            {activeTab === 'table' && (
                <ScrollView horizontal style={styles.tableContainer}>
                    <View>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableCell, styles.headerCell]}>Track</Text>
                            <Text style={[styles.tableCell, styles.headerCell]}>Artist</Text>
                            <Text style={[styles.tableCell, styles.headerCell]}>Deleted</Text>
                        </View>
                        {newTracksArray.map(([key, trackObj]: any, index) => (
                            <View key={index} style={styles.tableRow}>
                                <Text style={styles.tableCell}>{trackObj.track || ""}</Text>
                                <Text style={styles.tableCell}>{trackObj.artist || ""}</Text>
                                <Text style={styles.tableCell}>No</Text>
                            </View>
                        ))}
                        {deletedTracksArray.map(([key, trackObj]: any, index) => (
                            <View key={index + newTracksArray.length} style={styles.tableRow}>
                                <Text style={styles.tableCell}>{trackObj.track || ""}</Text>
                                <Text style={styles.tableCell}>{trackObj.artist || ""}</Text>
                                <Text style={styles.tableCell}>Yes</Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            )}
        </Animated.View>
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

const baseStyles = {
    container: {
        padding: 20,
        borderRadius: 10,
        marginVertical: 10,
    },
    themeToggleButton: {
        alignSelf: 'flex-end',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    themeToggleText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    tabButton: {
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
    },
    activeTabButton: {
        borderColor: "#00ffcc",
    },
    tabButtonText: {
        textAlign: "center",
    },
    resultContainer: {
        padding: 10,
        borderRadius: 10,
    },
    resultText: {
        fontSize: 16,
        marginBottom: 10,
    },
    tableContainer: {
        marginTop: 10,
        borderRadius: 10,
        padding: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        paddingBottom: 10,
        marginBottom: 10,
    },
    tableRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    tableCell: {
        flex: 1,
        fontSize: 14,
        textAlign: "center",
        paddingHorizontal: 10,
    },
    headerCell: {
        fontWeight: "bold",
    },
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
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: SPACING.margin,
    },
    tabButton: {
        backgroundColor: COLORS.darkButton,
        padding: SPACING.margin,
        borderRadius: SPACING.borderRadius,
        borderWidth: 1,
        borderColor: COLORS.borderDark,
    },
    activeTabButton: {
        borderColor: COLORS.borderDark,
        backgroundColor: COLORS.darkButton,
    },
    tabButtonText: {
        color: COLORS.darkText,
        textAlign: "center",
    },
    resultContainer: {
        backgroundColor: COLORS.darkButton,
        padding: SPACING.padding,
        borderRadius: SPACING.borderRadius,
    },
    resultText: {
        color: COLORS.darkText,
        fontSize: FONT_SIZES.medium,
        marginBottom: SPACING.margin,
    },
    tableContainer: {
        backgroundColor: COLORS.darkButton,
        borderRadius: SPACING.borderRadius,
        padding: SPACING.padding,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderDark,
        paddingBottom: SPACING.margin,
        marginBottom: SPACING.margin,
    },
    tableRow: {
        flexDirection: 'row',
        marginBottom: SPACING.margin,
    },
    tableCell: {
        flex: 1,
        color: COLORS.darkText,
        fontSize: FONT_SIZES.small,
        textAlign: "center",
        paddingHorizontal: SPACING.margin,
    },
    headerCell: {
        fontWeight: "bold",
        color: COLORS.darkText,
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
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: SPACING.margin,
    },
    tabButton: {
        backgroundColor: COLORS.lightButton,
        padding: SPACING.margin,
        borderRadius: SPACING.borderRadius,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    activeTabButton: {
        borderColor: COLORS.borderLight,
        backgroundColor: COLORS.lightButton,
    },
    tabButtonText: {
        color: COLORS.lightText,
        textAlign: "center",
    },
    resultContainer: {
        backgroundColor: COLORS.lightButton,
        padding: SPACING.padding,
        borderRadius: SPACING.borderRadius,
    },
    resultText: {
        color: COLORS.lightText,
        fontSize: FONT_SIZES.medium,
        marginBottom: SPACING.margin,
    },
    tableContainer: {
        backgroundColor: COLORS.lightButton,
        borderRadius: SPACING.borderRadius,
        padding: SPACING.padding,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
        paddingBottom: SPACING.margin,
        marginBottom: SPACING.margin,
    },
    tableRow: {
        flexDirection: 'row',
        marginBottom: SPACING.margin,
    },
    tableCell: {
        flex: 1,
        color: COLORS.lightText,
        fontSize: FONT_SIZES.small,
        textAlign: "center",
        paddingHorizontal: SPACING.margin,
    },
    headerCell: {
        fontWeight: "bold",
        color: COLORS.lightText,
    },
});
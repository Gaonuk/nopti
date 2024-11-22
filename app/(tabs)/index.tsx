import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "@/types";

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
	const navigation = useNavigation<NavigationProp>();

	const handleActivate = () => {
		// For tab navigation, use navigate with the tab name from your router configuration
		navigation.navigate("(tabs)", { screen: "conversation" });
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Welcome to Nopti</Text>
			<TouchableOpacity style={styles.button} onPress={handleActivate}>
				<Text style={styles.buttonText}>Activate</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
	},
	button: {
		backgroundColor: "black",
		padding: 15,
		borderRadius: 5,
	},
	buttonText: {
		color: "white",
		fontSize: 18,
		fontWeight: "bold",
	},
});

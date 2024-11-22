import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	FlatList,
	PermissionsAndroid,
	Platform,
	SafeAreaView,
} from "react-native";
import Voice, {
	type SpeechErrorEvent,
	type SpeechResultsEvent,
} from "@react-native-voice/voice";
import * as Speech from "expo-speech";
import useChatService from "@/hooks/useChatService";
import { generateResponse } from "@/functions/generateResponse";

// Add speech initialization and options
const initSpeech = async () => {
	try {
		const voices = await Speech.getAvailableVoicesAsync();
		// Select first available voice or default
		return voices[0]?.identifier || null;
	} catch (error) {
		console.warn("Speech initialization error:", error);
		return null;
	}
};

type Message = {
	id: string;
	text: string;
	sender: "user" | "bot";
};

export default function ConversationScreen() {
	const [isListening, setIsListening] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [lastWord, setLastWord] = useState<string>("");
	const { llm } = useChatService();
	const [responseToSay, setResponseToSay] = useState<string>("");

	useEffect(() => {
		Voice.onSpeechResults = onSpeechResults;
		Voice.onSpeechError = onSpeechError;

		let voiceIdentifier: string | null = null;

		const setup = async () => {
			voiceIdentifier = await initSpeech();
		};

		setup();

		return () => {
			Voice.destroy().then(Voice.removeAllListeners);
			Speech.stop();
		};
	}, []);

	const requestMicrophonePermission = async () => {
		if (Platform.OS === "android") {
			const granted = await PermissionsAndroid.request(
				PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
				{
					title: "Microphone Permission",
					message: "App needs access to your microphone to recognize speech.",
					buttonNeutral: "Ask Me Later",
					buttonNegative: "Cancel",
					buttonPositive: "OK",
				},
			);
			return granted === PermissionsAndroid.RESULTS.GRANTED;
		}
		return true;
	};

	const startListening = async () => {
		const hasPermission = await requestMicrophonePermission();
		if (!hasPermission) {
			setError("Microphone permission denied");
			return;
		}
		try {
			setError(null);
			setIsListening(true);
			await Voice.start("en-US");
			console.log("Listening...");
			setTimeout(async () => {
				await Voice.stop();
				console.log("llm.isModelReady", llm.isModelReady);
				console.log("lastWord", lastWord);
				if (llm.isModelReady) {
					generateResponse(llm, lastWord);
				}
				setIsListening(false);
			}, 5000);
		} catch (e) {
			setError("Failed to start listening");
			setIsListening(false);
		}
	};

	useEffect(() => {
		if (!llm.isModelGenerating && llm.response && !isListening) {
			setResponseToSay(llm.response);
		}
	}, [llm.isModelGenerating, llm.response, isListening]);

	useEffect(() => {
		if (responseToSay) {
			Speech.speak(responseToSay);
		}
	}, [responseToSay]);

	const onSpeechResults = (event: SpeechResultsEvent) => {
		const spokenText = event.value ? event.value[0] : "";

		setLastWord(spokenText);
		setIsListening(false);
	};

	const onSpeechError = (event: SpeechErrorEvent) => {
		setError(`Speech Error: ${event.error?.message ?? "Unknown error"}`);
		setIsListening(false);
	};

	const renderItem = ({ item }: { item: Message }) => (
		<View
			style={[
				styles.messageContainer,
				item.sender === "user" ? styles.userMessage : styles.botMessage,
			]}
		>
			<Text style={styles.messageText}>{item.text}</Text>
		</View>
	);

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.container}>
				<Text style={styles.title}>Nopti is ready to chat!</Text>
				<FlatList
					data={messages}
					renderItem={renderItem}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.chatContainer}
					inverted // This prop makes the chat scroll to the latest message
				/>
				{error && <Text style={styles.errorText}>{error}</Text>}
				{lastWord ? (
					<Text style={styles.word}>Last word: {lastWord}</Text>
				) : null}
				<TouchableOpacity
					style={styles.button}
					onPress={startListening}
					disabled={isListening}
				>
					<Text style={styles.buttonText}>
						{isListening ? "Listening..." : "Start (5s)"}
					</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	container: {
		flex: 1,
		padding: 20,
		justifyContent: "space-between",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 10,
	},
	chatContainer: {
		flexGrow: 1,
		justifyContent: "flex-end",
	},
	messageContainer: {
		maxWidth: "80%",
		padding: 10,
		borderRadius: 10,
		marginVertical: 5,
	},
	userMessage: {
		backgroundColor: "#DCF8C6",
		alignSelf: "flex-end",
	},
	botMessage: {
		backgroundColor: "#ECECEC",
		alignSelf: "flex-start",
	},
	messageText: {
		fontSize: 16,
		color: "#333333",
	},
	button: {
		backgroundColor: "#007AFF",
		padding: 15,
		borderRadius: 50,
		alignItems: "center",
		marginTop: 10,
		marginBottom: 20,
	},
	buttonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
	},
	errorText: {
		color: "red",
		textAlign: "center",
		marginVertical: 10,
	},
	word: {
		fontSize: 18,
		marginVertical: 20,
	},
});

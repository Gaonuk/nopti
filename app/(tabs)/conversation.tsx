import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withTiming,
	Easing,
} from "react-native-reanimated";
import {useLLM, LLAMA3_2_1B_URL} from 'react-native-executorch';
import useChatService from "@/hooks/useChatService";
import { generateResponse } from "@/functions/generateResponse";

interface MessageType {
	text: string;
	from: 'user' | 'ai';
}


export default function ConversationScreen() {
	const scale = useSharedValue(1);
	const [chatHistory, setChatHistory] = useState<Array<MessageType>>([]);
	const { llm } = useChatService();
	// const llm = useLLM({
	// 	modelSource:  LLAMA3_2_1B_URL,
	// 	tokenizerSource: require('../../assets/images/tokenizer.bin'),
	// 	contextWindowLength: 6,
	// });

	const animatedStyles = useAnimatedStyle(() => {
		return {
			transform: [{ scale: scale.value }],
		};
	});
	
	useEffect(() => {
		scale.value = withRepeat(
			withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
			-1,
			true,
		);
	}, [scale]);

	useEffect(() => {
		if (llm.isModelReady) {
			generateResponse(llm, "What is the meaning of life?");
		}
	}, [llm.isModelReady]);

	useEffect(() => {
		if (!llm.isModelGenerating && llm.response) {
			setChatHistory(prev => [...prev, { 
				text: llm.response!, 
				from: 'ai' 
			}]);
		}
	}, [llm.response, llm.isModelGenerating]);

	return (
		<View style={styles.container}>
			{!llm.isModelReady ? (
				<View style={styles.loadingContainer}>
					<Text style={styles.loadingText}>Loading model... {(llm.downloadProgress * 100).toFixed(0)}%</Text>
					<Animated.View style={[styles.circle, animatedStyles]} />
				</View>
			) : (
				<View style={styles.chatContainer}>
					<ScrollView 
						style={styles.messagesContainer}
						contentContainerStyle={styles.scrollContent}
					>
						<View style={[styles.messageBox, styles.userMessage]}>
							<Text>hello</Text>
						</View>
						{llm.response && (
							<View style={[styles.messageBox, styles.aiMessage]}>
								<Text>{llm.response}</Text>
							</View>
						)}
					</ScrollView>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F5FCFF",
		padding: 10,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
	},
	circle: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: "black",
	},
	response: {
		fontSize: 18,
		padding: 20,
		textAlign: 'center',
	},
	loadingContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 20,
	},
	loadingText: {
		fontSize: 16,
		marginBottom: 20,
	},
	chatContainer: {
		flex: 1,
		width: '100%',
		padding: 10,
		justifyContent: 'space-between',
	},
	messagesContainer: {
		flex: 1,
		marginBottom: 10,
	},
	messageBox: {
		padding: 10,
		marginVertical: 5,
		maxWidth: '80%',
		borderRadius: 10,
	},
	userMessage: {
		alignSelf: 'flex-end',
		backgroundColor: '#007AFF',
	},
	aiMessage: {
		alignSelf: 'flex-start',
		backgroundColor: '#E5E5EA',
	},
	inputContainer: {
		flexDirection: 'row',
		padding: 10,
		backgroundColor: '#F5FCFF',
		borderTopWidth: 1,
		borderTopColor: '#ccc',
	},
	input: {
		flex: 1,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 20,
		paddingHorizontal: 15,
		paddingVertical: 8,
		marginRight: 10,
	},
	sendButton: {
		padding: 10,
		backgroundColor: '#007AFF',
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
		minWidth: 70,
	},
	sendButtonText: {
		color: '#fff',
	},
	scrollContent: {
		flexGrow: 1,
	},
});

import React, { useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withTiming,
	Easing,
} from "react-native-reanimated";
import { ChatService, MessageType } from '../../service/chat_service';

const chatService = new ChatService();

export default function ConversationScreen() {
	const [chatHistory, setChatHistory] = useState<Array<MessageType>>([]);
	const [inputText, setInputText] = useState('');
	const scale = useSharedValue(1);

	const isModelReady = useMemo(() => chatService.isModelReady(), []);

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

	const handleSendMessage = async () => {
		if (!inputText.trim()) return;
		
		const userMessage: MessageType = { text: inputText, from: 'user' };
		setChatHistory(prev => [...prev, userMessage]);
		
		try {
			const response = await chatService.generateResponse(inputText);
			if (response) {
				const aiMessage: MessageType = { text: response, from: 'ai' };
				setChatHistory(prev => [...prev, aiMessage]);
			}
		} catch (error) {
			console.error('Error generating response:', error);
		}
		
		setInputText('');
	};

	return (
		<View style={styles.container}>
			{!isModelReady ? (
				<View style={styles.loadingContainer}>
					<Text style={styles.loadingText}>
						Loading model... {(chatService.getDownloadProgress() * 100).toFixed(0)}%
					</Text>
					<Animated.View style={[styles.circle, animatedStyles]} />
				</View>
			) : (
				<View style={styles.chatContainer}>
					<ScrollView 
						style={styles.messagesContainer}
						contentContainerStyle={styles.scrollContent}
					>
						{chatHistory?.map((message, index) => (
							<View 
								key={index} 
								style={[
									styles.messageBox, 
									message.from === 'user' ? styles.userMessage : styles.aiMessage
								]}
							>
								<Text style={message.from === 'user' ? styles.userMessageText : styles.aiMessageText}>
									{message.text}
								</Text>
							</View>
						))}
					</ScrollView>
					<View style={styles.inputContainer}>
						<TextInput
							style={styles.input}
							value={inputText}
							onChangeText={setInputText}
							placeholder="Type a message..."
						/>
						<TouchableOpacity 
							style={styles.sendButton}
							onPress={handleSendMessage}
						>
							<Text style={styles.sendButtonText}>Send</Text>
						</TouchableOpacity>
					</View>
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
	userMessageText: {
		color: '#ffffff',
	},
	aiMessageText: {
		color: '#000000',
	},
});

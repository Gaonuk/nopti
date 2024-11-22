import { generateResponse } from '@/functions/generateResponse';
import useChatService from '@/hooks/useChatService';
import { useUserContent } from '@/hooks/useUserContent';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { ContentItem } from '@/types/Content';

interface MessageType {
	text: string;
	from: 'user' | 'ai';
}


export default function ConversationScreen() {
	const scale = useSharedValue(1);
	const [chatHistory, setChatHistory] = useState<Array<MessageType>>([]);
	const { llm, rankContent } = useChatService();
	const { userContent, loading, error } = useUserContent();
	// const llm = useLLM({
	// 	modelSource:  LLAMA3_2_1B_URL,
	// 	tokenizerSource: require('../../assets/images/tokenizer.bin'),
	// 	contextWindowLength: 6,
	// });

	useEffect(() => {
		const processContent = async () => {
			if (userContent) {
				console.log('Fetched user content:', userContent);
				
				if (llm.isModelReady) {
					try {
						console.log('Raw userContent:', userContent);
						
						// Parse the string into an object if it's a string
						const contentObject = typeof userContent === 'string' 
							? JSON.parse(userContent) 
							: userContent;
						
						console.log('Content object keys:', Object.keys(contentObject));
						
						// Extract the news_list array
						const contentArray = contentObject.news_list;
						
						if (!Array.isArray(contentArray)) {
							throw new Error('news_list is not an array');
						}
						
						// Transform the data to match ContentItem interface
						const formattedContent: ContentItem[] = contentArray.map(item => ({
							id: item.id,
							title: item.title || '',
							summary: item.summary || '',
							link: item.link || '',
							date: item.date || new Date().toISOString(),
							type: item.source || 'news',
							passed: Boolean(item.passed),
							shown: Boolean(item.shown)
						}));
							
						console.log('Formatted content first item:', formattedContent[0]);

						const rankedResults = await rankContent(formattedContent.slice(0, 3));
						console.log('Ranked content results:', rankedResults);
					} catch (err) {
						console.error('Error ranking content:', err);
					}
				}
			}
			if (error) {
				console.error('Error fetching content:', error);
			}
		};

		processContent();
	}, [userContent, error, llm.isModelReady]);

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

	// Comment out the initial message generation
	/*
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
	*/

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
						{/* Comment out the hello message and response
						<View style={[styles.messageBox, styles.userMessage]}>
							<Text>hello</Text>
						</View>
						{llm.response && (
							<View style={[styles.messageBox, styles.aiMessage]}>
								<Text>{llm.response}</Text>
							</View>
						)}
						*/}
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

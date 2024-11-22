import { useUserContent } from '@/hooks/useUserContent';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export default function ConversationScreen() {
	const scale = useSharedValue(1);
	const { userContent, loading, error } = useUserContent();

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

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Nopti is thinking...</Text>
			<View>
				{loading && <Text>Loading...</Text>}
				{error && <Text>Error: {error}</Text>}
				{userContent && <Text>{JSON.stringify(userContent)}</Text>}
			</View>
			<Animated.View style={[styles.circle, animatedStyles]} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#F5FCFF",
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
});

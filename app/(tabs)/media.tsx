import React, { useState } from "react";
import {
	StyleSheet,
	ScrollView,
	Dimensions,
	TouchableOpacity,
	View,
	SafeAreaView,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Image } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";

const { width } = Dimensions.get("window");

type MediaType = "text" | "images" | "videos";

const VideoPlayer = () => {
	const videoSource =
		"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

	const player = useVideoPlayer(videoSource, (playerInstance) => {
		playerInstance.loop = true;
		playerInstance.play();
	});

	const { isPlaying } = useEvent(player, "playingChange", {
		isPlaying: player.playing,
	});

	return (
		<View style={styles.videoContainer}>
			<VideoView
				style={styles.video}
				player={player}
				allowsFullscreen
				allowsPictureInPicture
			/>
			<TouchableOpacity
				style={styles.videoControl}
				onPress={() => (isPlaying ? player.pause() : player.play())}
			>
				<ThemedText style={styles.buttonText}>
					{isPlaying ? "Pause" : "Play"}
				</ThemedText>
			</TouchableOpacity>
		</View>
	);
};

export default function MediaScreen() {
	const [selectedMedia, setSelectedMedia] = useState<MediaType>("text");

	const renderContent = () => {
		switch (selectedMedia) {
			case "text":
				return (
					<View style={styles.section}>
						<ThemedText style={styles.sectionTitle}>
							Topic 1: Introduction
						</ThemedText>
						<ThemedText style={styles.text}>
							Welcome to the Media section. Here you can find various resources.
						</ThemedText>
					</View>
				);
			case "images":
				return (
					<View style={styles.section}>
						<ThemedText style={styles.sectionTitle}>Topic 2: Images</ThemedText>
						<Image
							source={require("@/assets/images/yann.jpg")}
							style={styles.image}
							resizeMode="contain"
						/>
					</View>
				);
			case "videos":
				return (
					<View style={styles.section}>
						<ThemedText style={styles.sectionTitle}>Topic 3: Videos</ThemedText>
						<VideoPlayer />
					</View>
				);
			default:
				return null;
		}
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<ScrollView contentContainerStyle={styles.container}>
				<ThemedText type="title" style={styles.title}>
					Media Topics
				</ThemedText>

				<View style={styles.buttonContainer}>
					{(["text", "images", "videos"] as MediaType[]).map((type) => (
						<TouchableOpacity
							key={type}
							style={[
								styles.button,
								selectedMedia === type && styles.activeButton,
							]}
							onPress={() => setSelectedMedia(type)}
						>
							<ThemedText style={styles.buttonText}>
								{type.charAt(0).toUpperCase() + type.slice(1)}
							</ThemedText>
						</TouchableOpacity>
					))}
				</View>

				{renderContent()}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	container: {
		paddingHorizontal: 20,
		paddingTop: 20, // Added top padding to ensure visibility
		paddingBottom: 40,
	},
	title: {
		textAlign: "center",
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginBottom: 20,
	},
	button: {
		backgroundColor: "#EEEEEE",
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 5,
	},
	activeButton: {
		backgroundColor: "#CCCCCC",
	},
	buttonText: {
		fontSize: 16,
		color: "#333333",
	},
	section: {
		marginBottom: 30,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "600",
		marginBottom: 10,
	},
	text: {
		fontSize: 16,
		lineHeight: 24,
	},
	image: {
		width: width - 40,
		height: 200,
		borderRadius: 8,
		alignSelf: "center",
	},
	videoContainer: {
		alignItems: "center",
	},
	video: {
		width: width - 40,
		height: 200,
		borderRadius: 8,
		alignSelf: "center",
	},
	videoControl: {
		marginTop: 10,
		paddingVertical: 8,
		paddingHorizontal: 16,
		backgroundColor: "#EEEEEE",
		borderRadius: 5,
	},
});

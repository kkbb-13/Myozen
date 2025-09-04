import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  useWindowDimensions,
  Pressable,
  ImageSourcePropType,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from "react-native-reanimated";

export default function AfterLoginScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isTabletOrDesktop = width >= 768;

  const cardWidth = isTabletOrDesktop ? width * 0.35 : width * 0.85;
  const imageHeight = isTabletOrDesktop ? height * 0.35 : height * 0.25;

  // --- Fade-in animation for the whole container
  const opacity = useSharedValue(0);
  const fadeInStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
  }, []);

  // Reusable zoom + press bounce
  const useZoomEffect = () => {
    const scale = useSharedValue(1);
    const shadow = useSharedValue(5);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      shadowRadius: shadow.value,
    }));

    const onHoverIn = () => {
      scale.value = withSpring(1.05, { damping: 10, stiffness: 100 });
      shadow.value = withTiming(15, { duration: 200 });
    };

    const onHoverOut = () => {
      scale.value = withSpring(1, { damping: 10, stiffness: 100 });
      shadow.value = withTiming(5, { duration: 200 });
    };

    const onPressIn = () => {
      // small bounce effect
      scale.value = withSequence(
        withSpring(0.95, { damping: 10, stiffness: 150 }),
        withSpring(1.05, { damping: 10, stiffness: 150 })
      );
    };

    const onPressOut = () => {
      scale.value = withSpring(1, { damping: 10, stiffness: 150 });
    };

    return { animatedStyle, onHoverIn, onHoverOut, onPressIn, onPressOut };
  };

  const hospitalZoom = useZoomEffect();
  const clinicZoom = useZoomEffect();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.View
        style={[
          styles.cardContainer,
          { flexDirection: isTabletOrDesktop ? "row" : "column" },
          fadeInStyle,
        ]}
      >
        {/* HOSPITAL */}
        <Animated.View
          style={[
            styles.card,
            { width: cardWidth },
            hospitalZoom.animatedStyle,
          ]}
        >
          <Pressable
            onPress={() => router.push("/Hospital")}
            onHoverIn={hospitalZoom.onHoverIn}
            onHoverOut={hospitalZoom.onHoverOut}
            onPressIn={hospitalZoom.onPressIn}
            onPressOut={hospitalZoom.onPressOut}
          >
            <ImageBackground
              source={
                require("../../assets/images/Hospital.jpeg") as ImageSourcePropType
              }
              style={[styles.image, { height: imageHeight }]}
              imageStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
              resizeMode="cover"
            >
              <View style={styles.overlay}>
                <Text style={styles.heading}>HOSPITAL</Text>
              </View>
            </ImageBackground>
          </Pressable>
        </Animated.View>

        {/* CLINIC */}
        <Animated.View
          style={[styles.card, { width: cardWidth }, clinicZoom.animatedStyle]}
        >
          <Pressable
            onPress={() => router.push("/Clinic")}
            onHoverIn={clinicZoom.onHoverIn}
            onHoverOut={clinicZoom.onHoverOut}
            onPressIn={clinicZoom.onPressIn}
            onPressOut={clinicZoom.onPressOut}
          >
            <ImageBackground
              source={
                require("../../assets/images/Clinic.jpeg") as ImageSourcePropType
              }
              style={[styles.image, { height: imageHeight }]}
              imageStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
              resizeMode="cover"
            >
              <View style={styles.overlay}>
                <Text style={styles.heading}>CLINIC</Text>
              </View>
            </ImageBackground>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f0f6ff",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  cardContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: 30,
    flexWrap: "wrap",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 10,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    justifyContent: "flex-end",
  },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingVertical: 10,
    alignItems: "center",
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
});

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  useWindowDimensions,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

// This would likely be passed in as a prop or retrieved from a global state/context
const appName = "MYOZEN";

export default function ProfileScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  const handleLogout = () => {
    // In a real app, you would clear any user session data here
    // (e.g., tokens, user info from AsyncStorage or state management)
    console.log("User logging out...");
    // Replace the current screen with the Login screen so the user can't go back
    router.replace("/Login");
  };

  return (
    <LinearGradient colors={["#d0e8ff", "#f5f7fa"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={[styles.card, isLargeScreen && { width: 450 }]}>
            <View style={styles.header}>
              <Ionicons
                name="person-circle-outline"
                size={80}
                color="#003366"
              />
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.doctorName}>{appName}</Text>
              <Text style={styles.subtitle}>
                are You Sure You Want To Logout?
              </Text>
            </View>

            {/* You could add other profile options here */}
            {/* <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuItemText}>Edit Profile</Text>
                <MaterialIcons name="chevron-right" size={24} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
                <Text style={styles.menuItemText}>Settings</Text>
                <MaterialIcons name="chevron-right" size={24} color="#555" />
            </TouchableOpacity> 
            */}

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <MaterialIcons name="logout" size={20} color="#FFFFFF" />
              <Text style={styles.logoutButtonText}>Logout Securely</Text>
            </TouchableOpacity>

            <View style={styles.secureLoginContainer}>
              {" "}
              <Ionicons name="lock-closed" size={16} color="#666" />{" "}
              <Text style={styles.secureLoginText}>Secure Medical Session</Text>{" "}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#003366",
    textAlign: "center",
    marginTop: 10,
  },
  doctorName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#0055a5",
    textAlign: "center",
    marginVertical: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 6,
    maxWidth: "90%",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d32f2f", // A different color for logout
    borderRadius: 8,
    paddingVertical: 16,
    width: "100%",
    marginTop: 20, // Add some space above the button
    marginBottom: 16,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  secureLoginContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  secureLoginText: {
    color: "#666",
    fontSize: 14,
  },
  // Styles for other potential menu items
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
  },
});

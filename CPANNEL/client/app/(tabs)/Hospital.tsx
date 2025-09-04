import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Animated,
  Pressable,
  Platform,
  Easing,
  ScrollView,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";

interface Hospital {
  id: number;
  name: string;
  productId: string;
  address: string;
  email: string;
}

const navItems = [
  { label: "VIEW HOSPITAL", icon: "eye-outline", path: "/Hospital" },
  {
    label: "ADD HOSPITAL",
    icon: "add-circle-outline",
    path: "/Addhospital",
  },
  { label: "LOGOUT", icon: "log-out-outline", path: "/Logout" },
] as const;

// This will be our initial data
const initialHospitals: Hospital[] = [
  {
    id: 1,
    name: "HealthFirst Hospital",
    productId: "P-1001",
    address: "12 Main St, Chennai",
    email: "healthfirst@example.com",
  },
  {
    id: 2,
    name: "Sunrise Care Hospital",
    productId: "P-1002",
    address: "88 Sunrise Rd, Madurai",
    email: "sunrisecare@example.com",
  },
  {
    id: 3,
    name: "Lifeline Hospital",
    productId: "P-1003",
    address: "33 Lifeline Ave, Coimbatore",
    email: "lifeline@example.com",
  },
  {
    id: 4,
    name: "Hopewell Health Hospital",
    productId: "P-1004",
    address: "10 Hopewell St, Trichy",
    email: "hopewell@example.com",
  },
  {
    id: 5,
    name: "Cure Hospital",
    productId: "P-1005",
    address: "77 East Rd, Salem",
    email: "curehospital@example.com",
  },
  {
    id: 6,
    name: "NovaMed Center",
    productId: "P-1006",
    address: "89 Nova St, Erode",
    email: "novamed@example.com",
  },
  {
    id: 7,
    name: "Care & Cure Hospital",
    productId: "P-1007",
    address: "52 Park Lane, Tirunelveli",
    email: "carecure@example.com",
  },
  {
    id: 8,
    name: "Metro Health Hospital",
    productId: "P-1008",
    address: "105 Metro Rd, Thanjavur",
    email: "metrohealth@example.com",
  },
  {
    id: 9,
    name: "GreenLeaf Hospital",
    productId: "P-1009",
    address: "22 Garden St, Vellore",
    email: "greenleaf@example.com",
  },
  {
    id: 10,
    name: "Vitality Center Hospital",
    productId: "P-1010",
    address: "39 Wellness Dr, Puducherry",
    email: "vitality@example.com",
  },
];

const HospitalCard = React.memo(
  ({
    hospital,
    onPress,
    onDelete,
  }: {
    hospital: Hospital;
    onPress: () => void;
    onDelete: () => void;
  }) => {
    const cardColors = ["#e6f0ff", "#f9f9ff", "#f5deedff"];
    const bgColor = cardColors[hospital.id % cardColors.length];
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handleHoverIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 1.05,
        useNativeDriver: true,
      }).start();
    };

    const handleHoverOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Pressable
        onPress={onPress}
        onHoverIn={handleHoverIn}
        onHoverOut={handleHoverOut}
      >
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: bgColor, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{hospital.name.charAt(0)}</Text>
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {hospital.name}
          </Text>
          <Text style={styles.subText} numberOfLines={1}>
            Product ID: {hospital.productId}
          </Text>
          <Text style={styles.subText} numberOfLines={1}>
            📍 {hospital.address}
          </Text>
          <Text style={styles.subText} numberOfLines={1}>
            ✉️ {hospital.email}
          </Text>

          <TouchableOpacity
            style={styles.deleteIcon}
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            accessibilityLabel={`Delete ${hospital.name}`}
          >
            <Ionicons name="trash-outline" size={22} color="#c53030" />
          </TouchableOpacity>
        </Animated.View>
      </Pressable>
    );
  }
);

const HospitalList: React.FC = () => {
  const { width } = useWindowDimensions();
  const isTabletOrPC = width >= 768;
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [hospitals, setHospitals] = useState(initialHospitals);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const searchSlideAnim = useRef(new Animated.Value(30)).current;
  const cardAnimations = useRef(
    hospitals.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(searchSlideAnim, {
        toValue: 0,
        duration: 700,
        delay: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();

    const cardAnimationsSequence = cardAnimations.map((anim, index) => {
      return Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: 400 + index * 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.2)),
      });
    });

    Animated.stagger(100, cardAnimationsSequence).start();
  }, []);

  const filteredHospitals = React.useMemo(() => {
    if (!searchQuery) return hospitals;
    const query = searchQuery.toLowerCase();
    return hospitals.filter(
      (hospital) =>
        hospital.name.toLowerCase().includes(query) ||
        hospital.productId.toLowerCase().includes(query) ||
        hospital.address.toLowerCase().includes(query)
    );
  }, [searchQuery, hospitals]);

  const isCurrentRoute = (path: string) =>
    pathname?.toLowerCase() === path.toLowerCase();

  const handleDeleteHospital = (hospitalId: number) => {
    // DEBUGGING: Check if this function is called
    console.log(`Delete icon clicked for ID: ${hospitalId}`);

    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this hospital?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            setHospitals((currentHospitals) =>
              currentHospitals.filter((hospital) => hospital.id !== hospitalId)
            );
          },
          style: "destructive",
        },
      ]
    );
  };

  const renderItem = ({ item, index }: { item: Hospital; index: number }) => {
    const animationIndex = initialHospitals.findIndex((h) => h.id === item.id);
    const anim = cardAnimations[animationIndex] || new Animated.Value(1);

    const cardScale = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.7, 1],
    });

    const cardOpacity = anim;
    const cardTranslateY = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0],
    });

    return (
      <Animated.View
        key={item.id}
        style={[
          styles.cardContainer,
          {
            opacity: cardOpacity,
            transform: [{ scale: cardScale }, { translateY: cardTranslateY }],
            width: isTabletOrPC ? "30%" : width > 400 ? "48%" : "100%",
          },
        ]}
      >
        <HospitalCard
          hospital={item}
          onPress={() =>
            router.push({
              pathname: "/Hospitaldetails",
              params: {
                id: item.id.toString(),
                name: item.name,
                productId: item.productId,
                address: item.address,
                email: item.email,
              },
            })
          }
          onDelete={() => handleDeleteHospital(item.id)}
        />
      </Animated.View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { flexDirection: isTabletOrPC ? "row" : "column" },
      ]}
    >
      {isTabletOrPC && (
        <View style={styles.sidebar}>
          <Text style={styles.sidebarTitle}>HOSPITAL DASHBOARD</Text>
          {navItems.map((item) => {
            const isActive = isCurrentRoute(item.path);
            const [hoverAnim] = useState(new Animated.Value(1));

            const zoomIn = () => {
              Animated.spring(hoverAnim, {
                toValue: 1.08,
                friction: 5,
                useNativeDriver: true,
              }).start();
            };

            const zoomOut = () => {
              Animated.spring(hoverAnim, {
                toValue: 1,
                friction: 5,
                useNativeDriver: true,
              }).start();
            };

            return (
              <Pressable
                key={item.path}
                onPress={() => router.push(item.path as any)}
                onHoverIn={Platform.OS === "web" ? zoomIn : undefined}
                onHoverOut={Platform.OS === "web" ? zoomOut : undefined}
                onPressIn={Platform.OS !== "web" ? zoomIn : undefined}
                onPressOut={Platform.OS !== "web" ? zoomOut : undefined}
              >
                <Animated.View
                  style={[
                    styles.navItem,
                    isActive && styles.activeNavItem,
                    { transform: [{ scale: hoverAnim }] },
                  ]}
                >
                  <Ionicons name={item.icon as any} size={22} color="#ffffff" />
                  <Text
                    style={[styles.navText, isActive && styles.activeNavText]}
                  >
                    {item.label}
                  </Text>
                </Animated.View>
              </Pressable>
            );
          })}
        </View>
      )}

      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: !isTabletOrPC ? 80 : 20 },
        ]}
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.innerContent,
            { maxWidth: isTabletOrPC ? 900 : "100%" },
          ]}
        >
          <Animated.View
            style={[
              styles.topBar,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text
              style={[styles.topBarTitle, { fontSize: isTabletOrPC ? 30 : 24 }]}
            >
              Hospital List
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.searchRow,
              {
                opacity: fadeAnim,
                transform: [{ translateY: searchSlideAnim }],
              },
            ]}
          >
            <View style={styles.searchContainer}>
              <View style={styles.searchInputWrapper}>
                <Ionicons
                  name="search"
                  size={18}
                  color="#3973d6"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search hospital, product ID, or address..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#999"
                  accessibilityLabel="Search hospitals"
                />
              </View>
            </View>

            <View style={styles.hospitalCountContainer}>
              <Text style={styles.hospitalCount}>
                Total Hospitals: {filteredHospitals.length}
              </Text>
            </View>
          </Animated.View>

          <View
            style={[
              styles.gridContainer,
              {
                justifyContent: isTabletOrPC ? "flex-start" : "center",
              },
            ]}
          >
            {filteredHospitals.map((item, index) =>
              renderItem({ item, index })
            )}
          </View>

          {filteredHospitals.length === 0 && (
            <Animated.Text
              style={[
                styles.noResultsText,
                {
                  fontSize: isTabletOrPC ? 18 : 16,
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              No matching hospitals found.
            </Animated.Text>
          )}
        </View>
      </ScrollView>

      {!isTabletOrPC && (
        <View style={styles.bottomNav}>
          {navItems.map((item) => {
            const isActive = isCurrentRoute(item.path);
            return (
              <TouchableOpacity
                key={item.path}
                style={styles.bottomNavItem}
                onPress={() => router.push(item.path as any)}
              >
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={isActive ? "#3973d6" : "#888"}
                />
                <Text
                  style={[
                    styles.bottomNavLabel,
                    { color: isActive ? "#3973d6" : "#888" },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#e6f0ff",
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#e6f0ff",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  innerContent: {
    width: "100%",
    alignSelf: "center",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  topBarTitle: {
    fontWeight: "bold",
    color: "#003366",
    textShadowColor: "rgba(0, 51, 102, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    flexWrap: "wrap",
  },
  searchContainer: {
    flex: 1,
    marginRight: 16,
    minWidth: 250,
  },
  hospitalCountContainer: {
    justifyContent: "center",
  },
  hospitalCount: {
    fontSize: 16,
    color: "#003366",
    fontWeight: "500",
    marginRight: 64,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#cce0ff",
    shadowColor: "#3973d6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000",
    ...(Platform.OS === "web"
      ? { outlineWidth: 0, outlineColor: "transparent" }
      : {}),
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: Platform.OS === "web" ? -6 : -10,
  },
  cardContainer: {
    marginBottom: 16,
    marginHorizontal: Platform.OS === "web" ? 6 : 5,
  },
  card: {
    height: 200,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3973d6",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(204, 224, 255, 0.5)",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3973d6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#3973d6",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 4,
    color: "#2c5282",
  },
  subText: {
    color: "#4a5568",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 4,
  },
  noResultsText: {
    textAlign: "center",
    marginTop: 40,
    color: "#718096",
    fontWeight: "500",
  },
  sidebar: {
    width: 220,
    backgroundColor: "#3973d6",
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  sidebarTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
    marginLeft: 10,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  activeNavItem: {
    backgroundColor: "#2455a4",
    borderLeftWidth: 4,
    borderLeftColor: "#FFD700",
  },
  navText: {
    color: "#fff",
    marginLeft: 12,
    fontSize: 15,
  },
  activeNavText: {
    fontWeight: "bold",
    color: "#fff",
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  bottomNavItem: {
    alignItems: "center",
  },
  bottomNavLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
    textAlign: "center",
  },
  deleteIcon: {
    position: "absolute",
    bottom: 10,
    right: 10,
    padding: 5,
    borderRadius: 20,
    backgroundColor: "rgba(255, 204, 204, 0.5)",
    zIndex: 1, // Ensures the icon is clickable
  },
});

export default HospitalList;

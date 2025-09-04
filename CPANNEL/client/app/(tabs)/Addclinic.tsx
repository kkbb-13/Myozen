import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button, // Note: This is no longer used for the submit button
  useWindowDimensions,
  ScrollView,
  Platform,
  Animated,
  Easing,
  Pressable,
  Keyboard,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import * as DocumentPicker from "expo-document-picker";

const navItems = [
  { label: "VIEW CLINIC", icon: "eye-outline", path: "/Clinic" }, // Changed
  {
    label: "ADD CLINIC",
    icon: "add-circle-outline",
    path: "/AddClinic", // Changed
  },
  { label: "LOGOUT", icon: "exit-outline", path: "/Logout" },
] as const;

const ClinicForm = () => {
  // Renamed component
  const { width } = useWindowDimensions();
  const isTabletOrPC = width >= 768;
  const router = useRouter();
  const pathname = usePathname();
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // 🔹 Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  // Adjusted array size as one field was removed
  const inputAnimations = useRef(
    Array(11)
      .fill(0)
      .map(() => new Animated.Value(0))
  ).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  // ✅ START: ADDED FOR POPUP
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const popupAnim = useRef(new Animated.Value(0)).current;
  // ✅ END: ADDED FOR POPUP

  // 🔹 Refs for input fields
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const deviceIdInputRef = useRef<TextInput | null>(null);

  // Clinic details states (Renamed from hospital)
  const [clinicName, setClinicName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [gst, setGst] = useState("");
  const [productId, setProductId] = useState("");
  const [clinicId, setClinicId] = useState(""); // Renamed
  const [productSellDate, setProductSellDate] = useState("");
  const [productCount, setProductCount] = useState("");
  const [pdfFile, setPdfFile] = useState<any>(null);

  const [accessDeviceIds, setAccessDeviceIds] = useState<string[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState("");

  // ✅ START: VALIDATION CHANGES - Add state to hold errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // ✅ END: VALIDATION CHANGES

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, fields.length);
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
    ]).start();
    const inputSequence = inputAnimations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: 400 + index * 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.2)),
      })
    );
    Animated.stagger(100, inputSequence).start();
  }, []);

  // ✅ START: USEEFFECT FOR POPUP ANIMATION
  useEffect(() => {
    if (isPopupVisible) {
      Animated.spring(popupAnim, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        setIsPopupVisible(false);
      }, 2000); // Popup will be visible for 2 seconds

      return () => clearTimeout(timer);
    } else {
      Animated.timing(popupAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isPopupVisible]);
  // ✅ END: USEEFFECT FOR POPUP ANIMATION

  const handleAddDeviceId = () => {
    if (currentDeviceId.trim() !== "") {
      if (accessDeviceIds.includes(currentDeviceId.trim())) {
        Alert.alert("Duplicate ID", "This Device ID has already been added.");
        return;
      }
      const newDeviceIds = [...accessDeviceIds, currentDeviceId.trim()];
      setAccessDeviceIds(newDeviceIds);
      setProductCount(String(newDeviceIds.length));
      setCurrentDeviceId("");
    }
  };

  const handleRemoveDeviceId = (indexToRemove: number) => {
    const newDeviceIds = accessDeviceIds.filter(
      (_, index) => index !== indexToRemove
    );
    setAccessDeviceIds(newDeviceIds);
    setProductCount(String(newDeviceIds.length));
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (
        !result.canceled &&
        (result as any).assets &&
        (result as any).assets.length > 0
      ) {
        const selectedFile = (result as any).assets[0];
        setPdfFile({
          name: selectedFile.name,
          uri: selectedFile.uri,
          size: selectedFile.size,
          type: "success",
        });
        if (errors.pdfFile) {
          setErrors((prev) => ({ ...prev, pdfFile: "" }));
        }
        Alert.alert(
          "Success",
          `PDF file "${selectedFile.name}" selected successfully!`
        );
      }
    } catch (err) {
      console.error("Error picking document:", err);
      Alert.alert("Error", "Error selecting PDF file. Please try again.");
    }
  };

  const removeDocument = () => {
    setPdfFile(null);
    Alert.alert("Removed", "PDF file removed successfully!");
  };

  const viewDocument = async (uri?: string) => {
    if (!uri) {
      Alert.alert("No file", "No PDF file URI is available to open.");
      return;
    }
    try {
      if (await Linking.canOpenURL(uri)) {
        await Linking.openURL(uri);
      } else {
        Alert.alert(
          "Can't open file",
          "This file can't be opened on this device."
        );
      }
    } catch (err) {
      console.error("Error opening PDF:", err);
      Alert.alert("Error", "Unable to open the PDF file.");
    }
  };

  // Simplified handleEnterPress
  const handleEnterPress = (index: number) => {
    if (index < fields.length - 1) {
      inputRefs.current[index + 1]?.focus();
    } else {
      // Last item in fields array, focus the device ID input
      deviceIdInputRef.current?.focus();
    }
  };

  // ✅ START: DATE FORMATTING FUNCTION
  const handleDateChange = (text: string) => {
    const cleaned = text.replace(/[^\d]/g, "");
    const truncated = cleaned.substring(0, 8);
    let formattedDate = truncated;
    if (truncated.length > 4) {
      formattedDate = `${truncated.substring(0, 2)}/${truncated.substring(
        2,
        4
      )}/${truncated.substring(4)}`;
    } else if (truncated.length > 2) {
      formattedDate = `${truncated.substring(0, 2)}/${truncated.substring(2)}`;
    }
    setProductSellDate(formattedDate);
  };
  // ✅ END: DATE FORMATTING FUNCTION

  // ✅ START: VALIDATION CHANGES - Updated handleSubmit function
  const handleSubmit = () => {
    const newErrors: { [key: string]: string } = {};

    if (!clinicName.trim()) newErrors.clinicName = "Clinic Name is required"; // Changed
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";
    if (!contact.trim()) newErrors.contact = "Contact No is required";
    if (!address.trim()) newErrors.address = "Address is required";
    if (!gst.trim()) newErrors.gst = "GST No is required";
    if (!productId.trim()) newErrors.productId = "Product ID is required";
    if (!clinicId.trim()) newErrors.clinicId = "Clinic ID is required"; // Changed
    if (!productSellDate.trim())
      newErrors.productSellDate = "Product Sell Date is required";
    if (!productCount.trim())
      newErrors.productCount = "Product Count is required";
    if (!pdfFile) newErrors.pdfFile = "Billing PDF is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert("Incomplete Form", "Please fill all the required fields.");
      return;
    }

    setErrors({}); // Clear errors if validation passes

    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 200,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
    ]).start();

    const formData = {
      clinicName, // Changed
      email,
      contact,
      address,
      gst,
      productId,
      accessDeviceIds,
      clinicId, // Changed
      productSellDate,
      productCount,
      pdfFile: pdfFile
        ? { name: pdfFile.name, uri: pdfFile.uri, size: pdfFile.size }
        : null,
    };

    console.log("Form Data:", formData);
    setIsPopupVisible(true);
    Keyboard.dismiss();
  };
  // ✅ END: VALIDATION CHANGES

  const fields = [
    {
      label: "Clinic Name", // Changed
      value: clinicName,
      onChange: setClinicName,
      key: "clinicName", // Changed
      ref: (el: TextInput | null) => (inputRefs.current[0] = el),
      onSubmit: () => handleEnterPress(0),
      returnKeyType: "next" as const,
    },
    {
      label: "Email",
      value: email,
      onChange: setEmail,
      key: "email",
      ref: (el: TextInput | null) => (inputRefs.current[1] = el),
      onSubmit: () => handleEnterPress(1),
      returnKeyType: "next" as const,
    },
    {
      label: "Contact No",
      value: contact,
      onChange: setContact,
      key: "contact",
      ref: (el: TextInput | null) => (inputRefs.current[2] = el),
      onSubmit: () => handleEnterPress(2),
      returnKeyType: "next" as const,
    },
    {
      label: "Address",
      value: address,
      onChange: setAddress,
      key: "address",
      ref: (el: TextInput | null) => (inputRefs.current[3] = el),
      onSubmit: () => handleEnterPress(3),
      returnKeyType: "next" as const,
    },
    {
      label: "GST No",
      value: gst,
      onChange: setGst,
      key: "gst",
      ref: (el: TextInput | null) => (inputRefs.current[4] = el),
      onSubmit: () => handleEnterPress(4),
      returnKeyType: "next" as const,
    },
    {
      label: "Product ID",
      value: productId,
      onChange: setProductId,
      key: "productId",
      ref: (el: TextInput | null) => (inputRefs.current[5] = el),
      onSubmit: () => handleEnterPress(5),
      returnKeyType: "next" as const,
    },
    {
      label: "Clinic ID", // Changed
      value: clinicId,
      onChange: setClinicId,
      key: "clinicId", // Changed
      ref: (el: TextInput | null) => (inputRefs.current[6] = el),
      onSubmit: () => handleEnterPress(6),
      returnKeyType: "next" as const,
    },
    {
      label: "Product Sell Date",
      value: productSellDate,
      onChange: handleDateChange,
      key: "productSellDate",
      ref: (el: TextInput | null) => (inputRefs.current[7] = el), // Index updated
      onSubmit: () => handleEnterPress(7), // Index updated
      returnKeyType: "next" as const,
      keyboardType: "numeric" as const,
      maxLength: 10,
    },
  ];

  const isCurrentRoute = (path: string) =>
    pathname?.toLowerCase() === path.toLowerCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {isTabletOrPC && (
          <View style={styles.sidebar}>
            <Text style={styles.sidebarTitle}>CLINIC DASHBOARD</Text>{" "}
            {/* Changed */}
            {navItems.map((item) => {
              const isActive = isCurrentRoute(item.path);
              const [hoverAnim] = useState(new Animated.Value(1));
              const zoomIn = () =>
                Animated.spring(hoverAnim, {
                  toValue: 1.08,
                  friction: 5,
                  useNativeDriver: true,
                }).start();
              const zoomOut = () =>
                Animated.spring(hoverAnim, {
                  toValue: 1,
                  friction: 5,
                  useNativeDriver: true,
                }).start();
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
                    <Ionicons
                      name={item.icon as any}
                      size={22}
                      color="#ffffff"
                    />
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
          style={styles.formScroll}
          contentContainerStyle={[
            styles.formContainer,
            { paddingHorizontal: isTabletOrPC ? 50 : 25 },
          ]}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Text style={styles.heading}>Add New Clinic</Text> {/* Changed */}
          </Animated.View>

          <View style={styles.inputWrapper}>
            {fields.map((field, index) => {
              return (
                <AnimatedInputField
                  key={field.key}
                  label={field.label}
                  value={field.value}
                  onChange={field.onChange}
                  isFocused={focusedInput === field.key}
                  onFocus={() => setFocusedInput(field.key)}
                  onBlur={() => setFocusedInput(null)}
                  animation={inputAnimations[index]}
                  inputRef={field.ref}
                  onSubmitEditing={field.onSubmit}
                  returnKeyType={field.returnKeyType}
                  error={errors[field.key]}
                  keyboardType={field.keyboardType}
                  maxLength={field.maxLength}
                />
              );
            })}

            <Animated.View
              style={[
                styles.inputGroup,
                {
                  opacity: inputAnimations[8], // Animation index updated
                  transform: [
                    {
                      scale: inputAnimations[8].interpolate({
                        // Index updated
                        inputRange: [0, 1],
                        outputRange: [0.7, 1],
                      }),
                    },
                    {
                      translateY: inputAnimations[8].interpolate({
                        // Index updated
                        inputRange: [0, 1],
                        outputRange: [40, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.label}>Access Device IDs</Text>
              <View style={styles.deviceIdRow}>
                <TextInput
                  ref={deviceIdInputRef}
                  style={styles.deviceIdInput}
                  placeholder="Enter Device ID"
                  placeholderTextColor="#999"
                  value={currentDeviceId}
                  onChangeText={setCurrentDeviceId}
                  onSubmitEditing={handleAddDeviceId}
                />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAddDeviceId}
                >
                  <Ionicons name="add-circle" size={24} color="#fff" />
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>

              {accessDeviceIds.length > 0 && (
                <View style={styles.idListContainer}>
                  {accessDeviceIds.map((id, index) => (
                    <View key={index} style={styles.idListItem}>
                      <Text style={styles.idListText}>{id}</Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveDeviceId(index)}
                      >
                        <Ionicons
                          name="close-circle"
                          size={22}
                          color="#ff3b30"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </Animated.View>

            <AnimatedInputField
              label="Product Count"
              value={productCount}
              onChange={setProductCount}
              isFocused={focusedInput === "productCount"}
              onFocus={() => setFocusedInput("productCount")}
              onBlur={() => setFocusedInput(null)}
              animation={inputAnimations[9]} // Animation index updated
              error={errors["productCount"]}
              keyboardType="numeric"
              editable={false}
            />

            <Animated.View
              style={[
                styles.inputGroup,
                {
                  opacity: inputAnimations[10], // Animation index updated
                  transform: [
                    {
                      scale: inputAnimations[10].interpolate({
                        // Index updated
                        inputRange: [0, 1],
                        outputRange: [0.7, 1],
                      }),
                    },
                    {
                      translateY: inputAnimations[10].interpolate({
                        // Index updated
                        inputRange: [0, 1],
                        outputRange: [40, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text
                style={[styles.label, errors.pdfFile && { color: "#ff3b30" }]}
              >
                Billing Details (PDF)
              </Text>

              {pdfFile?.name ? (
                <View style={styles.pdfInfoContainer}>
                  <Ionicons
                    name="document-text-outline"
                    size={24}
                    color="#007BFF"
                  />
                  <View style={styles.pdfInfo}>
                    <Text style={styles.pdfFileName} numberOfLines={1}>
                      {pdfFile.name}
                    </Text>
                    {pdfFile.size && (
                      <Text style={styles.pdfFileSize}>
                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => viewDocument(pdfFile.uri)}
                    style={styles.viewButton}
                  >
                    <Ionicons name="eye-outline" size={18} color="#fff" />
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={removeDocument}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={24} color="#ff3b30" />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    style={[
                      styles.uploadButton,
                      errors.pdfFile && { borderColor: "#ff3b30" },
                    ]}
                    onPress={pickDocument}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="cloud-upload-outline"
                      size={24}
                      color={errors.pdfFile ? "#ff3b30" : "#007BFF"}
                    />
                    <Text
                      style={[
                        styles.uploadButtonText,
                        errors.pdfFile && { color: "#ff3b30" },
                      ]}
                    >
                      Upload PDF File
                    </Text>
                    <Text style={styles.uploadSubText}>
                      Click here to select a PDF file
                    </Text>
                  </TouchableOpacity>
                  {errors.pdfFile && (
                    <Text style={styles.errorText}>{errors.pdfFile}</Text>
                  )}
                </>
              )}
            </Animated.View>
          </View>

          {/* ✅ START: CODE UPDATED HERE */}
          <Animated.View
            style={[
              styles.buttonContainer,
              { transform: [{ scale: scaleValue }] },
            ]}
          >
            {/* The Button component is replaced with TouchableOpacity */}
            <TouchableOpacity
              style={styles.submitButton} // We will add this new style
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Ionicons name="mail-outline" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>
                SAVE AND VERIFY EMAIL
              </Text>{" "}
              {/* New style */}
            </TouchableOpacity>
          </Animated.View>
          {/* ✅ END: CODE UPDATED HERE */}
        </ScrollView>
      </View>

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
                  color={isActive ? "#1d4ed8" : "#555"}
                />
                <Text
                  style={[
                    styles.bottomNavText,
                    isActive && { color: "#1d4ed8", fontWeight: "bold" },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {isPopupVisible && (
        <Animated.View
          style={[
            styles.popupContainer,
            {
              opacity: popupAnim,
              transform: [
                {
                  scale: popupAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Ionicons name="checkmark-circle" size={50} color="#4CAF50" />
          <Text style={styles.popupText}>VERIFIED SUCCESSFULLY</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

// AnimatedInputField component remains the same, no changes needed there
const AnimatedInputField = ({
  label,
  value,
  onChange,
  isFocused,
  onFocus,
  onBlur,
  animation,
  inputRef,
  onSubmitEditing,
  returnKeyType,
  error,
  keyboardType,
  maxLength,
  editable = true,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  isFocused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  animation: Animated.Value;
  inputRef?: (ref: TextInput | null) => void;
  onSubmitEditing?: () => void;
  returnKeyType?: "next" | "done" | "go" | "search" | "send";
  error?: string;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  maxLength?: number;
  editable?: boolean;
}) => {
  const borderColor = error ? "#ff3b30" : isFocused ? "#007BFF" : "#ccc";
  const labelColor = error ? "#ff3b30" : isFocused ? "#007BFF" : "#333";
  const cardScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });
  const cardOpacity = animation;
  const cardTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  return (
    <Animated.View
      style={[
        styles.inputGroup,
        isFocused && styles.inputGroupFocused,
        {
          borderColor,
          shadowColor: isFocused ? "rgba(0, 123, 255, 0.3)" : "transparent",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: isFocused ? 1 : 0,
          shadowRadius: isFocused ? 10 : 0,
          opacity: cardOpacity,
          transform: [{ scale: cardScale }, { translateY: cardTranslateY }],
        },
      ]}
    >
      <Animated.Text style={[styles.label, { color: labelColor }]}>
        {label}
      </Animated.Text>
      <TextInput
        style={[
          styles.input,
          {
            borderColor,
            borderWidth: error || isFocused ? 1.5 : 1,
            backgroundColor: !editable ? "#f0f0f0" : "#fff",
          },
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={
          error
            ? error
            : label === "Product Sell Date"
            ? "DD/MM/YYYY"
            : `Enter ${label}`
        }
        placeholderTextColor={error ? "#ff3b30" : "#999"}
        onFocus={onFocus}
        onBlur={onBlur}
        ref={inputRef}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
        blurOnSubmit={returnKeyType === "done"}
        keyboardType={keyboardType}
        maxLength={maxLength}
        editable={editable}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </Animated.View>
  );
};

// Styles remain the same, with two new styles added for the submit button
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5f9ff" },
  container: { flex: 1, flexDirection: "row" },
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
  navText: { color: "#fff", marginLeft: 12, fontSize: 15 },
  activeNavText: { fontWeight: "bold", color: "#fff" },
  formScroll: { flex: 1, backgroundColor: "#f5f9ff" },
  formContainer: { paddingVertical: 30, alignItems: "center" },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 30,
    color: "#003366",
    alignSelf: "center",
  },
  inputWrapper: {
    backgroundColor: "#fff",
    padding: 35,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    width: "100%",
    maxWidth: 600,
  },
  inputGroup: { marginBottom: 22, borderRadius: 12, padding: 8 },
  inputGroupFocused: { backgroundColor: "rgba(0, 123, 255, 0.03)" },
  label: { marginBottom: 8, fontWeight: "600", fontSize: 15, paddingLeft: 5 },
  input: {
    padding: Platform.OS === "ios" ? 16 : 14,
    borderRadius: 12,
    backgroundColor: "#fff",
    fontSize: 15,
  },
  buttonContainer: {
    marginTop: 32,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    borderRadius: 12,
    overflow: "hidden",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  bottomNavItem: { alignItems: "center", flex: 1 },
  bottomNavText: { fontSize: 12, marginTop: 4, color: "#555" },
  uploadButton: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderWidth: 2,
    borderColor: "#007BFF",
    borderStyle: "dashed",
    borderRadius: 12,
    backgroundColor: "#f8fbff",
    minHeight: 100,
  },
  uploadButtonText: {
    marginTop: 8,
    color: "#007BFF",
    fontWeight: "600",
    fontSize: 16,
  },
  uploadSubText: {
    marginTop: 4,
    color: "#666",
    fontSize: 12,
    textAlign: "center",
  },
  pdfInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#007BFF",
    borderRadius: 12,
    backgroundColor: "#f8fbff",
    minHeight: 60,
    justifyContent: "space-between",
  },
  pdfInfo: { flex: 1, marginLeft: 12 },
  pdfFileName: {
    color: "#007BFF",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 2,
  },
  pdfFileSize: { fontSize: 12, color: "#666" },
  removeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#007BFF",
    marginRight: 8,
  },
  viewButtonText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
    fontSize: 13,
  },
  deviceIdRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  deviceIdInput: {
    flex: 1,
    padding: Platform.OS === "ios" ? 16 : 14,
    borderRadius: 12,
    backgroundColor: "#fff",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginLeft: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 6,
  },
  idListContainer: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  idListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fbff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  idListText: {
    fontSize: 15,
    color: "#333",
  },
  popupContainer: {
    position: "absolute",
    top: "40%",
    alignSelf: "center",
    width: 200,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  popupText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 12,
    marginTop: 5,
    paddingLeft: 5,
  },
  errorInput: {
    borderColor: "#ff3b30",
    borderWidth: 1.5,
  },
  // ✅ START: NEW STYLES ADDED HERE
  submitButton: {
    backgroundColor: "#007BFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 12,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
  // ✅ END: NEW STYLES ADDED HERE
});

export default ClinicForm;

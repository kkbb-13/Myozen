import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
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
  { label: "VIEW HOSPITAL", icon: "eye-outline", path: "/Hospital" },
  {
    label: "ADD HOSPITAL",
    icon: "add-circle-outline",
    path: "/Addhospital",
  },
  { label: "LOGOUT", icon: "exit-outline", path: "/Logout" },
] as const;

const HOSPITAL_TYPES = ["Private", "Government", "Trust", "Specialty"];

const HospitalForm = () => {
  const { width } = useWindowDimensions();
  const isTabletOrPC = width >= 768;
  const router = useRouter();
  const pathname = usePathname();
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // 🔹 Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const inputAnimations = useRef(
    Array(12)
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
  // Hidden text input ref to capture Enter/Done for dropdown
  const hospitalTypeInputRef = useRef<TextInput | null>(null);

  // ✨ START: MOVED - Added ref for Device ID input to improve navigation
  const deviceIdInputRef = useRef<TextInput | null>(null);
  // ✨ END: MOVED

  // ⭐️ START: FIX - Added dedicated refs for conditional inputs
  const trustInputRef = useRef<TextInput | null>(null);
  const specialtyInputRef = useRef<TextInput | null>(null);
  // ⭐️ END: FIX

  // Hospital details states
  const [hospitalName, setHospitalName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [gst, setGst] = useState("");
  const [productId, setProductId] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  const [hospitalType, setHospitalType] = useState("");
  const [productSellDate, setProductSellDate] = useState("");
  const [productCount, setProductCount] = useState("");
  const [pdfFile, setPdfFile] = useState<any>(null);

  const [accessDeviceIds, setAccessDeviceIds] = useState<string[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState("");

  // Extra fields for certain hospital types
  const [trustRegistrationNo, setTrustRegistrationNo] = useState("");
  const [specialtyDetails, setSpecialtyDetails] = useState("");

  // Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownAnim = useRef(new Animated.Value(0)).current; // 0 closed, 1 open

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

  // ✅ START: MODIFIED FUNCTION
  const handleAddDeviceId = () => {
    if (currentDeviceId.trim() !== "") {
      if (accessDeviceIds.includes(currentDeviceId.trim())) {
        Alert.alert("Duplicate ID", "This Device ID has already been added.");
        return;
      }
      // Create the new array of device IDs first
      const newDeviceIds = [...accessDeviceIds, currentDeviceId.trim()];
      // Update the device IDs list
      setAccessDeviceIds(newDeviceIds);
      // Update the product count based on the new array's length
      setProductCount(String(newDeviceIds.length));
      setCurrentDeviceId("");
    }
  };
  // ✅ END: MODIFIED FUNCTION

  // ✅ START: MODIFIED FUNCTION
  const handleRemoveDeviceId = (indexToRemove: number) => {
    // Create the new array after filtering
    const newDeviceIds = accessDeviceIds.filter(
      (_, index) => index !== indexToRemove
    );
    // Update the device IDs list
    setAccessDeviceIds(newDeviceIds);
    // Update the product count based on the new length
    setProductCount(String(newDeviceIds.length));
  };
  // ✅ END: MODIFIED FUNCTION

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
        // ✅ START: VALIDATION CHANGES - Clear error on selection
        if (errors.pdfFile) {
          setErrors((prev) => ({ ...prev, pdfFile: "" }));
        }
        // ✅ END: VALIDATION CHANGES
        Alert.alert(
          "Success",
          `PDF file "${selectedFile.name}" selected successfully!`
        );
      } else if ((result as any).type === "success") {
        setPdfFile(result);
        Alert.alert(
          "Success",
          `PDF file "${(result as any).name}" selected successfully!`
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
      const canOpen = await Linking.canOpenURL(uri);
      if (canOpen) {
        await Linking.openURL(uri);
        return;
      }
      if (!uri.includes("://")) {
        const fileUri = `file://${uri}`;
        if (await Linking.canOpenURL(fileUri)) {
          await Linking.openURL(fileUri);
          return;
        }
      }
      Alert.alert(
        "Can't open file",
        "This file can't be opened on this device."
      );
    } catch (err) {
      console.error("Error opening PDF:", err);
      Alert.alert("Error", "Unable to open the PDF file.");
    }
  };

  const handleEnterPress = (index: number) => {
    if (index < fields.length - 1) {
      const nextField = fields[index + 1];
      if (nextField.key === "hospitalType") {
        inputRefs.current[index]?.blur();
        toggleDropdown();
        setFocusedInput("hospitalType");
      } else {
        inputRefs.current[index + 1]?.focus();
      }
    } else {
      // ✨ START: MOVED - When last item in fields array is submitted, focus the device ID input
      deviceIdInputRef.current?.focus();
      // ✨ END: MOVED
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

    if (!hospitalName.trim())
      newErrors.hospitalName = "Hospital Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";
    if (!contact.trim()) newErrors.contact = "Contact No is required";
    if (!address.trim()) newErrors.address = "Address is required";
    if (!gst.trim()) newErrors.gst = "GST No is required";
    if (!productId.trim()) newErrors.productId = "Product ID is required";
    if (!hospitalId.trim()) newErrors.hospitalId = "Hospital ID is required";
    if (!hospitalType) newErrors.hospitalType = "Please select a Hospital Type";
    if (hospitalType === "Trust" && !trustRegistrationNo.trim()) {
      newErrors.trustRegistrationNo = "Trust Registration No is required";
    }
    if (hospitalType === "Specialty" && !specialtyDetails.trim()) {
      newErrors.specialtyDetails = "Specialty Details are required";
    }
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
      hospitalName,
      email,
      contact,
      address,
      gst,
      productId,
      accessDeviceIds,
      hospitalId,
      hospitalType,
      productSellDate,
      productCount,
      trustRegistrationNo: trustRegistrationNo || null,
      specialtyDetails: specialtyDetails || null,
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
      label: "Hospital Name",
      value: hospitalName,
      onChange: setHospitalName,
      key: "hospitalName",
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
      label: "Hospital ID",
      value: hospitalId,
      onChange: setHospitalId,
      key: "hospitalId",
      ref: (el: TextInput | null) => (inputRefs.current[6] = el),
      onSubmit: () => handleEnterPress(6),
      returnKeyType: "next" as const,
    },
    {
      label: "Hospital Type (Private / Government / Trust / Specialty)",
      value: hospitalType,
      onChange: setHospitalType,
      key: "hospitalType",
      ref: (el: TextInput | null) => (inputRefs.current[7] = null),
      onSubmit: () => {},
      returnKeyType: "next" as const,
    },
    // ✅ START: UPDATED PRODUCT SELL DATE FIELD
    {
      label: "Product Sell Date",
      value: productSellDate,
      onChange: handleDateChange, // Use the new formatting function
      key: "productSellDate",
      ref: (el: TextInput | null) => (inputRefs.current[8] = el),
      // ✨ START: MOVED - Updated this to use handleEnterPress to move to the next logical input
      onSubmit: () => handleEnterPress(8),
      // ✨ END: MOVED
      returnKeyType: "next" as const,
      keyboardType: "numeric" as const, // Set keyboard to numeric
      maxLength: 10, // Limit input length to DD/MM/YYYY
    },
    // ✅ END: UPDATED PRODUCT SELL DATE FIELD

    // ✨ START: MOVED - Product Count field definition is removed from here
    // and is now rendered manually below the "Access Device IDs" section.
    // ✨ END: MOVED
  ];

  useEffect(() => {
    Animated.timing(dropdownAnim, {
      toValue: isDropdownOpen ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [isDropdownOpen]);

  const toggleDropdown = () => setIsDropdownOpen((s) => !s);

  const selectHospitalType = (type: string) => {
    setHospitalType(type);
    setIsDropdownOpen(false);
    // ✅ START: VALIDATION CHANGES - Clear error on selection
    if (errors.hospitalType) {
      setErrors((prev) => ({ ...prev, hospitalType: "" }));
    }
    // ✅ END: VALIDATION CHANGES
    if (type !== "Trust") setTrustRegistrationNo("");
    if (type !== "Specialty") setSpecialtyDetails("");
  };

  const getHospitalTypeDescription = (type: string) => {
    switch (type) {
      case "Private":
        return "Private hospitals are owned by individuals or corporations and may be profit-driven.";
      case "Government":
        return "Government hospitals are funded and managed by government bodies, typically serving the public sector.";
      case "Trust":
        return "Trust hospitals are run by charitable trusts or societies. They usually have a registered trust number.";
      case "Specialty":
        return "Specialty hospitals focus on specific medical areas (e.g., cardiac, orthopedics, oncology).";
      default:
        return "";
    }
  };

  const isCurrentRoute = (path: string) =>
    pathname?.toLowerCase() === path.toLowerCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {isTabletOrPC && (
          <View style={styles.sidebar}>
            <Text style={styles.sidebarTitle}>HOSPITAL DASHBOARD</Text>
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
            <Text style={styles.heading}>Add New Hospital</Text>
          </Animated.View>

          <View style={styles.inputWrapper}>
            {fields.map((field, index) => {
              if (field.key === "hospitalType") {
                const anim = inputAnimations[index];
                const containerScale = anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.7, 1],
                });
                const containerOpacity = anim;
                const containerTranslateY = anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0],
                });
                const listHeight = dropdownAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, HOSPITAL_TYPES.length * 44],
                });

                return (
                  <Animated.View
                    key={field.key}
                    style={[
                      styles.inputGroup,
                      {
                        opacity: containerOpacity,
                        transform: [
                          { scale: containerScale },
                          { translateY: containerTranslateY },
                        ],
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.label,
                        {
                          color: errors.hospitalType
                            ? "#ff3b30"
                            : focusedInput === field.key
                            ? "#007BFF"
                            : "#333",
                        },
                      ]}
                    >
                      {field.label}
                    </Text>

                    <TextInput
                      ref={hospitalTypeInputRef}
                      value={hospitalType}
                      onChangeText={setHospitalType}
                      style={{
                        height: 0,
                        width: 0,
                        opacity: 0,
                        position: "absolute",
                      }}
                      onSubmitEditing={() => {
                        setIsDropdownOpen(false);
                        setFocusedInput(null);
                        if (hospitalType === "Trust") {
                          trustInputRef.current?.focus();
                        } else if (hospitalType === "Specialty") {
                          specialtyInputRef.current?.focus();
                        } else {
                          inputRefs.current[8]?.focus();
                        }
                      }}
                      blurOnSubmit={false}
                      returnKeyType="next"
                    />

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        setFocusedInput(field.key);
                        toggleDropdown();
                        if (Platform.OS === "web") {
                          setTimeout(
                            () => hospitalTypeInputRef.current?.focus(),
                            40
                          );
                        }
                      }}
                      style={[
                        styles.dropdownButton,
                        {
                          borderColor: errors.hospitalType
                            ? "#ff3b30"
                            : focusedInput === field.key
                            ? "#007BFF"
                            : "#ccc",
                        },
                      ]}
                    >
                      <Text
                        numberOfLines={1}
                        style={{
                          fontSize: 15,
                          flex: 1,
                          color: hospitalType ? "#000" : "#666",
                        }}
                      >
                        {hospitalType ? hospitalType : `Select Hospital Type`}
                      </Text>
                      <Ionicons
                        name={isDropdownOpen ? "chevron-up" : "chevron-down"}
                        size={20}
                        color="#555"
                      />
                    </TouchableOpacity>
                    {errors.hospitalType && (
                      <Text style={styles.errorText}>
                        {errors.hospitalType}
                      </Text>
                    )}

                    <Animated.View
                      style={[
                        styles.dropdownList,
                        { height: listHeight, overflow: "hidden" },
                      ]}
                    >
                      {HOSPITAL_TYPES.map((type) => (
                        <TouchableOpacity
                          key={type}
                          style={styles.dropdownItem}
                          onPress={() => {
                            selectHospitalType(type);
                            setFocusedInput(null);
                          }}
                        >
                          <Text style={{ fontSize: 15 }}>{type}</Text>
                        </TouchableOpacity>
                      ))}
                    </Animated.View>
                    {hospitalType ? (
                      <View style={styles.typeDetails}>
                        <Text style={styles.typeDescription}>
                          {getHospitalTypeDescription(hospitalType)}
                        </Text>
                        {hospitalType === "Trust" && (
                          <>
                            <TextInput
                              placeholder={
                                errors.trustRegistrationNo
                                  ? errors.trustRegistrationNo
                                  : "Enter Trust Registration No"
                              }
                              placeholderTextColor={
                                errors.trustRegistrationNo ? "#ff3b30" : "#999"
                              }
                              style={[
                                styles.input,
                                { marginTop: 10 },
                                errors.trustRegistrationNo && styles.errorInput,
                              ]}
                              value={trustRegistrationNo}
                              onChangeText={setTrustRegistrationNo}
                              returnKeyType="next"
                              ref={trustInputRef}
                              onSubmitEditing={() =>
                                inputRefs.current[8]?.focus()
                              }
                            />
                            {errors.trustRegistrationNo && (
                              <Text style={styles.errorText}>
                                {errors.trustRegistrationNo}
                              </Text>
                            )}
                          </>
                        )}
                        {hospitalType === "Specialty" && (
                          <>
                            <TextInput
                              placeholder={
                                errors.specialtyDetails
                                  ? errors.specialtyDetails
                                  : "Enter Specialty Details"
                              }
                              placeholderTextColor={
                                errors.specialtyDetails ? "#ff3b30" : "#999"
                              }
                              style={[
                                styles.input,
                                { marginTop: 10 },
                                errors.specialtyDetails && styles.errorInput,
                              ]}
                              value={specialtyDetails}
                              onChangeText={setSpecialtyDetails}
                              returnKeyType="next"
                              ref={specialtyInputRef}
                              onSubmitEditing={() =>
                                inputRefs.current[8]?.focus()
                              }
                            />
                            {errors.specialtyDetails && (
                              <Text style={styles.errorText}>
                                {errors.specialtyDetails}
                              </Text>
                            )}
                          </>
                        )}
                      </View>
                    ) : null}
                  </Animated.View>
                );
              }
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
                  editable={field.editable}
                />
              );
            })}

            <Animated.View
              style={[
                styles.inputGroup,
                {
                  // ✨ START: MOVED - Corrected animation index for proper sequence
                  opacity: inputAnimations[9],
                  transform: [
                    {
                      scale: inputAnimations[9].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.7, 1],
                      }),
                    },
                    {
                      translateY: inputAnimations[9].interpolate({
                        inputRange: [0, 1],
                        outputRange: [40, 0],
                      }),
                    },
                  ],
                  // ✨ END: MOVED
                },
              ]}
            >
              <Text style={styles.label}>Access Device IDs</Text>
              <View style={styles.deviceIdRow}>
                <TextInput
                  // ✨ START: MOVED - Added ref here
                  ref={deviceIdInputRef}
                  // ✨ END: MOVED
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

            {/* ✨ START: MOVED PRODUCT COUNT FIELD (Access Device ID kku keela) */}
            {/* Here's the Product Count field, moved below Access Device IDs */}
            <AnimatedInputField
              label="Product Count"
              value={productCount}
              onChange={setProductCount}
              isFocused={focusedInput === "productCount"}
              onFocus={() => setFocusedInput("productCount")}
              onBlur={() => setFocusedInput(null)}
              animation={inputAnimations[10]} // New animation index
              error={errors["productCount"]}
              keyboardType="numeric"
              editable={false}
            />
            {/* ✨ END: MOVED PRODUCT COUNT FIELD */}

            <Animated.View
              style={[
                styles.inputGroup,
                {
                  opacity: inputAnimations[11],
                  transform: [
                    {
                      scale: inputAnimations[11].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.7, 1],
                      }),
                    },
                    {
                      translateY: inputAnimations[11].interpolate({
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
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="eye-outline" size={18} color="#fff" />
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={removeDocument}
                    style={styles.removeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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

          <Animated.View
            style={[
              styles.buttonContainer,
              { transform: [{ scale: scaleValue }] },
            ]}
          >
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Ionicons name="mail-outline" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>SAVE AND VERIFY EMAIL</Text>
            </TouchableOpacity>
          </Animated.View>
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

// ✅ START: UPDATED ANIMATEDINPUTFIELD COMPONENT
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
  editable = true, // Prop added with default value
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
  editable?: boolean; // Type added
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
            backgroundColor: !editable ? "#f0f0f0" : "#fff", // Visual cue for non-editable fields
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
        editable={editable} // Prop passed to TextInput
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </Animated.View>
  );
};
// ✅ END: UPDATED ANIMATEDINPUTFIELD COMPONENT

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
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "#fff",
  },
  dropdownList: {
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    backgroundColor: "#fff",
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
  },
  typeDetails: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f8fbff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e6f0ff",
  },
  typeDescription: { color: "#333", fontSize: 13 },
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
  submitButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
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
});

export default HospitalForm;

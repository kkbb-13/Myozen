import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Platform,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";

// Types
interface ClinicParams {
  id: string;
  name: string;
  doctor: string;
  address: string;
  email: string;
}

interface FormData {
  clinicName: string;
  email: string;
  contact: string;
  address: string;
  gst: string;
  productId: string;
  accessDeviceIds: string[];
  productSellDate: string;
  productCount: string;
  billingDetails: string;
}

type PickedFile = {
  name: string;
  uri: string;
  size?: number;
  mime?: string;
} | null;

// Function to format date input as DD/MM/YYYY
const formatDateInput = (text: string) => {
  const cleaned = text.replace(/[^0-9]/g, "");
  const length = cleaned.length;

  if (length < 3) {
    return cleaned;
  }
  if (length < 5) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  }
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
};

const Cclinicdetails = () => {
  const params = useLocalSearchParams() as unknown as ClinicParams;
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTabletOrPC = width >= 768;

  // Refs for text inputs
  const inputRefs = useRef<Record<string, TextInput | null>>({});

  // Animations
  const cardEnterAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const fieldsAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(1)).current;
  const editModeAnim = useRef(new Animated.Value(0)).current;
  const fieldStaggerAnims = useRef(
    Array.from({ length: 11 }, () => new Animated.Value(0)) // Adjusted length
  ).current;

  // State
  const [isEditing, setIsEditing] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    clinicName: params.name || "City Care Clinic",
    email: params.email || "info@citycareclinic.com",
    contact: "+91 9876543210",
    address: params.address || "123 Health Street, Medical District",
    gst: "GSTIN123456789",
    productId: "PRD-001",
    accessDeviceIds: ["DEV-12345", "DEV-67890"],
    productSellDate: "23/08/2025",
    productCount: "2",
    billingDetails: "",
  });

  const [newDeviceId, setNewDeviceId] = useState("");
  const [billingFile, setBillingFile] = useState<PickedFile>(null);

  useEffect(() => {
    // Entry animations
    const entrySequence = [
      Animated.timing(cardEnterAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        useNativeDriver: true,
      }),
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fieldsAnim, {
        toValue: 1,
        duration: 500,
        delay: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ];

    Animated.sequence(entrySequence).start();

    const fieldAnimations = fieldStaggerAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: 600 + index * 80,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );

    Animated.parallel(fieldAnimations).start();
  }, []);

  const handleFieldFocus = (fieldName: string) => {
    setActiveField(fieldName);
    Animated.spring(editModeAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      // **THE FIX IS HERE:** useNativeDriver is FALSE because we are animating backgroundColor and borderColor
      useNativeDriver: false,
    }).start();
  };

  const handleFieldBlur = () => {
    setActiveField(null);
    Animated.spring(editModeAnim, {
      toValue: 0,
      friction: 8,
      tension: 30,
      // **THE FIX IS HERE:** useNativeDriver is FALSE for the same reason
      useNativeDriver: false,
    }).start();
  };

  const toggleEdit = () => {
    Animated.sequence([
      Animated.timing(buttonAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(buttonAnim, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setIsEditing((prev) => !prev);
  };

  const handleChange = (field: keyof FormData, value: string | string[]) => {
    if (field === "productSellDate" && typeof value === "string") {
      const formattedDate = formatDateInput(value);
      setFormData((prev) => ({ ...prev, [field]: formattedDate }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleAddDeviceId = () => {
    if (newDeviceId.trim() === "") {
      Alert.alert("Input Empty", "Please enter a device ID.");
      return;
    }
    if (formData.accessDeviceIds.includes(newDeviceId.trim())) {
      Alert.alert("Duplicate ID", "This device ID has already been added.");
      return;
    }
    setFormData((prev) => {
      const currentCount = parseInt(prev.productCount, 10) || 0;
      const newCount = currentCount + 1;
      return {
        ...prev,
        accessDeviceIds: [...prev.accessDeviceIds, newDeviceId.trim()],
        productCount: String(newCount),
      };
    });
    setNewDeviceId("");
  };

  const handleRemoveDeviceId = (idToRemove: string) => {
    setFormData((prev) => {
      const currentCount = parseInt(prev.productCount, 10) || 0;
      const newCount = Math.max(0, currentCount - 1);
      return {
        ...prev,
        accessDeviceIds: prev.accessDeviceIds.filter((id) => id !== idToRemove),
        productCount: String(newCount),
      };
    });
  };

  const handleSubmitEditing = (currentField: keyof FormData) => {
    const fieldOrder: (keyof FormData)[] = [
      "clinicName",
      "email",
      "contact",
      "address",
      "gst",
      "productId",
      "productSellDate",
      "productCount",
      "billingDetails",
    ];
    const currentIndex = fieldOrder.indexOf(currentField);
    if (currentIndex < fieldOrder.length - 1) {
      const nextField = fieldOrder[currentIndex + 1];
      inputRefs.current[nextField]?.focus();
    } else {
      inputRefs.current[currentField]?.blur();
      toggleEdit();
    }
  };

  const navItems = [
    { label: "VIEW CLINIC", icon: "eye-outline", path: "/Clinic" },
    { label: "ADD CLINIC", icon: "add-circle-outline", path: "/Addclinic" },
    { label: "LOGOUT", icon: "log-out-outline", path: "/Logout" },
  ];

  const pickBillingPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        multiple: false,
        copyToCacheDirectory: true,
      });
      const asset = (result as any)?.assets?.[0] ?? (result as any);
      if (asset && (asset.type === "success" || asset.uri)) {
        const file: PickedFile = {
          uri: asset.uri,
          name: asset.name || "billing.pdf",
          size: asset.size,
          mime: asset.mimeType || "application/pdf",
        };
        setBillingFile(file);
        setFormData((prev) => ({
          ...prev,
          billingDetails: prev.billingDetails || file.name,
        }));
      }
    } catch (e) {
      console.warn("PDF pick cancelled/failed", e);
    }
  };

  const clearBillingPdf = () => setBillingFile(null);

  const openBillingPdf = async () => {
    if (billingFile?.uri) {
      try {
        await Linking.openURL(billingFile.uri);
      } catch (e) {
        console.warn("Unable to open file", e);
      }
    }
  };

  const renderField = (
    label: string,
    field: keyof FormData | "clinicId",
    index: number,
    isReadOnly = false
  ) => {
    const isActive = activeField === label;
    const fieldAnim = fieldStaggerAnims[index];

    const animatedStyle = {
      opacity: fieldAnim,
      transform: [
        {
          translateY: fieldAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [25, 0],
          }),
        },
        {
          scale:
            isActive && isEditing && !isReadOnly
              ? editModeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.02],
                })
              : 1,
        },
      ],
    } as const;

    const containerStyle = {
      backgroundColor:
        isActive && isEditing && !isReadOnly
          ? editModeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ["rgba(255,255,255,1)", "rgba(59, 130, 246, 0.05)"],
            })
          : isReadOnly
          ? "#f1f5f9"
          : "#ffffff",
      borderColor:
        isActive && isEditing && !isReadOnly
          ? editModeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [
                "rgba(203, 213, 225, 1)",
                "rgba(59, 130, 246, 0.4)",
              ],
            })
          : "rgba(203, 213, 225, 1)",
    } as const;

    const isBillingField = field === "billingDetails";
    const isAccessDeviceField = field === "accessDeviceIds";

    return (
      <Animated.View key={field} style={[styles.fieldContainer, animatedStyle]}>
        <Animated.View style={[styles.fieldBox, containerStyle]}>
          <Text style={styles.infoLabel}>{label}</Text>

          {isAccessDeviceField ? (
            isEditing ? (
              <View>
                <View style={styles.deviceInputContainer}>
                  <TextInput
                    style={styles.deviceInput}
                    placeholder="Enter new device ID"
                    placeholderTextColor="#94a3b8"
                    value={newDeviceId}
                    onChangeText={setNewDeviceId}
                    returnKeyType="done"
                    onSubmitEditing={handleAddDeviceId}
                  />
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddDeviceId}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add" size={20} color="#fff" />
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.deviceChipContainer}>
                  {formData.accessDeviceIds.length > 0 ? (
                    formData.accessDeviceIds.map((id) => (
                      <View key={id} style={styles.deviceChip}>
                        <Text style={styles.deviceChipText}>{id}</Text>
                        <TouchableOpacity
                          style={styles.removeDeviceBtn}
                          onPress={() => handleRemoveDeviceId(id)}
                        >
                          <Ionicons
                            name="close-circle"
                            size={18}
                            color="#be123c"
                          />
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyDeviceText}>
                      No devices added yet.
                    </Text>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.deviceChipContainer}>
                {formData.accessDeviceIds.length > 0 ? (
                  formData.accessDeviceIds.map((id) => (
                    <View
                      key={id}
                      style={[styles.deviceChip, { paddingRight: 10 }]}
                    >
                      <Ionicons
                        name="hardware-chip-outline"
                        size={16}
                        color="#475569"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.deviceChipText}>{id}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.infoValue}>N/A</Text>
                )}
              </View>
            )
          ) : isBillingField && isEditing ? (
            <View>
              {!billingFile ? (
                <TouchableOpacity
                  onPress={pickBillingPdf}
                  activeOpacity={0.85}
                  style={styles.uploadBox}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={22}
                    color="#1e40af"
                  />
                  <Text style={styles.uploadText}>
                    Tap to upload PDF (Billing)
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.fileChipRow}>
                  <View style={styles.fileChip}>
                    <Ionicons
                      name="document-attach-outline"
                      size={18}
                      color="#0f172a"
                    />
                    <Text style={styles.fileNameText} numberOfLines={1}>
                      {billingFile.name}
                    </Text>
                    <TouchableOpacity
                      onPress={clearBillingPdf}
                      style={styles.clearBtn}
                    >
                      <Ionicons name="close-circle" size={18} color="#be123c" />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    onPress={openBillingPdf}
                    style={styles.viewBtn}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="eye-outline" size={18} color="#ffffff" />
                    <Text style={styles.viewBtnText}>View</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TextInput
                ref={(ref) => {
                  if (field === "billingDetails")
                    inputRefs.current[field] = ref;
                }}
                value={formData.billingDetails}
                onChangeText={(text) => handleChange("billingDetails", text)}
                style={[
                  styles.inputField,
                  isActive && styles.inputFieldFocused,
                  { marginTop: 12 },
                ]}
                placeholder={`Add billing note (optional)`}
                onFocus={() => handleFieldFocus(label)}
                onBlur={handleFieldBlur}
                placeholderTextColor="#94a3b8"
                selectionColor="#3b82f6"
                returnKeyType="done"
                onSubmitEditing={() => handleSubmitEditing("billingDetails")}
                blurOnSubmit={false}
              />
            </View>
          ) : isEditing && !isReadOnly ? (
            <TextInput
              ref={(ref) => {
                if (field !== "clinicId") inputRefs.current[field] = ref;
              }}
              value={field !== "clinicId" ? (formData[field] as string) : ""}
              onChangeText={(text) => {
                if (field !== "clinicId") handleChange(field, text);
              }}
              style={[styles.inputField, isActive && styles.inputFieldFocused]}
              placeholder={`Enter ${label.toLowerCase()}`}
              onFocus={() => handleFieldFocus(label)}
              onBlur={handleFieldBlur}
              placeholderTextColor="#94a3b8"
              selectionColor="#3b82f6"
              returnKeyType={index < 9 ? "next" : "done"}
              onSubmitEditing={() => {
                if (field !== "clinicId") handleSubmitEditing(field);
              }}
              blurOnSubmit={false}
              keyboardType={
                field === "productSellDate" || field === "productCount"
                  ? "numeric"
                  : "default"
              }
              maxLength={field === "productSellDate" ? 10 : undefined}
            />
          ) : (
            <View>
              {isBillingField && billingFile ? (
                <View style={styles.fileChipRowReadonly}>
                  <Ionicons
                    name="document-attach-outline"
                    size={18}
                    color="#0f172a"
                  />
                  <Text
                    style={[styles.infoValue, { marginLeft: 8 }]}
                    numberOfLines={1}
                  >
                    {billingFile.name}
                  </Text>
                  <TouchableOpacity
                    onPress={openBillingPdf}
                    style={styles.viewBtnCompact}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="eye-outline" size={16} color="#ffffff" />
                    <Text style={styles.viewBtnTextSmall}>View</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text
                  style={[styles.infoValue, isReadOnly && styles.readOnlyValue]}
                >
                  {isReadOnly
                    ? params.id || "N/A"
                    : field !== "clinicId"
                    ? (formData[field] as string)
                    : ""}
                </Text>
              )}
            </View>
          )}
        </Animated.View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      {isTabletOrPC && (
        <View style={styles.sidebar}>
          <Text style={styles.sidebarTitle}>CLINICAL DASHBOARD</Text>
          {navItems.map((item) => {
            const [isHovered, setIsHovered] = useState(false);
            return (
              <TouchableOpacity
                key={item.path}
                style={[styles.navItem, isHovered && styles.navItemHovered]}
                onPress={() => router.push(item.path as any)}
                activeOpacity={0.8}
                {...(Platform.OS === "web"
                  ? {
                      onMouseEnter: () => setIsHovered(true),
                      onMouseLeave: () => setIsHovered(false),
                    }
                  : {})}
              >
                <Ionicons name={item.icon as any} size={22} color="#ffffff" />
                <Text style={styles.navText}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={styles.contentContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1e40af" />
          <Text style={styles.backText}>Back to Clinic List</Text>
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.card,
              {
                opacity: cardEnterAnim,
                transform: [
                  {
                    translateY: cardEnterAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0],
                    }),
                  },
                  {
                    scale: cardEnterAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.96, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.headerSection,
                {
                  opacity: headerAnim,
                  transform: [
                    {
                      translateY: headerAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [15, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.avatarContainer}>
                <Animated.View
                  style={[
                    styles.avatar,
                    {
                      transform: [
                        {
                          scale: headerAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {formData.clinicName.charAt(0).toUpperCase()}
                  </Text>
                </Animated.View>
                <View style={styles.avatarGlow} />
              </View>
              <Text style={styles.clinicName}>{formData.clinicName}</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.fieldsSection,
                {
                  opacity: fieldsAnim,
                  transform: [
                    {
                      translateY: fieldsAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {renderField("Clinic Name", "clinicName", 0)}
              {renderField("Email Address", "email", 1)}
              {renderField("Contact Number", "contact", 2)}
              {renderField("Address", "address", 3)}
              {renderField("GST Number", "gst", 4)}
              {renderField("Product ID", "productId", 5)}
              {renderField("Access Device IDs", "accessDeviceIds", 6)}
              {renderField("Product Sell Date", "productSellDate", 7)}
              {renderField("Product Count", "productCount", 8)}
              {renderField("Billing Details (PDF)", "billingDetails", 9)}
              {renderField("Clinic ID", "clinicId", 10, true)}
            </Animated.View>

            <Animated.View
              style={[
                styles.buttonContainer,
                { transform: [{ scale: buttonAnim }] },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.editButton,
                  isEditing && styles.editButtonActive,
                ]}
                onPress={toggleEdit}
                activeOpacity={0.9}
              >
                <View style={styles.buttonContent}>
                  <Ionicons
                    name={
                      isEditing ? "checkmark-circle-outline" : "create-outline"
                    }
                    size={22}
                    color="#ffffff"
                  />
                  <Text style={styles.editText}>
                    {isEditing ? "Save Changes" : "Edit Details"}
                  </Text>
                </View>
                {isEditing && <View style={styles.buttonRipple} />}
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, flexDirection: "row", backgroundColor: "#f8fafc" },
  sidebar: {
    width: 220,
    backgroundColor: "#3973d6",
    paddingVertical: 20,
    paddingHorizontal: 10,
    elevation: 5,
  },
  sidebarTitle: {
    color: "#fff",
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
  navItemHovered: {
    backgroundColor: "rgba(255,255,255,0.15)",
    transform: [{ scale: 1.08 }],
  },
  navText: { color: "#fff", marginLeft: 12, fontSize: 15 },
  contentContainer: { flex: 1, padding: 24 },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 8,
  },
  backText: {
    marginLeft: 10,
    color: "#1e40af",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: { paddingBottom: 40 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 28,
    elevation: 6,
    maxWidth: 750,
    width: "100%",
    alignSelf: "center",
  },
  headerSection: { alignItems: "center", marginBottom: 28 },
  avatarContainer: { position: "relative", marginBottom: 16 },
  avatar: {
    backgroundColor: "#3b82f6",
    width: 75,
    height: 75,
    borderRadius: 37.5,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarGlow: {
    position: "absolute",
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 45,
    backgroundColor: "rgba(59,130,246,0.1)",
    zIndex: -1,
  },
  avatarText: { fontSize: 30, color: "#ffffff", fontWeight: "bold" },
  clinicName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 12,
    textAlign: "center",
  },
  fieldsSection: { marginBottom: 20 },
  fieldContainer: { marginBottom: 14 },
  fieldBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(203,213,225,1)",
    padding: 18,
  },
  infoLabel: {
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 8,
    color: "#475569",
    textTransform: "uppercase",
  },
  infoValue: { fontSize: 16, color: "#1e293b", fontWeight: "500" },
  readOnlyValue: { color: "#64748b", fontStyle: "italic" },
  inputField: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  inputFieldFocused: {
    borderColor: "#3b82f6",
    shadowColor: "#3b82f6",
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  uploadBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#93c5fd",
    backgroundColor: "#eff6ff",
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: {
    marginLeft: 10,
    color: "#1e40af",
    fontSize: 15,
    fontWeight: "600",
  },
  fileChipRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fileChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  fileNameText: { marginLeft: 8, flex: 1, fontSize: 14, color: "#0f172a" },
  clearBtn: { marginLeft: 8 },
  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  viewBtnCompact: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  viewBtnText: { color: "#ffffff", marginLeft: 6, fontWeight: "700" },
  viewBtnTextSmall: {
    color: "#ffffff",
    marginLeft: 6,
    fontWeight: "700",
    fontSize: 12,
  },
  fileChipRowReadonly: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonContainer: { alignItems: "center", marginTop: 12 },
  editButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  editButtonActive: { backgroundColor: "#1d4ed8" },
  buttonContent: { flexDirection: "row", alignItems: "center" },
  buttonRipple: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 16,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    zIndex: -1,
  },
  editText: { color: "#fff", marginLeft: 10, fontSize: 17, fontWeight: "700" },
  deviceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  deviceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 10,
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 6,
  },
  deviceChipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  deviceChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e2e8f0",
    borderRadius: 16,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  deviceChipText: {
    color: "#1e293b",
    fontSize: 14,
    fontWeight: "500",
  },
  removeDeviceBtn: {
    marginLeft: 6,
    padding: 2,
  },
  emptyDeviceText: {
    color: "#64748b",
    fontStyle: "italic",
    fontSize: 15,
  },
});

export default Cclinicdetails;

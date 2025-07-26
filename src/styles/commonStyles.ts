import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

export const commonStyles = StyleSheet.create({
  containerCenter: {
    alignItems: "center",
    marginBottom: 8,
  },
  cardContainer: {
    marginBottom: 10,
    alignItems: "center",
  },
  card: {
    minHeight: 200,
    width: width - 24,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  cardMini: {
    minHeight: 100,
    width: width - 24,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  imageCover: {
    resizeMode: "cover",
  },
  imageUnavailable: {
    opacity: 0.7,
  },
  overlayDark: {
    flex: 1,
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titleText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  subtitleText: {
    color: "#ddd",
    fontSize: 13,
    fontWeight: "600",
  },
  descriptionText: {
    color: "#ccc",
    fontSize: 13,
    marginTop: 6,
    marginBottom: 8,
  },
  rowSpaceBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  statusTextYellow: {
    color: "#facc15",
    fontWeight: "bold",
    fontSize: 13,
  },
  warningTextYellow: {
    color: "#facc15",
    fontSize: 13,
    fontWeight: "600",
  },
  errorTextRed: {
    color: "#f87171",
    fontSize: 13,
    fontWeight: "600",
  },
  buttonPrimary: {
    backgroundColor: "#2196F3",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonDisabled: {
    backgroundColor: "#6b8dc3",
  },
  buttonDanger: {
    backgroundColor: "#f87171",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonTextLight: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 30,
    padding: 12,
    zIndex: 10,
  },
  closeText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 20,
    alignSelf: "center",
    backgroundColor: "#e53935",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: width - 48,
    marginBottom: 16,
  },
  closeXButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 30,
    padding: 12,
    zIndex: 10,
  },
  closeXText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  flatList: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  actionContainer: {
    justifyContent: "space-between",
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 2,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },

  emptyText: {
    color: "#ccc",
    fontStyle: "italic",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    padding: 24,
  },

  cancelButton: {
    backgroundColor: "#f87171",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  whiteText: {
    color: "white",
  },

  cardPopUp: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    minHeight: 250,
  },
  imageCoverPopUp: {
    resizeMode: "cover",
  },
  rowResources: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  queueCountContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
  },
  queueCount: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  pt5: {
    paddingTop: 10,
  },
  flexGrow1: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  flex1: {
    flex: 1,
  },
  ph10: {
    paddingHorizontal: 10,
  },
});

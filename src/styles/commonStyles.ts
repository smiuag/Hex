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
    minHeight: 80,
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
  titleBlueText: {
    color: "#5a73f2ff",
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
    backgroundColor: "#22a552ff",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    minWidth: 100,
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
    textAlign: "center",
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
    textAlign: "center",
  },
  backButton: {
    marginTop: 5,
    alignSelf: "center",
    backgroundColor: "#6b8dc3",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    width: width - 48,
    marginBottom: 5,
  },
  closeXButton: {
    position: "absolute",
    top: 10,
    right: 10,
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
  mainBuilding: {
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
    minWidth: 100,
  },

  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
    textAlign: "center",
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
    flexDirection: "row",
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
  buildCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    overflow: "hidden",
    flex: 1,
    aspectRatio: 1,
    marginHorizontal: 5,
  },

  buildCardImage: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  buildTitle: {
    fontSize: 14,
    color: "white",
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  rowEvenly: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "flex-start",
    marginVertical: 10,
    gap: 10,
  },
  cardMiniMiddleCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    height: 50,
  },
  flexCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  floatingDeleteButton: {
    position: "absolute",
    top: 6,
    right: 8,
    backgroundColor: "rgba(200, 0, 0, 0.8)",
    borderRadius: 20,
    padding: 6,
    zIndex: 0,
    elevation: 0,
  },

  floatingDeleteText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  smallSubtitle: {
    fontSize: 12,
    color: "white",
    marginTop: 1,
  },
  minWidth25: { minWidth: 25 },
});

import { StyleSheet } from "react-native";

export const hexStyles = StyleSheet.create({
  modalWrapper: {
    maxHeight: "80%",
    width: 350,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",

    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4, // Android
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
});

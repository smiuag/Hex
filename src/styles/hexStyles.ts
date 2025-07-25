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
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)", // si quieres oscurecer fondo
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
});

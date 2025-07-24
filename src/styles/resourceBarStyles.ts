import { StyleSheet } from "react-native";

export const resourceBarStyles = StyleSheet.create({
  containerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 15,
    backgroundColor: "#1C1C1C",
    borderRadius: 8,
    minHeight: 40, // o 44, 48 para que tenga tamaño visible
  },
  title: {
    fontWeight: "bold",
    fontSize: 14,
  },
  resourcesContainer: {
    flexDirection: "row",
  },
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    backgroundColor: "#1C1C1C",
  },
});

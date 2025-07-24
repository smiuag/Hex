import { StyleSheet } from "react-native";

export const menuStyles = StyleSheet.create({
  processCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30, 30, 30, 0.85)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 6,
  },
  processName: {
    flex: 1,
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  processTime: {
    color: "#facc15",
    fontWeight: "bold",
    fontSize: 13,
    marginRight: 12,
  },
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
    justifyContent: "space-between",
  },
  topContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  list: {
    flex: 1,
    marginTop: 12,
  },
});

import { Platform, StyleSheet } from "react-native";

export const tabStyles = StyleSheet.create({
  hidden: {
    display: "none",
  },
  questIconBase: {
    position: "absolute",
    top: -4,
    right: -4,
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  questIconText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  tabBarStyle: Platform.select({
    ios: {
      position: "absolute",
    },
    default: {},
  }),
});

export const questIconView = (dotColor: string) => ({
  ...tabStyles.questIconBase,
  backgroundColor: dotColor,
});

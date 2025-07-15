import React from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export const MenuIcon = ({ color, size }: { color: string; size: number }) => (
  <MaterialCommunityIcons name="menu" size={size} color={color} />
);

export const PlanetIcon = ({
  color,
  size,
}: {
  color: string;
  size: number;
}) => <MaterialCommunityIcons name="orbit" size={size} color={color} />;

import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Item = { label: string; value: string };
type Props = {
  selectedValue: string;
  items: Item[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  title?: string;
};

export default function CustomPicker({
  selectedValue,
  items,
  onValueChange,
  placeholder,
  title = "Selecciona origen",
}: Props) {
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(
    () => items.find((i) => i.value === selectedValue)?.label ?? placeholder ?? "Select",
    [items, selectedValue, placeholder]
  );

  return (
    <>
      {/* Trigger (barra superior) */}
      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <Text
          style={styles.triggerText}
          numberOfLines={1}
          ellipsizeMode="tail"
          allowFontScaling={false}
          maxFontSizeMultiplier={1.0}
        >
          {selectedLabel}
        </Text>
        <Text style={styles.triggerIcon}>▾</Text>
      </Pressable>

      {/* Popup */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={styles.popupWrap}>
          <View style={styles.popup}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={() => setOpen(false)} hitSlop={8}>
                <Text style={styles.close}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Items */}
            <FlatList
              data={items}
              keyExtractor={(it) => it.value}
              ItemSeparatorComponent={() => <View style={styles.sep} />}
              renderItem={({ item }) => {
                const active = item.value === selectedValue;
                return (
                  <TouchableOpacity
                    style={[styles.row, active && styles.rowActive]}
                    onPress={() => {
                      onValueChange(item.value);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.rowText, active && styles.rowTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={{ paddingBottom: 4 }}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const TRIGGER_H = 52; // altura suficiente para evitar recortes

const styles = StyleSheet.create({
  // Barra superior
  trigger: {
    backgroundColor: "rgba(0,0,0,0.75)",
    borderWidth: 1.5,
    borderColor: "#00ffe0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: TRIGGER_H,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  triggerText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 20,
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    marginRight: 8,
    includeFontPadding: false as any, // Android: quita padding extra
    textAlignVertical: "center" as any,
    overflow: "hidden",
  },
  triggerIcon: { color: "#00ffe0", fontSize: 14 },

  // Fondo oscuro detrás
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },

  // Contenedor para centrar el popup
  popupWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: "6%",
  },

  // Popup centrado
  popup: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "rgba(0,0,0,0.92)",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#00ff90",
    padding: 12,
    maxHeight: "60%",
    ...Platform.select({
      android: { elevation: 8 },
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.35,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
      },
    }),
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 2,
    paddingBottom: 6,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,255,144,0.25)",
  },
  title: { color: "#e5e7eb", fontWeight: "700", fontSize: 16 },
  close: { color: "#00ffe0", fontSize: 18 },

  row: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "rgba(2, 6, 23, 0.65)",
  },
  rowActive: {
    borderWidth: 1,
    borderColor: "#00ffe0",
    backgroundColor: "rgba(11, 34, 60, 0.82)",
  },
  rowText: { color: "#e5e7eb", fontSize: 15 },
  rowTextActive: { color: "#00ffe0", fontWeight: "700" },
  sep: { height: 8 },
});

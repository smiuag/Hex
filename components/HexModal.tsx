import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  data: { q: number; r: number; terrain: string } | null;
};

export default function HexModal({ visible, onClose, data }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Hexágono seleccionado</Text>
          {data ? (
            <>
              <Text>q: {data.q}</Text>
              <Text>r: {data.r}</Text>
              <Text>Terreno: {data.terrain}</Text>
            </>
          ) : (
            <Text>Sin datos</Text>
          )}
          <Pressable onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>Cerrar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // sombra detrás
  },
  modal: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 10,
    width: 280,
    alignItems: 'center',
    elevation: 10, // sombra Android
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

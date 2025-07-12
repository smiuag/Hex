import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import HexMap from '../../src/components/HexMap';

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <HexMap />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // opcional para que se note bien el modal
  },
});

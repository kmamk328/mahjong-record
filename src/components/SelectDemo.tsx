import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SelectDemoItem from './SelectDemoItem';

const SelectDemo = () => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Custom</Text>
        <SelectDemoItem native={{}} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Native</Text>
        <SelectDemoItem native />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    minWidth: 80,
    marginRight: 8,
  },
});

export default SelectDemo;

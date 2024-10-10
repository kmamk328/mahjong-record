import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const SelectDemoItem = ({ native }) => {
  const [selectedValue, setSelectedValue] = useState('apple');

  return (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={selectedValue}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedValue(itemValue)}
      >
        {items.map((item) => (
          <Picker.Item key={item.name} label={item.name} value={item.name.toLowerCase()} />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    overflow: 'hidden',
  },
  picker: {
    width: 220,
    height: 40,
  },
});

const items = [
  { name: 'Apple' },
  { name: 'Pear' },
  { name: 'Blackberry' },
  { name: 'Peach' },
  { name: 'Apricot' },
  { name: 'Melon' },
  { name: 'Honeydew' },
  { name: 'Starfruit' },
  { name: 'Blueberry' },
  { name: 'Raspberry' },
  { name: 'Strawberry' },
  { name: 'Mango' },
  { name: 'Pineapple' },
  { name: 'Lime' },
  { name: 'Lemon' },
  { name: 'Coconut' },
  { name: 'Guava' },
  { name: 'Papaya' },
  { name: 'Orange' },
  { name: 'Grape' },
  { name: 'Jackfruit' },
  { name: 'Durian' },
];

export default SelectDemoItem;

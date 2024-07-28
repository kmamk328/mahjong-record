import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons'; // Ensure you have installed @expo/vector-icons

const MemberInput = ({ existingMembers, onChange, value, placeholder, reset, label }) => {
  const [isCustomInput, setIsCustomInput] = useState(false);

  useEffect(() => {
    if (reset) {
      setIsCustomInput(false);
      onChange('');
    }
  }, [reset]);

  const handlePickerChange = (itemValue) => {
    if (itemValue === 'custom') {
      setIsCustomInput(true);
      onChange('');
    } else {
      setIsCustomInput(false);
      onChange(itemValue);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {isCustomInput ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
        />
      ) : (
        <View style={styles.input}>
          <Picker
            selectedValue={value}
            style={styles.picker}
            onValueChange={handlePickerChange}
            dropdownIconColor="gray"
          >
            <Picker.Item label="新しいメンバーを入力" value="custom" />
            {existingMembers.map((member, index) => (
              <Picker.Item key={index} label={member} value={member} />
            ))}
          </Picker>
          {/* <TouchableOpacity style={styles.iconContainer}>
            <Ionicons name="md-arrow-down" size={24} color="gray" />
          </TouchableOpacity> */}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom:10, // `flexDirection: 'row'` と `alignItems: 'center'` を削除し、ラベルとピッカーを垂直に並べる
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '100%', // 幅を100%にしてピッカーを広げる
    // flex: 1,
    paddingLeft: 10,
    backgroundColor: '#fff',
    borderRadius: 4,
    flexDirection: 'row', // Add this line to align the picker and icon horizontally
    alignItems: 'center', // Add this line to vertically center the picker and icon
  },
  picker: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  iconContainer: {
    position: 'absolute',
    right: 10,
    pointerEvents: 'none', // Allow clicks to pass through to the Picker
  },
});

export default MemberInput;

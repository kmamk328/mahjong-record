import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons'; // Ensure you have installed @expo/vector-icons

const MemberInput = ({ existingMembers, onChange, value, placeholder, reset, label }) => {
  const [isCustomInput, setIsCustomInput] = useState(false);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [tempValue, setTempValue] = useState(''); // 仮選択用の値

  useEffect(() => {
    if (reset) {
      setIsCustomInput(false);
      onChange('');
    }
  }, [reset]);

  const handlePickerChange = (itemValue) => {
    if (itemValue === 'custom') {
      setIsCustomInput(true);
      setTempValue(''); // カスタム入力に切り替えた場合は空にする
    } else if (itemValue === null || itemValue === undefined) { // nullまたはundefinedをチェック
      setIsCustomInput(false); // 空白を選択した場合、カスタム入力にしない
      setTempValue(''); // 空白にする
    } else {
      setIsCustomInput(false);
      setTempValue(itemValue);
    }
  };

  const applyPickerSelection = () => {
    // tempValueが空白やnullの場合、"custom"を設定
    if (!tempValue || tempValue === null) {
      setIsCustomInput(true); // 新規入力に切り替える
      onChange(''); // 空の入力フィールドに切り替える
    } else {
      onChange(tempValue); // 選択した値を確定
    }
    setIsPickerVisible(false); // モーダルを閉じる
  };
  

  const showPicker = () => {
    setIsPickerVisible(true);
    setTempValue(value); // 現在の値を仮選択に設定
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
        <TouchableOpacity onPress={showPicker}>
          <View style={styles.input}>
            <Text>{value || placeholder}</Text>
            <Ionicons name="arrow-down" size={24} color="gray" style={styles.iconContainer} />
          </View>
        </TouchableOpacity>
      )}

      {/* Pickerをモーダルで表示 */}
      <Modal visible={isPickerVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={tempValue || "custom"}
              onValueChange={handlePickerChange}
            >
              {/* <Picker.Item label="新規入力" value="custom" /> */}
              {/* <Picker.Item label=" " value={null} /> */}
              <Picker.Item label="新規入力" value="custom" />
              {existingMembers.map((member, index) => (
                <Picker.Item key={index} label={member} value={member} />
              ))}
            </Picker>
            <Button title="OK" onPress={applyPickerSelection} />
            {/* <Button title="閉じる" onPress={() => setIsPickerVisible(false)} /> */}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '100%',
    paddingLeft: 10,
    backgroundColor: '#fff',
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  picker: {
    width: '100%',
  },
  iconContainer: {
    position: 'absolute',
    right: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    padding: 20,
  },
});

export default MemberInput;

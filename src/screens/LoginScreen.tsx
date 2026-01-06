import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Choose your role</Text>

      <TouchableOpacity onPress={() => login('contractor')}>
        <Text style={{ fontSize: 18 }}>I want to give work</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => login('labour')}>
        <Text style={{ fontSize: 18, marginTop: 10 }}>I want to work</Text>
      </TouchableOpacity>
    </View>
  );
}

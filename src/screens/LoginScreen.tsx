import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { Colors } from '../theme/colors';

export default function LoginScreen({ navigation }: any) {
  const { checkUser, verifyOtp } = useAuth();
  const { t } = useTranslation();

  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const handleVerifyNumber = async () => {
    if (phone.length < 10) return Alert.alert('Invalid Phone', 'Enter 10-digit number');
    if (!name.trim()) return Alert.alert('Required', 'Please enter your name');

    setLoading(true);
    try {
      await checkUser(phone);
      setStep('verify');
      Alert.alert(t('otp_sent' as any), t('use_otp_demo' as any));
    } catch (e) {
      Alert.alert(t('error'), t('failed_to_update_profile' as any));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) return Alert.alert('Invalid OTP', 'Enter 4-digit code');

    setLoading(true);
    try {
      // This will login AND create user if needed.
      // The Context will update 'user' state. 
      // If role is missing, Context user logic needs to handle redirection or we rely on RootNavigator?
      // Actually, verifyOtp returns the user object.
      const res = await verifyOtp(phone, otp, name);

      if (res.isNewUser) {
        // Navigate to Role Selection
        navigation.navigate('RoleSelection');
        // Wait, RoleSelection is in Auth stack? Yes.
      }
      // If not new user (has role), AuthContext updates state -> RootNavigator switches to Main -> Home.
    } catch (e: any) {
      Alert.alert('Failed', 'Invalid OTP or Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.white }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: Colors.primary, marginBottom: 8 }}>
          {t('welcome' as any)}
        </Text>
        <Text style={{ fontSize: 16, color: Colors.textSecondary, marginBottom: 32 }}>
          {t('login_sub' as any)}
        </Text>

        {/* Name Input - Always visible or visible only in Step 1? logic says "Same Screen" */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ marginBottom: 8, fontWeight: '600', color: Colors.textPrimary }}>{t('full_name')}</Text>
          <TextInput
            placeholder={t('enter_name')}
            value={name}
            onChangeText={setName}
            editable={step === 'input'}
            style={{
              borderWidth: 1,
              borderColor: Colors.border,
              padding: 14,
              borderRadius: 8,
              backgroundColor: step === 'input' ? 'white' : '#f5f5f5',
              color: Colors.textPrimary
            }}
          />
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ marginBottom: 8, fontWeight: '600', color: Colors.textPrimary }}>{t('phone')}</Text>
          <TextInput
            placeholder="+91"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10}
            editable={step === 'input'}
            style={{
              borderWidth: 1,
              borderColor: Colors.border,
              padding: 14,
              borderRadius: 8,
              backgroundColor: step === 'input' ? 'white' : '#f5f5f5',
              color: Colors.textPrimary
            }}
          />
        </View>

        {step === 'verify' && (
          <View style={{ marginBottom: 32, alignItems: 'center' }}>
            <Text style={{ marginBottom: 12, fontWeight: 'bold', color: Colors.primary }}>{t('use_otp_demo' as any)}</Text>
            <TextInput
              placeholder="X X X X"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={4}
              autoFocus
              style={{
                fontSize: 24,
                borderBottomWidth: 2,
                borderColor: Colors.primary,
                width: 120,
                textAlign: 'center',
                letterSpacing: 8,
                paddingBottom: 8,
                color: Colors.textPrimary
              }}
            />
          </View>
        )}

        <TouchableOpacity
          onPress={step === 'input' ? handleVerifyNumber : handleVerifyOtp}
          disabled={loading}
          style={{
            backgroundColor: Colors.primary,
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 16
          }}
        >
          {loading ? <ActivityIndicator color="white" /> : (
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
              {step === 'input' ? t('verify_number' as any) : t('verify_otp' as any)}
            </Text>
          )}
        </TouchableOpacity>

        {step === 'verify' && (
          <TouchableOpacity onPress={() => setStep('input')}>
            <Text style={{ textAlign: 'center', color: Colors.textSecondary }}>{t('edit_phone' as any)}</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

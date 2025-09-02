import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { supabase } from '../../api/supabaseClient';
import Colors from '../../constants/Colors'; // <-- 1. Importe as cores

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      Alert.alert('Erro no Cadastro', error.message);
    } else {
      Alert.alert('Cadastro Realizado!', 'Verifique seu e-mail para confirmar a conta.');
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert('Erro no Login', error.message);
    // O AuthContext cuidará do redirecionamento
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Bem-vindo de Volta' : 'Crie sua Conta'}</Text>
      
      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Nome Completo"
          placeholderTextColor={Colors.textSecondary}
          value={name}
          onChangeText={setName}
        />
      )}
      
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor={Colors.textSecondary}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor={Colors.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable
        style={({ pressed }) => [styles.button, { opacity: pressed ? 0.8 : 1 }, loading && styles.buttonDisabled]}
        onPress={isLogin ? handleLogin : handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{isLogin ? 'Entrar' : 'Cadastrar'}</Text>
        )}
      </Pressable>

      <Pressable onPress={() => setIsLogin(!isLogin)} style={styles.toggleButton}>
        <Text style={styles.toggleText}>
          {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça Login'}
        </Text>
      </Pressable>
    </View>
  );
}

// --- 2. Estilos agora usam o objeto Colors ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: Colors.surface,
    color: Colors.dark.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#334155', // slate-700
  },
  buttonText: {
    color: Colors.dark.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleButton: {
    marginTop: 24,
  },
  toggleText: {
    color: Colors.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
});
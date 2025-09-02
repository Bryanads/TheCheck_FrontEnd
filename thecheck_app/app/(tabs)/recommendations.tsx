import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRecommendations } from '../../api'; // Precisamos criar esta função
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/Colors';
import { Recommendation } from '../../types'; // E estes tipos

// --- Componente de Card (placeholder por enquanto) ---
const RecommendationCard = ({ item }: { item: Recommendation }) => (
    <View style={styles.card}>
        <Text style={styles.cardTitle}>{item.spot_name}</Text>
        <Text style={styles.cardScore}>{item.overall_score.toFixed(1)}</Text>
        <Text style={styles.cardTime}>{new Date(item.timestamp_utc).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
    </View>
);
// ----------------------------------------------------

export default function RecommendationsScreen() {
    const { profile } = useAuth();

    // Hook do TanStack Query para buscar as recomendações
    const { data: recommendations, isLoading, error } = useQuery({
        queryKey: ['recommendations', profile?.id],
        queryFn: () => {
            // TODO: Usar um preset padrão aqui
            const mockPresetRequest = {
                spot_ids: [1, 2, 3, 4, 5, 6, 7], // Usa todos os spots que cadastramos
                day_selection: { type: 'offsets', values: [0, 1] },
                time_window: { start: '06:00:00', end: '18:00:00' },
                limit: 10,
            };
            return getRecommendations(mockPresetRequest);
        },
        enabled: !!profile, // Só executa a query se o perfil do usuário já foi carregado
    });

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Buscando as melhores ondas para você...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Erro ao buscar recomendações: {error.message}</Text>
            </View>
        );
    }
    
    return (
        <View style={styles.container}>
            <FlatList
                data={recommendations}
                keyExtractor={(item) => `${item.spot_id}-${item.timestamp_utc}`}
                renderItem={({ item }) => <RecommendationCard item={item} />}
                ListHeaderComponent={<Text style={styles.title}>Melhores Condições</Text>}
            />
        </View>
    );
}

// --- Estilos ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.dark.background, padding: 16 },
    loadingText: { color: Colors.textSecondary, marginTop: 10 },
    errorText: { color: Colors.score.bad, textAlign: 'center' },
    title: { fontSize: 32, fontWeight: 'bold', color: Colors.dark.text, marginBottom: 16 },
    card: { backgroundColor: Colors.surface, padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
    cardTitle: { color: Colors.primary, fontSize: 18, fontWeight: 'bold' },
    cardScore: { color: Colors.dark.text, fontSize: 24, fontWeight: 'bold' },
    cardTime: { color: Colors.textSecondary, fontSize: 14 },
});
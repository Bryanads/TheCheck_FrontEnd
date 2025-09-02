const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

// Paleta de cores do TheCheck V2, baseada na nossa documentação
export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#e2e8f0', // Texto Principal: Branco Suave
    background: '#0f172a', // Fundo Principal: Azul Ardósia Escuro
    tint: '#22d3ee', // Cor Primária (Ação): Azul Ciano Brilhante
    tabIconDefault: '#94a3b8', // Cinza para ícones inativos
    tabIconSelected: '#22d3ee', // Ciano para ícones ativos
  },
  // Cores adicionais do nosso Design System
  primary: '#22d3ee', // Ciano
  surface: '#1e293b', // Azul Ardósia Intermediário (Cards)
  textSecondary: '#94a3b8', // Cinza
  border: '#334155', // Borda sutil (Slate 700)
  
  // Cores de Score
  score: {
    good: '#22c55e', // Verde
    medium: '#eab308', // Amarelo
    bad: '#ef4444', // Vermelho
  },
};
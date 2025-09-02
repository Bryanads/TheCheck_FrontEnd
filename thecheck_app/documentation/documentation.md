# Documentação Completa do Frontend - TheCheck V2

### Introdução

Este documento detalha a arquitetura, as tecnologias e as convenções para o desenvolvimento do frontend do TheCheck V2. O objetivo é criar um aplicativo multiplataforma (iOS, Android e Web) a partir de uma única base de código, oferecendo uma experiência de usuário rápida, intuitiva e coesa, consumindo a TheCheck API V2.

-----

### Ponto 1: Arquitetura e Tecnologias

A stack tecnológica foi escolhida para maximizar a produtividade, a performance e a qualidade do produto final.

  * **Framework Principal: React Native com Expo**

      * **Descrição:** Utilizaremos React Native para o desenvolvimento do núcleo do aplicativo e o framework Expo para gerenciar o build, as dependências nativas e o fluxo de desenvolvimento.
      * **Vantagem:** Permite a criação de um aplicativo nativo para iOS e Android, além de uma versão para a Web (PWA), a partir de uma única base de código em TypeScript, reduzindo drasticamente o tempo e o custo de desenvolvimento.

  * **Gerenciamento de Dados e Cache: TanStack Query (React Query)**

      * **Descrição:** Biblioteca para gerenciar o estado do servidor. Ela cuidará de todas as interações com a nossa API.
      * **Vantagem:** Automatiza o cache, a atualização de dados em segundo plano e os estados de `loading`/`error`, resultando em uma UI mais responsiva e um código mais limpo, sem a necessidade de gerenciar `useEffect` e `useState` para cada chamada de API.

  * **Navegação: React Navigation**

      * **Descrição:** Solução de roteamento e navegação padrão do ecossistema React Native.
      * **Vantagem:** Permite a criação de fluxos de navegação complexos e nativos, como abas inferiores (Tab Navigator) e telas que se sobrepõem (Stack Navigator).

  * **UI e Gráficos: Tailwind CSS + Recharts**

      * **Descrição:** Usaremos Tailwind CSS (através do `nativewind`) para uma estilização rápida e consistente. Para os gráficos, utilizaremos a biblioteca `Recharts`, que já foi validada no projeto anterior.

  * **Autenticação: Supabase Client JS**

      * **Descrição:** A biblioteca cliente do Supabase (`@supabase/supabase-js`) gerenciará todo o fluxo de autenticação (cadastro, login, recuperação de senha, gerenciamento de sessão).

-----

### Ponto 2: Estrutura de Pastas do Projeto (Expo)

A organização de pastas seguirá um padrão escalável e de fácil manutenção.

```
thecheck_app/
├── api/              # Funções que chamam a nossa API (ex: getRecommendations).
├── app/              # Telas e layout de navegação (padrão Expo Router).
├── assets/           # Imagens, fontes e ícones.
├── components/       # Componentes reutilizáveis (ScoreGauge, PresetForm, etc.).
├── constants/        # Cores, temas, e outras constantes de UI.
├── context/          # Nossos contextos (ex: AuthContext).
├── hooks/            # Hooks customizados (ex: useCachedData).
├── types/            # Nossas interfaces TypeScript.
└── App.tsx           # Ponto de entrada do aplicativo.
```

-----

### Ponto 3: Fluxo de Navegação

A navegação será dividida em três contextos principais, gerenciados pelo `React Navigation`.

  * **Fluxo de Autenticação (Stack Navigator):** Para usuários não logados.

      * `AuthScreen`: Tela de Login e Cadastro.
      * `ForgotPasswordScreen`: Tela de recuperação de senha.

  * **Fluxo de Onboarding (Stack Navigator):** Executado uma única vez após o primeiro login do usuário.

      * `OnboardingProfileScreen`: Define nível de surf e base.
      * `OnboardingSpotsScreen`: Apresenta os picos para o usuário.
      * `OnboardingPreferencesScreen`: Onde o usuário define suas preferências iniciais.
      * `OnboardingPresetScreen`: Criação do primeiro preset de busca.

  * **Aplicativo Principal (Tab Navigator):** O coração do app, com 3 abas principais na parte inferior.

    1.  **Aba "Recomendações" (Stack)**

          * `RecommendationsScreen`: Tela principal, exibe os cards de resumo.
          * `ForecastDetailScreen`: Acessada a partir de um card, exibe a previsão completa com o horário em destaque.

    2.  **Aba "Previsões" (Stack)**

          * `ForecastsScreen`: Ferramenta de análise independente, com seletor de picos para ver a previsão de 7 dias.

    3.  **Aba "Perfil" (Stack)**

          * `ProfileScreen`: Tela principal do perfil.
          * `PresetsScreen`: Acessada a partir do Perfil, para gerenciar presets.
          * `SpotsScreen`: Acessível a partir dos Presets ou Perfil, para gerenciar preferências de cada pico.
          * `SpotPreferencesScreen`: Tela de edição das preferências de um pico.

-----

### Ponto 4: Gestão de Dados e Estado

  * **Estado do Servidor (TanStack Query):**

      * Criaremos hooks customizados para cada recurso da API (ex: `useSpots()`, `usePresets(userId)`, `useForecast(spotId)`).
      * Esses hooks usarão o `useQuery` do TanStack Query internamente para buscar e cachear os dados.
      * Para ações de escrita (criar/atualizar/deletar), usaremos o `useMutation`, que permite invalidar o cache automaticamente, mantendo a UI sempre sincronizada com o banco de dados.

  * **Estado Global do Cliente (Context API):**

      * `AuthContext`: Gerencia o estado da sessão do Supabase, o perfil do usuário logado e o status de autenticação, disponibilizando essas informações para todo o app.
      * `OnboardingContext`: Gerencia o estado dos dados coletados durante o fluxo de onboarding.

-----

### Ponto 5: Arquitetura de Componentes

O aplicativo será construído com componentes reutilizáveis para garantir consistência e agilidade.

  * **`RecommendationCard`**: Exibe o resumo de uma recomendação (`spot_name`, `timestamp_utc`, `overall_score`). Ao ser tocado, navega para a `ForecastDetailScreen`.
  * **`ForecastCharts`**: Exibe os gráficos de previsão (onda, vento, maré). Replicará a lógica de "highlight" do projeto anterior, destacando a barra do horário selecionado.
  * **`ScoreGauge`**: Medidor circular que exibe um score de 0 a 100, mudando de cor (verde/amarelo/vermelho) com base no valor.
  * **`SpotSelector`**: Componente com barra de busca e botão "Picos Próximos" para encontrar e selecionar picos.
  * **`PresetForm`**: Formulário completo para criar e editar um preset.

-----

### Ponto 6: Design System (UI/UX)

  * **Paleta de Cores:** Tema escuro como padrão.
      * **Primária (Ação):** Azul Ciano Brilhante (`#22d3ee`).
      * **Fundo:** Azul Ardósia Escuro (`#0f172a`).
      * **Superfícies (Cards):** Azul Ardósia Intermediário (`#1e293b`).
      * **Cores de Score:** Verde (`#22c55e`), Amarelo (`#eab308`), Vermelho (`#ef4444`).
      * **Texto Principal:** Branco Suave (`#e2e8f0`).
      * **Texto Secundário:** Cinza (`#94a3b8`).
  * **Ícones:** Um conjunto centralizado de componentes de ícones em `components/icons.tsx` será usado para manter a consistência visual.
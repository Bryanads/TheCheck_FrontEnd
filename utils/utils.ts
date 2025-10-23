/**
 * Converte um ângulo em graus para direção cardeal.
 * @param degrees valor em graus (0-360)
 * @returns direção cardeal (N, NNE, NE, ENE, etc.)
 */
export function degreesToCardinal(degrees: number): string {
  if (isNaN(degrees) || degrees === null || degrees === undefined) return "-"; // Adicionada checagem para null/undefined

  const directions = [
    "N", "NNE", "NE", "ENE",
    "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW",
    "W", "WNW", "NW", "NNW"
  ];

  // Garante que graus esteja entre 0 e 360
  const normalizedDegrees = ((degrees % 360) + 360) % 360;

  // Calcula o índice arredondando para o mais próximo
  const index = Math.round(normalizedDegrees / 22.5) % 16;
  return directions[index];
}

/**
 * Converte uma string de horário local (HH:mm) para uma string de horário UTC (HH:mm:ss).
 * @param localTime Horário local no formato "HH:mm".
 * @returns Horário UTC no formato "HH:mm:ss".
 * @deprecated ESTA FUNÇÃO ESTÁ INCORRETA E SERÁ REMOVIDA. A conversão UTC deve ser feita no backend usando o timezone do Spot. Use formatLocalTimeForAPI em vez disso.
 */
export const toUTCTime_DEPRECATED = (localTime: string): string => {
    console.warn("toUTCTime está depreciada e incorreta. A conversão UTC deve ocorrer no backend.");
    // Retorna a hora no formato esperado pela API, mas sem conversão UTC real
    if (!localTime) return '00:00:00';
    const [hours, minutes] = localTime.split(':').map(Number);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
};

/**
 * Formata uma string de horário local (HH:mm) para o formato "HH:mm:ss" esperado pela API,
 * sem realizar conversão de fuso horário.
 * @param localTime Horário local no formato "HH:mm".
 * @returns Horário formatado como "HH:mm:ss".
 */
export const formatLocalTimeForAPI = (localTime: string): string => {
    if (!localTime) return '00:00:00';
    const parts = localTime.split(':');
    const hours = parseInt(parts[0] || '0', 10);
    const minutes = parseInt(parts[1] || '0', 10);
     // Adiciona :00 para segundos
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
};


/**
 * Converte uma string de horário UTC (HH:mm ou HH:mm:ss) para uma string de horário local (HH:mm).
 * @param utcTime Horário UTC no formato "HH:mm" ou "HH:mm:ss".
 * @returns Horário local no formato "HH:mm".
 */
export const toLocalTime = (utcTime: string): string => {
    if (!utcTime) return '00:00';
    // Garante que temos horas, minutos e segundos (mesmo que 00)
    const parts = utcTime.split(':');
    const hours = parseInt(parts[0] || '0', 10);
    const minutes = parseInt(parts[1] || '0', 10);
    const seconds = parseInt(parts[2] || '0', 10);

    const date = new Date();
    // Define a hora como UTC
    date.setUTCHours(hours, minutes, seconds, 0);

    // Obtém a hora local correspondente
    const localHours = date.getHours().toString().padStart(2, '0');
    const localMinutes = date.getMinutes().toString().padStart(2, '0');
    return `${localHours}:${localMinutes}`;
};


/**
 * Calcula os day_offsets com base nos dias da semana selecionados.
 * @param weekdays Array de números representando os dias da semana (0=Domingo, 6=Sábado).
 * @returns Array de day_offsets (e.g., [0, 1] para hoje e amanhã).
 */
export const weekdaysToDayOffset = (weekdays: number[]): number[] => {
    if (!weekdays || weekdays.length === 0) return [0]; // Padrão para hoje se nenhum dia for selecionado

    const today = new Date();
    // Usar getUTCDay() para consistência, já que os offsets são baseados em dias UTC
    const currentUTCDay = today.getUTCDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    const offsets: number[] = [];

    for (let i = 0; i < 7; i++) { // Verifica os próximos 7 dias
        const futureDay = (currentUTCDay + i) % 7;
        if (weekdays.includes(futureDay)) {
            offsets.push(i);
        }
    }
    // Se nenhum dia da semana corresponder nos próximos 7 dias, retorna hoje como padrão.
    return offsets.length > 0 ? offsets : [0];
};
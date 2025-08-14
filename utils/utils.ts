/**
 * Converte um ângulo em graus para direção cardeal.
 * @param degrees valor em graus (0-360)
 * @returns direção cardeal (N, NNE, NE, ENE, etc.)
 */
export function degreesToCardinal(degrees: number): string {
  if (isNaN(degrees)) return "-";

  const directions = [
    "N", "NNE", "NE", "ENE",
    "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW",
    "W", "WNW", "NW", "NNW"
  ];

  const index = Math.round(((degrees % 360) / 22.5)) % 16;
  return directions[index];
}

/**
 * Converte uma string de horário local (HH:mm) para uma string de horário UTC (HH:mm:ss).
 * @param localTime Horário local no formato "HH:mm".
 * @returns Horário UTC no formato "HH:mm:ss".
 */
export const toUTCTime = (localTime: string): string => {
    if (!localTime) return '00:00:00';
    const [hours, minutes] = localTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0); // Define o horário local

    const utcHours = date.getUTCHours().toString().padStart(2, '0');
    const utcMinutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${utcHours}:${utcMinutes}:00`; 
};

/**
 * Converte uma string de horário UTC (HH:mm ou HH:mm:ss) para uma string de horário local (HH:mm).
 * @param utcTime Horário UTC no formato "HH:mm" ou "HH:mm:ss".
 * @returns Horário local no formato "HH:mm".
 */
export const toLocalTime = (utcTime: string): string => {
    if (!utcTime) return '00:00';
    const [hours, minutes] = utcTime.split(':').map(Number);
    const date = new Date();
    date.setUTCHours(hours, minutes, 0, 0); // Define o horário UTC

    const localHours = date.getHours().toString().padStart(2, '0');
    const localMinutes = date.getMinutes().toString().padStart(2, '0');
    return `${localHours}:${localMinutes}`;
};
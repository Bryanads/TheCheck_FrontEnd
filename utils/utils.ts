/**
 * Converte um ângulo em graus para direção cardeal.
 * 0° ou 360° → N, 90° → E, 180° → S, 270° → W, etc.
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

  // cada direção ocupa 22.5°
  const index = Math.round(((degrees % 360) / 22.5)) % 16;
  return directions[index];
}
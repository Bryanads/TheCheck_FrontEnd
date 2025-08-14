export interface User {
  user_id: string;
  name: string;
  email: string;
  surf_level: 'maroleiro' | 'intermediario' ;
  goofy_regular_stance: 'Regular' | 'Goofy'; 
  preferred_wave_direction: 'Left' | 'Right' | 'Both';
  bio?: string;
  profile_picture_url?: string;
}

export interface Spot {
  spot_id: number;
  spot_name: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface Forecast {
  spot_id: number;
  spot_name: string;
  timestamp_utc: string;
  wave_height_sg: number;
  wave_direction_sg: number;
  wave_period_sg: number;
  swell_height_sg: number;
  swell_direction_sg: number;
  swell_period_sg: number;
  secondary_swell_height_sg: number | null;
  secondary_swell_direction_sg: number | null;
  secondary_swell_period_sg: number | null;
  wind_speed_sg: number;
  wind_direction_sg: number;
  water_temperature_sg: number;
  air_temperature_sg: number;
  current_speed_sg: number | null;
  current_direction_sg: number | null;
  sea_level_sg: number;
  tide_phase: 'Rising' | 'Falling' | 'High' | 'Low';
}

export interface DetailedScores {
  wave_score: number;
  wind_score: number;
  tide_score: number;
  water_temperature_score: number;
  air_temperature_score: number;
  current_score: number;
}

export interface HourlyRecommendation {
  timestamp_utc: string;
  suitability_score: number;
  detailed_scores: DetailedScores;
  forecast_conditions: Omit<Forecast, 'spot_id' | 'spot_name'>;
  spot_characteristics: {
    bottom_type: string | null;
    coast_orientation: string | null;
    general_characteristics: string | null;
  };
}

export interface DayOffsetRecommendations {
  day_offset: number;
  recommendations: HourlyRecommendation[];
}

export interface SpotPreferences {
  level_preference_id?: number;
  spot_id: number;
  surf_level?: string;
  min_wave_height: number;
  max_wave_height: number;
  ideal_wave_height: number;
  min_wave_period: number;
  max_wave_period: number;
  ideal_wave_period: number;
  min_swell_height: number;
  max_swell_height: number;
  ideal_swell_height: number;
  min_swell_period: number;
  max_swell_period: number;
  ideal_swell_period: number;
  preferred_wave_direction: string;
  preferred_swell_direction: string;
  ideal_tide_type: string;
  min_sea_level: number;
  max_sea_level: number;
  ideal_sea_level: number;
  min_wind_speed: number;
  max_wind_speed: number;
  ideal_wind_speed: number;
  preferred_wind_direction: string;
  ideal_water_temperature: number;
  ideal_air_temperature: number;
}

export interface SpotRecommendation {
  spot_name: string;
  spot_id: number;
  preferences_used_for_spot: SpotPreferences; // <-- PROPRIEDADE CORRIGIDA
  day_offsets: DayOffsetRecommendations[];
}

export interface Preset {
    preset_id: number;
    user_id: string;
    preset_name: string;
    spot_ids: number[];
    start_time: string;
    end_time: string;
    weekdays: number[];
    is_default: boolean;
    is_active: boolean;
}

export interface RecommendationFilters {
    selectedSpotIds: number[];
    dayOffset: number[];
    startTime: string;
    endTime: string;
}
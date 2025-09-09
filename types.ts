// bryanads/thecheck_frontend/TheCheck_FrontEnd-56043ed899e9911f49213e6ecb22787e09848d37/types.ts
export interface Spot {
  spot_id: number;
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  bottom_type?: string;
  break_type?: string;
  difficulty_level?: string;
  state?: string;
  region?: string;
  ideal_swell_direction?: number[];
  ideal_wind_direction?: number[];
  ideal_sea_level?: number;
  ideal_tide_flow?: string[];
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  location?: string;
  bio?: string;
  surf_level?: 'iniciante' | 'intermediario' | 'avancado';
  stance?: 'regular' | 'goofy';
}

export interface ProfileUpdate {
  name?: string;
  location?: string;
  bio?: string;
  surf_level?: 'iniciante' | 'intermediario' | 'avancado';
  stance?: 'regular' | 'goofy';
}

export interface Preset {
  preset_id: number;
  user_id: string;
  name: string;
  spot_ids: number[];
  start_time: string; // "HH:MM:SS"
  end_time: string;   // "HH:MM:SS"
  day_selection_type: 'offsets' | 'weekdays';
  day_selection_values: number[];
  is_default: boolean;
}

export interface PresetCreate extends Omit<Preset, 'preset_id' | 'user_id'> {}
export interface PresetUpdate extends Partial<Omit<Preset, 'preset_id' | 'user_id'>> {}

export interface Preference {
  preference_id: number;
  user_id: string;
  spot_id: number;
  ideal_swell_height?: number;
  max_swell_height?: number;
  max_wind_speed?: number;
  ideal_water_temperature?: number;
  ideal_air_temperature?: number;
  is_active: boolean;
}

export interface PreferenceUpdate extends Partial<Omit<Preference, 'preference_id' | 'user_id' | 'spot_id'>> {}

export interface ForecastConditions {
  wave_height_sg?: number;
  wave_direction_sg?: number;
  wave_period_sg?: number;
  swell_height_sg?: number;
  swell_direction_sg?: number;
  swell_period_sg?: number;
  secondary_swell_height_sg?: number;
  secondary_swell_direction_sg?: number;
  secondary_swell_period_sg?: number;
  wind_speed_sg?: number;
  wind_direction_sg?: number;
  water_temperature_sg?: number;
  air_temperature_sg?: number;
  current_speed_sg?: number;
  current_direction_sg?: number;
  sea_level_sg?: number;
  tide_type?: string;
}

export interface HourlyForecast {
  timestamp_utc: string;
  conditions: ForecastConditions;
}

export interface DailyForecast {
  date: string;
  hourly_data: HourlyForecast[];
}

export interface SpotForecast {
  spot_id: number;
  spot_name: string;
  forecasts: HourlyForecast[]; 
}

export interface RecommendationRequest {
  spot_ids: number[];
  day_selection: {
    type: 'offsets' | 'weekdays';
    values: number[];
  };
  time_window: {
    start: string; // "HH:MM:SS"
    end: string;   // "HH:MM:SS"
  };
  limit?: number;
}

export interface DetailedScores {
  wave_score: number;
  wind_score: number;
  tide_score: number;
  air_temperature_score: number;
  water_temperature_score: number;
}

export interface Recommendation {
  spot_id: number;
  spot_name: string;
  timestamp_utc: string; // ISO 8601 date string
  overall_score: number;
  detailed_scores: DetailedScores;
}
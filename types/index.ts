export interface Profile {
  id: string;
  name: string;
  email: string;
  location?: string;
  bio?: string;
  surf_level?: string;
  stance?: string;
}

export interface DaySelection {
    type: string;
    values: number[];
}

export interface TimeWindow {
    start: string;
    end: string;
}

export interface RecommendationRequest {
    spot_ids: number[];
    day_selection: DaySelection;
    time_window: TimeWindow;
    limit: number;
}

export interface DetailedScores {
    wave_score: number;
    wind_score: number;
    tide_score: number;
    water_temperature_score: number;
    air_temperature_score: number;
}

export interface Recommendation {
    spot_id: number;
    spot_name: string;
    timestamp_utc: string;
    overall_score: number;
    detailed_scores: DetailedScores;
}
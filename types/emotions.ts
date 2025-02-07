export interface EmotionalDataPoint {
  date: string
  Anger: number
  Disgust: number
  Fear: number
  Happiness: number
  Sadness: number
  Surprise: number
}

export interface EmotionalTrend {
  date: Date
  value: number
  microexpression: string
} 
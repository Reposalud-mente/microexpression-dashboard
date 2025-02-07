export interface EmotionalTrend {
  date: Date
  microexpression: string
  emotions: {
    Ira: number
    Asco: number
    Miedo: number
    Felicidad: number
    Tristeza: number
    Sorpresa: number
    [key: string]: number  // For any additional emotions
  }
}

export interface Recommendation {
  id: string
  type: 'Therapy' | 'Activity' | 'Medication'
  description: string
  priority: 'High' | 'Medium' | 'Low'
  basedOn: string[]
  dateCreated: Date
}

export interface TreatmentRecord {
  id: string
  date: Date
  type: string
  notes: string
  outcome?: string
} 
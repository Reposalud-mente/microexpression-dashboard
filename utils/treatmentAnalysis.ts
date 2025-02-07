import type { EmotionalTrend, Recommendation } from "@/utils/emotions"
export const analyzeTreatmentNeeds = (emotionalData: EmotionalTrend[]): Recommendation[] => {
  const recommendations: Recommendation[] = []
  
  const angerLevel = getAverageEmotion(emotionalData, 'Ira')
  const anxietyLevel = getAverageEmotion(emotionalData, 'Miedo')
  const sadnessLevel = getAverageEmotion(emotionalData, 'Tristeza')
  const happinessLevel = getAverageEmotion(emotionalData, 'Felicidad')
  
  if (angerLevel > 70) {
    recommendations.push({
      id: crypto.randomUUID(),
      type: 'Therapy',
      description: 'Consider anger management therapy sessions',
      priority: 'High',
      basedOn: ['Ira'],
      dateCreated: new Date()
    })
  }
  
  if (anxietyLevel > 60) {
    recommendations.push({
      id: crypto.randomUUID(),
      type: 'Activity',
      description: 'Daily meditation and breathing exercises recommended',
      priority: 'Medium',
      basedOn: ['Miedo'],
      dateCreated: new Date()
    })
  }
  
  if (sadnessLevel > 65 && happinessLevel < 30) {
    recommendations.push({
      id: crypto.randomUUID(),
      type: 'Therapy',
      description: 'Schedule consultation with mental health professional',
      priority: 'High',
      basedOn: ['Tristeza', 'Felicidad'],
      dateCreated: new Date()
    })
  }
  
  return recommendations
}

export const getAverageEmotion = (data: EmotionalTrend[], emotion: string): number => {
  if (!data || data.length === 0) return 0
  return data.reduce((sum, d) => sum + (d.emotions[emotion] || 0), 0) / data.length
} 
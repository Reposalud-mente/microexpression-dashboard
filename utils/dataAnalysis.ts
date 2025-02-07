import { TrendingUp, Minus } from "lucide-react"
import React from "react"

export const getDominantExpression = (data: any[]): string => {
  if (!data || data.length === 0) return "No data"
  const microexpressions = ["Ira", "Asco", "Miedo", "Felicidad", "Tristeza", "Sorpresa"]
  const averages = microexpressions.map((me) => ({
    microexpression: me,
    average: data.reduce((sum, d) => sum + d[me], 0) / data.length,
  }))
  return averages.sort((a, b) => b.average - a.average)[0].microexpression
}

export const getSignificantChanges = (data: any[]): string => {
  if (!data || data.length <= 1) return "No significant changes"
  // This is a placeholder. In a real application, you'd implement more sophisticated analysis here.
  return "Implement significant change detection logic here"
}

export const getStabilityIndex = (data: any[]): number => {
  if (!data || data.length === 0) return 0
  // This is a placeholder. In a real application, you'd implement more sophisticated analysis here.
  return Math.floor(Math.random() * 10) + 1 // Returns a random number between 1 and 10
}

const getIntensityLabel = (emotion: string, value: number): string => {
  if (["Anger", "Disgust", "Fear", "Sadness"].includes(emotion)) {
    if (value >= 70) return "Intensidad severa";
    if (value >= 50) return "Intensidad moderada";
    if (value >= 30) return "Intensidad leve";
    return "Intensidad baja";
  } else {
    if (value >= 70) return "Altamente positivo";
    if (value >= 50) return "Moderadamente positivo";
    if (value >= 30) return "Ligeramente positivo";
    return "Neutral";
  }
}

const getTrendData = (emotion: string, value: number) => {
  return {
    variant: value > 50 ? "default" : "secondary",
    label: value > 50 ? "Aumentando" : "Estable",
    icon: value > 50 
      ? React.createElement(TrendingUp, { className: "h-4 w-4 text-green-500" }) 
      : React.createElement(Minus, { className: "h-4 w-4 text-gray-500" }),
  }
}


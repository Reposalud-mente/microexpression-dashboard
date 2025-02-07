"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, LineChart, BarChart3, PieChart, TrendingUp, Minus, Download, Brain, Stethoscope } from "lucide-react"
import DatePickerWithRange from "./date-range-picker"
import MicroexpressionLineChart from "./microexpression-line-chart"
import MicroexpressionHeatmap from "./microexpression-heatmap"
import MicroexpressionBarChart from "./microexpression-bar-chart"
import { addDays, format, differenceInDays } from "date-fns"
import { getDominantExpression, getSignificantChanges, getStabilityIndex } from "./utils/dataAnalysis"
import type { DateRange } from "react-day-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TreatmentRecommendations } from "./TreatmentRecommendations"
import type { EmotionalTrend, Recommendation, TreatmentRecord } from "./utils/emotions"
import { analyzeTreatmentNeeds, getAverageEmotion } from "./utils/treatmentAnalysis"

const microexpressions = ["Ira", "Asco", "Miedo", "Felicidad", "Tristeza", "Sorpresa"]

// Sample data with correct structure
const sampleEmotionalData: EmotionalTrend[] = [
  {
    date: new Date(),
    microexpression: "Mixed",
    emotions: {
      "Ira": 65,
      "Asco": 40,
      "Miedo": 45,
      "Felicidad": 50,
      "Tristeza": 30,
      "Sorpresa": 35
    }
  },
  {
    date: new Date(Date.now() - 86400000), // yesterday
    microexpression: "Mixed",
    emotions: {
      "Ira": 70,
      "Asco": 45,
      "Miedo": 55,
      "Tristeza": 25,
      "Felicidad": 45,
      "Sorpresa": 30
    }
  }
]

// Add this function at the top level, after microexpressions constant
const getIntensityColor = (emotion: string, value: number): string => {
  // Negative emotions
  if (['Ira', 'Asco', 'Miedo', 'Tristeza'].includes(emotion)) {
    if (value >= 70) return 'text-red-600'
    if (value >= 50) return 'text-orange-500'
    if (value >= 30) return 'text-yellow-500'
    return 'text-green-500'
  }
  // Positive emotions (Felicidad, Sorpresa)
  else {
    if (value >= 70) return 'text-green-600'
    if (value >= 50) return 'text-green-500'
    if (value >= 30) return 'text-yellow-500'
    return 'text-orange-500'
  }
}

// Add this function to provide an intensity label based on emotion and value
const getIntensityLabel = (emotion: string, value: number): string => {
  if (["Ira", "Asco", "Miedo", "Tristeza"].includes(emotion)) {
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

const getTrendData = (emotion: string, value: number): {
  variant: "default" | "destructive" | "outline" | "secondary" | null | undefined;
  label: string;
  icon: React.ReactNode;
} => {
  return {
    variant: value > 50 ? "default" : "secondary",
    label: value > 50 ? "Aumentando" : "Estable",
    icon: value > 50 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <Minus className="h-4 w-4 text-gray-500" />
  }
}

const getEmotionEmoji = (emotion: string): string => {
  const emojiMap: Record<string, string> = {
    Ira: "😠",
    Asco: "🤢",
    Miedo: "😨",
    Felicidad: "😊",
    Tristeza: "😢",
    Sorpresa: "😲"
  }
  return emojiMap[emotion] || "😐"
}

const EmotionCard = ({ me, average }: { me: string; average: number }) => {
  const intensityColor = getIntensityColor(me, average)
  const intensityLabel = getIntensityLabel(me, average)
  const trend = getTrendData(me, average)

  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            {getEmotionEmoji(me)} {me}
            <Badge variant={trend.variant} className="ml-2">
              {trend.label}
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className={`text-3xl font-bold ${intensityColor}`}>
            {average.toFixed(1)}%
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {intensityLabel}
            </p>
            {trend.icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface PatientMetrics {
  patientId: string
  name: string
  age: number
  emotionalData: EmotionalTrend[]
  treatmentHistory: TreatmentRecord[]
  recommendations: Recommendation[]
}

const PatientSelector = ({ onPatientChange }: { onPatientChange: (patientId: string) => void }) => {
  return (
    <Select onValueChange={onPatientChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Seleccionar paciente" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="patient1">Juan Pérez</SelectItem>
        <SelectItem value="patient2">María García</SelectItem>
      </SelectContent>
    </Select>
  )
}

const generateData = (from: Date, to: Date) => {
  const days = differenceInDays(to, from)
  return Array.from({ length: days + 1 }, (_, i) => ({
    date: addDays(from, i),
    microexpression: "Mixed",
    emotions: {
      "Ira": Math.random() * 100,
      "Asco": Math.random() * 100,
      "Miedo": Math.random() * 100,
      "Felicidad": Math.random() * 100,
      "Tristeza": Math.random() * 100,
      "Sorpresa": Math.random() * 100
    }
  }))
}

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })
  const [activeView, setActiveView] = useState("overview")
  const [focusExpression, setFocusExpression] = useState("")

  const data = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return []
    return generateData(dateRange.from, dateRange.to)
  }, [dateRange])

  const averages = useMemo(() => 
    microexpressions.map((me) => ({
      microexpression: me,
      average: data.reduce((sum, d) => sum + d.emotions[me as keyof typeof d.emotions], 0) / data.length,
    }))
  , [data])

  const insights = useMemo(() => ({
    dominant: getDominantExpression(data),
    changes: getSignificantChanges(data),
    stability: getStabilityIndex(data),
    daysAnalyzed: dateRange && dateRange.from && dateRange.to ? 
      differenceInDays(dateRange.to, dateRange.from) : 0
  }), [data, dateRange])

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 space-y-8">
      {/* Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 p-6 border-b bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-lg shadow-sm">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100/80 rounded-lg shadow-sm">
              <Brain className="h-5 w-5 text-blue-600" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Panel de Análisis Emocional
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1 ml-11">
            Analizando {insights.daysAnalyzed} días de datos emocionales
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden md:flex gap-2 bg-white/50 hover:bg-blue-50"
          >
            <Download className="h-4 w-4 text-blue-600" />
            Exportar Datos
          </Button>
          <DatePickerWithRange 
            date={dateRange} 
            setDate={setDateRange}
            className="bg-white/50 w-full md:w-auto"
          />
          <PatientSelector onPatientChange={(patientId) => {}} />
        </div>
      </div>

      {/* Tabs and Content */}
      <div className="mt-8">
        <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <PieChart className="h-4 w-4" /> Resumen
            </TabsTrigger>
            <TabsTrigger value="trends" className="gap-2">
              <LineChart className="h-4 w-4" /> Tendencias
            </TabsTrigger>
            <TabsTrigger value="treatments" className="gap-2">
              <Stethoscope className="h-4 w-4" /> Tratamientos
            </TabsTrigger>
            <TabsTrigger value="details" className="gap-2">
              <BarChart3 className="h-4 w-4" /> Detalles
            </TabsTrigger>
          </TabsList>

          {/* Emotion Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {averages.map((item) => (
              <EmotionCard 
                key={item.microexpression}
                me={item.microexpression}
                average={item.average}
              />
            ))}
          </div>

          {/* Rest of the tabs content */}
          <TabsContent value="trends" className="space-y-4">
            <div className="grid gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Análisis de Tendencias Emocionales</CardTitle>
                  <CardDescription>
                    Seguimiento de patrones y variaciones emocionales en el tiempo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="h-[400px] pt-4">
                      <MicroexpressionLineChart 
                        data={data} 
                        focusExpression={focusExpression} 
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {microexpressions.map((emotion) => (
                        <Button
                          key={emotion}
                          variant={focusExpression === emotion ? "default" : "outline"}
                          onClick={() => setFocusExpression(focusExpression === emotion ? "" : emotion)}
                          className="gap-2"
                          size="sm"
                        >
                          {getEmotionEmoji(emotion)}
                          {emotion}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Emoción Dominante</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      {getEmotionEmoji(insights.dominant)}
                      <span className="text-2xl font-bold">{insights.dominant}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Índice de Estabilidad</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {insights.stability}/10
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Cambios Significativos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{insights.changes}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="treatments" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="col-span-1 md:col-span-3">
                <CardHeader>
                  <CardTitle>Recomendaciones de Tratamiento</CardTitle>
                  <CardDescription>
                    Basado en análisis de patrones emocionales
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Recomendaciones Activas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {analyzeTreatmentNeeds(data).length}
                        </div>
                      </CardContent>
                    </Card>
                    {/* Other metric cards */}
                  </div>
                  <TreatmentRecommendations recommendations={analyzeTreatmentNeeds(data)} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análisis Detallado</CardTitle>
                <CardDescription>
                  Desglose de patrones e intensidades emocionales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <MicroexpressionBarChart data={averages} />
                  <MicroexpressionHeatmap data={data} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}


"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, LineChart, BarChart3, PieChart, TrendingUp, Minus, Download, Brain } from "lucide-react"
import DatePickerWithRange from "./date-range-picker"
import MicroexpressionLineChart from "./microexpression-line-chart"
import MicroexpressionHeatmap from "./microexpression-heatmap"
import MicroexpressionBarChart from "./microexpression-bar-chart"
import { addDays, format, differenceInDays } from "date-fns"
import { getDominantExpression, getSignificantChanges, getStabilityIndex } from "./utils/dataAnalysis"
import type { DateRange } from "react-day-picker"

// Sample data
const microexpressions = ["Ira", "Asco", "Miedo", "Felicidad", "Tristeza", "Sorpresa"]
const generateData = (start: Date, end: Date) => {
  const data = []
  let current = start
  while (current <= end) {
    const entry: any = { date: format(current, "yyyy-MM-dd") }
    microexpressions.forEach((me) => {
      entry[me] = Math.random() * 100
    })
    data.push(entry)
    current = addDays(current, 1)
  }
  return data
}

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
      average: data.reduce((sum, d) => sum + d[me], 0) / data.length,
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
    <div className="container mx-auto px-6 pt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 pb-6 border-b bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-lg p-4">
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
        
        <div className="flex items-center gap-2">
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
            className="bg-white/50"
          />
        </div>
      </div>

      <Tabs value={activeView} onValueChange={setActiveView} className="mt-6">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <PieChart className="h-4 w-4" /> Resumen
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            <LineChart className="h-4 w-4" /> Tendencias
          </TabsTrigger>
          <TabsTrigger value="details" className="gap-2">
            <BarChart3 className="h-4 w-4" /> Detalles
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {averages.map((item) => (
            <EmotionCard 
              key={item.microexpression}
              me={item.microexpression}
              average={item.average}
            />
          ))}
        </div>

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
        
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analysis</CardTitle>
              <CardDescription>
                Breakdown of emotional patterns and intensities
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
  )
}


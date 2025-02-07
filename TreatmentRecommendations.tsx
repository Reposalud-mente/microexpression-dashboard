import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Activity, Pill } from "lucide-react"
import type { Recommendation } from "./utils/emotions"

const getIconForType = (type: string) => {
  switch (type) {
    case 'Therapy':
      return <Brain className="h-4 w-4" />
    case 'Activity':
      return <Activity className="h-4 w-4" />
    case 'Medication':
      return <Pill className="h-4 w-4" />
    default:
      return null
  }
}

const getPriorityColor = (priority: string): "destructive" | "secondary" | "default" | "outline" => {
  switch (priority) {
    case 'High':
      return 'destructive'
    case 'Medium':
      return 'secondary'
    case 'Low':
      return 'outline'
    default:
      return 'default'
  }
}

export function TreatmentRecommendations({ recommendations }: { recommendations: Recommendation[] }) {
  return (
    <div className="space-y-4">
      {recommendations.map((rec) => (
        <Card key={rec.id}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getIconForType(rec.type)}
                <h3 className="font-semibold">{rec.type}</h3>
              </div>
              <Badge variant={getPriorityColor(rec.priority)}>
                {rec.priority} Priority
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{rec.description}</p>
            <div className="mt-4 flex gap-2">
              {rec.basedOn.map((factor) => (
                <Badge variant="outline" key={factor}>{factor}</Badge>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-4">
              Recommended on: {rec.dateCreated.toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 
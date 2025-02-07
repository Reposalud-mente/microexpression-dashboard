"use client"
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip } from "recharts"

const microexpressions = ["Ira", "Asco", "Miedo", "Felicidad", "Tristeza", "Sorpresa"]

interface Props {
  data: any[]
}

const MicroexpressionHeatmap = ({ data }: Props) => {
  const heatmapData = data.flatMap((entry, index) =>
    microexpressions.map((me, meIndex) => ({
      x: index,
      y: meIndex,
      z: entry[me],
      date: entry.date,
      microexpression: me,
    })),
  )

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis type="number" dataKey="x" name="date" tick={false} />
          <YAxis type="number" dataKey="y" name="microexpression" tickFormatter={(value) => microexpressions[value]} />
          <ZAxis type="number" dataKey="z" range={[0, 500]} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ payload }) => {
              if (payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div style={{ backgroundColor: "white", padding: "10px", border: "1px solid #ccc" }}>
                    <p>Fecha: {data.date}</p>
                    <p>Emoción: {data.microexpression}</p>
                    <p>Intensidad: {data.z.toFixed(2)}%</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Scatter data={heatmapData} fill="#8884d8" fillOpacity={0.6} shape="circle" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}

export default MicroexpressionHeatmap


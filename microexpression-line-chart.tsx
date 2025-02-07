"use client"

import { useRef, useEffect, useMemo } from "react"
import * as d3 from "d3"
import { format } from "date-fns"

interface Props {
  data: {
    date: Date
    emotions: {
      [key: string]: number
    }
  }[]
  focusExpression: string
}

const microexpressions = ["Ira", "Asco", "Miedo", "Felicidad", "Tristeza", "Sorpresa"]
const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F"]

const MicroexpressionLineChart = ({ data, focusExpression }: Props) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!data || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 30, right: 120, bottom: 50, left: 50 }
    const width = svg.node()!.getBoundingClientRect().width - margin.left - margin.right
    const height = 300 - margin.top - margin.bottom

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => new Date(d.date)) as [Date, Date])
      .range([0, width])

    const y = d3.scaleLinear().domain([0, 100]).range([height, 0])

    // Create line generator with correct emotion data access
    const line = d3
      .line<any>()
      .x((d) => x(new Date(d.date)))
      .y((d, i) => y(d.emotions[focusExpression] || 0))

    // Draw lines for each emotion or just focused emotion
    microexpressions.forEach((emotion, i) => {
      if (!focusExpression || focusExpression === emotion) {
        g.append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", colors[i])
          .attr("stroke-width", focusExpression === emotion ? 3 : 1.5)
          .attr("stroke-opacity", focusExpression ? (focusExpression === emotion ? 1 : 0.2) : 0.8)
          .attr("d", line)
      }
    })

    // Format X axis with less compressed dates
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3.axisBottom(x)
          .ticks(d3.timeWeek.every(1))
          .tickFormat((d) => format(d as Date, "'Semana del' d MMM"))
      )
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")

    g.append("g").call(d3.axisLeft(y).tickFormat((d) => `${d}%`))

    // Add this after the axes but before the lines
    // Grid lines
    g.append("g")
      .attr("class", "grid-lines")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-opacity", 0.2)
      .attr("stroke-dasharray", "2,2")
      .call(
        d3.axisLeft(y)
          .tickSize(-width)
          .tickFormat(() => "")
          .ticks(10)
      )
      .call(g => g.select(".domain").remove()) // Remove axis line
      .call(g => g.selectAll(".tick text").remove()) // Remove tick labels

    // Ensure grid lines are behind data
    g.selectAll(".grid-lines").lower()

    // Add subtle x-grid lines too
    g.append("g")
      .attr("class", "grid-lines-x")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-opacity", 0.2)
      .attr("stroke-dasharray", "2,2")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3.axisBottom(x)
          .tickSize(-height)
          .tickFormat(() => "")
          .ticks(d3.timeWeek.every(1))
      )
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick text").remove())

    // Ensure x-grid lines are behind data too
    g.selectAll(".grid-lines-x").lower()

    // Add legend
    const legend = g
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width + 10}, 0)`)

    microexpressions.forEach((emotion, i) => {
      if (!focusExpression || focusExpression === emotion) {
        // Add legend items instead of end-of-line labels
        legend
          .append("rect")
          .attr("y", i * 20)
          .attr("width", 12)
          .attr("height", 12)
          .attr("fill", colors[i])

        legend
          .append("text")
          .attr("x", 20)
          .attr("y", i * 20 + 10)
          .text(emotion)
          .style("font-size", "12px")
          .attr("alignment-baseline", "middle")
      }
    })

    const legendItem = legend
      .selectAll(".legend-item")
      .data(microexpressions)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0,${i * 25})`)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        // Highlight selected line
        svg.selectAll("path")
          .style("opacity", 0.2)
        svg.selectAll(`path[data-expression="${d}"]`)
          .style("opacity", 1)
          .style("stroke-width", 3)
      })
      .on("mouseout", function(event, d) {
        // Reset all lines
        svg.selectAll("path")
          .style("opacity", 1)
          .style("stroke-width", 2)
      })

    // Enhanced tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "rgba(255, 255, 255, 0.98)")
      .style("padding", "12px")
      .style("border-radius", "6px")
      .style("box-shadow", "0 4px 6px rgba(0,0,0,0.1)")
      .style("font-size", "14px")
      .style("z-index", "100")
      .style("border", "1px solid #e2e8f0")
      .style("pointer-events", "none")

    const bisect = d3.bisector((d: any) => new Date(d.date)).left

    // Vertical line for tooltip
    const verticalLine = g
      .append("line")
      .attr("class", "vertical-line")
      .style("stroke", "#ddd")
      .style("stroke-width", "1px")
      .style("stroke-dasharray", "5,5")
      .style("visibility", "hidden")

    g.append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mousemove", (event) => {
        const x0 = x.invert(d3.pointer(event)[0])
        const i = bisect(data, x0, 1)
        const d = i < data.length ? data[i] : data[data.length - 1]

        verticalLine
          .style("visibility", "visible")
          .attr("x1", x(new Date(d.date)))
          .attr("y1", 0)
          .attr("x2", x(new Date(d.date)))
          .attr("y2", height)

        tooltip
          .style("visibility", "visible")
          .html(
            `<strong>${format(new Date(d.date), "MMMM d, yyyy")}</strong><br/>${microexpressions
              .map((emotion) => `${emotion}: ${d.emotions[emotion]?.toFixed(2) || 0}%`)
              .join("<br/>")}`
          )
          .style("transform", `translate(${event.pageX + 10}px,${event.pageY - 10}px)`)
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden")
        verticalLine.style("visibility", "hidden")
      })

    // Add after y-axis
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#64748b")
      .text("Intensity (%)")

    return () => {
      tooltip.remove()
    }
  }, [data, focusExpression])

  return (
    <div className="h-[300px] w-full">
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  )
}

export default MicroexpressionLineChart


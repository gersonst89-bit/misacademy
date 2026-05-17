import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface Skill {
  axis: string;
  value: number;
}

interface SkillRadarChartProps {
  data: Skill[];
}

const SkillRadarChart: React.FC<SkillRadarChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 350;
    const height = 350;
    const margin = 60;
    const radius = Math.min(width, height) / 2 - margin;
    const levels = 4;
    const total = data.length;
    const angleSlice = (Math.PI * 2) / total;

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Define Gradients & Filters
    const defs = svg.append("defs");

    // Area Gradient
    const areaGradient = defs.append("linearGradient")
      .attr("id", "areaGradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "100%");
    areaGradient.append("stop").attr("offset", "0%").attr("stop-color", "#0ea5e9").attr("stop-opacity", 0.6);
    areaGradient.append("stop").attr("offset", "100%").attr("stop-color", "#d946ef").attr("stop-opacity", 0.3);

    // Glow Filter
    const filter = defs.append("filter").attr("id", "glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "3.5").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Draw circular grid (Web)
    const grid = svg.append("g").attr("class", "grid-wrapper");
    
    for (let j = 0; j < levels; j++) {
      const r = (radius / levels) * (j + 1);
      grid.append("circle")
        .attr("cx", 0).attr("cy", 0).attr("r", r)
        .attr("fill", "none")
        .attr("stroke", "rgba(255,255,255,0.05)")
        .attr("stroke-width", 1);
        
      // Level labels
      grid.append("text")
        .attr("x", 4)
        .attr("y", -r - 2)
        .attr("fill", "rgba(255,255,255,0.15)")
        .style("font-size", "8px")
        .style("font-weight", "900")
        .text(((j + 1) * 25).toString());
    }

    // Axis lines
    const axes = svg.selectAll(".axis")
      .data(data)
      .enter().append("g")
      .attr("class", "axis");

    axes.append("line")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", (d, i) => radius * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("y2", (d, i) => radius * Math.sin(angleSlice * i - Math.PI / 2))
      .attr("stroke", "rgba(255,255,255,0.1)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2");

    // Labels with Outfit font style
    axes.append("text")
      .attr("class", "legend")
      .style("font-family", "'Outfit', sans-serif")
      .style("font-size", "11px")
      .style("font-weight", "800")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("x", (d, i) => (radius + 28) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("y", (d, i) => (radius + 28) * Math.sin(angleSlice * i - Math.PI / 2))
      .text(d => d.axis.toUpperCase())
      .attr("fill", (d, i) => i % 2 === 0 ? "#fff" : "#38bdf8")
      .style("letter-spacing", "0.1em");

    // Radar line generator
    const radarLine = d3.lineRadial<Skill>()
      .radius(d => (d.value / 100) * radius)
      .angle((d, i) => i * angleSlice)
      .curve(d3.curveCardinalClosed.tension(0.4));

    // Draw the main area
    const area = svg.append("path")
      .datum(data)
      .attr("d", radarLine as any)
      .attr("fill", "url(#areaGradient)")
      .attr("stroke", "#38bdf8")
      .attr("stroke-width", 3)
      .attr("stroke-linejoin", "round")
      .style("filter", "url(#glow)")
      .style("opacity", 0);

    // Animate the area appearing
    area.transition()
      .duration(1200)
      .ease(d3.easeElasticOut)
      .style("opacity", 1);

    // Glowing dots
    svg.selectAll(".radar-dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "radar-dot")
      .attr("r", 5)
      .attr("cx", (d, i) => (d.value / 100) * radius * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("cy", (d, i) => (d.value / 100) * radius * Math.sin(angleSlice * i - Math.PI / 2))
      .attr("fill", "#fff")
      .attr("stroke", "#d946ef")
      .attr("stroke-width", 2)
      .style("filter", "url(#glow)");

  }, [data]);

  return (
    <div className="w-full flex items-center justify-center p-4">
      <svg ref={svgRef} className="w-full h-full max-w-[350px] max-h-[350px]" />
    </div>
  );
};

export default SkillRadarChart;

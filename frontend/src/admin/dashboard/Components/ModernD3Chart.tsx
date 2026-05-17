import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { FaArrowTrendUp } from "react-icons/fa6";

interface DataPoint {
  label: string;
  value: number;
}

interface ModernD3ChartProps {
  data: DataPoint[];
  title: string;
  color?: string;
}

const ModernD3Chart: React.FC<ModernD3ChartProps> = ({ data, title, color = "#0ea5e9" }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Scales
    const x = d3.scalePoint()
      .domain(data.map(d => d.label))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 0])
      .range([height - margin.bottom, margin.top]);

    // Area generator
    const area = d3.area<DataPoint>()
      .x(d => x(d.label) || 0)
      .y0(height - margin.bottom)
      .y1(d => y(d.value))
      .curve(d3.curveCardinal);

    // Line generator
    const line = d3.line<DataPoint>()
      .x(d => x(d.label) || 0)
      .y(d => y(d.value))
      .curve(d3.curveCardinal);

    // Gradient
    const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;
    const defs = svg.append("defs");
    
    const gradient = defs.append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0.4);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0);

    // Grid lines
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSize(-(height - margin.top - margin.bottom)).tickFormat(() => ""))
      .attr("stroke-opacity", 0.1);

    // Draw Area
    svg.append("path")
      .datum(data)
      .attr("fill", `url(#${gradientId})`)
      .attr("d", area);

    // Draw Line
    const path = svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 3)
      .attr("d", line);

    // Animation
    const totalLength = (path.node() as SVGPathElement).getTotalLength();
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(2000)
      .ease(d3.easeExpOut)
      .attr("stroke-dashoffset", 0);

    // Dots
    svg.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.label) || 0)
      .attr("cy", d => y(d.value))
      .attr("r", 0)
      .attr("fill", "#fff")
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .transition()
      .delay((d, i) => i * 100 + 1000)
      .duration(500)
      .attr("r", 5);

    // Tooltip logic
    const tooltip = d3.select("body").append("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "rgba(14, 28, 43, 0.9)")
      .style("color", "#fff")
      .style("padding", "8px 12px")
      .style("border-radius", "12px")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("backdrop-filter", "blur(4px)")
      .style("pointer-events", "none")
      .style("z-index", "100");

    svg.selectAll(".overlay")
      .data(data)
      .enter().append("circle")
      .attr("cx", d => x(d.label) || 0)
      .attr("cy", d => y(d.value))
      .attr("r", 15)
      .attr("fill", "transparent")
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget.parentNode).selectAll(".dot")
          .filter((p: any) => p === d)
          .transition().duration(200).attr("r", 8).attr("fill", color);
        
        tooltip.style("visibility", "visible").text(`${d.label}: ${d.value} alumnos`);
      })
      .on("mousemove", (event) => {
        tooltip.style("top", (event.pageY - 40) + "px").style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", (event, d) => {
        d3.select(event.currentTarget.parentNode).selectAll(".dot")
          .filter((p: any) => p === d)
          .transition().duration(200).attr("r", 5).attr("fill", "#fff");
        tooltip.style("visibility", "hidden");
      });

    // X Axis
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickPadding(10))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").remove())
      .style("font-size", "11px")
      .style("color", "#94a3b8");

    // Cleanup function
    return () => {
      tooltip.remove();
    };
  }, [data, color]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-8">
        <div className={`p-2.5 rounded-2xl bg-sky-50 text-sky-500 shadow-sm`}>
          <FaArrowTrendUp size={18} />
        </div>
        <div>
          <h3 className="text-[16px] font-black text-slate-900 tracking-tight leading-none mb-1">{title}</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Rendimiento mensual histórico</p>
        </div>
      </div>
      <div className="relative w-full overflow-hidden">
        <svg ref={svgRef} className="w-full h-auto min-h-[300px]" />
      </div>
    </div>
  );
};

export default ModernD3Chart;

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useNavigate } from "react-router-dom";

interface RouteNode {
  name: string;
  id?: number;
  slug?: string;
  children?: RouteNode[];
}

interface InteractiveRouteTreeProps {
  lineName: string;
  routes: { id_ruta: number; nombre: string }[];
  lineSlug: string;
}

const InteractiveRouteTree: React.FC<InteractiveRouteTreeProps> = ({ lineName, routes, lineSlug }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const navigate = useNavigate();

  const slugify = (s: string) =>
    (s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  useEffect(() => {
    if (!svgRef.current || !routes || routes.length === 0) return;

    // Data transformation
    const data: RouteNode = {
      name: lineName,
      children: routes.map(r => ({
        name: r.nombre,
        id: r.id_ruta,
        slug: slugify(r.nombre)
      }))
    };

    // Clear previous SVG
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const tree = d3.tree<RouteNode>().size([height - margin.top - margin.bottom, width - margin.left - margin.right]);
    const root = d3.hierarchy(data);
    tree(root);

    // Links
    svg.selectAll(".link")
      .data(root.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal()
        .x((d: any) => d.y)
        .y((d: any) => d.x) as any)
      .attr("fill", "none")
      .attr("stroke", "rgba(56, 189, 248, 0.2)")
      .attr("stroke-width", 2);

    // Nodes
    const node = svg.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", d => `node ${d.children ? "node-internal" : "node-leaf"}`)
      .attr("transform", d => `translate(${d.y},${d.x})`);

    // Node circles with neon effect
    node.append("circle")
      .attr("r", d => d.children ? 8 : 6)
      .attr("fill", d => d.children ? "#0ea5e9" : "#152B3F")
      .attr("stroke", "#38bdf8")
      .attr("stroke-width", 2)
      .style("filter", "drop-shadow(0 0 5px rgba(56, 189, 248, 0.5))")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        if (!d.children && d.data.slug) {
          navigate(`/lineas-academicas/${lineSlug}/${d.data.slug}`);
        }
      });

    // Labels
    node.append("text")
      .attr("dy", ".35em")
      .attr("x", d => d.children ? -15 : 15)
      .attr("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.name)
      .style("fill", "#fff")
      .style("font-size", "12px")
      .style("font-weight", d => d.children ? "bold" : "normal")
      .style("pointer-events", "none")
      .style("text-shadow", "0 2px 4px rgba(0,0,0,0.5)");

    // Animation
    svg.selectAll(".node")
      .style("opacity", 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .style("opacity", 1);

  }, [lineName, routes, lineSlug]);

  return (
    <div className="w-full bg-[#0E1C2B]/40 rounded-3xl border border-white/5 p-8 shadow-2xl backdrop-blur-xl">
      <h3 className="text-center text-sky-400 font-bold uppercase tracking-widest text-sm mb-6">Mapa de la Ruta de Aprendizaje</h3>
      <div className="overflow-x-auto overflow-y-hidden custom-scrollbar">
        <svg ref={svgRef} className="min-w-[800px] h-auto" />
      </div>
    </div>
  );
};

export default InteractiveRouteTree;

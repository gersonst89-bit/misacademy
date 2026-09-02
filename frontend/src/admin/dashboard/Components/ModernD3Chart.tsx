import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { FaArrowTrendUp, FaCircleCheck } from 'react-icons/fa6';

interface DataPoint {
  label: string;
  value: number;
}

interface ModernD3ChartProps {
  data: DataPoint[];
  title: string;
  color?: string;
}

const ModernD3Chart: React.FC<ModernD3ChartProps> = ({ data, title, color = '#0ea5e9' }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const hasData = data.length > 0;
  const hasHistory = data.length >= 2;

  const currentData = data[data.length - 1];
  const currentValue = currentData?.value ?? 0;

  const valueLabel = currentValue === 1 ? 'ESTUDIANTE INSCRITO' : 'ESTUDIANTES INSCRITOS';

  const formatMonth = (label: string) => {
    const [year, month] = label.split('-');

    if (!year || !month) {
      return label;
    }

    const date = new Date(Number(year), Number(month) - 1, 1);

    return date
      .toLocaleDateString('es-PE', {
        month: 'long',
        year: 'numeric',
      })
      .toUpperCase();
  };

  useEffect(() => {
    const svgElement = svgRef.current;

    if (!svgElement || !hasHistory) {
      return;
    }

    const svg = d3.select(svgElement);

    // Limpiar cualquier render anterior
    svg.selectAll('*').remove();

    const width = svgElement.clientWidth || 800;

    const height = 300;

    const margin = {
      top: 20,
      right: 30,
      bottom: 50,
      left: 50,
    };

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('preserveAspectRatio', 'xMidYMid meet');

    // =====================================================
    // ESCALA X
    // =====================================================

    const x = d3
      .scalePoint<string>()
      .domain(data.map((d) => d.label))
      .range([margin.left, width - margin.right]);

    // =====================================================
    // ESCALA Y
    // =====================================================

    const maxValue = d3.max(data, (d) => d.value) ?? 0;

    const yMax = maxValue > 0 ? maxValue : 1;

    const y = d3
      .scaleLinear()
      .domain([0, yMax])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // =====================================================
    // GRADIENTE
    // =====================================================

    const gradientId = `gradient-${Math.random().toString(36).substring(2, 9)}`;

    const defs = svg.append('defs');

    const gradient = defs
      .append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', color)
      .attr('stop-opacity', 0.16);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', color)
      .attr('stop-opacity', 0);

    // =====================================================
    // GRID HORIZONTAL
    // =====================================================

    const gridGroup = svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickSize(-width + margin.left + margin.right)
          .tickFormat(() => ''),
      );

    gridGroup.select('.domain').remove();

    gridGroup
      .selectAll('.tick line')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-dasharray', '3 3')
      .attr('stroke-opacity', 0.65);

    // =====================================================
    // ÁREA
    // =====================================================

    const area = d3
      .area<DataPoint>()
      .x((d) => x(d.label) ?? 0)
      .y0(height - margin.bottom)
      .y1((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    svg.append('path').datum(data).attr('fill', `url(#${gradientId})`).attr('d', area);

    // =====================================================
    // LÍNEA
    // =====================================================

    const line = d3
      .line<DataPoint>()
      .x((d) => x(d.label) ?? 0)
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    const path = svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('d', line);

    // =====================================================
    // ANIMACIÓN DE LA LÍNEA
    // =====================================================

    const totalLength = path.node()?.getTotalLength() ?? 0;

    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(900)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);

    // =====================================================
    // PUNTOS
    // =====================================================

    svg
      .selectAll<SVGCircleElement, DataPoint>('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => x(d.label) ?? 0)
      .attr('cy', (d) => y(d.value))
      .attr('r', 0)
      .attr('fill', '#ffffff')
      .attr('stroke', color)
      .attr('stroke-width', 2.5)
      .transition()
      .delay((_, index) => index * 70)
      .duration(300)
      .attr('r', 4.5);

    // =====================================================
    // EJE X
    // =====================================================

    const xAxis = svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .tickFormat((value) => formatMonth(String(value)))
          .tickPadding(12),
      );

    xAxis.select('.domain').remove();

    xAxis.selectAll('.tick line').remove();

    xAxis
      .selectAll('text')
      .style('font-size', '9px')
      .style('font-weight', '700')
      .style('fill', '#94a3b8');

    // =====================================================
    // EJE Y
    // =====================================================

    const yAxis = svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickSize(0)
          .tickPadding(10)
          .tickFormat((value) => Number(value).toLocaleString('es-PE')),
      );

    yAxis.select('.domain').remove();

    yAxis
      .selectAll('text')
      .style('font-size', '10px')
      .style('font-weight', '600')
      .style('fill', '#94a3b8');

    // =====================================================
    // TOOLTIP
    // =====================================================

    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'd3-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'rgba(15, 23, 42, 0.94)')
      .style('color', '#ffffff')
      .style('padding', '8px 12px')
      .style('border-radius', '10px')
      .style('font-size', '11px')
      .style('font-weight', '700')
      .style('pointer-events', 'none')
      .style('z-index', '9999')
      .style('box-shadow', '0 10px 25px rgba(15, 23, 42, 0.15)');

    // =====================================================
    // OVERLAY PARA INTERACCIÓN
    // =====================================================

    svg
      .selectAll<SVGCircleElement, DataPoint>('.overlay')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'overlay')
      .attr('cx', (d) => x(d.label) ?? 0)
      .attr('cy', (d) => y(d.value))
      .attr('r', 14)
      .attr('fill', 'transparent')
      .on('mouseenter', (event, d) => {
        d3.select(event.currentTarget.parentNode)
          .selectAll<SVGCircleElement, DataPoint>('.dot')
          .filter((point) => point.label === d.label)
          .attr('r', 7)
          .attr('fill', color);

        tooltip
          .style('visibility', 'visible')
          .text(
            `${formatMonth(d.label)}: ${d.value.toLocaleString('es-PE')} ${
              d.value === 1 ? 'estudiante' : 'estudiantes'
            }`,
          );
      })
      .on('mousemove', (event) => {
        tooltip.style('top', `${event.pageY - 42}px`).style('left', `${event.pageX + 12}px`);
      })
      .on('mouseleave', (event, d) => {
        d3.select(event.currentTarget.parentNode)
          .selectAll<SVGCircleElement, DataPoint>('.dot')
          .filter((point) => point.label === d.label)
          .attr('r', 4.5)
          .attr('fill', '#ffffff');

        tooltip.style('visibility', 'hidden');
      });

    // =====================================================
    // CLEANUP
    // =====================================================

    return () => {
      tooltip.remove();
      svg.selectAll('*').remove();
    };
  }, [data, color, hasHistory]);

  return (
    <div className="flex flex-col h-full">
      {/* =====================================================
          ENCABEZADO
      ====================================================== */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="
            p-2.5
            rounded-2xl
            bg-sky-50
            text-sky-500
            shadow-sm
          "
        >
          <FaArrowTrendUp size={18} />
        </div>

        <div>
          <h3
            className="
    text-[16px]
    font-extrabold
    font-['Plus_Jakarta_Sans']
    text-slate-900
    tracking-normal
    leading-tight
    mb-1
  "
          >
            {title}
          </h3>

          <p
            className="
              text-[10px]
              font-black
              uppercase
              tracking-[0.15em]
              text-slate-400
            "
          >
            {hasHistory
              ? 'Rendimiento mensual histórico'
              : hasData
                ? 'Resumen actual'
                : 'Sin actividad'}
          </p>
        </div>
      </div>

      {/* =====================================================
          SIN DATOS
      ====================================================== */}
      {!hasData && (
        <div className="flex-1 min-h-[260px] flex items-center justify-center">
          <div className="text-center max-w-xs">
            <div
              className="
                mx-auto
                w-14
                h-14
                rounded-2xl
                bg-sky-50
                text-sky-400
                flex
                items-center
                justify-center
                mb-4
              "
            >
              <FaArrowTrendUp size={22} />
            </div>

            <h4 className="text-sm font-black text-slate-700">Aún no hay datos</h4>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Los datos aparecerán aquí cuando existan inscripciones en la plataforma.
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          UN SOLO MES
      ====================================================== */}
      {hasData && !hasHistory && (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm">
            {/* =================================================
                MÉTRICA PRINCIPAL
            ================================================== */}
            <div className="text-center">
              <div
                className="
                  inline-flex
                  items-center
                  justify-center
                  w-[72px]
                  h-[72px]
                  rounded-[22px]
                  bg-sky-50
                  border
                  border-sky-100
                  shadow-sm
                "
              >
                <span
                  className="
                    text-[44px]
                    leading-none
                    font-extrabold
                    tracking-tight
                    text-slate-900
                  "
                >
                  {currentValue.toLocaleString('es-PE')}
                </span>
              </div>

              <p
                className="
                  mt-3
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.16em]
                  text-slate-400
                "
              >
                {valueLabel}
              </p>
            </div>

            {/* =================================================
                CONTEXTO
            ================================================== */}
            <div className="mt-7">
              <div
                className="
                  h-px
                  w-full
                  bg-slate-100
                "
              />

              <div className="mt-4 grid grid-cols-2 gap-3">
                {/* Estado */}
                <div
                  className="
                    rounded-2xl
                    border
                    border-emerald-100
                    bg-emerald-50/60
                    px-4
                    py-3
                  "
                >
                  <div className="flex items-center gap-2">
                    <FaCircleCheck size={10} className="text-emerald-500" />

                    <span
                      className="
                        text-[9px]
                        font-black
                        uppercase
                        tracking-[0.13em]
                        text-emerald-600
                      "
                    >
                      Estado
                    </span>
                  </div>

                  <p
                    className="
                      mt-1.5
                      text-[11px]
                      font-bold
                      text-slate-600
                    "
                  >
                    {currentValue > 0 ? 'Registro activo' : 'Sin registros'}
                  </p>
                </div>

                {/* Período */}
                <div
                  className="
                    rounded-2xl
                    border
                    border-sky-100
                    bg-sky-50/60
                    px-4
                    py-3
                  "
                >
                  <div className="flex items-center gap-2">
                    <FaArrowTrendUp size={10} className="text-sky-500" />

                    <span
                      className="
                        text-[9px]
                        font-black
                        uppercase
                        tracking-[0.13em]
                        text-sky-600
                      "
                    >
                      Período
                    </span>
                  </div>

                  <p
                    className="
                      mt-1.5
                      text-[11px]
                      font-bold
                      text-slate-600
                    "
                  >
                    {currentData?.label ? formatMonth(currentData.label) : 'Sin período'}
                  </p>
                </div>
              </div>

              <p
                className="
                  mt-3
                  text-center
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.14em]
                  text-slate-300
                "
              >
                Último mes registrado
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          HISTÓRICO
      ====================================================== */}
      {hasHistory && (
        <div className="relative w-full flex-1 overflow-hidden">
          <svg ref={svgRef} className="w-full h-auto min-h-[300px]" />
        </div>
      )}
    </div>
  );
};

export default ModernD3Chart;

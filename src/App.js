import React, { useMemo, useEffect, useRef } from 'react';
import { client } from '@sigmacomputing/plugin';
import * as d3 from 'd3';

function App() {
  const containerRef = useRef();

  // Configure the plugin's editor panel
  client.config.configureEditorPanel([
    { name: 'source', type: 'element' },
    { name: 'station_id', type: 'column', source: 'source', allowMultiple: false },
    { name: 'production_line', type: 'column', source: 'source', allowMultiple: false },
    { name: 'temperature', type: 'column', source: 'source', allowMultiple: false },
    { name: 'pressure', type: 'column', source: 'source', allowMultiple: false },
    { name: 'vibration', type: 'column', source: 'source', allowMultiple: false },
    { name: 'quality_score', type: 'column', source: 'source', allowMultiple: false }
  ]);

  // Get the configured source element
  const source = client.config.getValue('source');
  
  // Get data from Sigma
  const sigmaData = client.useElementData(source);
  const sigmaColumns = client.useElementColumns(source);

  // Transform data for visualization
  const processedData = useMemo(() => {
    if (!sigmaData || !sigmaColumns) return [];

    const stationCol = client.config.getValue('station_id');
    const lineCol = client.config.getValue('production_line');
    const tempCol = client.config.getValue('temperature');
    const pressureCol = client.config.getValue('pressure');
    const vibrationCol = client.config.getValue('vibration');
    const qualityCol = client.config.getValue('quality_score');

    if (!stationCol || !sigmaData[stationCol]) return [];

    // Convert columnar data to rows
    const rowCount = sigmaData[stationCol].length;
    const rows = [];

    for (let i = 0; i < rowCount; i++) {
      rows.push({
        station_id: sigmaData[stationCol][i],
        production_line: lineCol ? sigmaData[lineCol][i] : 'Unknown',
        temperature_celsius: tempCol ? parseFloat(sigmaData[tempCol][i]) || 0 : 0,
        pressure_psi: pressureCol ? parseFloat(sigmaData[pressureCol][i]) || 0 : 0,
        vibration_mm_s: vibrationCol ? parseFloat(sigmaData[vibrationCol][i]) || 0 : 0,
        quality_score: qualityCol ? parseFloat(sigmaData[qualityCol][i]) || 0 : 0
      });
    }

    console.log('Factory plugin - processed data:', rows);
    return rows;
  }, [sigmaData, sigmaColumns]);

  // Create the D3 visualization
  useEffect(() => {
    if (!containerRef.current) return;
    
    createFactoryVisualization(containerRef.current, processedData);
  }, [processedData]);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '600px' }}>
      {processedData.length === 0 ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#666',
          background: '#f8f9fa',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#333' }}>
            Factory Floor Layout
          </h3>
          <p style={{ marginBottom: '15px' }}>
            Please configure your data source:
          </p>
          <ol style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
            <li>Select a data source table</li>
            <li>Map Station ID column (ST-01, ST-02, etc.)</li>
            <li>Map Production Line column (LINE-A, LINE-B, LINE-C)</li>
            <li>Map Temperature, Pressure, Vibration, and Quality Score columns</li>
          </ol>
        </div>
      ) : (
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      )}
    </div>
  );
}

function createFactoryVisualization(container, data) {
  // Clear previous visualization
  d3.select(container).selectAll('*').remove();

  if (!data || data.length === 0) return;

  // Get container dimensions
  const containerRect = container.getBoundingClientRect();
  const width = containerRect.width || 900;
  const height = Math.max(containerRect.height, 600);

  // Create SVG
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('background', 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)')
    .style('border-radius', '8px')
    .style('box-shadow', '0 2px 8px rgba(0,0,0,0.1)');

  // Title
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', 35)
    .attr('text-anchor', 'middle')
    .style('font-size', '28px')
    .style('font-weight', '600')
    .style('fill', '#2c3e50')
    .style('text-shadow', '0 1px 2px rgba(0,0,0,0.1)')
    .text('Factory Floor Layout');

  // Station positions (responsive)
  const stationPositions = {
    'ST-01': { x: width * 0.15, y: height * 0.25, line: 'LINE-A' },
    'ST-02': { x: width * 0.35, y: height * 0.25, line: 'LINE-A' },
    'ST-03': { x: width * 0.55, y: height * 0.25, line: 'LINE-A' },
    'ST-04': { x: width * 0.75, y: height * 0.25, line: 'LINE-A' },
    'ST-05': { x: width * 0.15, y: height * 0.50, line: 'LINE-B' },
    'ST-06': { x: width * 0.35, y: height * 0.50, line: 'LINE-B' },
    'ST-07': { x: width * 0.55, y: height * 0.50, line: 'LINE-B' },
    'ST-08': { x: width * 0.75, y: height * 0.50, line: 'LINE-B' },
    'ST-09': { x: width * 0.15, y: height * 0.75, line: 'LINE-C' },
    'ST-10': { x: width * 0.35, y: height * 0.75, line: 'LINE-C' },
    'ST-11': { x: width * 0.55, y: height * 0.75, line: 'LINE-C' },
    'ST-12': { x: width * 0.75, y: height * 0.75, line: 'LINE-C' }
  };

  // Draw production line backgrounds
  const lineColors = { 'LINE-A': '#e3f2fd', 'LINE-B': '#f3e5f5', 'LINE-C': '#e8f5e8' };
  const lineYPositions = { 'LINE-A': height * 0.25, 'LINE-B': height * 0.50, 'LINE-C': height * 0.75 };

  Object.entries(lineColors).forEach(([line, color]) => {
    svg.append('rect')
      .attr('x', width * 0.08)
      .attr('y', lineYPositions[line] - height * 0.08)
      .attr('width', width * 0.84)
      .attr('height', height * 0.16)
      .attr('rx', 12)
      .style('fill', color)
      .style('opacity', 0.3);
  });

  // Line labels
  Object.keys(lineYPositions).forEach(line => {
    svg.append('text')
      .attr('x', width * 0.04)
      .attr('y', lineYPositions[line] + 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', '#495057')
      .text(line);
  });

  // Create arrow marker
  const defs = svg.append('defs');
  defs.append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '0 0 10 10')
    .attr('refX', 9)
    .attr('refY', 3)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,0 L0,6 L9,3 z')
    .style('fill', '#6c757d');

  // Draw flow lines
  const flows = [
    ['ST-01', 'ST-02', 'ST-03', 'ST-04'],
    ['ST-05', 'ST-06', 'ST-07', 'ST-08'],
    ['ST-09', 'ST-10', 'ST-11', 'ST-12']
  ];

  flows.forEach(flow => {
    for (let i = 0; i < flow.length - 1; i++) {
      const from = stationPositions[flow[i]];
      const to = stationPositions[flow[i + 1]];
      
      svg.append('line')
        .attr('x1', from.x + 30)
        .attr('y1', from.y)
        .attr('x2', to.x - 30)
        .attr('y2', to.y)
        .style('stroke', '#6c757d')
        .style('stroke-width', 3)
        .style('opacity', 0.6)
        .style('marker-end', 'url(#arrowhead)');
    }
  });

  // Group data by station
  const stationData = {};
  data.forEach(row => {
    const stationId = row.station_id;
    if (stationId && stationPositions[stationId]) {
      if (!stationData[stationId]) stationData[stationId] = [];
      stationData[stationId].push(row);
    }
  });

  // Create tooltip
  const tooltip = d3.select('body').append('div')
    .attr('class', 'factory-tooltip')
    .style('opacity', 0)
    .style('position', 'absolute')
    .style('background', 'rgba(0,0,0,0.9)')
    .style('color', 'white')
    .style('padding', '12px')
    .style('border-radius', '6px')
    .style('pointer-events', 'none')
    .style('font-size', '13px')
    .style('z-index', '10000')
    .style('box-shadow', '0 4px 12px rgba(0,0,0,0.3)');

  // Create station groups
  const stationGroups = svg.selectAll('.station-group')
    .data(Object.entries(stationPositions))
    .enter()
    .append('g')
    .attr('class', 'station-group')
    .attr('transform', d => `translate(${d[1].x}, ${d[1].y})`);

  // Station circles with quality-based colors
  stationGroups.append('circle')
    .attr('class', 'station-base')
    .attr('r', Math.min(width, height) * 0.025)
    .style('fill', d => {
      const stationId = d[0];
      const data = stationData[stationId];
      if (!data || !data.length) return '#e9ecef';
      
      const latestData = data[data.length - 1];
      const quality = latestData.quality_score || 0;
      
      if (quality >= 98) return '#28a745'; // Excellent - Green
      if (quality >= 95) return '#ffc107'; // Good - Yellow  
      if (quality >= 90) return '#fd7e14'; // Fair - Orange
      return '#dc3545'; // Poor - Red
    })
    .style('stroke', '#495057')
    .style('stroke-width', 2)
    .style('filter', 'drop-shadow(0 3px 6px rgba(0,0,0,0.15))')
    .style('cursor', 'pointer');

  // Station labels
  stationGroups.append('text')
    .attr('text-anchor', 'middle')
    .attr('y', 4)
    .style('font-size', Math.min(width, height) * 0.015 + 'px')
    .style('font-weight', 'bold')
    .style('fill', '#2c3e50')
    .style('pointer-events', 'none')
    .text(d => d[0]);

  // Add interactivity
  stationGroups
    .on('mouseover', function(event, d) {
      const stationId = d[0];
      const data = stationData[stationId];
      
      // Scale animation
      d3.select(this).transition().duration(200)
        .attr('transform', `translate(${d[1].x}, ${d[1].y}) scale(1.15)`);

      // Show tooltip
      if (data && data.length > 0) {
        const latest = data[data.length - 1];
        tooltip.transition().duration(200).style('opacity', 1);
        tooltip.html(`
          <strong>${stationId}</strong><br/>
          Line: ${latest.production_line}<br/>
          Temperature: ${latest.temperature_celsius.toFixed(1)}°C<br/>
          Pressure: ${latest.pressure_psi.toFixed(1)} PSI<br/>
          Vibration: ${latest.vibration_mm_s.toFixed(2)} mm/s<br/>
          Quality: ${latest.quality_score.toFixed(1)}%
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
      } else {
        tooltip.transition().duration(200).style('opacity', 1);
        tooltip.html(`<strong>${stationId}</strong><br/>No data available`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      }
    })
    .on('mouseout', function(event, d) {
      // Reset scale
      d3.select(this).transition().duration(200)
        .attr('transform', `translate(${d[1].x}, ${d[1].y}) scale(1)`);
      
      // Hide tooltip
      tooltip.transition().duration(200).style('opacity', 0);
    })
    .on('click', function(event, d) {
      const stationId = d[0];
      const data = stationData[stationId];
      
      if (data && data.length > 0) {
        const latest = data[data.length - 1];
        alert(`${stationId} Detailed Metrics:\n\n` +
              `Production Line: ${latest.production_line}\n` +
              `Temperature: ${latest.temperature_celsius.toFixed(1)}°C\n` +
              `Pressure: ${latest.pressure_psi.toFixed(1)} PSI\n` +
              `Vibration: ${latest.vibration_mm_s.toFixed(2)} mm/s\n` +
              `Quality Score: ${latest.quality_score.toFixed(1)}%`);
      } else {
        alert(`${stationId}: No data available`);
      }
    });

  // Add visual effects for anomalies
  Object.entries(stationData).forEach(([stationId, dataPoints]) => {
    if (!dataPoints.length) return;
    
    const latest = dataPoints[dataPoints.length - 1];
    const position = stationPositions[stationId];
    const group = svg.select(`g[transform="translate(${position.x}, ${position.y})"]`);
    
    // Temperature glow effect for high temperatures
    if (latest.temperature_celsius > 85) {
      const intensity = Math.min((latest.temperature_celsius - 85) / 15, 1);
      group.append('circle')
        .attr('r', Math.min(width, height) * 0.035)
        .style('fill', 'none')
        .style('stroke', `rgba(255, ${255 - intensity * 150}, 0, ${intensity * 0.8})`)
        .style('stroke-width', 3)
        .style('opacity', 0.8);
    }
    
    // Vibration ripple effect for high vibration
    if (latest.vibration_mm_s > 3) {
      const ripple = group.append('circle')
        .attr('r', Math.min(width, height) * 0.025)
        .style('fill', 'none')
        .style('stroke', '#ff4757')
        .style('stroke-width', 2)
        .style('opacity', 0.8);
        
      ripple.transition()
        .duration(1200)
        .attr('r', Math.min(width, height) * 0.055)
        .style('opacity', 0)
        .remove();
    }
  });

  // Add legend
  const legend = svg.append('g')
    .attr('transform', `translate(${width - 180}, 80)`);

  legend.append('text')
    .attr('x', 0)
    .attr('y', 0)
    .style('font-size', '14px')
    .style('font-weight', 'bold')
    .style('fill', '#2c3e50')
    .text('Quality Score');

  const legendData = [
    { label: 'Excellent (98-100%)', color: '#28a745' },
    { label: 'Good (95-97%)', color: '#ffc107' },
    { label: 'Fair (90-94%)', color: '#fd7e14' },
    { label: 'Poor (< 90%)', color: '#dc3545' }
  ];

  const legendItems = legend.selectAll('.legend-item')
    .data(legendData)
    .enter()
    .append('g')
    .attr('transform', (d, i) => `translate(0, ${20 + i * 22})`);

  legendItems.append('circle')
    .attr('r', 8)
    .style('fill', d => d.color);

  legendItems.append('text')
    .attr('x', 15)
    .attr('y', 5)
    .style('font-size', '11px')
    .style('fill', '#495057')
    .text(d => d.label);

  console.log('Factory floor visualization rendered with', data.length, 'data points');
}

export default App;
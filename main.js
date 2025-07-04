// Factory Floor Layout Plugin for Sigma Computing
// Following the official Sigma sample plugin pattern without React build

(function() {
  'use strict';

  // Plugin initialization function for Sigma
  function initializePlugin() {
    // Check if we're in Sigma environment
    if (typeof sigma === 'undefined' || !sigma.config) {
      console.log('Not in Sigma environment, using demo mode');
      return initializeDemoMode();
    }

    // Configure Sigma editor panel for data source selection
    sigma.config.configureEditorPanel([
      { name: 'source', type: 'element' },
      { name: 'station_id', type: 'column', source: 'source', allowMultiple: false },
      { name: 'production_line', type: 'column', source: 'source', allowMultiple: false },
      { name: 'temperature', type: 'column', source: 'source', allowMultiple: false },
      { name: 'pressure', type: 'column', source: 'source', allowMultiple: false },
      { name: 'vibration', type: 'column', source: 'source', allowMultiple: false },
      { name: 'quality_score', type: 'column', source: 'source', allowMultiple: false }
    ]);

    // Set up data subscription
    let currentData = [];
    
    // Subscribe to data changes
    sigma.onDataUpdate = function(data, columns) {
      console.log('Sigma data update:', data, columns);
      currentData = processData(data, columns);
      renderVisualization(currentData);
    };

    // Initial render
    renderVisualization(currentData);
  }

  // Process Sigma's columnar data into row format
  function processData(sigmaData, columns) {
    if (!sigmaData || !columns) return [];

    const stationCol = sigma.config.getValue('station_id');
    const lineCol = sigma.config.getValue('production_line');
    const tempCol = sigma.config.getValue('temperature');
    const pressureCol = sigma.config.getValue('pressure');
    const vibrationCol = sigma.config.getValue('vibration');
    const qualityCol = sigma.config.getValue('quality_score');

    if (!stationCol || !sigmaData[stationCol]) return [];

    const rowCount = sigmaData[stationCol].length;
    const rows = [];

    for (let i = 0; i < rowCount; i++) {
      rows.push({
        station_id: sigmaData[stationCol][i],
        production_line: lineCol ? sigmaData[lineCol][i] : 'Unknown',
        temperature_celsius: tempCol ? sigmaData[tempCol][i] : 0,
        pressure_psi: pressureCol ? sigmaData[pressureCol][i] : 0,
        vibration_mm_s: vibrationCol ? sigmaData[vibrationCol][i] : 0,
        quality_score: qualityCol ? sigmaData[qualityCol][i] : 0
      });
    }

    console.log('Processed data:', rows);
    return rows;
  }

  // Demo mode for testing without Sigma
  function initializeDemoMode() {
    // Generate demo data
    const demoData = generateDemoData();
    renderVisualization(demoData);
  }

  function generateDemoData() {
    const stations = ['ST-01', 'ST-02', 'ST-03', 'ST-04', 'ST-05', 'ST-06', 
                     'ST-07', 'ST-08', 'ST-09', 'ST-10', 'ST-11', 'ST-12'];
    const lines = {
      'ST-01': 'LINE-A', 'ST-02': 'LINE-A', 'ST-03': 'LINE-A', 'ST-04': 'LINE-A',
      'ST-05': 'LINE-B', 'ST-06': 'LINE-B', 'ST-07': 'LINE-B', 'ST-08': 'LINE-B',
      'ST-09': 'LINE-C', 'ST-10': 'LINE-C', 'ST-11': 'LINE-C', 'ST-12': 'LINE-C'
    };
    
    return stations.map(station => ({
      station_id: station,
      production_line: lines[station],
      temperature_celsius: 70 + Math.random() * 20,
      pressure_psi: 40 + Math.random() * 20,
      vibration_mm_s: 1 + Math.random() * 3,
      quality_score: 88 + Math.random() * 12,
      power_consumption_kw: 12 + Math.random() * 8,
      cycle_time_seconds: 90 + Math.random() * 40
    }));
  }

  // Main visualization rendering function
  function renderVisualization(data) {
    // Load D3 if not available
    if (typeof d3 === 'undefined') {
      loadD3().then(() => renderVisualization(data));
      return;
    }

    createFactoryFloorVisualization(data);
  }

  // Load D3.js dynamically
  function loadD3() {
    return new Promise((resolve, reject) => {
      if (typeof d3 !== 'undefined') {
        resolve(d3);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://d3js.org/d3.v7.min.js';
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve(window.d3);
      script.onerror = () => reject(new Error('Failed to load D3.js'));
      document.head.appendChild(script);
    });
  }

  // Create the factory floor visualization using D3
  function createFactoryFloorVisualization(data) {
    // Find or create container
    let container = document.getElementById('sigma-plugin-container');
    if (!container) {
      container = document.body;
    }

    // Clear previous visualization
    d3.select(container).selectAll('.factory-floor-viz').remove();

    // Show data configuration message if no data
    if (!data || data.length === 0) {
      const messageDiv = d3.select(container)
        .append('div')
        .attr('class', 'factory-floor-viz')
        .style('padding', '40px')
        .style('text-align', 'center')
        .style('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')
        .style('color', '#666')
        .style('background', '#f8f9fa')
        .style('border-radius', '8px')
        .style('margin', '20px');

      messageDiv.append('h3')
        .style('margin-bottom', '20px')
        .style('color', '#333')
        .text('Factory Floor Layout');

      messageDiv.append('p')
        .style('margin-bottom', '15px')
        .text('Please configure your data source in Sigma:');

      const list = messageDiv.append('ol')
        .style('text-align', 'left')
        .style('max-width', '400px')
        .style('margin', '0 auto');

      list.append('li').text('Select a data source table');
      list.append('li').text('Map Station ID column (ST-01, ST-02, etc.)');
      list.append('li').text('Map Production Line column (LINE-A, LINE-B, LINE-C)');
      list.append('li').text('Map Temperature, Pressure, Vibration, and Quality Score columns');

      return;
    }

    // Create main container
    const vizContainer = d3.select(container)
      .append('div')
      .attr('class', 'factory-floor-viz')
      .style('width', '100%')
      .style('height', '100%')
      .style('min-height', '600px')
      .style('position', 'relative');

    // Get container dimensions
    const containerRect = vizContainer.node().getBoundingClientRect();
    const width = containerRect.width || 900;
    const height = Math.max(containerRect.height, 600);

    // Create SVG
    const svg = vizContainer
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('background', 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)')
      .style('border-radius', '8px')
      .style('box-shadow', '0 2px 8px rgba(0,0,0,0.1)');

    // Add title
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

    // Group data by station
    const stationData = {};
    data.forEach(row => {
      const stationId = row.station_id;
      if (stationId && stationPositions[stationId]) {
        if (!stationData[stationId]) stationData[stationId] = [];
        stationData[stationId].push(row);
      }
    });

    // Create station groups
    const stationGroups = svg.selectAll('.station-group')
      .data(Object.entries(stationPositions))
      .enter()
      .append('g')
      .attr('class', 'station-group')
      .attr('transform', d => `translate(${d[1].x}, ${d[1].y})`);

    // Station circles
    stationGroups.append('circle')
      .attr('class', 'station-base')
      .attr('r', Math.min(width, height) * 0.025)
      .style('fill', d => {
        const stationId = d[0];
        const data = stationData[stationId];
        if (!data || !data.length) return '#e9ecef';
        
        const latestData = data[data.length - 1];
        const quality = latestData.quality_score || 0;
        
        if (quality >= 98) return '#28a745'; // Excellent
        if (quality >= 95) return '#ffc107'; // Good  
        if (quality >= 90) return '#fd7e14'; // Fair
        return '#dc3545'; // Poor
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
        
        d3.select(this).transition().duration(200)
          .attr('transform', `translate(${d[1].x}, ${d[1].y}) scale(1.15)`);

        if (data && data.length > 0) {
          const latest = data[data.length - 1];
          tooltip.transition().duration(200).style('opacity', 1);
          tooltip.html(`
            <strong>${stationId}</strong><br/>
            Line: ${latest.production_line}<br/>
            Temperature: ${latest.temperature_celsius}°C<br/>
            Pressure: ${latest.pressure_psi} PSI<br/>
            Vibration: ${latest.vibration_mm_s} mm/s<br/>
            Quality: ${latest.quality_score}%
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
        d3.select(this).transition().duration(200)
          .attr('transform', `translate(${d[1].x}, ${d[1].y}) scale(1)`);
        
        tooltip.transition().duration(200).style('opacity', 0);
      })
      .on('click', function(event, d) {
        const stationId = d[0];
        const data = stationData[stationId];
        
        if (data && data.length > 0) {
          const latest = data[data.length - 1];
          alert(`${stationId} Detailed Metrics:\n\n` +
                `Production Line: ${latest.production_line}\n` +
                `Temperature: ${latest.temperature_celsius}°C\n` +
                `Pressure: ${latest.pressure_psi} PSI\n` +
                `Vibration: ${latest.vibration_mm_s} mm/s\n` +
                `Quality Score: ${latest.quality_score}%`);
        } else {
          alert(`${stationId}: No data available`);
        }
      });

    // Add visual effects
    Object.entries(stationData).forEach(([stationId, dataPoints]) => {
      if (!dataPoints.length) return;
      
      const latest = dataPoints[dataPoints.length - 1];
      const position = stationPositions[stationId];
      const group = svg.select(`g[transform="translate(${position.x}, ${position.y})"]`);
      
      // Temperature glow effect
      if (latest.temperature_celsius > 85) {
        const intensity = Math.min((latest.temperature_celsius - 85) / 15, 1);
        group.append('circle')
          .attr('r', Math.min(width, height) * 0.035)
          .style('fill', 'none')
          .style('stroke', `rgba(255, ${255 - intensity * 150}, 0, ${intensity * 0.8})`)
          .style('stroke-width', 3)
          .style('opacity', 0.8);
      }
      
      // Vibration ripple effect
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

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePlugin);
  } else {
    initializePlugin();
  }

  // Export for module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initializePlugin };
  }

  // Global access
  window.FactoryFloorPlugin = { initializePlugin };

})();
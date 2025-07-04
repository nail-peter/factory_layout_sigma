// Factory Floor Layout Plugin for Sigma Computing
// Interactive 2D factory floor visualization

class FactoryFloorLayout {
  constructor(element, config) {
    this.element = element;
    this.config = config;
    this.svg = null;
    this.stations = [];
    this.currentData = null;
    this.init();
  }

  init() {
    // Create SVG container
    this.svg = d3.select(this.element)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .style('background-color', '#f8f9fa');

    // Add title
    this.svg.append('text')
      .attr('x', 20)
      .attr('y', 30)
      .attr('class', 'title')
      .style('font-size', '24px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text('Factory Floor Layout');

    // Initialize factory layout
    this.setupFactoryLayout();
  }

  setupFactoryLayout() {
    const width = 800;
    const height = 600;
    
    // Set SVG viewBox for responsive scaling
    this.svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Define station positions for 3 production lines
    const stationPositions = {
      // LINE-A (top row)
      'ST-01': { x: 100, y: 150, line: 'LINE-A' },
      'ST-02': { x: 250, y: 150, line: 'LINE-A' },
      'ST-03': { x: 400, y: 150, line: 'LINE-A' },
      'ST-04': { x: 550, y: 150, line: 'LINE-A' },
      
      // LINE-B (middle row)
      'ST-05': { x: 100, y: 300, line: 'LINE-B' },
      'ST-06': { x: 250, y: 300, line: 'LINE-B' },
      'ST-07': { x: 400, y: 300, line: 'LINE-B' },
      'ST-08': { x: 550, y: 300, line: 'LINE-B' },
      
      // LINE-C (bottom row)
      'ST-09': { x: 100, y: 450, line: 'LINE-C' },
      'ST-10': { x: 250, y: 450, line: 'LINE-C' },
      'ST-11': { x: 400, y: 450, line: 'LINE-C' },
      'ST-12': { x: 550, y: 450, line: 'LINE-C' }
    };

    // Draw production line labels
    const lineLabels = [
      { name: 'LINE-A', y: 100 },
      { name: 'LINE-B', y: 250 },
      { name: 'LINE-C', y: 400 }
    ];

    this.svg.selectAll('.line-label')
      .data(lineLabels)
      .enter()
      .append('text')
      .attr('class', 'line-label')
      .attr('x', 20)
      .attr('y', d => d.y)
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .style('fill', '#666')
      .text(d => d.name);

    // Draw connection lines between stations
    this.drawConnectionLines(stationPositions);

    // Create station groups
    this.stationGroups = this.svg.selectAll('.station-group')
      .data(Object.entries(stationPositions))
      .enter()
      .append('g')
      .attr('class', 'station-group')
      .attr('transform', d => `translate(${d[1].x}, ${d[1].y})`);

    // Draw station base circles
    this.stationGroups.append('circle')
      .attr('class', 'station-base')
      .attr('r', 25)
      .style('fill', '#e9ecef')
      .style('stroke', '#6c757d')
      .style('stroke-width', 2);

    // Add station labels
    this.stationGroups.append('text')
      .attr('class', 'station-label')
      .attr('text-anchor', 'middle')
      .attr('y', 5)
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text(d => d[0]);

    // Add click handlers
    this.stationGroups
      .style('cursor', 'pointer')
      .on('click', (event, d) => this.showStationDetails(d));

    // Create tooltip
    this.tooltip = d3.select('body').append('div')
      .attr('class', 'factory-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'rgba(0,0,0,0.8)')
      .style('color', 'white')
      .style('padding', '10px')
      .style('border-radius', '5px')
      .style('pointer-events', 'none')
      .style('font-size', '12px');

    // Add hover effects
    this.stationGroups
      .on('mouseover', (event, d) => this.showTooltip(event, d))
      .on('mouseout', () => this.hideTooltip());
  }

  drawConnectionLines(positions) {
    // Draw arrows between stations in each line
    const lines = [
      ['ST-01', 'ST-02', 'ST-03', 'ST-04'],
      ['ST-05', 'ST-06', 'ST-07', 'ST-08'],
      ['ST-09', 'ST-10', 'ST-11', 'ST-12']
    ];

    lines.forEach(line => {
      for (let i = 0; i < line.length - 1; i++) {
        const from = positions[line[i]];
        const to = positions[line[i + 1]];
        
        // Draw arrow line
        this.svg.append('line')
          .attr('class', 'connection-line')
          .attr('x1', from.x + 25)
          .attr('y1', from.y)
          .attr('x2', to.x - 25)
          .attr('y2', to.y)
          .style('stroke', '#adb5bd')
          .style('stroke-width', 2)
          .style('marker-end', 'url(#arrowhead)');
      }
    });

    // Define arrow marker
    const defs = this.svg.append('defs');
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
      .style('fill', '#adb5bd');
  }

  updateData(data) {
    if (!data || data.length === 0) return;

    this.currentData = data;
    
    // Group data by station
    const stationData = {};
    data.forEach(row => {
      const stationId = row.station_id;
      if (!stationData[stationId]) {
        stationData[stationId] = [];
      }
      stationData[stationId].push(row);
    });

    // Update station visualizations
    this.updateStationVisuals(stationData);
  }

  updateStationVisuals(stationData) {
    // Update each station based on latest data
    Object.entries(stationData).forEach(([stationId, data]) => {
      const latestData = data[data.length - 1]; // Get most recent data point
      const stationGroup = this.svg.select(`g:nth-child(${this.getStationIndex(stationId) + 1})`);
      
      if (stationGroup.empty()) return;

      // Update station color based on quality score
      const qualityScore = latestData.quality_score || 0;
      const stationColor = this.getQualityColor(qualityScore);
      
      stationGroup.select('.station-base')
        .transition()
        .duration(500)
        .style('fill', stationColor);

      // Add temperature overlay if enabled
      if (this.config.show_temperature) {
        this.updateTemperatureOverlay(stationGroup, latestData);
      }

      // Add vibration overlay if enabled
      if (this.config.show_vibration) {
        this.updateVibrationOverlay(stationGroup, latestData);
      }
    });
  }

  getStationIndex(stationId) {
    const stations = ['ST-01', 'ST-02', 'ST-03', 'ST-04', 'ST-05', 'ST-06', 
                     'ST-07', 'ST-08', 'ST-09', 'ST-10', 'ST-11', 'ST-12'];
    return stations.indexOf(stationId);
  }

  getQualityColor(score) {
    if (score >= 98) return '#28a745'; // Green - Excellent
    if (score >= 95) return '#ffc107'; // Yellow - Good
    if (score >= 90) return '#fd7e14'; // Orange - Fair
    return '#dc3545'; // Red - Poor
  }

  updateTemperatureOverlay(stationGroup, data) {
    const temp = data.temperature_celsius || 20;
    const intensity = Math.min(temp / 100, 1); // Normalize temperature
    
    // Remove existing temperature overlay
    stationGroup.select('.temp-overlay').remove();
    
    // Add temperature glow effect
    stationGroup.append('circle')
      .attr('class', 'temp-overlay')
      .attr('r', 30)
      .style('fill', 'none')
      .style('stroke', `rgba(255, ${255 - intensity * 200}, 0, ${intensity})`)
      .style('stroke-width', 3)
      .style('opacity', 0.7);
  }

  updateVibrationOverlay(stationGroup, data) {
    const vibration = data.vibration_mm_s || 0;
    if (vibration > 2.5) { // Show ripple effect for high vibration
      this.createRippleEffect(stationGroup, vibration);
    }
  }

  createRippleEffect(stationGroup, vibration) {
    const ripple = stationGroup.append('circle')
      .attr('class', 'vibration-ripple')
      .attr('r', 25)
      .style('fill', 'none')
      .style('stroke', '#ff6b6b')
      .style('stroke-width', 2)
      .style('opacity', 0.8);

    ripple.transition()
      .duration(1000)
      .attr('r', 50)
      .style('opacity', 0)
      .remove();
  }

  showTooltip(event, d) {
    const stationId = d[0];
    const stationData = this.getLatestStationData(stationId);
    
    if (!stationData) return;

    const tooltipContent = `
      <strong>${stationId}</strong><br/>
      Line: ${stationData.production_line}<br/>
      Temperature: ${stationData.temperature_celsius}°C<br/>
      Pressure: ${stationData.pressure_psi} PSI<br/>
      Vibration: ${stationData.vibration_mm_s} mm/s<br/>
      Quality: ${stationData.quality_score}%<br/>
      Power: ${stationData.power_consumption_kw} kW
    `;

    this.tooltip.transition()
      .duration(200)
      .style('opacity', 1);
    
    this.tooltip.html(tooltipContent)
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 10) + 'px');
  }

  hideTooltip() {
    this.tooltip.transition()
      .duration(200)
      .style('opacity', 0);
  }

  getLatestStationData(stationId) {
    if (!this.currentData) return null;
    
    // Find the most recent data for this station
    const stationData = this.currentData.filter(row => row.station_id === stationId);
    return stationData.length > 0 ? stationData[stationData.length - 1] : null;
  }

  showStationDetails(d) {
    const stationId = d[0];
    const stationData = this.getLatestStationData(stationId);
    
    if (!stationData) return;

    // Create detailed view modal or side panel
    alert(`Station ${stationId} Details:\n\n` +
          `Production Line: ${stationData.production_line}\n` +
          `Temperature: ${stationData.temperature_celsius}°C\n` +
          `Pressure: ${stationData.pressure_psi} PSI\n` +
          `Vibration: ${stationData.vibration_mm_s} mm/s\n` +
          `Quality Score: ${stationData.quality_score}%\n` +
          `Power Consumption: ${stationData.power_consumption_kw} kW\n` +
          `Cycle Time: ${stationData.cycle_time_seconds}s`);
  }

  resize() {
    // Handle responsive resizing
    const containerWidth = this.element.clientWidth;
    const containerHeight = this.element.clientHeight;
    
    this.svg
      .attr('width', containerWidth)
      .attr('height', containerHeight);
  }
}

// Sigma Plugin Integration
function createPlugin(element, config) {
  // Load D3.js if not already loaded
  if (typeof d3 === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://d3js.org/d3.v7.min.js';
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      return new FactoryFloorLayout(element, config);
    };
    script.onerror = () => {
      console.error('Failed to load D3.js');
    };
    document.head.appendChild(script);
  } else {
    return new FactoryFloorLayout(element, config);
  }
}

// Export for Sigma Computing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createPlugin };
} else {
  window.FactoryFloorLayout = { createPlugin };
}
// Factory Floor Layout Plugin for Sigma Computing
// Following official Sigma Plugin Development API

(function() {
  'use strict';

  // Load D3.js dependency
  function loadD3() {
    return new Promise((resolve, reject) => {
      if (typeof d3 !== 'undefined') {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://d3js.org/d3.v7.min.js';
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load D3.js'));
      document.head.appendChild(script);
    });
  }

  // Main plugin function following Sigma API
  function createPlugin(element, config, data) {
    console.log('Factory Plugin - Creating with:', { config, data });
    
    return loadD3().then(() => {
      // Clear element
      element.innerHTML = '';
      
      // Handle data - Sigma passes data as rows array
      const rows = data || [];
      console.log('Factory Plugin - Received rows:', rows.length, rows[0]);
      
      if (rows.length === 0) {
        element.innerHTML = `
          <div style="padding: 20px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <h3 style="color: #333; margin-bottom: 10px;">Factory Floor Layout</h3>
            <p style="color: #666; margin-bottom: 15px;">Please configure your data source:</p>
            <ol style="text-align: left; max-width: 400px; margin: 0 auto; color: #666; font-size: 14px;">
              <li>Click "Data" in the left panel</li>
              <li>Select "Add Data Source"</li>
              <li>Choose your telemetry table</li>
              <li>Map the required columns</li>
            </ol>
            <p style="font-size: 12px; color: #999; margin-top: 20px;">
              Expected columns: station_id, production_line, temperature_celsius, pressure_psi, vibration_mm_s, quality_score
            </p>
          </div>`;
        return;
      }
      
      return new FactoryFloorVisualization(element, config, rows);
    }).catch(error => {
      console.error('Factory Plugin Error:', error);
      element.innerHTML = `
        <div style="padding: 20px; color: red; font-family: Arial, sans-serif;">
          <h3>Plugin Error</h3>
          <p>Failed to load visualization: ${error.message}</p>
        </div>`;
    });
  }

  // Factory Floor Visualization Class
  class FactoryFloorVisualization {
    constructor(element, config, data) {
      this.element = element;
      this.config = config || {};
      this.data = data || [];
      this.svg = null;
      
      console.log('FactoryFloor - Initializing with data:', this.data.length, 'rows');
      this.init();
    }

    init() {
      // Create container
      const container = document.createElement('div');
      container.style.cssText = `
        width: 100%;
        height: 100%;
        min-height: 500px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        position: relative;
      `;
      this.element.appendChild(container);

      // Create SVG with proper responsive design
      this.svg = d3.select(container)
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', '0 0 900 650')
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('background', 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)')
        .style('border-radius', '8px')
        .style('box-shadow', '0 2px 8px rgba(0,0,0,0.1)');

      this.setupLayout();
      this.processAndDisplayData();
    }

    setupLayout() {
      // Add title with better styling
      this.svg.append('text')
        .attr('x', 450)
        .attr('y', 35)
        .attr('text-anchor', 'middle')
        .style('font-size', '28px')
        .style('font-weight', '600')
        .style('fill', '#2c3e50')
        .style('text-shadow', '0 1px 2px rgba(0,0,0,0.1)')
        .text('Factory Floor Layout');

      // Define optimized station positions
      this.stationPositions = {
        'ST-01': { x: 120, y: 180, line: 'LINE-A' },
        'ST-02': { x: 280, y: 180, line: 'LINE-A' },
        'ST-03': { x: 440, y: 180, line: 'LINE-A' },
        'ST-04': { x: 600, y: 180, line: 'LINE-A' },
        'ST-05': { x: 120, y: 320, line: 'LINE-B' },
        'ST-06': { x: 280, y: 320, line: 'LINE-B' },
        'ST-07': { x: 440, y: 320, line: 'LINE-B' },
        'ST-08': { x: 600, y: 320, line: 'LINE-B' },
        'ST-09': { x: 120, y: 460, line: 'LINE-C' },
        'ST-10': { x: 280, y: 460, line: 'LINE-C' },
        'ST-11': { x: 440, y: 460, line: 'LINE-C' },
        'ST-12': { x: 600, y: 460, line: 'LINE-C' }
      };

      // Draw production line backgrounds
      const lineColors = {
        'LINE-A': '#e3f2fd',
        'LINE-B': '#f3e5f5', 
        'LINE-C': '#e8f5e8'
      };

      const lineY = { 'LINE-A': 180, 'LINE-B': 320, 'LINE-C': 460 };
      
      Object.entries(lineColors).forEach(([line, color]) => {
        this.svg.append('rect')
          .attr('x', 60)
          .attr('y', lineY[line] - 40)
          .attr('width', 600)
          .attr('height', 80)
          .attr('rx', 12)
          .style('fill', color)
          .style('opacity', 0.3);
      });

      // Add line labels with better positioning
      Object.keys(lineY).forEach(line => {
        this.svg.append('text')
          .attr('x', 40)
          .attr('y', lineY[line] + 5)
          .attr('text-anchor', 'middle')
          .style('font-size', '16px')
          .style('font-weight', 'bold')
          .style('fill', '#495057')
          .style('writing-mode', 'tb')
          .text(line);
      });

      this.drawConnections();
      this.createStations();
      this.createLegend();
    }

    drawConnections() {
      // Create arrow marker
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
        .style('fill', '#6c757d');

      // Draw flow lines between stations
      const flows = [
        ['ST-01', 'ST-02', 'ST-03', 'ST-04'],
        ['ST-05', 'ST-06', 'ST-07', 'ST-08'],
        ['ST-09', 'ST-10', 'ST-11', 'ST-12']
      ];

      flows.forEach(flow => {
        for (let i = 0; i < flow.length - 1; i++) {
          const from = this.stationPositions[flow[i]];
          const to = this.stationPositions[flow[i + 1]];
          
          this.svg.append('line')
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
    }

    createStations() {
      // Create station groups
      this.stationGroups = this.svg.selectAll('.station-group')
        .data(Object.entries(this.stationPositions))
        .enter()
        .append('g')
        .attr('class', 'station-group')
        .attr('transform', d => `translate(${d[1].x}, ${d[1].y})`);

      // Station base circles
      this.stationGroups.append('circle')
        .attr('class', 'station-base')
        .attr('r', 28)
        .style('fill', '#e9ecef')
        .style('stroke', '#495057')
        .style('stroke-width', 2)
        .style('filter', 'drop-shadow(0 3px 6px rgba(0,0,0,0.15))')
        .style('cursor', 'pointer');

      // Station labels
      this.stationGroups.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', 6)
        .style('font-size', '13px')
        .style('font-weight', 'bold')
        .style('fill', '#2c3e50')
        .style('pointer-events', 'none')
        .text(d => d[0]);

      // Add interactivity
      this.stationGroups
        .on('mouseover', (event, d) => this.handleMouseOver(event, d))
        .on('mouseout', (event, d) => this.handleMouseOut(event, d))
        .on('click', (event, d) => this.handleClick(event, d));
    }

    createLegend() {
      const legend = this.svg.append('g')
        .attr('class', 'legend')
        .attr('transform', 'translate(720, 100)');

      const legendData = [
        { label: 'Excellent (98-100%)', color: '#28a745' },
        { label: 'Good (95-97%)', color: '#ffc107' },
        { label: 'Fair (90-94%)', color: '#fd7e14' },
        { label: 'Poor (< 90%)', color: '#dc3545' }
      ];

      legend.append('text')
        .attr('x', 0)
        .attr('y', 0)
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .style('fill', '#2c3e50')
        .text('Quality Score');

      const legendItems = legend.selectAll('.legend-item')
        .data(legendData)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${20 + i * 25})`);

      legendItems.append('circle')
        .attr('r', 8)
        .style('fill', d => d.color);

      legendItems.append('text')
        .attr('x', 15)
        .attr('y', 5)
        .style('font-size', '12px')
        .style('fill', '#495057')
        .text(d => d.label);
    }

    processAndDisplayData() {
      if (!this.data || this.data.length === 0) {
        console.log('No data to process');
        return;
      }

      // Group data by station - handle different column name formats
      const stationData = {};
      this.data.forEach(row => {
        // Try different possible column names for station_id
        const stationId = row.station_id || row['station_id'] || row.Station_ID || row['Station ID'];
        
        if (stationId && this.stationPositions[stationId]) {
          if (!stationData[stationId]) {
            stationData[stationId] = [];
          }
          stationData[stationId].push(row);
        }
      });

      console.log('Processed station data:', stationData);

      // Update each station's visualization
      Object.entries(stationData).forEach(([stationId, rows]) => {
        if (rows.length > 0) {
          // Use the most recent data point
          const latestData = rows[rows.length - 1];
          this.updateStationDisplay(stationId, latestData);
        }
      });

      // Show stations without data in gray
      Object.keys(this.stationPositions).forEach(stationId => {
        if (!stationData[stationId]) {
          this.updateStationDisplay(stationId, null);
        }
      });
    }

    updateStationDisplay(stationId, data) {
      const stationGroup = this.stationGroups.filter(d => d[0] === stationId);
      
      if (stationGroup.empty()) return;

      let color = '#6c757d'; // Default gray for no data
      let temperature = 0;
      let vibration = 0;

      if (data) {
        // Extract quality score - try different column name formats
        const qualityScore = parseFloat(
          data.quality_score || 
          data['quality_score'] || 
          data.Quality_Score || 
          data['Quality Score'] || 
          0
        );

        temperature = parseFloat(
          data.temperature_celsius || 
          data['temperature_celsius'] || 
          data.Temperature_Celsius || 
          data['Temperature (°C)'] || 
          0
        );

        vibration = parseFloat(
          data.vibration_mm_s || 
          data['vibration_mm_s'] || 
          data.Vibration_mm_s || 
          data['Vibration (mm/s)'] || 
          0
        );

        color = this.getQualityColor(qualityScore);
      }

      // Update station color with animation
      stationGroup.select('.station-base')
        .transition()
        .duration(800)
        .style('fill', color);

      // Add temperature effect
      if (temperature > 85) {
        this.addTemperatureEffect(stationGroup, temperature);
      }

      // Add vibration effect
      if (vibration > 3) {
        this.addVibrationEffect(stationGroup);
      }
    }

    getQualityColor(score) {
      if (score >= 98) return '#28a745'; // Excellent - Green
      if (score >= 95) return '#ffc107'; // Good - Yellow
      if (score >= 90) return '#fd7e14'; // Fair - Orange
      return '#dc3545'; // Poor - Red
    }

    addTemperatureEffect(stationGroup, temperature) {
      const intensity = Math.min((temperature - 85) / 15, 1);
      
      stationGroup.selectAll('.temp-glow').remove();
      stationGroup.append('circle')
        .attr('class', 'temp-glow')
        .attr('r', 35)
        .style('fill', 'none')
        .style('stroke', `rgba(255, ${255 - intensity * 150}, 0, ${intensity * 0.7})`)
        .style('stroke-width', 4)
        .style('opacity', 0)
        .transition()
        .duration(500)
        .style('opacity', 1);
    }

    addVibrationEffect(stationGroup) {
      const ripple = stationGroup.append('circle')
        .attr('class', 'vibration-ripple')
        .attr('r', 28)
        .style('fill', 'none')
        .style('stroke', '#ff4757')
        .style('stroke-width', 3)
        .style('opacity', 0.8);

      ripple.transition()
        .duration(1200)
        .attr('r', 55)
        .style('opacity', 0)
        .remove();
    }

    handleMouseOver(event, d) {
      const stationId = d[0];
      const stationData = this.getStationData(stationId);
      
      // Scale up the station
      d3.select(event.currentTarget)
        .transition()
        .duration(200)
        .attr('transform', `translate(${d[1].x}, ${d[1].y}) scale(1.15)`);

      // Show tooltip
      this.showTooltip(event, stationId, stationData);
    }

    handleMouseOut(event, d) {
      // Scale back to normal
      d3.select(event.currentTarget)
        .transition()
        .duration(200)
        .attr('transform', `translate(${d[1].x}, ${d[1].y}) scale(1)`);

      this.hideTooltip();
    }

    handleClick(event, d) {
      const stationId = d[0];
      const stationData = this.getStationData(stationId);
      this.showDetailModal(stationId, stationData);
    }

    getStationData(stationId) {
      if (!this.data) return null;
      
      const stationRows = this.data.filter(row => {
        const id = row.station_id || row['station_id'] || row.Station_ID || row['Station ID'];
        return id === stationId;
      });
      
      return stationRows.length > 0 ? stationRows[stationRows.length - 1] : null;
    }

    showTooltip(event, stationId, data) {
      // Remove existing tooltip
      d3.selectAll('.sigma-factory-tooltip').remove();

      const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'sigma-factory-tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(0,0,0,0.9)')
        .style('color', 'white')
        .style('padding', '12px')
        .style('border-radius', '6px')
        .style('font-size', '13px')
        .style('pointer-events', 'none')
        .style('z-index', '10000')
        .style('opacity', 0);

      let content = `<strong>${stationId}</strong><br/>`;
      
      if (data) {
        const line = data.production_line || data['production_line'] || 'Unknown';
        const temp = data.temperature_celsius || data['temperature_celsius'] || 'N/A';
        const pressure = data.pressure_psi || data['pressure_psi'] || 'N/A';
        const vibration = data.vibration_mm_s || data['vibration_mm_s'] || 'N/A';
        const quality = data.quality_score || data['quality_score'] || 'N/A';
        
        content += `Line: ${line}<br/>`;
        content += `Temperature: ${temp}°C<br/>`;
        content += `Pressure: ${pressure} PSI<br/>`;
        content += `Vibration: ${vibration} mm/s<br/>`;
        content += `Quality: ${quality}%`;
      } else {
        content += 'No data available';
      }

      tooltip.html(content)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
        .transition()
        .duration(200)
        .style('opacity', 1);
    }

    hideTooltip() {
      d3.selectAll('.sigma-factory-tooltip')
        .transition()
        .duration(200)
        .style('opacity', 0)
        .remove();
    }

    showDetailModal(stationId, data) {
      if (!data) {
        alert(`${stationId}: No data available`);
        return;
      }

      const line = data.production_line || data['production_line'] || 'Unknown';
      const temp = data.temperature_celsius || data['temperature_celsius'] || 'N/A';
      const pressure = data.pressure_psi || data['pressure_psi'] || 'N/A';
      const vibration = data.vibration_mm_s || data['vibration_mm_s'] || 'N/A';
      const quality = data.quality_score || data['quality_score'] || 'N/A';
      const power = data.power_consumption_kw || data['power_consumption_kw'] || 'N/A';
      const cycle = data.cycle_time_seconds || data['cycle_time_seconds'] || 'N/A';

      alert(`${stationId} Detailed Metrics:\n\n` +
            `Production Line: ${line}\n` +
            `Temperature: ${temp}°C\n` +
            `Pressure: ${pressure} PSI\n` +
            `Vibration: ${vibration} mm/s\n` +
            `Quality Score: ${quality}%\n` +
            `Power Consumption: ${power} kW\n` +
            `Cycle Time: ${cycle} seconds`);
    }
  }

  // Export the plugin function for Sigma Computing
  if (typeof window !== 'undefined') {
    window.createPlugin = createPlugin;
    window.FactoryFloorPlugin = {
      createPlugin: createPlugin,
      FactoryFloorVisualization: FactoryFloorVisualization
    };
  }

  // Support for module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = createPlugin;
  }

})();
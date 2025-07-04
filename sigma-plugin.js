// Factory Floor Layout Plugin for Sigma Computing
// This is the entry point that Sigma will load

(function() {
  'use strict';

  // Plugin metadata
  const PLUGIN_ID = 'factory-floor-layout';
  const PLUGIN_VERSION = '1.0.0';

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

  // Factory Floor Layout Class
  class FactoryFloorLayout {
    constructor(element, config, data) {
      this.element = element;
      this.config = config || {};
      this.data = data || [];
      this.svg = null;
      this.currentData = null;
      
      // Clear the element
      this.element.innerHTML = '';
      
      this.init();
    }

    init() {
      // Create container
      const container = document.createElement('div');
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.minHeight = '600px';
      container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      this.element.appendChild(container);

      // Create SVG
      this.svg = d3.select(container)
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', '0 0 800 600')
        .style('background', 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)')
        .style('border-radius', '8px');

      // Add title
      this.svg.append('text')
        .attr('x', 20)
        .attr('y', 30)
        .style('font-size', '24px')
        .style('font-weight', 'bold')
        .style('fill', '#333')
        .text('Factory Floor Layout');

      this.setupFactoryLayout();
      this.updateData(this.data);
    }

    setupFactoryLayout() {
      // Define station positions
      const stationPositions = {
        'ST-01': { x: 100, y: 150, line: 'LINE-A' },
        'ST-02': { x: 250, y: 150, line: 'LINE-A' },
        'ST-03': { x: 400, y: 150, line: 'LINE-A' },
        'ST-04': { x: 550, y: 150, line: 'LINE-A' },
        'ST-05': { x: 100, y: 300, line: 'LINE-B' },
        'ST-06': { x: 250, y: 300, line: 'LINE-B' },
        'ST-07': { x: 400, y: 300, line: 'LINE-B' },
        'ST-08': { x: 550, y: 300, line: 'LINE-B' },
        'ST-09': { x: 100, y: 450, line: 'LINE-C' },
        'ST-10': { x: 250, y: 450, line: 'LINE-C' },
        'ST-11': { x: 400, y: 450, line: 'LINE-C' },
        'ST-12': { x: 550, y: 450, line: 'LINE-C' }
      };

      // Draw line labels
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

      // Draw connection arrows
      this.drawConnectionLines(stationPositions);

      // Create station groups
      this.stationGroups = this.svg.selectAll('.station-group')
        .data(Object.entries(stationPositions))
        .enter()
        .append('g')
        .attr('class', 'station-group')
        .attr('transform', d => `translate(${d[1].x}, ${d[1].y})`);

      // Draw station circles
      this.stationGroups.append('circle')
        .attr('class', 'station-base')
        .attr('r', 25)
        .style('fill', '#e9ecef')
        .style('stroke', '#6c757d')
        .style('stroke-width', 2)
        .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))');

      // Add station labels
      this.stationGroups.append('text')
        .attr('class', 'station-label')
        .attr('text-anchor', 'middle')
        .attr('y', 5)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', '#333')
        .text(d => d[0]);

      // Add interactivity
      this.stationGroups
        .style('cursor', 'pointer')
        .on('mouseover', (event, d) => {
          d3.select(event.currentTarget)
            .transition()
            .duration(200)
            .attr('transform', d => `translate(${d[1].x}, ${d[1].y}) scale(1.1)`);
        })
        .on('mouseout', (event, d) => {
          d3.select(event.currentTarget)
            .transition()
            .duration(200)
            .attr('transform', d => `translate(${d[1].x}, ${d[1].y}) scale(1)`);
        })
        .on('click', (event, d) => {
          this.showStationDetails(d[0]);
        });

      // Create tooltip
      this.tooltip = d3.select('body').append('div')
        .attr('class', 'sigma-factory-tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background', 'rgba(0,0,0,0.9)')
        .style('color', 'white')
        .style('padding', '10px')
        .style('border-radius', '5px')
        .style('pointer-events', 'none')
        .style('font-size', '12px')
        .style('z-index', '10000');
    }

    drawConnectionLines(positions) {
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

      // Draw lines between stations
      const lines = [
        ['ST-01', 'ST-02', 'ST-03', 'ST-04'],
        ['ST-05', 'ST-06', 'ST-07', 'ST-08'],
        ['ST-09', 'ST-10', 'ST-11', 'ST-12']
      ];

      lines.forEach(line => {
        for (let i = 0; i < line.length - 1; i++) {
          const from = positions[line[i]];
          const to = positions[line[i + 1]];
          
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
    }

    updateData(data) {
      if (!data || data.length === 0) return;
      
      this.currentData = data;
      
      // Group data by station
      const stationData = {};
      data.forEach(row => {
        const stationId = row.station_id || row['station_id'];
        if (stationId && !stationData[stationId]) {
          stationData[stationId] = [];
        }
        if (stationId) {
          stationData[stationId].push(row);
        }
      });

      // Update station visuals
      Object.entries(stationData).forEach(([stationId, stationRows]) => {
        const latestData = stationRows[stationRows.length - 1];
        this.updateStationVisual(stationId, latestData);
      });
    }

    updateStationVisual(stationId, data) {
      const qualityScore = parseFloat(data.quality_score || data['quality_score']) || 0;
      const temperature = parseFloat(data.temperature_celsius || data['temperature_celsius']) || 0;
      const vibration = parseFloat(data.vibration_mm_s || data['vibration_mm_s']) || 0;
      
      // Find the station group
      const stationGroup = this.stationGroups.filter(d => d[0] === stationId);
      
      if (stationGroup.empty()) return;

      // Update station color based on quality
      const color = this.getQualityColor(qualityScore);
      
      stationGroup.select('.station-base')
        .transition()
        .duration(500)
        .style('fill', color);

      // Add temperature glow
      if (temperature > 80) {
        const intensity = Math.min((temperature - 80) / 20, 1);
        stationGroup.selectAll('.temp-glow').remove();
        stationGroup.append('circle')
          .attr('class', 'temp-glow')
          .attr('r', 35)
          .style('fill', 'none')
          .style('stroke', `rgba(255, ${255 - intensity * 200}, 0, ${intensity * 0.8})`)
          .style('stroke-width', 3);
      }

      // Add vibration effect
      if (vibration > 3) {
        this.createVibrationRipple(stationGroup);
      }
    }

    getQualityColor(score) {
      if (score >= 98) return '#28a745'; // Green
      if (score >= 95) return '#ffc107'; // Yellow
      if (score >= 90) return '#fd7e14'; // Orange
      return '#dc3545'; // Red
    }

    createVibrationRipple(stationGroup) {
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

    showStationDetails(stationId) {
      const stationData = this.getLatestStationData(stationId);
      if (!stationData) return;

      alert(`Station ${stationId} Details:\n\n` +
            `Production Line: ${stationData.production_line || stationData['production_line']}\n` +
            `Temperature: ${stationData.temperature_celsius || stationData['temperature_celsius']}°C\n` +
            `Pressure: ${stationData.pressure_psi || stationData['pressure_psi']} PSI\n` +
            `Vibration: ${stationData.vibration_mm_s || stationData['vibration_mm_s']} mm/s\n` +
            `Quality Score: ${stationData.quality_score || stationData['quality_score']}%`);
    }

    getLatestStationData(stationId) {
      if (!this.currentData) return null;
      const stationData = this.currentData.filter(row => 
        (row.station_id || row['station_id']) === stationId
      );
      return stationData.length > 0 ? stationData[stationData.length - 1] : null;
    }
  }

  // Sigma Plugin Interface
  function createVisualization(element, config, queryResult) {
    return loadD3().then(() => {
      // Handle different Sigma data formats
      let data = [];
      
      if (queryResult) {
        if (queryResult.data && Array.isArray(queryResult.data)) {
          data = queryResult.data;
        } else if (queryResult.rawData && Array.isArray(queryResult.rawData)) {
          data = queryResult.rawData;
        } else if (Array.isArray(queryResult)) {
          data = queryResult;
        }
      }
      
      // Debug logging
      console.log('Factory Layout Plugin - Data received:', {
        queryResult: queryResult,
        dataLength: data.length,
        sampleRow: data[0]
      });
      
      // Show data status in plugin
      if (data.length === 0) {
        element.innerHTML = `
          <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
            <h3>Factory Floor Layout</h3>
            <p style="color: #666;">No data connected. Please add your telemetry dataset to this plugin.</p>
            <p style="font-size: 12px;">Expected columns: station_id, production_line, temperature_celsius, pressure_psi, vibration_mm_s, quality_score</p>
          </div>`;
        return;
      }
      
      return new FactoryFloorLayout(element, config, data);
    }).catch(error => {
      console.error('Factory Layout Plugin Error:', error);
      element.innerHTML = `<div style="padding: 20px; color: red;">Error loading plugin: ${error.message}</div>`;
    });
  }

  // Register the plugin with Sigma
  if (typeof sigmaComputing !== 'undefined' && sigmaComputing.plugins) {
    sigmaComputing.plugins.register({
      id: PLUGIN_ID,
      version: PLUGIN_VERSION,
      name: 'Factory Floor Layout',
      description: 'Interactive 2D factory floor visualization with real-time telemetry',
      createVisualization: createVisualization
    });
  } else {
    // Fallback for standalone testing
    window.FactoryFloorLayoutPlugin = {
      createVisualization: createVisualization,
      FactoryFloorLayout: FactoryFloorLayout
    };
  }

})();
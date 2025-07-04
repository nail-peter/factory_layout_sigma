// Factory Floor Layout Plugin for Sigma Computing
// Simple JavaScript implementation without build process

(function() {
  'use strict';

  // Check if we're running in Sigma Computing environment
  const isSigmaEnvironment = () => {
    return typeof window !== 'undefined' && 
           window.parent !== window && 
           document.referrer.includes('sigmacomputing.com');
  };

  // Plugin initialization
  function initializePlugin() {
    console.log('Factory Floor Plugin - Initializing...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializePlugin);
      return;
    }

    // Create main container
    const container = document.body;
    container.style.cssText = `
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f8f9fa;
      min-height: 100vh;
    `;

    // Clear existing content
    container.innerHTML = '';

    if (isSigmaEnvironment()) {
      setupSigmaPlugin(container);
    } else {
      setupDemoMode(container);
    }
  }

  // Setup for Sigma Computing environment
  function setupSigmaPlugin(container) {
    // Create plugin interface message
    const pluginDiv = document.createElement('div');
    pluginDiv.style.cssText = `
      padding: 40px;
      text-align: center;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      max-width: 600px;
      margin: 0 auto;
    `;

    pluginDiv.innerHTML = `
      <h2 style="color: #2c3e50; margin-bottom: 20px;">Factory Floor Layout Plugin</h2>
      <p style="color: #666; margin-bottom: 20px;">
        This plugin is now loaded in Sigma Computing!
      </p>
      <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #1976d2; margin-bottom: 10px;">Next Steps:</h3>
        <ol style="text-align: left; color: #333;">
          <li>In Sigma's left panel, click "Data" to configure your data source</li>
          <li>Select your manufacturing telemetry table</li>
          <li>Map the following columns:
            <ul style="margin: 10px 0;">
              <li>Station ID (ST-01, ST-02, etc.)</li>
              <li>Production Line (LINE-A, LINE-B, LINE-C)</li>
              <li>Temperature, Pressure, Vibration, Quality Score</li>
            </ul>
          </li>
          <li>The factory floor visualization will appear automatically</li>
        </ol>
      </div>
      <button id="testVisualization" style="
        background: #1976d2;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
      ">
        Show Demo Visualization
      </button>
    `;

    container.appendChild(pluginDiv);

    // Add test button functionality
    document.getElementById('testVisualization').addEventListener('click', () => {
      setupDemoMode(container);
    });

    // Try to communicate with Sigma
    if (window.parent && window.parent.postMessage) {
      window.parent.postMessage({
        type: 'SIGMA_PLUGIN_READY',
        payload: {
          pluginId: 'factory-floor-layout',
          version: '1.0.0',
          configSchema: {
            dataSources: [
              {
                name: 'telemetry_data',
                type: 'table',
                required: true,
                description: 'Manufacturing telemetry data'
              }
            ],
            columns: [
              { name: 'station_id', type: 'dimension', required: true },
              { name: 'production_line', type: 'dimension', required: true },
              { name: 'temperature', type: 'measure', required: false },
              { name: 'pressure', type: 'measure', required: false },
              { name: 'vibration', type: 'measure', required: false },
              { name: 'quality_score', type: 'measure', required: false }
            ]
          }
        }
      }, '*');
    }
  }

  // Setup demo mode with sample data
  function setupDemoMode(container) {
    container.innerHTML = '';
    
    // Load D3.js if not available
    if (typeof d3 === 'undefined') {
      loadD3().then(() => createDemoVisualization(container));
    } else {
      createDemoVisualization(container);
    }
  }

  // Load D3.js dynamically
  function loadD3() {
    return new Promise((resolve, reject) => {
      console.log('Loading D3.js...');
      const script = document.createElement('script');
      script.src = 'https://d3js.org/d3.v7.min.js';
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        console.log('D3.js loaded successfully');
        resolve(window.d3);
      };
      script.onerror = () => {
        console.error('Failed to load D3.js');
        reject(new Error('Failed to load D3.js'));
      };
      document.head.appendChild(script);
    });
  }

  // Create demo visualization
  function createDemoVisualization(container) {
    console.log('Creating demo visualization...');

    // Generate demo data
    const demoData = generateDemoData();
    
    // Create visualization container
    const vizContainer = document.createElement('div');
    vizContainer.style.cssText = `
      width: 100%;
      height: 600px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      position: relative;
    `;
    container.appendChild(vizContainer);

    // Create factory floor visualization
    createFactoryFloorVisualization(vizContainer, demoData);
  }

  // Generate sample manufacturing data
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
      temperature_celsius: 70 + Math.random() * 25,
      pressure_psi: 40 + Math.random() * 20,
      vibration_mm_s: 1 + Math.random() * 4,
      quality_score: 85 + Math.random() * 15
    }));
  }

  // Create the D3 factory floor visualization
  function createFactoryFloorVisualization(container, data) {
    if (!window.d3) {
      console.error('D3.js not available');
      return;
    }

    const d3 = window.d3;
    
    // Clear container
    d3.select(container).selectAll('*').remove();

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // Create SVG
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('background', 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)')
      .style('border-radius', '12px');

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .style('font-size', '24px')
      .style('font-weight', 'bold')
      .style('fill', '#2c3e50')
      .text('Factory Floor Layout - Demo');

    // Station positions
    const stationPositions = {
      'ST-01': { x: width * 0.15, y: height * 0.25 },
      'ST-02': { x: width * 0.35, y: height * 0.25 },
      'ST-03': { x: width * 0.55, y: height * 0.25 },
      'ST-04': { x: width * 0.75, y: height * 0.25 },
      'ST-05': { x: width * 0.15, y: height * 0.50 },
      'ST-06': { x: width * 0.35, y: height * 0.50 },
      'ST-07': { x: width * 0.55, y: height * 0.50 },
      'ST-08': { x: width * 0.75, y: height * 0.50 },
      'ST-09': { x: width * 0.15, y: height * 0.75 },
      'ST-10': { x: width * 0.35, y: height * 0.75 },
      'ST-11': { x: width * 0.55, y: height * 0.75 },
      'ST-12': { x: width * 0.75, y: height * 0.75 }
    };

    // Draw production line backgrounds
    const lineColors = { 'LINE-A': '#e3f2fd', 'LINE-B': '#f3e5f5', 'LINE-C': '#e8f5e8' };
    const lineYs = [height * 0.25, height * 0.50, height * 0.75];
    const lineNames = ['LINE-A', 'LINE-B', 'LINE-C'];

    lineYs.forEach((y, i) => {
      svg.append('rect')
        .attr('x', width * 0.08)
        .attr('y', y - height * 0.06)
        .attr('width', width * 0.84)
        .attr('height', height * 0.12)
        .attr('rx', 8)
        .style('fill', Object.values(lineColors)[i])
        .style('opacity', 0.3);

      svg.append('text')
        .attr('x', width * 0.05)
        .attr('y', y + 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .style('fill', '#495057')
        .text(lineNames[i]);
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

    // Draw flow arrows
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
          .attr('x1', from.x + 25)
          .attr('y1', from.y)
          .attr('x2', to.x - 25)
          .attr('y2', to.y)
          .style('stroke', '#6c757d')
          .style('stroke-width', 2)
          .style('opacity', 0.6)
          .style('marker-end', 'url(#arrowhead)');
      }
    });

    // Group data by station
    const stationData = {};
    data.forEach(row => {
      stationData[row.station_id] = row;
    });

    // Create tooltip
    const tooltip = d3.select('body').append('div')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'rgba(0,0,0,0.8)')
      .style('color', 'white')
      .style('padding', '10px')
      .style('border-radius', '5px')
      .style('pointer-events', 'none')
      .style('font-size', '12px')
      .style('z-index', '10000');

    // Create station groups
    const stationGroups = svg.selectAll('.station-group')
      .data(Object.entries(stationPositions))
      .enter()
      .append('g')
      .attr('class', 'station-group')
      .attr('transform', d => `translate(${d[1].x}, ${d[1].y})`);

    // Station circles
    stationGroups.append('circle')
      .attr('r', 20)
      .style('fill', d => {
        const station = stationData[d[0]];
        if (!station) return '#e9ecef';
        
        const quality = station.quality_score;
        if (quality >= 98) return '#28a745';
        if (quality >= 95) return '#ffc107';
        if (quality >= 90) return '#fd7e14';
        return '#dc3545';
      })
      .style('stroke', '#495057')
      .style('stroke-width', 2)
      .style('cursor', 'pointer');

    // Station labels
    stationGroups.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 5)
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .style('fill', '#2c3e50')
      .style('pointer-events', 'none')
      .text(d => d[0]);

    // Add interactivity
    stationGroups
      .on('mouseover', function(event, d) {
        const station = stationData[d[0]];
        
        d3.select(this).transition().duration(200)
          .attr('transform', `translate(${d[1].x}, ${d[1].y}) scale(1.2)`);

        if (station) {
          tooltip.transition().duration(200).style('opacity', 1);
          tooltip.html(`
            <strong>${d[0]}</strong><br/>
            Line: ${station.production_line}<br/>
            Temperature: ${station.temperature_celsius.toFixed(1)}°C<br/>
            Pressure: ${station.pressure_psi.toFixed(1)} PSI<br/>
            Vibration: ${station.vibration_mm_s.toFixed(2)} mm/s<br/>
            Quality: ${station.quality_score.toFixed(1)}%
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
        }
      })
      .on('mouseout', function(event, d) {
        d3.select(this).transition().duration(200)
          .attr('transform', `translate(${d[1].x}, ${d[1].y}) scale(1)`);
        
        tooltip.transition().duration(200).style('opacity', 0);
      });

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 160}, 80)`);

    const legendData = [
      { label: 'Excellent (98-100%)', color: '#28a745' },
      { label: 'Good (95-97%)', color: '#ffc107' },
      { label: 'Fair (90-94%)', color: '#fd7e14' },
      { label: 'Poor (< 90%)', color: '#dc3545' }
    ];

    legend.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#2c3e50')
      .text('Quality Score');

    const legendItems = legend.selectAll('.legend-item')
      .data(legendData)
      .enter()
      .append('g')
      .attr('transform', (d, i) => `translate(0, ${15 + i * 18})`);

    legendItems.append('circle')
      .attr('r', 6)
      .style('fill', d => d.color);

    legendItems.append('text')
      .attr('x', 12)
      .attr('y', 4)
      .style('font-size', '10px')
      .style('fill', '#495057')
      .text(d => d.label);

    console.log('Factory floor visualization created successfully');
  }

  // Initialize the plugin
  initializePlugin();

})();
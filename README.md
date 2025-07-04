# Factory Floor Layout Plugin for Sigma Computing

Interactive 2D factory floor visualization showing real-time manufacturing telemetry data.

## Features

- 2D factory floor layout with 12 stations across 3 production lines
- Real-time sensor data overlays (temperature, pressure, vibration)
- Interactive station details on click
- Quality score indicators
- Production line status visualization

## Data Structure

The plugin expects manufacturing telemetry data with these columns:
- `station_id` (ST-01 through ST-12)
- `production_line` (LINE-A, LINE-B, LINE-C)
- `temperature_celsius`
- `pressure_psi`
- `vibration_mm_s`
- `quality_score`
- `power_consumption_kw`
- `cycle_time_seconds`

## Installation

1. Upload the plugin files to your Sigma Computing workspace
2. Create a new workbook and add the Factory Layout plugin
3. Connect your manufacturing telemetry data source
4. Configure the data mapping in the plugin settings
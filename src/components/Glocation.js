import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Set your token
mapboxgl.accessToken = 'pk.eyJ1IjoiamVtYWxzbWIiLCJhIjoiY202NnZlMnRsMDFvYTJqc2V0Z3JqeWpmMCJ9.jDBDFxGO_C0_jcLRBy3nyg';

export default function Glocation({ onClose }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(15);
  const [lat, setLat] = useState(54);
  const [zoom, setZoom] = useState(2);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState('none');
  const [drawnShapes, setDrawnShapes] = useState([]);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/navigation-night-v1',
        center: [lng, lat],
        zoom: zoom,
        projection: 'mercator'
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add map load event listener
      map.current.on('load', () => {
        
        // Add a source for drawing shapes
        map.current.addSource('drawn-shapes', {
          'type': 'geojson',
          'data': {
            'type': 'FeatureCollection',
            'features': []
          }
        });

        // Add layer for drawn rectangles
        map.current.addLayer({
          'id': 'drawn-rectangles',
          'type': 'fill',
          'source': 'drawn-shapes',
          'layout': {},
          'paint': {
            'fill-color': '#ff6b6b',
            'fill-opacity': 0.3
          },
          'filter': ['==', '$type', 'Polygon']
        });

        // Add layer for rectangle borders
        map.current.addLayer({
          'id': 'drawn-rectangles-outline',
          'type': 'line',
          'source': 'drawn-shapes',
          'layout': {},
          'paint': {
            'line-color': '#ff6b6b',
            'line-width': 2
          },
          'filter': ['==', '$type', 'Polygon']
        });
      });

      // Add map move event listener
      map.current.on('move', () => {
        setLng(map.current.getCenter().lng.toFixed(4));
        setLat(map.current.getCenter().lat.toFixed(4));
        setZoom(map.current.getZoom().toFixed(2));
      });

      // Add error handler
      map.current.on('error', (e) => {
        console.error('Map error:', e);
      });

    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
    
    // Define region coordinates
    const regions = {
      'North America': { center: [-95, 45], zoom: 3 },
      'Europe': { center: [10, 54], zoom: 4 },
      'Asia': { center: [100, 35], zoom: 3 },
      'Africa': { center: [20, 0], zoom: 3 },
      'South America': { center: [-60, -15], zoom: 3 },
      'Oceania': { center: [140, -25], zoom: 4 }
    };

    if (regions[region] && map.current) {
      map.current.flyTo({
        center: regions[region].center,
        zoom: regions[region].zoom,
        duration: 2000
      });
    }
  };

  const startDrawing = (mode) => {
    setDrawMode(mode);
    setIsDrawing(true);
    
    if (map.current) {
      map.current.getCanvas().style.cursor = 'crosshair';
      
      if (mode === 'rectangle') {
        let startPoint = null;
        let currentRect = null;
        
        const onMouseDown = (e) => {
          startPoint = [e.lngLat.lng, e.lngLat.lat];
          map.current.dragPan.disable();
        };
        
        const onMouseMove = (e) => {
          if (!startPoint) return;
          
          const endPoint = [e.lngLat.lng, e.lngLat.lat];
          const rectangle = createRectangle(startPoint, endPoint);
          
          // Update the source with the current rectangle
          if (map.current.getSource('drawn-shapes')) {
            map.current.getSource('drawn-shapes').setData({
              'type': 'FeatureCollection',
              'features': [...drawnShapes, rectangle]
            });
          }
        };
        
        const onMouseUp = (e) => {
          if (!startPoint) return;
          
          const endPoint = [e.lngLat.lng, e.lngLat.lat];
          const rectangle = createRectangle(startPoint, endPoint);
          
          // Add the completed rectangle to the drawn shapes
          const newShapes = [...drawnShapes, rectangle];
          setDrawnShapes(newShapes);
          
          if (map.current.getSource('drawn-shapes')) {
            map.current.getSource('drawn-shapes').setData({
              'type': 'FeatureCollection',
              'features': newShapes
            });
          }
          
          // Clean up
          map.current.off('mousedown', onMouseDown);
          map.current.off('mousemove', onMouseMove);
          map.current.off('mouseup', onMouseUp);
          map.current.dragPan.enable();
          stopDrawing();
        };
        
        map.current.on('mousedown', onMouseDown);
        map.current.on('mousemove', onMouseMove);
        map.current.on('mouseup', onMouseUp);
      }
    }
  };

  const createRectangle = (start, end) => {
    const [minLng, maxLng] = start[0] < end[0] ? [start[0], end[0]] : [end[0], start[0]];
    const [minLat, maxLat] = start[1] < end[1] ? [start[1], end[1]] : [end[1], start[1]];
    
    return {
      'type': 'Feature',
      'geometry': {
        'type': 'Polygon',
        'coordinates': [[
          [minLng, minLat],
          [maxLng, minLat],
          [maxLng, maxLat],
          [minLng, maxLat],
          [minLng, minLat]
        ]]
      },
      'properties': {
        'type': 'rectangle'
      }
    };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setDrawMode('none');
    
    if (map.current) {
      map.current.getCanvas().style.cursor = '';
      map.current.dragPan.enable();
    }
  };

  const clearDrawnShapes = () => {
    setDrawnShapes([]);
    if (map.current && map.current.getSource('drawn-shapes')) {
      map.current.getSource('drawn-shapes').setData({
        'type': 'FeatureCollection',
        'features': []
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-2xl max-w-7xl w-full max-h-[85vh] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-blue-500 text-white p-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Geographic Targeting</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Sidebar Controls */}
        <div className="w-full lg:w-72 bg-gray-50 dark:bg-gray-800 p-4 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="space-y-4">
            {/* Coordinates Display */}
            <div className="text-sm">
              <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Current View</div>
              <div className="text-gray-600 dark:text-gray-400 text-xs">
                <div>Longitude: {lng}</div>
                <div>Latitude: {lat}</div>
                <div>Zoom Level: {zoom}</div>
              </div>
            </div>

            {/* Quick Region Select */}
            <div>
              <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-sm">Quick Regions</div>
              <div className="grid grid-cols-2 gap-2">
                {['North America', 'Europe', 'Asia', 'Africa', 'South America', 'Oceania'].map((region) => (
                  <button
                    key={region}
                    onClick={() => handleRegionSelect(region)}
                    className={`px-3 py-2 text-xs rounded-md transition-all duration-200 ${
                      selectedRegion === region 
                        ? 'bg-pink-500 text-white' 
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-pink-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            {/* Drawing Tools */}
            <div>
              <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-sm">Drawing Tools</div>
              <div className="space-y-2">
                <button
                  onClick={() => isDrawing ? stopDrawing() : startDrawing('rectangle')}
                  className={`w-full px-3 py-2 text-xs rounded-md transition-all duration-200 flex items-center justify-center ${
                    drawMode === 'rectangle' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  </svg>
                  Draw Rectangle
                </button>
                
                <button
                  onClick={clearDrawnShapes}
                  className="w-full px-3 py-2 text-xs rounded-md bg-red-500 text-white hover:bg-red-600 transition-all duration-200 flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear All
                </button>
                
                {isDrawing && (
                  <button
                    onClick={stopDrawing}
                    className="w-full px-3 py-2 text-xs rounded-md bg-yellow-500 text-white hover:bg-yellow-600 transition-all duration-200 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Stop Drawing
                  </button>
                )}
              </div>
            </div>

            {/* Drawn Areas Info */}
            {drawnShapes.length > 0 && (
              <div>
                <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-sm">Targeted Areas</div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-2">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {drawnShapes.length} area{drawnShapes.length !== 1 ? 's' : ''} selected
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  onClose();
                }}
                className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-md hover:from-pink-600 hover:to-blue-600 transition-all duration-200 text-sm font-medium"
              >
                Apply Targeting ({drawnShapes.length} areas)
              </button>
              
              <button
                onClick={() => {
                  setSelectedRegion('');
                  setDrawMode('none');
                  setIsDrawing(false);
                  clearDrawnShapes();
                  if (map.current) {
                    map.current.flyTo({ center: [15, 54], zoom: 2, duration: 1000 });
                  }
                }}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-all duration-200 text-sm"
              >
                Reset View
              </button>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 overflow-hidden">
          <div 
            ref={mapContainer} 
            className="w-full h-full"
            style={{ minHeight: '400px', maxHeight: '500px' }}
          />
        </div>
      </div>

      {/* Footer with instructions */}
      <div className="bg-gray-50 dark:bg-gray-800 p-3 text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <span>🖱️</span>
            <span>Click and drag to pan</span>
          </span>
          <span className="flex items-center gap-1">
            <span>🔍</span>
            <span>Scroll to zoom</span>
          </span>
          <span className="flex items-center gap-1">
            <span>📍</span>
            <span>Draw rectangular areas</span>
          </span>
          <span className="text-pink-500 font-medium">Click "Draw Rectangle" then drag on map</span>
        </div>
      </div>
    </div>
  );
}
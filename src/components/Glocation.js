import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

// Set your token
mapboxgl.accessToken = 'pk.eyJ1IjoiamVtYWxzbWIiLCJhIjoiY202NnZlMnRsMDFvYTJqc2V0Z3JqeWpmMCJ9.jDBDFxGO_C0_jcLRBy3nyg';

export default function Glocation() {
  useEffect(() => {
    // Initialize Mapbox map
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [15, 54],
      zoom: 2
    });
  }, []);

  return (
    <div style={{ width: '400px', height: '400px' }}>
      <div id="map" style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
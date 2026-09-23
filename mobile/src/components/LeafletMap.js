import React, { useRef, useEffect } from 'react';
import { WebView } from 'react-native-webview';

export default function LeafletMap({
  markers = [],
  center = [12.95, 77.55],
  zoom = 13,
  onMapClick,
  mapRef,
}) {
  const webRef = useRef(null);

  useEffect(() => {
    if (mapRef) {
      mapRef.current = {
        recenter: (lat, lng, z) => {
          webRef.current?.injectJavaScript(
            `window.__recenter(${lat}, ${lng}, ${z ?? zoom}); true;`
          );
        },
        setUserLocation: (lat, lng) => {
          webRef.current?.injectJavaScript(
            `window.__setUserLocation(${lat}, ${lng}); true;`
          );
        },
      };
    }
  }, [mapRef, zoom]);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; }
        .leaflet-control-attribution { font-size: 9px !important; }
        .user-dot {
          width: 18px; height: 18px; border-radius: 50%;
          background: #0D9488; border: 3px solid #fff;
          box-shadow: 0 0 0 5px rgba(13,148,136,0.22);
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const map = L.map('map', { zoomControl: false, attributionControl: true })
          .setView([${center[0]}, ${center[1]}], ${zoom});

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        const markersData = ${JSON.stringify(markers)};
        markersData.forEach(m => {
          L.marker(m.latLng).addTo(map).bindPopup(m.title);
        });

        let userMarker = null;
        window.__setUserLocation = function(lat, lng) {
          if (userMarker) {
            userMarker.setLatLng([lat, lng]);
          } else {
            const icon = L.divIcon({
              className: '',
              html: '<div class="user-dot"></div>',
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            });
            userMarker = L.marker([lat, lng], { icon }).addTo(map);
          }
        };

        window.__recenter = function(lat, lng, z) {
          map.setView([lat, lng], z || map.getZoom(), { animate: true });
        };

        map.on('click', function(e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'mapClick',
            lat: e.latlng.lat,
            lng: e.latlng.lng
          }));
        });
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapClick' && onMapClick) {
        onMapClick({ lat: data.lat, lng: data.lng });
      }
    } catch (err) {
      // ignore
    }
  };

  return (
    <WebView
      ref={webRef}
      originWhitelist={['*']}
      source={{ html }}
      onMessage={handleMessage}
      style={{ flex: 1 }}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      scrollEnabled={false}
    />
  );
}
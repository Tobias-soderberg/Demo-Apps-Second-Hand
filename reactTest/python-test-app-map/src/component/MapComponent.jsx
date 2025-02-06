import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import axios from "axios";

const MapComponent = ({ city, radius }) => {
  const [stores, setStores] = useState([]); // Stores fetched from API
  const [cityCoords, setCityCoords] = useState([59.3293, 18.0686]); // Default coordinates for Stockholm
  const [loading, setLoading] = useState(false); // Loading state for API requests
  const mapRef = useRef(null); // Reference for the map instance
  const markersRef = useRef(null); // Reference for marker cluster group

  // Fetch stores when city or radius changes
  useEffect(() => {
    if (!city) return; // Do nothing if city is not provided

    console.log(`Fetching data for: ${city} with radius: ${radius} meters`);
    setLoading(true);

    axios
      .get(`http://127.0.0.1:8000/api/stores/${city}?radius=${radius}`)
      .then((res) => {
        const data = res.data || [];
        console.log("API Response:", data);
        const extractedStores = data.stores?.elements || [];
        setStores(extractedStores);

        // Update map center if valid coordinates are received
        if (data.latitude > -90) {
          setCityCoords([data.latitude, data.longitude]);
          console.log(
            `Centering map on first store at: ${data.latitude}, ${data.longitude}`
          );
        }
      })
      .catch((err) => console.error("Error fetching data:", err))
      .finally(() => setLoading(false)); // Stop loading after request completes
  }, [city, radius]);

  // Initialize the map on first render
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView(cityCoords, 10);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
        mapRef.current
      );
      markersRef.current = L.markerClusterGroup({
        maxClusterRadius: 20, // Smaller values mean fewer clustered markers
        disableClusteringAtZoom: 13, // Stop clustering at higher zoom levels
      });
      mapRef.current.addLayer(markersRef.current);
    }
  }, []);

  // Update markers whenever the stores data changes
  useEffect(() => {
    if (!mapRef.current) return;

    console.log("Adding markers for stores:", stores);

    if (stores.length > 0) {
      mapRef.current.setView(
        [cityCoords[0], cityCoords[1]],
        radius > 15000 ? 9 : 10 // Adjust zoom level based on radius
      );
    }

    if (!markersRef.current) return;
    markersRef.current.clearLayers(); // Clear previous markers

    // Add new markers to the map
    stores.forEach((store) => {
      if (store.lat && store.lon) {
        const marker = L.marker([store.lat, store.lon]).bindPopup(
          `<b>${store.tags.name || "Unnamed Store"}</b><br/>
           📍 ${store.tags["addr:street"] || "No address available"}<br/>
           ⏰ ${store.tags.opening_hours || "No hours available"}<br/>
           🌍 <a href="${store.tags.website || "#"}" target="_blank">${
            store.tags.website ? "Visit website" : "No webpage"
          }</a>`
        );

        markersRef.current.addLayer(marker);
      }
    });
  }, [stores]);

  return (
    <div style={{ textAlign: "center" }}>
      {/* Loading modal to indicate API request in progress */}
      {loading && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      )}

      {/* Map container */}
      <div id="map" style={{ height: "700px", width: "700px" }}></div>
    </div>
  );
};

export default MapComponent;

import React, { useState } from "react";
import MapComponent from "./component/MapComponent";

function App() {
  const [searchInput, setSearchInput] = useState("Stockholm");
  const [city, setCity] = useState("Stockholm");
  const [searchRadius, setSearchRadius] = useState(5000); // User input (temporary)
  const [radius, setRadius] = useState(5000); // Applied radius

  const handleSearch = () => {
    setCity(searchInput); // Apply the searched city
    setRadius(searchRadius); // Apply the selected radius
  };

  return (
    <div className="page">
      <div className="content">
        <h1>Second-Hand Store Finder</h1>

        {/* City Label */}
        <label className="mb-3">
          <strong>Current City: </strong>
          {city}
        </label>
        <br />
        <br />

        {/* Search Input */}
        <input
          className="mb-3"
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Enter a city"
        />

        <br />

        {/* Radius Selection */}
        <label className="mb-3">
          <strong>Search Radius (km): </strong>
        </label>
        <input
          className="mb-3"
          type="range"
          min="5"
          max="50"
          step="1"
          value={searchRadius / 1000} // Convert meters to km
          onChange={(e) => setSearchRadius(e.target.value * 1000)} // Convert km to meters
        />
        <span> {searchRadius / 1000} km</span>

        <br />

        <button className="mb-3 search-button" onClick={handleSearch}>
          Search
        </button>

        {/* Pass city & radius to MapComponent */}
        <div className="map">
          <MapComponent city={city} radius={radius} />
        </div>
      </div>
    </div>
  );
}

export default App;

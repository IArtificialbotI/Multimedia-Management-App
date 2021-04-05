import { useRef, useEffect } from "react";
import { Icon } from "leaflet";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./LocationMap.css";

//TODO: update real location & icon for marker
const LocationMap = ({ categories, onCategorySelected }) => {
  const mapRef = useRef(null);

  const handleOnClicked = (id) => () => {
    onCategorySelected(id);
  };

  useEffect(() => {
    if (categories.length > 0) {
      if (mapRef && mapRef.current) {
        const newCenter = [categories[0].lat, categories[0].lon];
        mapRef.current.setView(newCenter, mapRef.current.getZoom());
        console.log("setView", newCenter, mapRef.current.getZoom());
      }
    }
  }, [categories]);

  return (
    <div className="location-map-container">
      <MapContainer
        center={[51.505, -0.091]}
        zoom={3}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
        }}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {categories.map((category, index) => {
          return (
            <Marker
              key={category.previewPath + index}
              position={[category.lat, category.lon]}
              icon={
                new Icon({
                  iconUrl: categories[index].previewPath,
                  iconSize: [50, 50],
                })
              }
              eventHandlers={{
                click: handleOnClicked(index),
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
};

export default LocationMap;

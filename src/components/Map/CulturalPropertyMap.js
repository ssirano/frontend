import React, { useEffect, useState } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import axios from 'axios';

const CulturalPropertyMap = () => {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get('/api/cultural-properties/list');
        setProperties(response.data);
      } catch (error) {
        console.error('Failed to fetch cultural properties:', error);
      }
    };
    fetchProperties();
  }, []);

  return (
    <Map
      center={{ lat: 37.566826, lng: 126.9786567 }}
      style={{ width: '100%', height: '400px' }}
      level={8}
      apiKey={process.env.REACT_APP_KAKAO_MAPS_API_KEY}
    >
      {properties.map((property) => (
        <MapMarker
          key={property._id}
          position={{
            lat: property.location.coordinates[1],
            lng: property.location.coordinates[0],
          }}
          clickable={true}
          onClick={() => alert(property.name)}
        />
      ))}
    </Map>
  );
};

export default CulturalPropertyMap;

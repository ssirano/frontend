import React, { useState, useEffect } from 'react';
import { fetchCulturalProperties } from '../services/api';

const CulturalPropertyList = () => {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const loadProperties = async () => {
      const data = await fetchCulturalProperties();
      setProperties(data);
    };
    loadProperties();
  }, []);

  return (
    <div>
      <h1>문화재 목록</h1>
      <ul>
        {properties.map((property) => (
          <li key={property._id}>
            <h3>{property.name}</h3>
            <p>{property.description}</p>
            <img src={property.imageUrl} alt={property.name} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CulturalPropertyList;

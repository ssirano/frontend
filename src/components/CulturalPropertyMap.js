// CulturalPropertyMap.js

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Map, MapMarker, MapInfoWindow } from 'react-kakao-maps-sdk';
import debounce from 'lodash/debounce';
import ReactEcharts from 'echarts-for-react';
import ChatButton from './ChatButton';
import ChatModal from './ChatModal';

const CulturalPropertyMap = ({ token, setToken }) => {
  console.log('Token in CulturalPropertyMap:', token);
  const [markers, setMarkers] = useState([]);
  const [map, setMap] = useState(null);
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [center, setCenter] = useState({ lat: 37.566826, lng: 126.9786567 });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [chatParticipants, setChatParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [tokenExpirationTime, setTokenExpirationTime] = useState(null);
  const [shouldReconnect, setShouldReconnect] = useState(false);

  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);

  const wsRef = useRef(null);

  const decodeToken = useCallback((token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (token) {
      const decodedToken = decodeToken(token);
      if (decodedToken) {
        setUserId(decodedToken.id);
        setUsername(decodedToken.username);
      }
    }
  }, [token, decodeToken]);

  const checkTokenExpiration = useCallback(() => {
    if (token) {
      const decodedToken = decodeToken(token);
      if (decodedToken && decodedToken.exp) {
        const expirationTime = decodedToken.exp * 1000;
        setTokenExpirationTime(expirationTime);

        const currentTime = Date.now();
        const timeUntilExpiration = expirationTime - currentTime;

        if (timeUntilExpiration > 0) {
          setTimeout(
            () => {
              console.log('Token is about to expire. Refreshing...');
              setShouldReconnect(true);
            },
            timeUntilExpiration - 5 * 60 * 1000
          );
        } else {
          console.log('Token has expired. Reconnecting...');
          setShouldReconnect(true);
        }
      } else {
        console.error('Invalid token structure');
      }
    }
  }, [token, decodeToken]);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = process.env.REACT_APP_WS_PORT || '5003';

    let wsUrl;
    if (process.env.REACT_APP_WS_URL) {
      wsUrl = process.env.REACT_APP_WS_URL;
    } else {
      wsUrl = `${protocol}//${host}:${port}/ws`;
    }

    console.log('Attempting to connect to WebSocket:', wsUrl);
    console.log('Token used in WebSocket connection:', token);

    const tokenParam = token ? `?token=${encodeURIComponent(token)}` : '';
    const socket = new WebSocket(`${wsUrl}${tokenParam}`);

    socket.onopen = () => {
      console.log('WebSocket connection established');
      checkTokenExpiration();
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received message:', data);
      if (data.type === 'chat') {
        if (!isChatOpen && data.userId !== userId) {
          setUnreadMessages((prev) => prev + 1);
        }
        const messageData = {
          ...data,
          username: data.userId === userId ? 'You' : data.username,
        };
        setMessages((prevMessages) => [...prevMessages, messageData]);
      } else if (data.type === 'participants') {
        setChatParticipants(data.participants);
      } else if (data.type === 'newToken') {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        checkTokenExpiration();
      }
    };

    socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      setTimeout(() => setShouldReconnect(true), 5000);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = socket;
  }, [token, isChatOpen, setToken, checkTokenExpiration, userId]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  useEffect(() => {
    if (shouldReconnect) {
      connectWebSocket();
      setShouldReconnect(false);
    }
  }, [shouldReconnect, connectWebSocket]);

  const fetchMarkers = useMemo(
    () =>
      debounce(async (mapInstance) => {
        if (!mapInstance) return;

        const bounds = mapInstance.getBounds();
        const swLatLng = bounds.getSouthWest();
        const neLatLng = bounds.getNorthEast();
        const level = mapInstance.getLevel();

        console.log('Current zoom level:', level);

        if (level >= 9) {
          setMarkers([]);
          return;
        }

        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5003';
        const url = `${apiUrl}/api/cultural-properties/list?swLat=${swLatLng.getLat()}&swLng=${swLatLng.getLng()}&neLat=${neLatLng.getLat()}&neLng=${neLatLng.getLng()}&level=${level}`;

        try {
          const response = await fetch(url);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              `HTTP error! status: ${response.status}, message: ${errorData.message}`
            );
          }
          const data = await response.json();
          console.log('Fetched data:', data);
          setMarkers(data);
        } catch (error) {
          console.error('Error fetching markers:', error);
          setMarkers([]);
        }
      }, 300),
    []
  );

  useEffect(() => {
    if (map) {
      const handleZoomChanged = () => {
        const currentLevel = map.getLevel();
        console.log('Zoom changed. New level:', currentLevel);
        fetchMarkers(map);
      };

      const handleDragEnd = () => {
        fetchMarkers(map);
      };

      map.addListener('zoom_changed', handleZoomChanged);
      map.addListener('dragend', handleDragEnd);

      fetchMarkers(map);

      return () => {
        map.removeListener('zoom_changed', handleZoomChanged);
        map.removeListener('dragend', handleDragEnd);
      };
    }
  }, [map, fetchMarkers]);

  useEffect(() => {
    if (map) {
      fetchMarkers(map);
    }
  }, [center, map, fetchMarkers]);

  const searchCulturalProperties = async () => {
    if (!searchKeyword.trim()) return;

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5003';
      const url = new URL(`${apiUrl}/api/cultural-properties/search`);
      url.searchParams.append('keyword', searchKeyword.trim());

      console.log('Searching with URL:', url.toString());

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching cultural properties:', error);
      alert('문화재 검색에 실패했습니다. 콘솔을 확인하세요.');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchCulturalProperties();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchCulturalProperties();
    }
  };

  const handleResultClick = (result) => {
    setCenter({
      lat: result.location.coordinates[1],
      lng: result.location.coordinates[0],
    });
    setSearchResults([]);
    setSearchKeyword('');
    setHoveredMarker(result);
  };

  const processChartData = (markersData) => {
    const typeCount = {};
    const periodCount = {};

    markersData.forEach((marker) => {
      if (marker.type) {
        typeCount[marker.type] = (typeCount[marker.type] || 0) + 1;
      }
      if (marker.period) {
        periodCount[marker.period] = (periodCount[marker.period] || 0) + 1;
      }
    });

    const types = Object.keys(typeCount);
    const typeValues = Object.values(typeCount);

    const periods = Object.keys(periodCount);
    const periodValues = Object.values(periodCount);

    return { types, typeValues, periods, periodValues };
  };

  const chartData = processChartData(markers);

  const typePieOption = {
    title: {
      text: '문화재 유형별 분포',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: '유형',
        type: 'pie',
        radius: '50%',
        data: chartData.types.map((type, index) => ({
          value: chartData.typeValues[index],
          name: type,
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  const periodBarOption = {
    title: {
      text: '문화재 시기별 분포',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: chartData.periods,
      axisLabel: {
        rotate: 45,
        interval: 0,
      },
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '시기',
        type: 'bar',
        data: chartData.periodValues,
        itemStyle: {
          color: '#5470C6',
        },
      },
    ],
  };

  const handleChatOpen = () => {
    setIsChatOpen(true);
    setUnreadMessages(0);
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
  };

  const handleSendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const messageData = { type: 'chat', message };
      wsRef.current.send(JSON.stringify(messageData));
      // 메시지를 상태에 추가하지 않습니다.
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="문화재 검색..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button type="submit">검색</button>
      </form>
      {searchResults.length > 0 && (
        <ul>
          {searchResults.map((result) => (
            <li key={result._id} onClick={() => handleResultClick(result)}>
              {result.name}
            </li>
          ))}
        </ul>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
        <div style={{ width: '45%', height: '400px' }}>
          <ReactEcharts option={typePieOption} style={{ height: '100%', width: '100%' }} />
        </div>
        <div style={{ width: '45%', height: '400px' }}>
          <ReactEcharts option={periodBarOption} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>
      <Map
        center={center}
        style={{ width: '100%', height: '400px', marginTop: '20px' }}
        level={7}
        onCreate={setMap}
      >
        {markers.map((marker) => (
          <React.Fragment key={marker._id}>
            <MapMarker
              position={{
                lat: marker.location.coordinates[1],
                lng: marker.location.coordinates[0],
              }}
              onClick={() => setHoveredMarker(marker)}
            />
            {hoveredMarker && hoveredMarker._id === marker._id && (
              <MapInfoWindow
                position={{
                  lat: marker.location.coordinates[1],
                  lng: marker.location.coordinates[0],
                }}
                onClose={() => setHoveredMarker(null)}
              >
                <div style={{ padding: '5px' }}>
                  <h4>{marker.name}</h4>
                  <p>유형: {marker.type}</p>
                  <p>시기: {marker.period}</p>
                </div>
              </MapInfoWindow>
            )}
          </React.Fragment>
        ))}
      </Map>
      <ChatButton onClick={handleChatOpen} unreadCount={unreadMessages} />
      <ChatModal
        isOpen={isChatOpen}
        onClose={handleChatClose}
        participants={chatParticipants}
        messages={messages}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default CulturalPropertyMap;

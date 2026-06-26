import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const ymaps: any;

interface YandexCityMapProps {
  fullAddress: string;
  placeName?: string;
  zoom?: number;
  height?: string | number;
}


const YandexCityMap: React.FC<YandexCityMapProps> = ({
  fullAddress,
  placeName = 'Дом',
  zoom = 15,
  height = '350px'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

const geocodeAddress = async (address: string) => {
    const encoded = encodeURIComponent(address);
    const response = await fetch(`http://localhost:5213/api/houses/geocode?address=${encoded}`);
    const data = await response.json();
    const geoObject = data?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
    if (!geoObject) return null;
    const pos = geoObject.Point.pos.split(' ');
    const coords: [number, number] = [parseFloat(pos[1]), parseFloat(pos[0])];
    const name = geoObject.name || address;
    return { coords, name };
};

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      try {
        if (typeof ymaps === 'undefined') {
          setError('API Яндекс.Карт не загружен');
          setLoading(false);
          return;
        }
        await ymaps.ready();

        if (!fullAddress || fullAddress === 'Адрес не указан') {
          setError('Адрес не указан');
          setLoading(false);
          return;
        }

        let result = await geocodeAddress(fullAddress);
        if (!result && fullAddress.includes(',')) {
          const parts = fullAddress.split(',');
          const withoutHouse = parts[0] + (parts[1] ? ',' + parts[1].replace(/\d+$/, '').trim() : '');
          if (withoutHouse !== fullAddress) {
            result = await geocodeAddress(withoutHouse);
          }
        }
        if (!result) {
          const cityMatch = fullAddress.match(/^([^,]+)/);
          const city = cityMatch ? cityMatch[1] : fullAddress;
          result = await geocodeAddress(city);
        }
        if (!result) {
          setError(`Не удалось найти адрес: ${fullAddress}`);
          setLoading(false);
          return;
        }

        const { coords, name } = result;

        const map = new ymaps.Map(mapRef.current, {
          center: coords,
          zoom: zoom,
          controls: ['zoomControl', 'fullscreenControl'],
        });

        const placemark = new ymaps.Placemark(coords, {
          balloonContent: `<div><strong>${placeName}</strong><br/>${name}</div>`,
          hintContent: placeName,
        });

        map.geoObjects.add(placemark);
        placemark.balloon.open();

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Не удалось загрузить карту');
        setLoading(false);
      }
    };

    initMap();
  }, [fullAddress, zoom, placeName]);

  return (
    <div style={{ position: 'relative', width: '100%', height: typeof height === 'number' ? `${height}px` : height, borderRadius: '12px', overflow: 'hidden' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      {loading && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#F0F7F4', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <FontAwesomeIcon icon={faSpinner} spin />
          <span>Загрузка карты...</span>
        </div>
      )}
      {error && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#F0F7F4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', textAlign: 'center' }}>
          <FontAwesomeIcon icon={faMapMarkerAlt} style={{ fontSize: '32px', opacity: 0.5 }} />
          <p style={{ margin: 0, color: '#2D6A4F' }}>{error}</p>
          <small>Проверьте правильность написания улицы</small>
        </div>
      )}
    </div>
  );
};

export default YandexCityMap;
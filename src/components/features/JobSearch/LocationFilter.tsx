import { useEffect, useRef, useState } from 'react';
import { Button, Input, Select } from 'antd';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { MdGpsFixed, MdLocationOn } from 'react-icons/md';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/* Fix Leaflet default marker icons when bundled with webpack */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
	iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
	iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
	shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const COUNTRIES = [
	'Afghanistan','Albania','Algeria','Argentina','Australia','Austria','Bangladesh',
	'Belgium','Brazil','Cambodia','Canada','Chile','China','Colombia','Croatia',
	'Czech Republic','Denmark','Egypt','Ethiopia','Finland','France','Germany',
	'Ghana','Greece','Hungary','India','Indonesia','Iran','Iraq','Ireland',
	'Israel','Italy','Japan','Jordan','Kenya','South Korea','Kuwait','Lebanon',
	'Malaysia','Mexico','Morocco','Netherlands','New Zealand','Nigeria','Norway',
	'Pakistan','Peru','Philippines','Poland','Portugal','Romania','Russia',
	'Saudi Arabia','Singapore','South Africa','Spain','Sri Lanka','Sweden',
	'Switzerland','Taiwan','Thailand','Turkey','Uganda','Ukraine',
	'United Arab Emirates','United Kingdom','United States','Vietnam',
].map((c) => ({ value: c, label: c }));

function MapUpdater({ center }: { center: [number, number] }) {
	const map = useMap();
	useEffect(() => {
		map.setView(center, 11, { animate: true });
	}, [center, map]);
	return null;
}

interface Props {
	onChange?: (country: string, city: string) => void;
}

export function LocationFilter({ onChange }: Props) {
	const [country, setCountry] = useState('');
	const [city, setCity] = useState('');
	const [coords, setCoords] = useState<[number, number] | null>(null);
	const [geoLoading, setGeoLoading] = useState(false);
	const [geoError, setGeoError] = useState('');
	const cityDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

	const geocodeForward = async (cityVal: string, countryVal: string) => {
		if (!cityVal.trim()) return;
		try {
			const q = countryVal ? `${cityVal}, ${countryVal}` : cityVal;
			const res = await fetch(
				`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
				{ headers: { 'Accept-Language': 'en' } }
			);
			const data = await res.json();
			if (data[0]) {
				setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
			}
		} catch (err) {
			console.warn('Forward geocode failed', err);
		}
	};

	const handleCityChange = (val: string) => {
		setCity(val);
		if (cityDebounce.current) clearTimeout(cityDebounce.current);
		cityDebounce.current = setTimeout(() => {
			geocodeForward(val, country);
			onChange?.(country, val);
		}, 700);
	};

	const handleCountryChange = (val: string) => {
		setCountry(val);
		setCity('');
		setCoords(null);
		onChange?.(val, '');
	};

	const handleUseLocation = () => {
		if (!navigator.geolocation) {
			setGeoError('Geolocation is not supported by your browser.');
			return;
		}
		setGeoLoading(true);
		setGeoError('');
		navigator.geolocation.getCurrentPosition(
			async (pos) => {
				const { latitude, longitude } = pos.coords;
				setCoords([latitude, longitude]);
				try {
					const res = await fetch(
						`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
						{ headers: { 'Accept-Language': 'en' } }
					);
					const data = await res.json();
					const detectedCountry = data.address?.country ?? '';
					const detectedCity =
						data.address?.city ??
						data.address?.town ??
						data.address?.village ??
						data.address?.county ??
						'';
					setCountry(detectedCountry);
					setCity(detectedCity);
					onChange?.(detectedCountry, detectedCity);
				} catch (err) {
					console.warn('Reverse geocode failed', err);
				}
				setGeoLoading(false);
			},
			() => {
				setGeoError('Location access denied. Please allow it in your browser.');
				setGeoLoading(false);
			},
			{ timeout: 10000 }
		);
	};

	const handleClear = () => {
		setCountry('');
		setCity('');
		setCoords(null);
		setGeoError('');
		onChange?.('', '');
	};

	return (
		<div className="loc-filter">
			<div className="loc-filter-head">
				<MdLocationOn className="loc-filter-head-icon" size={15} />
				<span>Location</span>
				{(country || city) && (
					<button type="button" className="loc-filter-clear" onClick={handleClear}>
						Clear
					</button>
				)}
			</div>

			<div className="loc-filter-fields">
				<Select
					size="small"
					placeholder="Country"
					value={country || undefined}
					onChange={handleCountryChange}
					showSearch
					optionFilterProp="label"
					options={COUNTRIES}
					style={{ width: '100%' }}
					className="loc-filter-select"
					allowClear
					onClear={() => handleCountryChange('')}
				/>

				<Input
					size="small"
					placeholder="City"
					value={city}
					onChange={(e) => handleCityChange(e.target.value)}
					className="loc-filter-city-input"
					allowClear
				/>
			</div>

			<button
				type="button"
				className={`loc-use-location-btn${geoLoading ? ' loading' : ''}`}
				onClick={handleUseLocation}
				disabled={geoLoading}
			>
				<MdGpsFixed size={14} className="loc-gps-icon" />
				{geoLoading ? 'Detecting location…' : 'Use my current location'}
			</button>

			{geoError && <p className="loc-filter-error">{geoError}</p>}

			<div className="loc-map-wrap">
				<MapContainer
					center={[20.5937, 78.9629]}
					zoom={4}
					style={{ height: '100%', width: '100%' }}
					zoomControl={false}
					scrollWheelZoom={false}
					dragging={false}
					attributionControl={true}
				>
					<TileLayer
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
				/>
					{coords && <Marker position={coords} />}
					{coords && <MapUpdater center={coords} />}
				</MapContainer>
				{(city || country) && (
					<div className="loc-map-label">
						{[city, country].filter(Boolean).join(', ')}
					</div>
				)}
			</div>
		</div>
	);
}

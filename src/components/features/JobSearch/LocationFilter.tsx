import { useEffect, useRef, useState } from 'react';
import { Input, Select } from 'antd';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import {
	MdGpsFixed, MdLocationOn, MdAdd, MdRemove,
	MdLayers, MdFullscreen, MdFullscreenExit,
} from 'react-icons/md';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MOCK_JOBS } from './jobSearchMock';

/* ── Fix Leaflet marker icons ── */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
	iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
	iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
	shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/* ── Marker icons ── */
const DOT_MARKER = L.divIcon({
	className: '',
	html: `<div style="width:16px;height:16px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#22d3ee);border:3px solid #fff;box-shadow:0 2px 10px rgba(99,102,241,0.55),0 0 0 3px rgba(99,102,241,0.18)"></div>`,
	iconSize: [16, 16], iconAnchor: [8, 8],
});

const jobMarker = (hue: number) => L.divIcon({
	className: '',
	html: `<div style="width:20px;height:20px;border-radius:5px;background:hsl(${hue},65%,52%);border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:#fff;font-family:sans-serif;">J</div>`,
	iconSize: [20, 20], iconAnchor: [10, 10],
});

/* ── Tile layers ── */
type TileStyle = 'street' | 'satellite' | 'dark';
const TILES: Record<TileStyle, { url: string; label: string; sub?: string }> = {
	street:    { url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',  label: 'Street',    sub: 'abcd' },
	satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', label: 'Satellite' },
	dark:      { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',            label: 'Dark',      sub: 'abcd' },
};
const TILE_ORDER: TileStyle[] = ['street', 'satellite', 'dark'];
const TILE_ICONS: Record<TileStyle, string> = { street: '🗺', satellite: '🛰', dark: '🌙' };

/* ── Known city coords for job pins ── */
const CITY_COORDS: Record<string, [number, number]> = {
	'Bengaluru':     [12.9716,  77.5946],
	'Bangalore':     [12.9716,  77.5946],
	'Dublin':        [53.3498,  -6.2603],
	'San Francisco': [37.7749, -122.4194],
	'New York':      [40.7128,  -74.0060],
	'London':        [51.5074,   -0.1278],
	'Mumbai':        [19.0760,  72.8777],
	'Delhi':         [28.6139,  77.2090],
	'Hyderabad':     [17.3850,  78.4867],
	'Chennai':       [13.0827,  80.2707],
	'Pune':          [18.5204,  73.8567],
	'Singapore':     [ 1.3521, 103.8198],
	'Sydney':        [-33.8688, 151.2093],
	'Tokyo':         [35.6762, 139.6503],
	'Berlin':        [52.5200,  13.4050],
	'Paris':         [48.8566,   2.3522],
	'Toronto':       [43.6532,  -79.3832],
};

/* ── Countries list ── */
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

/* ── Geocode ── */
async function geocodePlace(city: string, countryVal: string): Promise<{ coords: [number, number]; zoom: number } | null> {
	const hasCity = city.trim().length > 0;
	const hasCtry = countryVal.trim().length > 0;
	if (!hasCity && !hasCtry) return null;
	try {
		const q = hasCity ? (hasCtry ? `${city}, ${countryVal}` : city) : countryVal;
		const res  = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`, { headers: { 'Accept-Language': 'en' } });
		const data = await res.json();
		if (!data[0]) return null;
		const lat = parseFloat(data[0].lat), lon = parseFloat(data[0].lon);
		let zoom = hasCity ? 11 : 5;
		if (!hasCity) {
			const bb: number[] | undefined = data[0].boundingbox?.map(Number);
			if (bb) {
				const span = Math.max(Math.abs(bb[1] - bb[0]), Math.abs(bb[3] - bb[2]));
				zoom = span > 40 ? 4 : span > 20 ? 5 : span > 10 ? 6 : 7;
			}
		} else if (data[0].type === 'suburb' || data[0].type === 'neighbourhood') zoom = 13;
		return { coords: [lat, lon], zoom };
	} catch { return null; }
}

/* ── Map helpers ── */
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
	const map = useMap();
	useEffect(() => { map.setView(center, zoom, { animate: true, duration: 0.8 }); }, [center, zoom, map]);
	return null;
}

/* ── Click-to-select location ── */
function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
	useMapEvents({
		click(e) { onPick(e.latlng.lat, e.latlng.lng); },
	});
	return null;
}

function ZoomControls() {
	const map = useMap();
	return (
		<div className="loc-zoom-controls">
			<button type="button" className="loc-zoom-btn" aria-label="Zoom in"  onClick={() => map.zoomIn()}><MdAdd size={15} /></button>
			<div className="loc-zoom-divider" />
			<button type="button" className="loc-zoom-btn" aria-label="Zoom out" onClick={() => map.zoomOut()}><MdRemove size={15} /></button>
		</div>
	);
}

/* ── Main component ── */
interface Props { onChange?: (country: string, city: string) => void; }

export function LocationFilter({ onChange }: Props) {
	const [country,    setCountry]    = useState('');
	const [city,       setCity]       = useState('');
	const [view,       setView]       = useState<{ coords: [number, number]; zoom: number } | null>(null);
	const [geoLoading, setGeoLoading] = useState(false);
	const [geoError,   setGeoError]   = useState('');
	const [tileStyle,  setTileStyle]  = useState<TileStyle>('street');
	const [expanded,   setExpanded]   = useState(false);
const [pickLoading,  setPickLoading]  = useState(false);
	const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

	const handleMapPick = async (lat: number, lng: number) => {
		setView({ coords: [lat, lng], zoom: 12 });
		setPickLoading(true);
		try {
			const res  = await fetch(
				`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
				{ headers: { 'Accept-Language': 'en' } },
			);
			const data = await res.json();
			const c  = data.address?.country ?? '';
			const ci = data.address?.city ?? data.address?.town ?? data.address?.village ?? data.address?.county ?? '';
			setCountry(c);
			setCity(ci);
			onChange?.(c, ci);
		} catch (_) { /* ignore */ }
		setPickLoading(false);
	};

	const resolveView = async (c: string, ctry: string) => {
		const r = await geocodePlace(c, ctry);
		if (r) setView(r);
	};

	const handleCityChange = (val: string) => {
		setCity(val);
		if (debounce.current) clearTimeout(debounce.current);
		debounce.current = setTimeout(() => { resolveView(val, country); onChange?.(country, val); }, 700);
	};

	const handleCountryChange = (val: string) => {
		setCountry(val || ''); setCity('');
		if (debounce.current) clearTimeout(debounce.current);
		debounce.current = setTimeout(() => { if (val) resolveView('', val); else setView(null); onChange?.(val || '', ''); }, 300);
	};

	const handleUseLocation = () => {
		if (!navigator.geolocation) { setGeoError('Geolocation not supported.'); return; }
		setGeoLoading(true); setGeoError('');
		navigator.geolocation.getCurrentPosition(
			async ({ coords: { latitude, longitude } }) => {
				setView({ coords: [latitude, longitude], zoom: 12 });
				try {
					const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, { headers: { 'Accept-Language': 'en' } });
					const data = await res.json();
					const c  = data.address?.country ?? '';
					const ci = data.address?.city ?? data.address?.town ?? data.address?.village ?? '';
					setCountry(c); setCity(ci); onChange?.(c, ci);
				} catch (_) { /* optional */ }
				setGeoLoading(false);
			},
			() => { setGeoError('Location access denied.'); setGeoLoading(false); },
			{ timeout: 10000 },
		);
	};

	const handleClear = () => { setCountry(''); setCity(''); setView(null); setGeoError(''); onChange?.('', ''); };

	const cycleTile = () => {
		const i = TILE_ORDER.indexOf(tileStyle);
		setTileStyle(TILE_ORDER[(i + 1) % TILE_ORDER.length]);
	};

	/* Job pins — only for cities with known coords */
	const jobPins = MOCK_JOBS.filter(j => j.location in CITY_COORDS);

	const mapCenter: [number, number] = view?.coords ?? [22.5, 80.0];
	const mapZoom   = view?.zoom ?? 4;
	const tile      = TILES[tileStyle];

	return (
		<div className="loc-filter">
			<div className="loc-filter-head">
				<MdLocationOn className="loc-filter-head-icon" size={15} />
				<span>Location</span>
				{(country || city) && <button type="button" className="loc-filter-clear" onClick={handleClear}>Clear</button>}
			</div>

			<div className="loc-filter-fields">
				<Select size="small" placeholder="Country" value={country || undefined} onChange={handleCountryChange}
					showSearch optionFilterProp="label" options={COUNTRIES} style={{ width: '100%' }}
					className="loc-filter-select" allowClear onClear={() => handleCountryChange('')} />
				<Input size="small" placeholder="City" value={city} onChange={(e) => handleCityChange(e.target.value)}
					className="loc-filter-city-input" allowClear />
			</div>

			<button type="button" className={`loc-use-location-btn${geoLoading ? ' loading' : ''}`}
				onClick={handleUseLocation} disabled={geoLoading}>
				<MdGpsFixed size={14} className="loc-gps-icon" />
				{geoLoading ? 'Detecting location…' : 'Use my current location'}
			</button>

			{geoError && <p className="loc-filter-error">{geoError}</p>}

			{/* Map toolbar */}
			<div className="loc-map-toolbar">
				<button type="button" className="loc-tool-btn" onClick={cycleTile} title="Switch map style">
					<MdLayers size={13} />
					<span>{TILE_ICONS[tileStyle]} {tile.label}</span>
				</button>
				<button type="button" className="loc-tool-btn" onClick={() => setExpanded(p => !p)} title={expanded ? 'Collapse map' : 'Expand map'}>
					{expanded ? <MdFullscreenExit size={13} /> : <MdFullscreen size={13} />}
				</button>
			</div>

<div className={`loc-map-wrap${expanded ? ' loc-map-wrap--expanded' : ''}`}>
				<MapContainer center={mapCenter} zoom={mapZoom}
					style={{ height: '100%', width: '100%' }}
					zoomControl={false} scrollWheelZoom dragging attributionControl={false}>

					<TileLayer key={tileStyle} url={tile.url} subdomains={tile.sub ?? 'abc'} maxZoom={19} />

					{/* Job pins */}
					{jobPins.map(job => (
						<Marker key={job.id} position={CITY_COORDS[job.location]} icon={jobMarker(job.logoHue)}>
							<Popup className="loc-job-popup">
								<div className="loc-job-popup-inner">
									<strong>{job.title}</strong>
									<span>{job.company}</span>
									<span className="loc-job-popup-loc">📍 {job.location}</span>
								</div>
							</Popup>
						</Marker>
					))}

					{/* User location marker */}
					{view?.coords && <Marker position={view.coords} icon={DOT_MARKER} />}

{view && <MapUpdater center={view.coords} zoom={view.zoom} />}
					<MapClickHandler onPick={handleMapPick} />
					<ZoomControls />
				</MapContainer>

				{/* Bottom label — shows resolved city or a tap hint */}
				<div className="loc-map-label">
					{pickLoading
						? '📍 Resolving location…'
						: (city || country)
							? [city, country].filter(Boolean).join(', ')
							: 'Tap anywhere on the map to pick a location'
					}
				</div>
			</div>
		</div>
	);
}

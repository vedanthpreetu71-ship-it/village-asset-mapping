import { useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { initialAssets } from './data/assets';

const categories = ['All', 'School', 'Hospital', 'Water Tank', 'Road', 'Community Center', 'Park', 'Market'];

const categoryColors = {
  School: '#2563eb', Hospital: '#dc2626', 'Water Tank': '#0ea5e9', Road: '#f59e0b',
  'Community Center': '#8b5cf6', Park: '#16a34a', Market: '#f97316'
};

const defaultForm = { name: '', category: 'School', lat: '12.9716', lng: '77.5946', description: '', status: 'Operational', contact: '' };

function App() {
  const [assets, setAssets] = useState(initialAssets);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAsset, setSelectedAsset] = useState(initialAssets[0]);
  const [formData, setFormData] = useState(defaultForm);

  const filteredAssets = useMemo(() => selectedCategory === 'All' ? assets : assets.filter((asset) => asset.category === selectedCategory), [assets, selectedCategory]);
  const operationalCount = assets.filter((asset) => asset.status === 'Operational').length;
  const repairCount = assets.filter((asset) => asset.status === 'Needs Repair').length;

  const handleSubmit = (event) => {
    event.preventDefault();
    const newAsset = {
      id: Date.now(), name: formData.name.trim(), category: formData.category,
      lat: Number(formData.lat), lng: Number(formData.lng),
      description: formData.description.trim() || 'No description provided',
      status: formData.status, contact: formData.contact.trim() || 'Not available'
    };
    if (!newAsset.name || Number.isNaN(newAsset.lat) || Number.isNaN(newAsset.lng)) return;
    setAssets((current) => [...current, newAsset]);
    setSelectedAsset(newAsset);
    setSelectedCategory('All');
    setFormData(defaultForm);
  };

  return (
    <div className="app-shell">
      <header className="topbar"><p className="eyebrow">Community Resource Tracking</p><h1>Village Asset Mapping System</h1></header>
      <main className="main-layout">
        <section className="panel left-panel">
          <div className="stats-grid">
            <div className="stat-card"><span>Total Assets</span><strong>{assets.length}</strong></div>
            <div className="stat-card green"><span>Operational</span><strong>{operationalCount}</strong></div>
            <div className="stat-card warning"><span>Needs Repair</span><strong>{repairCount}</strong></div>
          </div>
          <div className="filter-group">{categories.map((category) => <button type="button" key={category} className={selectedCategory === category ? 'filter-btn active' : 'filter-btn'} onClick={() => setSelectedCategory(category)}>{category}</button>)}</div>
          <div className="list-panel">{filteredAssets.map((asset) => <button type="button" key={asset.id} className={selectedAsset?.id === asset.id ? 'asset-item selected' : 'asset-item'} onClick={() => setSelectedAsset(asset)}><div className="asset-topline"><span className="dot" style={{ backgroundColor: categoryColors[asset.category] || '#64748b' }} /> <strong>{asset.name}</strong></div><span className="asset-meta">{asset.category} · {asset.status}</span></button>)}</div>
        </section>
        <section className="panel map-panel"><MapContainer center={[12.9716, 77.5946]} zoom={12} scrollWheelZoom className="leaflet-map"><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />{filteredAssets.map((asset) => <CircleMarker key={asset.id} center={[asset.lat, asset.lng]} radius={selectedAsset?.id === asset.id ? 11 : 9} pathOptions={{ color: categoryColors[asset.category] || '#64748b', fillColor: categoryColors[asset.category] || '#64748b', fillOpacity: 0.9 }} eventHandlers={{ click: () => setSelectedAsset(asset) }}><Popup><strong>{asset.name}</strong><p>{asset.category}</p><p>{asset.description}</p></Popup></CircleMarker>)}</MapContainer></section>
        <aside className="panel right-panel">{selectedAsset && <div className="asset-details"><p className="eyebrow">Selected Asset</p><h2>{selectedAsset.name}</h2><span className="badge" style={{ backgroundColor: categoryColors[selectedAsset.category] || '#64748b' }}>{selectedAsset.category}</span><div className="detail-grid"><div><label>Status</label><p>{selectedAsset.status}</p></div><div><label>Contact</label><p>{selectedAsset.contact}</p></div><div><label>Coordinates</label><p>{selectedAsset.lat}, {selectedAsset.lng}</p></div></div><div className="description-box"><label>Description</label><p>{selectedAsset.description}</p></div></div>}
          <form className="asset-form" onSubmit={handleSubmit}><h3>Add New Asset</h3><label>Asset Name<input required name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Sunrise Health Center" /></label><label>Category<select name="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>{categories.slice(1).map((category) => <option key={category}>{category}</option>)}</select></label><div className="inline-fields"><label>Latitude<input required name="lat" value={formData.lat} onChange={(e) => setFormData({ ...formData, lat: e.target.value })} /></label><label>Longitude<input required name="lng" value={formData.lng} onChange={(e) => setFormData({ ...formData, lng: e.target.value })} /></label></div><label>Status<select name="status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}><option>Operational</option><option>Needs Repair</option><option>Under Construction</option></select></label><label>Contact<input name="contact" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} /></label><label>Description<textarea name="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" /></label><button className="submit-btn" type="submit">Add Asset</button></form>
        </aside>
      </main>
    </div>
  );
}

export default App;

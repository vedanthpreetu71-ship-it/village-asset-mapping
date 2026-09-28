import { useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { initialAssets } from './data/assets';

const categories = ['All', 'School', 'Hospital', 'Water Tank', 'Road', 'Community Center', 'Park', 'Market'];

const categoryColors = {
  School: '#2563eb',
  Hospital: '#dc2626',
  'Water Tank': '#0ea5e9',
  Road: '#f59e0b',
  'Community Center': '#8b5cf6',
  Park: '#16a34a',
  Market: '#f97316'
};

const defaultForm = {
  name: '',
  category: 'School',
  lat: '12.9716',
  lng: '77.5946',
  description: '',
  status: 'Operational',
  contact: ''
};

function App() {
  const [assets, setAssets] = useState(initialAssets);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAsset, setSelectedAsset] = useState(initialAssets[0]);
  const [formData, setFormData] = useState(defaultForm);

  const filteredAssets = useMemo(() => {
    if (selectedCategory === 'All') return assets;
    return assets.filter((asset) => asset.category === selectedCategory);
  }, [assets, selectedCategory]);

  const totalCount = assets.length;
  const operationalCount = assets.filter((asset) => asset.status === 'Operational').length;
  const alertCount = assets.filter((asset) => asset.status === 'Needs Repair').length;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const newAsset = {
      id: Date.now(),
      name: formData.name.trim(),
      category: formData.category,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      description: formData.description.trim() || 'No description provided',
      status: formData.status,
      contact: formData.contact.trim() || 'Not available'
    };

    if (!newAsset.name) {
      alert('Please enter the asset name.');
      return;
    }

    const updatedAssets = [...assets, newAsset];
    setAssets(updatedAssets);
    setSelectedAsset(newAsset);
    setSelectedCategory('All');
    setFormData(defaultForm);
  };

  const mapCenter = filteredAssets.length
    ? [filteredAssets[0].lat, filteredAssets[0].lng]
    : [12.9716, 77.5946];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Community Resource Tracking</p>
          <h1>Village Asset Mapping System</h1>
        </div>
      </header>

      <main className="main-layout">
        <section className="panel left-panel">
          <div className="stats-grid">
            <div className="stat-card">
              <span>Total Assets</span>
              <strong>{totalCount}</strong>
            </div>
            <div className="stat-card green">
              <span>Operational</span>
              <strong>{operationalCount}</strong>
            </div>
            <div className="stat-card warning">
              <span>Needs Repair</span>
              <strong>{alertCount}</strong>
            </div>
          </div>

          <div className="filter-group">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={selectedCategory === category ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="list-panel">
            {filteredAssets.map((asset) => (
              <button
                type="button"
                key={asset.id}
                className={selectedAsset?.id === asset.id ? 'asset-item selected' : 'asset-item'}
                onClick={() => setSelectedAsset(asset)}
              >
                <div className="asset-topline">
                  <span className="dot" style={{ backgroundColor: categoryColors[asset.category] || '#64748b' }}></span>
                  <strong>{asset.name}</strong>
                </div>
                <span className="asset-meta">{asset.category}</span>
                <span className="asset-meta">{asset.status}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel map-panel">
          <MapContainer center={mapCenter} zoom={12} scrollWheelZoom className="leaflet-map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredAssets.map((asset) => (
              <CircleMarker
                key={asset.id}
                center={[asset.lat, asset.lng]}
                radius={selectedAsset?.id === asset.id ? 11 : 9}
                pathOptions={{
                  color: categoryColors[asset.category] || '#64748b',
                  fillColor: categoryColors[asset.category] || '#64748b',
                  fillOpacity: 0.9,
                  weight: selectedAsset?.id === asset.id ? 3 : 2
                }}
                eventHandlers={{
                  click: () => setSelectedAsset(asset)
                }}
              >
                <Popup>
                  <div className="popup-card">
                    <strong>{asset.name}</strong>
                    <p>{asset.category}</p>
                    <p>{asset.description}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </section>

        <aside className="panel right-panel">
          {selectedAsset ? (
            <div className="asset-details">
              <p className="eyebrow">Selected Asset</p>
              <h2>{selectedAsset.name}</h2>
              <span className="badge" style={{ backgroundColor: categoryColors[selectedAsset.category] || '#64748b' }}>
                {selectedAsset.category}
              </span>

              <div className="detail-grid">
                <div>
                  <label>Status</label>
                  <p>{selectedAsset.status}</p>
                </div>
                <div>
                  <label>Contact</label>
                  <p>{selectedAsset.contact}</p>
                </div>
                <div>
                  <label>Latitude</label>
                  <p>{selectedAsset.lat}</p>
                </div>
                <div>
                  <label>Longitude</label>
                  <p>{selectedAsset.lng}</p>
                </div>
              </div>

              <div className="description-box">
                <label>Description</label>
                <p>{selectedAsset.description}</p>
              </div>
            </div>
          ) : (
            <p>No asset selected.</p>
          )}

          <form className="asset-form" onSubmit={handleSubmit}>
            <h3>Add New Asset</h3>

            <label>
              Asset Name
              <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Sunrise Health Center" />
            </label>

            <label>
              Category
              <select name="category" value={formData.category} onChange={handleChange}>
                {categories.filter((category) => category !== 'All').map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>

            <div className="inline-fields">
              <label>
                Latitude
                <input name="lat" value={formData.lat} onChange={handleChange} />
              </label>
              <label>
                Longitude
                <input name="lng" value={formData.lng} onChange={handleChange} />
              </label>
            </div>

            <label>
              Status
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="Operational">Operational</option>
                <option value="Needs Repair">Needs Repair</option>
                <option value="Under Construction">Under Construction</option>
              </select>
            </label>

            <label>
              Contact
              <input name="contact" value={formData.contact} onChange={handleChange} placeholder="Phone number or office contact" />
            </label>

            <label>
              Description
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the asset and its purpose"
              />
            </label>

            <button type="submit" className="submit-btn">Add Asset</button>
          </form>
        </aside>
      </main>
    </div>
  );
}

export default App;

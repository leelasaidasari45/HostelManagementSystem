import React, { useState } from 'react';
import { BuildingIcon, Plus, Info, Trash2, Settings2, CheckCircle, Users, MessageSquare, LayoutDashboard, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api';
import OwnerHeader from '../../components/owner/OwnerHeader';
import OwnerSidebar from '../../components/owner/OwnerSidebar';
import './OwnerDashboard.css';

const CreateHostel = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: ''
  });

  const [floorsConfig, setFloorsConfig] = useState([
    { floor: 1, baseRooms: '', baseCapacity: '', rooms: [], generated: false }
  ]);

  const autoGenerateRooms = (floorIndex) => {
    let newFloors = [...floorsConfig];
    const fl = newFloors[floorIndex];

    if (!fl.baseRooms || !fl.baseCapacity) return toast.error("Please enter rooms and beds to generate");

    const count = Number(fl.baseRooms);
    const cap = Number(fl.baseCapacity);
    let genRooms = [];
    for (let i = 1; i <= count; i++) {
      genRooms.push({
        number: `${fl.floor}${i.toString().padStart(2, '0')}`,
        capacity: cap
      });
    }
    fl.rooms = genRooms;
    fl.generated = true;
    setFloorsConfig(newFloors);
    toast.success(`Generated ${count} rooms for Floor ${fl.floor}`);
  };

  const updateRoomCapacity = (floorIndex, roomIndex, newCap) => {
    let newFloors = [...floorsConfig];
    newFloors[floorIndex].rooms[roomIndex].capacity = newCap;
    setFloorsConfig(newFloors);
  };

  const updateFloorField = (index, field, value) => {
    let newFloors = [...floorsConfig];
    newFloors[index][field] = value;
    setFloorsConfig(newFloors);
  };

  const addFloor = () => {
    const nextFloor = floorsConfig.length + 1;
    setFloorsConfig([...floorsConfig, { floor: nextFloor, baseRooms: '', baseCapacity: '', rooms: [], generated: false }]);
  };

  const removeFloor = (index) => {
    if (floorsConfig.length === 1) return toast.error("Must have at least one floor");
    let newFloors = floorsConfig.filter((_, i) => i !== index);
    // Re-index floors
    newFloors.forEach((fl, idx) => { fl.floor = idx + 1; });
    setFloorsConfig(newFloors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const hasUngenerated = floorsConfig.some(f => !f.generated);
    if (hasUngenerated) {
      return toast.error("Please generate room layouts for all floors before saving.");
    }

    setLoading(true);

    try {
      const res = await api.post('/api/owner/hostels', {
        name: formData.name,
        mobile: formData.mobile,
        floorsConfig
      });

      toast.success(res.data.message || 'Hostel successfully created!');
      window.location.href = '/owner/dashboard'; // Force context refresh

    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to create hostel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <OwnerSidebar />

      <main className="dashboard-content fade-in" style={{ padding: '2rem' }}>
        <OwnerHeader 
          title="Create Property" 
          subtitle="Configure new hostel" 
        />

        <div className="glass-panel p-8" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
          <div className="flex items-center gap-4 mb-8">
            <div className="icon-wrapper m-0"><BuildingIcon size={28} /></div>
            <div>
              <h2 className="mb-1">Hostel Builder</h2>
              <p className="text-muted">Design your property layout and room capacities exactly how they are structured.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex-col gap-6">
            {/* Basic Info */}
            <div className="grid gap-4 mb-8 form-grid-2">
              <div className="form-group mb-0">
                <label className="form-label">Hostel Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Prestige Boys Hostel"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group mb-0">
                <label className="form-label">Contact Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.mobile}
                  onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Dynamic Floor Builder */}
            <div className="mb-8">
              <h3 className="mb-4 flex items-center gap-2 border-b border-glass pb-2">
                <Settings2 size={20} color="var(--accent-primary)" /> Property Layout
              </h3>

              <div className="flex-col gap-6">
                {floorsConfig.map((floor, fIndex) => (
                  <div key={fIndex} className="p-5 rounded-2xl slide-up" style={{ 
                    background: '#f1f5f9', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                  }}>
                    <div className="flex justify-between items-center mb-4">
                      <strong className="text-lg text-indigo-600">Floor {floor.floor}</strong>
                      <button type="button" onClick={() => removeFloor(fIndex)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Row Configuration */}
                    {!floor.generated ? (
                      <div className="floor-builder-row">
                        <div className="flex-1 w-full text-slate-700">
                          <label className="form-label text-sm font-semibold">Number of Rooms</label>
                          <input type="number" min="1" className="form-control" style={{ background: '#fff' }} value={floor.baseRooms} onChange={e => updateFloorField(fIndex, 'baseRooms', e.target.value)} placeholder="e.g. 5" />
                        </div>
                        <div className="flex-1 w-full text-slate-700">
                          <label className="form-label text-sm font-semibold">Default Beds per Room</label>
                          <input type="number" min="1" className="form-control" style={{ background: '#fff' }} value={floor.baseCapacity} onChange={e => updateFloorField(fIndex, 'baseCapacity', e.target.value)} placeholder="e.g. 2" />
                        </div>
                        <button type="button" className="btn btn-secondary generate-btn" style={{ background: '#4f46e5', color: 'white' }} onClick={() => autoGenerateRooms(fIndex)}>Generate</button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm font-medium text-emerald-600 flex items-center gap-1"><CheckCircle size={14} /> Layout Ready</span>
                          <button type="button" className="text-xs text-slate-400 font-medium underline cursor-pointer bg-transparent border-none" onClick={() => updateFloorField(fIndex, 'generated', false)}>Reset Floor</button>
                        </div>

                        <div className="rooms-grid gap-3">
                          {floor.rooms.map((room, rIndex) => (
                            <div key={rIndex} className="p-4 rounded-xl text-center flex-col items-center justify-center bg-white shadow-sm border border-slate-100">
                              <span className="font-bold block mb-2 text-indigo-500">Room {room.number}</span>
                              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 font-medium">
                                Beds:
                                <input
                                  type="number"
                                  className="form-control text-center p-1"
                                  style={{ width: '60px', height: '32px', fontSize: '0.9rem', background: '#f8fafc' }}
                                  value={room.capacity}
                                  onChange={e => updateRoomCapacity(fIndex, rIndex, e.target.value)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button type="button" className="btn btn-secondary w-full mt-4" style={{ 
                border: '1.5px dashed var(--accent-primary)', 
                background: 'rgba(79, 70, 225, 0.05)',
                color: 'var(--accent-primary)',
                fontWeight: '600'
              }} onClick={addFloor}>
                <Plus size={18} /> Add Floor
              </button>
            </div>

            <div className="p-4 mt-6" style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 'var(--radius-md)' }}>
              <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--accent-primary)' }}>
                <Info size={16} /> <strong style={{ fontSize: '0.875rem' }}>Setup Instructions</strong>
              </div>
              <p className="text-muted" style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
                Define the total number of rooms per floor, then click "Generate". You can then micro-adjust the exact bed capacity for specific rooms (e.g. changing Room 104 from 2 beds to 4 beds) before finalizing.
              </p>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-6 btn-lg" disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin inline mr-2" /> : null}
              {loading ? 'Initializing Database...' : 'Deploy Hostel Architecture'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateHostel;



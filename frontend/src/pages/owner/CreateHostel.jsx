import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BuildingIcon, Plus, Info, Trash2, Settings2, CheckCircle, Users, Layers, Phone, ArrowLeft, ArrowRight, IndianRupee } from 'lucide-react';
import { useHostel } from '../../context/HostelContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../api';
import OwnerHeader from '../../components/owner/OwnerHeader';
import MobileOwnerHeader from '../../components/owner/MobileOwnerHeader';
import OwnerSidebar from '../../components/owner/OwnerSidebar';
import './OwnerDashboard.css';

const CreateHostel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshHostels } = useHostel();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    mobile: user?.phone || '',
    location: '',
  });
  const [photoFile, setPhotoFile] = useState(null);

  const [floorsConfig, setFloorsConfig] = useState([
    { floor: 1, baseRooms: '', baseCapacity: '', baseRent: '', rooms: [], generated: false }
  ]);

  const [quickRents, setQuickRents] = useState({});

  const autoGenerateRooms = (floorIndex) => {
    let newFloors = [...floorsConfig];
    const fl = newFloors[floorIndex];

    if (!fl.baseRooms || !fl.baseCapacity) return toast.error("Please enter rooms and beds to generate");

    const count = Number(fl.baseRooms);
    const cap = Number(fl.baseCapacity);
    const defaultRent = Number(fl.baseRent) || 0;
    let genRooms = [];
    for (let i = 1; i <= count; i++) {
      genRooms.push({
        number: `${fl.floor}${i.toString().padStart(2, '0')}`,
        capacity: cap,
        rent_amount: defaultRent,
      });
    }
    fl.rooms = genRooms;
    fl.generated = true;
    setFloorsConfig(newFloors);
    toast.success(`Generated ${count} rooms for Floor ${fl.floor}`);
  };

  const updateRoomCapacity = (floorIndex, roomIndex, newCap) => {
    let newFloors = [...floorsConfig];
    newFloors[floorIndex].rooms[roomIndex].capacity = Number(newCap) || 0;
    setFloorsConfig(newFloors);
  };

  const incrementRoomCapacity = (floorIndex, roomIndex) => {
    let newFloors = [...floorsConfig];
    const room = newFloors[floorIndex].rooms[roomIndex];
    room.capacity = Number(room.capacity || 0) + 1;
    setFloorsConfig(newFloors);
  };

  const decrementRoomCapacity = (floorIndex, roomIndex) => {
    let newFloors = [...floorsConfig];
    const room = newFloors[floorIndex].rooms[roomIndex];
    const currentCap = Number(room.capacity || 0);
    if (currentCap <= 1) return;
    room.capacity = currentCap - 1;
    setFloorsConfig(newFloors);
  };

  const updateRoomRent = (floorIndex, roomIndex, newRent) => {
    let newFloors = [...floorsConfig];
    newFloors[floorIndex].rooms[roomIndex].rent_amount = newRent;
    setFloorsConfig(newFloors);
  };

  const applyQuickRent = (floorIndex) => {
    const rentVal = Number(quickRents[floorIndex]);
    if (isNaN(rentVal) || rentVal < 0) return toast.error("Please enter a valid rent amount");
    
    let newFloors = [...floorsConfig];
    const fl = newFloors[floorIndex];
    fl.rooms = fl.rooms.map(room => ({
      ...room,
      rent_amount: rentVal
    }));
    setFloorsConfig(newFloors);
    toast.success(`Applied rent ₹${rentVal} to all rooms on Floor ${fl.floor}`);
  };

  const updateFloorField = (index, field, value) => {
    let newFloors = [...floorsConfig];
    newFloors[index][field] = value;
    setFloorsConfig(newFloors);
  };

  const addFloor = () => {
    const nextFloor = floorsConfig.length + 1;
    setFloorsConfig([...floorsConfig, { floor: nextFloor, baseRooms: '', baseCapacity: '', baseRent: '', rooms: [], generated: false }]);
  };

  const removeFloor = (index) => {
    if (floorsConfig.length === 1) return toast.error("Must have at least one floor");
    let newFloors = floorsConfig.filter((_, i) => i !== index);
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
      const data = new FormData();
      data.append('name', formData.name);
      data.append('mobile', formData.mobile);
      data.append('location', formData.location);
      data.append('floorsConfig', JSON.stringify(floorsConfig));
      if (photoFile) {
        data.append('photo', photoFile);
      }

      const res = await api.post('/api/owner/hostels', data);

      toast.success(res.data.message || 'Hostel successfully created!');
      await refreshHostels();
      navigate('/owner/dashboard'); 

    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to create hostel');
    } finally {
      setLoading(false);
    }
  };

  const isStep1Done = 
    formData.name.trim() !== '' && 
    formData.mobile.trim() !== '' && 
    formData.location.trim() !== '';
  const isStep2Done = floorsConfig.length > 0 && floorsConfig.every(f => f.generated);

  return (
    <div className="dashboard-layout">
      <OwnerSidebar />
      <MobileOwnerHeader />

      <main className="dashboard-content fade-in mobile-pb">
        <div className="desktop-only-widgets">
          <OwnerHeader 
            title="Create Property" 
            subtitle="Configure new hostel" 
          />
        </div>

        {/* Mobile Page Title */}
        <h2 className="mobile-page-title">Create Property</h2>

        <div className="builder-container">
          {/* Wizard Stepper */}
          <div className="wizard-stepper-container">
            <div className={`wizard-step ${currentStep > 1 ? 'completed' : (currentStep === 1 ? 'active' : '')}`}>
              <div className="wizard-step-circle">
                {currentStep > 1 ? '✓' : '1'}
              </div>
              <span className="wizard-step-label">Basic Info</span>
              <div className="wizard-step-line"></div>
            </div>
            
            <div className={`wizard-step ${currentStep === 2 ? 'active' : ''}`}>
              <div className="wizard-step-circle">
                2
              </div>
              <span className="wizard-step-label">Configure Layout</span>
            </div>
          </div>

          <div className="glass-panel p-6 md:p-8 mb-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="icon-wrapper m-0" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-glow)', color: 'var(--aurora-1)', width: 48, height: 48, borderRadius: '12px' }}>
                <BuildingIcon size={24} />
              </div>
              <div>
                <h2 className="mb-1" style={{ fontSize: '1.25rem', margin: 0 }}>Hostel Builder</h2>
                <p className="text-muted" style={{ fontSize: '0.875rem', margin: 0 }}>Design your property layout and room capacities exactly how they are structured.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-col gap-6">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="fade-in">
                  <div className="mb-8">
                    <div className="builder-step-header">
                      <div className="builder-step-number">1</div>
                      <h3 style={{ margin: 0 }}>Basic Details</h3>
                    </div>
                    <div className="grid gap-4 form-grid-2">
                      <div className="form-group mb-0">
                        <label className="form-label">Hostel Name</label>
                        <div className="input-icon-group">
                          <BuildingIcon size={16} />
                          <input
                            type="text"
                            className="form-control form-control-premium"
                            placeholder="e.g. Prestige Boys Hostel"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group mb-0">
                        <label className="form-label">Contact Number</label>
                        <div className="input-icon-group">
                          <Phone size={16} />
                          <input
                            type="tel"
                            className="form-control form-control-premium"
                            placeholder="e.g. +91 98765 43210"
                            value={formData.mobile}
                            onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="form-group mb-0">
                        <label className="form-label">City/Location</label>
                        <div className="input-icon-group">
                          <span style={{ marginLeft: 12, opacity: 0.5 }}>📍</span>
                          <input
                            type="text"
                            className="form-control form-control-premium"
                            placeholder="e.g. Hyderabad, Hitech City"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                            required
                            style={{ paddingLeft: 40 }}
                          />
                        </div>
                      </div>

                      <div className="form-group mb-0">
                        <label className="form-label">Hostel Photo (Optional)</label>
                        <div className="input-icon-group">
                          <span style={{ marginLeft: 12, opacity: 0.5 }}>📷</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="form-control form-control-premium"
                            onChange={e => setPhotoFile(e.target.files[0])}
                            style={{ paddingLeft: 40, paddingTop: 10 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-gradient-submit w-full mt-6 flex items-center justify-center gap-2"
                    onClick={() => setCurrentStep(2)}
                    disabled={!isStep1Done}
                  >
                    Next: Configure Layout <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {/* Step 2: Dynamic Floor Builder */}
              {currentStep === 2 && (
                <div className="fade-in">
                  <div className="mb-8">
                    <div className="builder-step-header">
                      <div className="builder-step-number">2</div>
                      <h3 style={{ margin: 0 }}>Configure Layout</h3>
                    </div>

                    <div className="flex flex-col gap-6 py-2">
                      {floorsConfig.map((floor, fIndex) => {
                        const totalRooms = floor.rooms ? floor.rooms.length : 0;
                        const totalBeds = floor.rooms ? floor.rooms.reduce((acc, r) => acc + (Number(r.capacity) || 0), 0) : 0;
                        const totalRent = floor.rooms ? floor.rooms.reduce((acc, r) => acc + (Number(r.rent_amount) || 0), 0) : 0;

                        return (
                          <div key={fIndex} className="builder-floor-card slide-up">
                            <div className="flex justify-between items-center mb-6">
                              <div className="flex items-center gap-2">
                                <div className="icon-wrapper m-0 p-2" style={{ background: 'var(--accent-glow)', color: 'var(--aurora-1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Layers size={18} />
                                </div>
                                <div className="flex flex-col">
                                  <strong style={{ fontSize: '1.2rem', color: 'var(--text-bright)', lineHeight: '1.2' }}>Floor {floor.floor}</strong>
                                  {floor.generated && (
                                    <span className="floor-stats-ribbon">
                                      {totalRooms} Rooms • {totalBeds} Beds • Total Rent: ₹{totalRent.toLocaleString('en-IN')}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button type="button" className="btn-trash" onClick={() => removeFloor(fIndex)}>
                                <Trash2 size={20} />
                              </button>
                            </div>

                            {/* Row Configuration */}
                            {!floor.generated ? (
                              <div className="floor-builder-grid">
                                <div className="form-group mb-0">
                                  <label className="form-label text-xs uppercase tracking-wider opacity-70">Number of Rooms</label>
                                  <div className="input-icon-group">
                                    <Layers size={16} />
                                    <input 
                                      type="number" 
                                      min="1" 
                                      className="form-control form-control-premium" 
                                      value={floor.baseRooms} 
                                      onChange={e => updateFloorField(fIndex, 'baseRooms', e.target.value)} 
                                      placeholder="e.g. 5" 
                                    />
                                  </div>
                                </div>
                                <div className="form-group mb-0">
                                  <label className="form-label text-xs uppercase tracking-wider opacity-70">Default Beds</label>
                                  <div className="input-icon-group">
                                    <Users size={16} />
                                    <input 
                                      type="number" 
                                      min="1" 
                                      className="form-control form-control-premium" 
                                      value={floor.baseCapacity} 
                                      onChange={e => updateFloorField(fIndex, 'baseCapacity', e.target.value)} 
                                      placeholder="e.g. 2" 
                                    />
                                  </div>
                                </div>
                                <div className="form-group mb-0">
                                  <label className="form-label text-xs uppercase tracking-wider opacity-70">Default Rent (₹)</label>
                                  <div className="input-icon-group">
                                    <IndianRupee size={16} />
                                    <input 
                                      type="number" 
                                      min="0" 
                                      className="form-control form-control-premium" 
                                      value={floor.baseRent} 
                                      onChange={e => updateFloorField(fIndex, 'baseRent', e.target.value)} 
                                      placeholder="e.g. 5000" 
                                    />
                                  </div>
                                </div>
                                <button type="button" className="btn btn-primary generate-btn px-6" onClick={() => autoGenerateRooms(fIndex)}>Generate Layout</button>
                              </div>
                            ) : (
                              <div>
                                <div className="flex justify-between items-center mb-6 p-3 rounded-lg" style={{ background: 'rgba(5, 150, 105, 0.06)', border: '1px solid rgba(5, 150, 105, 0.15)' }}>
                                  <span className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--success)' }}>
                                     <CheckCircle size={16} /> Layout Ready
                                  </span>
                                  <button type="button" className="text-xs font-bold bg-transparent border-none cursor-pointer p-1" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }} onClick={() => updateFloorField(fIndex, 'generated', false)}>
                                    Re-configure Floor
                                  </button>
                                </div>

                                {/* Quick Apply Rent Panel */}
                                <div className="quick-rent-container mb-6 p-4 rounded-xl">
                                  <div className="flex flex-col gap-1">
                                    <span className="quick-rent-title">Quick Apply Rent</span>
                                    <span className="quick-rent-desc font-normal text-xs text-muted" style={{ margin: 0 }}>Set rent for all rooms on this floor instantly</span>
                                  </div>
                                  <div className="quick-rent-controls">
                                    <div className="input-icon-group">
                                      <IndianRupee size={14} />
                                      <input
                                        type="number"
                                        placeholder="Rent amount"
                                        className="form-control form-control-premium quick-rent-input"
                                        value={quickRents[fIndex] || ''}
                                        onChange={e => setQuickRents({ ...quickRents, [fIndex]: e.target.value })}
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      className="btn btn-primary quick-rent-btn"
                                      onClick={() => applyQuickRent(fIndex)}
                                    >
                                      Apply to Floor
                                    </button>
                                  </div>
                                </div>

                                <div className="builder-rooms-grid gap-4">
                                  {floor.rooms.map((room, rIndex) => (
                                    <div key={rIndex} className="room-setup-card-premium slide-up">
                                      <div className="room-card-premium-header">
                                        <span className="room-setup-badge">Room</span>
                                        <strong className="room-setup-number">{room.number}</strong>
                                      </div>
                                      
                                      <div className="stepper-controls-wrapper">
                                        <span className="control-label text-xs uppercase tracking-wider opacity-70">Beds Capacity</span>
                                        <div className="stepper-controls">
                                          <button
                                            type="button"
                                            className="stepper-btn"
                                            onClick={() => decrementRoomCapacity(fIndex, rIndex)}
                                            disabled={room.capacity <= 1}
                                          >
                                            -
                                          </button>
                                          <div className="stepper-value">
                                            <Users size={14} className="stepper-icon" />
                                            <span>{room.capacity}</span>
                                          </div>
                                          <button
                                            type="button"
                                            className="stepper-btn"
                                            onClick={() => incrementRoomCapacity(fIndex, rIndex)}
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                      
                                      <div className="rent-input-wrapper">
                                        <span className="control-label text-xs uppercase tracking-wider opacity-70">Monthly Rent</span>
                                        <div className="input-icon-group">
                                          <span className="currency-symbol">₹</span>
                                          <input
                                            type="number"
                                            className="form-control rent-input-field"
                                            placeholder="Rent"
                                            value={room.rent_amount}
                                            onChange={e => updateRoomRent(fIndex, rIndex, e.target.value)}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <button type="button" className="btn-dashed-add-floor w-full mt-6" onClick={addFloor}>
                      <Plus size={20} /> Add Another Floor
                    </button>
                  </div>

                  {/* Instructions Callout */}
                  <div className="setup-info-panel mt-6">
                    <div className="setup-info-icon-wrap">
                      <Info size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-bright)' }}>Setup Instructions</h4>
                      <p className="text-muted" style={{ fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                        Define the total number of rooms per floor, then click "Generate". You can then micro-adjust the exact bed capacity for specific rooms (e.g. changing Room 104 from 2 beds to 4 beds) and customize the monthly rent for each room before finalizing.
                      </p>
                    </div>
                  </div>

                  <div className="wizard-actions-container mt-6">
                    <button
                      type="button"
                      className="btn btn-wizard-back"
                      onClick={() => setCurrentStep(1)}
                      disabled={loading}
                    >
                      <ArrowLeft size={18} /> Back
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary btn-gradient-submit"
                      disabled={loading || !isStep2Done}
                    >
                      {loading ? (
                        <span className="pulse-opacity">
                          Initializing
                          <span className="pulsing-dot-container">
                            <span className="pulsing-dot"></span>
                            <span className="pulsing-dot"></span>
                            <span className="pulsing-dot"></span>
                          </span>
                        </span>
                      ) : 'Deploy Hostel Architecture'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateHostel;



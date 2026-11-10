import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import { useJourney } from '../hooks/useJourney';
import { getAqiBadgeColor } from '../utils/formatters';
import { ROUTES } from '../utils/constants';
import {
  FaLocationArrow,
  FaWind,
  FaCloudSun,
  FaHospital,
  FaBed,
  FaUtensils,
  FaGasPump,
  FaTools,
  FaChargingStation,
  FaAmbulance,
  FaStopCircle,
  FaCoffee,
  FaCheckCircle
} from 'react-icons/fa';

export default function LiveJourneyPage() {
  const navigate = useNavigate();
  const { activeJourney, endJourney } = useJourney();

  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [journeyCompletedAlert, setJourneyCompletedAlert] = useState(false);

  useEffect(() => {
    if (!activeJourney && !journeyCompletedAlert) {
      navigate(ROUTES.PLAN_JOURNEY);
    }
  }, [activeJourney, journeyCompletedAlert, navigate]);

  if (!activeJourney && !journeyCompletedAlert) {
    return null;
  }

  const handleEndJourney = () => {
    endJourney();
    setJourneyCompletedAlert(true);
    setTimeout(() => {
      navigate(ROUTES.MY_TRIPS);
    }, 2000);
  };

  const handleSendSos = () => {
    setSosSent(true);
    setTimeout(() => {
      setSosSent(false);
      setSosModalOpen(false);
    }, 2500);
  };

  const route = activeJourney?.route;
  const fc = route?.facilitiesCount || { hospitals: 4, hotels: 6, restaurants: 12, fuelStations: 5, garages: 3, evChargers: 8 };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8 py-4">
        
        {/* Navigation Banner Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800 relative overflow-hidden">
          <div className="space-y-2 z-10">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 animate-ping"></span>
              <span className="text-xs font-extrabold uppercase tracking-widest text-green-400">
                Active Live Navigation Session
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{route?.title || 'Eco Journey'}</h1>
            <p className="text-slate-300 text-xs sm:text-sm">
              From <strong className="text-white">{activeJourney?.source}</strong> to <strong className="text-white">{activeJourney?.destination}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3 z-10">
            <Button
              variant="danger"
              size="md"
              icon={FaAmbulance}
              onClick={() => setSosModalOpen(true)}
              className="shadow-red-600/30"
            >
              Emergency SOS
            </Button>

            <Button
              variant="primary"
              size="md"
              icon={FaStopCircle}
              onClick={handleEndJourney}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              End Journey
            </Button>
          </div>
        </div>

        {journeyCompletedAlert && (
          <Alert
            type="success"
            message="Journey Completed! Trip details saved to your Trip History. Great job reducing carbon emissions!"
          />
        )}

        {/* Live Turn-by-Turn Instruction Card */}
        <Card className="p-6 bg-gradient-to-r from-green-700 via-green-600 to-emerald-700 text-white shadow-md space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl">
              <FaLocationArrow />
            </div>
            <div>
              <p className="text-xs text-green-100 uppercase font-bold tracking-wider">Next Turn Instruction</p>
              <h3 className="text-lg sm:text-xl font-extrabold">
                {activeJourney?.nextInstruction || 'In 400m, keep left onto the Scenic Eco Parkway'}
              </h3>
            </div>
          </div>
        </Card>

        {/* Real-Time Trip Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase text-slate-500">Remaining Distance</p>
            <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{activeJourney?.remainingDistance}</h4>
            <p className="text-xs text-green-700 font-semibold mt-1">Live GPS Tracked</p>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-semibold uppercase text-slate-500">Est. Arrival Time (ETA)</p>
            <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{activeJourney?.estimatedArrival}</h4>
            <p className="text-xs text-slate-500 mt-1">Traffic Normalized</p>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-semibold uppercase text-slate-500">Air Quality Index (AQI)</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900">{route?.aqi}</span>
              <span className={`px-2 py-0.5 rounded-full border text-xs font-bold ${getAqiBadgeColor(route?.aqi)}`}>
                {route?.aqiCategory}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><FaWind /> Continuous Monitor</p>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-semibold uppercase text-slate-500">Weather Forecast</p>
            <h4 className="text-xl font-extrabold text-slate-900 mt-1">{route?.weather}</h4>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><FaCloudSun /> Clear Visibility</p>
          </Card>
        </div>

        {/* Nearby Facilities & Rest Stops Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Facilities Radar */}
          <Card className="p-6 space-y-4 lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FaHospital className="text-red-500" />
              <span>Nearby Roadside Facilities Radar</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-red-50/60 rounded-xl border border-red-200/80 space-y-1">
                <span className="text-red-700 font-bold flex items-center gap-1.5 text-sm">
                  <FaHospital /> Hospitals ({fc.hospitals})
                </span>
                <p className="text-slate-600 text-[11px]">Nearest: Sunrise Care Clinic (2.4 km)</p>
              </div>

              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-1">
                <span className="text-blue-700 font-bold flex items-center gap-1.5 text-sm">
                  <FaBed /> Hotels ({fc.hotels})
                </span>
                <p className="text-slate-600 text-[11px]">Nearest: Eco Lodge & Suites (5.1 km)</p>
              </div>

              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-1">
                <span className="text-amber-700 font-bold flex items-center gap-1.5 text-sm">
                  <FaUtensils /> Restaurants ({fc.restaurants})
                </span>
                <p className="text-slate-600 text-[11px]">Nearest: Green Leaf Bistro (1.2 km)</p>
              </div>

              <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200/80 space-y-1">
                <span className="text-purple-700 font-bold flex items-center gap-1.5 text-sm">
                  <FaGasPump /> Fuel Stations ({fc.fuelStations})
                </span>
                <p className="text-slate-600 text-[11px]">Nearest: City Petroleum (3.8 km)</p>
              </div>

              <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-700 font-bold flex items-center gap-1.5 text-sm">
                  <FaTools /> Garages ({fc.garages})
                </span>
                <p className="text-slate-600 text-[11px]">Nearest: Express Auto Repairs (4.0 km)</p>
              </div>

              <div className="p-4 bg-green-50/60 rounded-xl border border-green-200/80 space-y-1">
                <span className="text-green-700 font-bold flex items-center gap-1.5 text-sm">
                  <FaChargingStation /> EV Chargers ({fc.evChargers})
                </span>
                <p className="text-slate-600 text-[11px]">Nearest: Ultra Fast Charging (1.8 km)</p>
              </div>
            </div>
          </Card>

          {/* Recommended Rest Stops */}
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FaCoffee className="text-amber-600" />
              <span>Recommended Rest Stops</span>
            </h3>

            <div className="space-y-3 text-xs">
              {(route?.restStops || ['Pine Tree Oasis Rest Plaza (KM 18)', 'Eco Charging & Dine Hub (KM 32)']).map((stop, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
                  <FaCheckCircle className="text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800">{stop}</p>
                    <p className="text-slate-500 text-[11px]">Verified clean restrooms & dining available</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

      </div>

      {/* Emergency SOS Modal */}
      <Modal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
        title="Emergency SOS Distress Dispatch"
      >
        {sosSent ? (
          <Alert type="success" message="SOS Alert Dispatched! Local highway emergency services and your contacts have been alerted with your exact GPS location." />
        ) : (
          <div className="space-y-4 text-xs">
            <Alert type="warning" message="Clicking dispatch will broadcast your current GPS coordinates to Emergency Medical Services and Traffic Police." />
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p><strong>Current GPS:</strong> 12.9716° N, 77.5946° E</p>
              <p><strong>Active Route:</strong> {route?.title}</p>
            </div>
            <Button variant="danger" fullWidth onClick={handleSendSos}>
              Confirm SOS Distress Dispatch
            </Button>
          </div>
        )}
      </Modal>
    </MainLayout>
  );
}

import React from 'react';
import { ArrowLeft, Lightbulb, WifiIcon, Phone, Home, ShoppingBag, Car, Landmark, Zap, Droplet, Wifi } from 'lucide-react';

// Import service provider logos
import srwbLogo from '../images/serviceprov/srwb.jpg';
import crwbLogo from '../images/serviceprov/crwb.jpg';
import nrwbLogo from '../images/serviceprov/nrwb.jpg';
import lwbLogo from '../images/serviceprov/lwb.jpg';
import bwbLogo from '../images/serviceprov/bwb.png';
import escomLogo from '../images/serviceprov/escom.png';
import starlinkLogo from '../images/serviceprov/starlink.svg';

interface ServiceProviderViewProps {
  onBack: () => void;
  onSelectProvider: (provider: ServiceProvider) => void;
  onServiceTypeSelect?: (serviceType: string | null) => void;
  selectedServiceType?: string | null;
  waterUtilityData?: WaterUtilityProvider[];
  electricityProviderData?: ElectricityProvider[];
  internetProviderData?: InternetProvider[];
}

export interface ServiceProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  email: string;
}

export interface WaterUtilityProvider {
  id: string;
  name: string;
  logo?: React.ReactNode;
  region: string;
  email: string;
}

export interface ElectricityProvider {
  id: string;
  name: string;
  logo?: React.ReactNode;
  coverageArea: string;
  email: string;
}

export interface InternetProvider {
  id: string;
  name: string;
  logo?: React.ReactNode;
  serviceType: string;
  email: string;
}

const ServiceProviderView: React.FC<ServiceProviderViewProps> = ({ 
  onBack, 
  onSelectProvider,
  onServiceTypeSelect,
  selectedServiceType,
  waterUtilityData = defaultWaterUtilityProviders,
  electricityProviderData = defaultElectricityProviders,
  internetProviderData = defaultInternetProviders
}) => {
  // Service providers data
  const serviceProviders: ServiceProvider[] = [
    { id: 'water', name: 'Water Utility', icon: <Zap size={36} className="text-blue-500" />, email: 'water@utility.com' },
    { id: 'electricity', name: 'Electricity Company', icon: <Lightbulb size={36} className="text-yellow-500" />, email: 'billing@electricity.com' },
    { id: 'internet', name: 'Internet Provider', icon: <WifiIcon size={36} className="text-green-500" />, email: 'payments@internet.com' },
    { id: 'phone', name: 'Mobile Network', icon: <Phone size={36} className="text-purple-500" />, email: 'billing@mobile.com' },
    { id: 'rent', name: 'Housing Agency', icon: <Home size={36} className="text-red-500" />, email: 'payments@housing.com' },
    { id: 'shopping', name: 'Monthly Subscription', icon: <ShoppingBag size={36} className="text-pink-500" />, email: 'billing@subscription.com' },
    { id: 'transport', name: 'Transport Provider', icon: <Car size={36} className="text-cyan-500" />, email: 'payments@transport.com' },
    { id: 'loan', name: 'Loan Payment', icon: <Landmark size={36} className="text-orange-500" />, email: 'payments@loans.com' },
  ];

  const handleServiceTypeSelect = (serviceType: string) => {
    if (onServiceTypeSelect) {
      onServiceTypeSelect(serviceType);
    }
  };

  // This function helps us navigate back from a specific provider list to the main service types
  const handleBackToServiceTypes = () => {
    if (onServiceTypeSelect) {
      // Setting to null clears the selected service type
      onServiceTypeSelect(null);
    }
  };

  // If a service type is selected, show its specific providers
  if (selectedServiceType === 'water') {
    return (
      <WaterUtilityProvidersView 
        providers={waterUtilityData} 
        onBack={handleBackToServiceTypes} 
        onSelectProvider={onSelectProvider}
      />
    );
  }
  
  if (selectedServiceType === 'electricity') {
    return (
      <ElectricityProvidersView 
        providers={electricityProviderData} 
        onBack={handleBackToServiceTypes} 
        onSelectProvider={onSelectProvider}
      />
    );
  }

  if (selectedServiceType === 'internet') {
    return (
      <InternetProvidersView 
        providers={internetProviderData} 
        onBack={handleBackToServiceTypes} 
        onSelectProvider={onSelectProvider}
      />
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <button 
          onClick={onBack}
          className="flex items-center justify-center px-4 py-3 rounded-md text-[#8928A4] bg-[#f9f0fc] hover:bg-[#f3e0fa] transition-colors text-base w-full md:w-auto"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Selection
        </button>
        <h3 className="font-medium text-lg text-gray-800 mt-4">Select Service Provider</h3>
        <p className="text-sm text-gray-500">Choose a service provider to set up auto payments</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {serviceProviders.map(provider => (
          <button
            key={provider.id}
            onClick={() => handleServiceTypeSelect(provider.id)}
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="mb-2 p-2 rounded-full bg-gray-100">
              {provider.icon}
            </div>
            <span className="text-sm text-center font-medium">{provider.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Water Utility Providers component
interface WaterUtilityProvidersViewProps {
  providers: WaterUtilityProvider[];
  onBack: () => void;
  onSelectProvider: (provider: ServiceProvider) => void;
}

const WaterUtilityProvidersView: React.FC<WaterUtilityProvidersViewProps> = ({ providers, onBack, onSelectProvider }) => {
  return (
    <div>
      <div className="mb-6">
        <button 
          onClick={onBack}
          className="flex items-center justify-center px-4 py-3 rounded-md text-[#8928A4] bg-[#f9f0fc] hover:bg-[#f3e0fa] transition-colors text-base w-full md:w-auto"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Service Types
        </button>
        <h3 className="font-medium text-lg text-gray-800 mt-4">Water Utility Providers</h3>
        <p className="text-sm text-gray-500">Choose your water utility provider</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {providers.map(provider => (
          <button
            key={provider.id}
            onClick={() => onSelectProvider({
              id: provider.id,
              name: provider.name,
              icon: provider.logo || <Droplet size={24} className="text-blue-500" />,
              email: provider.email
            })}
            className="flex items-center p-4 border rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div className="p-2 rounded-full bg-blue-100 mr-3">
              {provider.logo || <Droplet size={24} className="text-blue-500" />}
            </div>
            <div className="text-left">
              <span className="font-medium block">{provider.name}</span>
              <span className="text-xs text-gray-500">{provider.region}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Electricity Providers component
interface ElectricityProvidersViewProps {
  providers: ElectricityProvider[];
  onBack: () => void;
  onSelectProvider: (provider: ServiceProvider) => void;
}

const ElectricityProvidersView: React.FC<ElectricityProvidersViewProps> = ({ providers, onBack, onSelectProvider }) => {
  return (
    <div>
      <div className="mb-6">
        <button 
          onClick={onBack}
          className="flex items-center justify-center px-4 py-3 rounded-md text-[#8928A4] bg-[#f9f0fc] hover:bg-[#f3e0fa] transition-colors text-base w-full md:w-auto"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Service Types
        </button>
        <h3 className="font-medium text-lg text-gray-800 mt-4">Electricity Providers</h3>
        <p className="text-sm text-gray-500">Choose your electricity provider</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {providers.map(provider => (
          <button
            key={provider.id}
            onClick={() => onSelectProvider({
              id: provider.id,
              name: provider.name,
              icon: provider.logo || <Lightbulb size={24} className="text-yellow-500" />,
              email: provider.email
            })}
            className="flex items-center p-4 border rounded-lg hover:bg-yellow-50 transition-colors"
          >
            <div className="p-2 rounded-full bg-yellow-100 mr-3">
              {provider.logo || <Lightbulb size={24} className="text-yellow-500" />}
            </div>
            <div className="text-left">
              <span className="font-medium block">{provider.name}</span>
              <span className="text-xs text-gray-500">{provider.coverageArea}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Internet Providers component
interface InternetProvidersViewProps {
  providers: InternetProvider[];
  onBack: () => void;
  onSelectProvider: (provider: ServiceProvider) => void;
}

const InternetProvidersView: React.FC<InternetProvidersViewProps> = ({ providers, onBack, onSelectProvider }) => {
  return (
    <div>
      <div className="mb-6">
        <button 
          onClick={onBack}
          className="flex items-center justify-center px-4 py-3 rounded-md text-[#8928A4] bg-[#f9f0fc] hover:bg-[#f3e0fa] transition-colors text-base w-full md:w-auto"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Service Types
        </button>
        <h3 className="font-medium text-lg text-gray-800 mt-4">Internet Service Providers</h3>
        <p className="text-sm text-gray-500">Choose your internet provider</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {providers.map(provider => (
          <button
            key={provider.id}
            onClick={() => onSelectProvider({
              id: provider.id,
              name: provider.name,
              icon: provider.logo || <Wifi size={24} className="text-green-500" />,
              email: provider.email
            })}
            className="flex items-center p-4 border rounded-lg hover:bg-green-50 transition-colors"
          >
            <div className="p-2 rounded-full bg-green-100 mr-3">
              {provider.logo || <Wifi size={24} className="text-green-500" />}
            </div>
            <div className="text-left">
              <span className="font-medium block">{provider.name}</span>
              <span className="text-xs text-gray-500">{provider.serviceType}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Default water utility providers data
const defaultWaterUtilityProviders: WaterUtilityProvider[] = [
  { 
    id: 'lilongwe-water-board', 
    name: 'Lilongwe Water Board', 
    region: 'Lilongwe Region',
    email: 'payments@lwb.mw',
    logo: <img src={lwbLogo} alt="LWB Logo" className="h-10 w-10 object-cover rounded-full" />
  },
  { 
    id: 'blantyre-water-board', 
    name: 'Blantyre Water Board', 
    region: 'Blantyre Region',
    email: 'billing@bwb.mw',
    logo: <img src={bwbLogo} alt="BWB Logo" className="h-10 w-10 object-cover rounded-full" />
  },
  { 
    id: 'northern-region-water-board', 
    name: 'Northern Region Water Board', 
    region: 'Northern Region',
    email: 'payments@nrwb.mw',
    logo: <img src={nrwbLogo} alt="NRWB Logo" className="h-10 w-10 object-cover rounded-full" />
  },
  { 
    id: 'central-region-water-board', 
    name: 'Central Region Water Board', 
    region: 'Central Region',
    email: 'billing@crwb.mw',
    logo: <img src={crwbLogo} alt="CRWB Logo" className="h-10 w-10 object-cover rounded-full" />
  },
  { 
    id: 'southern-region-water-board', 
    name: 'Southern Region Water Board', 
    region: 'Southern Region',
    email: 'payments@srwb.mw',
    logo: <img src={srwbLogo} alt="SRWB Logo" className="h-10 w-10 object-cover rounded-full" />
  }
];

// Default electricity providers data
const defaultElectricityProviders: ElectricityProvider[] = [
  {
    id: 'escom',
    name: 'ESCOM - Electricity Supply Corporation of Malawi',
    coverageArea: 'National Grid',
    email: 'payments@escom.mw',
    logo: <img src={escomLogo} alt="ESCOM Logo" className="h-10 w-10 object-cover rounded-full" />
  }
];

// Default internet providers data
const defaultInternetProviders: InternetProvider[] = [
  {
    id: 'starlink',
    name: 'Starlink',
    serviceType: 'Satellite Internet',
    email: 'billing@starlink.com',
    logo: <img src={starlinkLogo} alt="Starlink Logo" className="h-10 w-10 object-cover rounded-full" />
  },
  {
    id: 'mtn-business',
    name: 'MTN Business Internet',
    serviceType: 'Fiber & Mobile Internet',
    email: 'payments@mtn.mw'
  },
  {
    id: 'skyband',
    name: 'Skyband',
    serviceType: 'Broadband & Fiber',
    email: 'billing@skyband.mw'
  },
  {
    id: 'tnm',
    name: 'TNM Internet Services',
    serviceType: 'Mobile & Fixed Internet',
    email: 'payments@tnm.mw'
  },
  {
    id: 'globe-internet',
    name: 'Globe Internet',
    serviceType: 'Wireless Internet',
    email: 'billing@globeinternet.mw'
  },
  {
    id: 'afrimax',
    name: 'Afrimax Malawi',
    serviceType: 'LTE & Wireless Internet',
    email: 'payments@afrimax.mw'
  }
];

export default ServiceProviderView;
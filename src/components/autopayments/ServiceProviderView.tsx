import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lightbulb, WifiIcon, Phone, Home, ShoppingBag, Car, Landmark, Zap, Droplet, Wifi, SearchIcon, CheckCircle, XCircle } from 'lucide-react';

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

// New confirmation modal interface
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  provider: ServiceProvider | null;
}

export interface ServiceProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  email: string;
  category?: string;
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

// Define service categories
export interface ServiceCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  
  // Service categories
  const serviceCategories: ServiceCategory[] = [
    { id: 'utilities', name: 'Utilities', icon: <Zap size={24} className="text-yellow-500" /> },
    { id: 'telecom', name: 'Telecom', icon: <Phone size={24} className="text-green-500" /> },
    { id: 'housing', name: 'Housing', icon: <Home size={24} className="text-blue-500" /> },
    { id: 'subscriptions', name: 'Subscriptions', icon: <ShoppingBag size={24} className="text-purple-500" /> },
    { id: 'transport', name: 'Transport', icon: <Car size={24} className="text-red-500" /> },
    { id: 'financial', name: 'Financial', icon: <Landmark size={24} className="text-cyan-500" /> },
  ];

  // Service providers data with categories
  const serviceProviders: ServiceProvider[] = [
    { id: 'water', name: 'Water Utility', icon: <Droplet size={36} className="text-blue-500" />, email: 'Pay your water bills', category: 'utilities' },
    { id: 'electricity', name: 'Electricity Company', icon: <Lightbulb size={36} className="text-yellow-500" />, email: 'Pay your electricity bills', category: 'utilities' },
    { id: 'internet', name: 'Internet Provider', icon: <WifiIcon size={36} className="text-green-500" />, email: 'Pay your internet bills', category: 'telecom' },
    { id: 'phone', name: 'Mobile Network', icon: <Phone size={36} className="text-purple-500" />, email: 'Pay your mobile bills', category: 'telecom' },
    { id: 'rent', name: 'Housing Agency', icon: <Home size={36} className="text-red-500" />, email: 'Pay your rent', category: 'housing' },
    { id: 'shopping', name: 'Monthly Subscription', icon: <ShoppingBag size={36} className="text-pink-500" />, email: 'Pay your subscriptions', category: 'subscriptions' },
    { id: 'transport', name: 'Transport Provider', icon: <Car size={36} className="text-cyan-500" />, email: 'Pay for transport services', category: 'transport' },
    { id: 'loan', name: 'Loan Payment', icon: <Landmark size={36} className="text-orange-500" />, email: 'Pay your loan installments', category: 'financial' },
  ];

  const handleServiceTypeSelect = (serviceType: string) => {
    if (onServiceTypeSelect) {
      onServiceTypeSelect(serviceType);
    }
  };

  const handleBackToServiceTypes = () => {
    if (onServiceTypeSelect) {
      // Setting to null clears the selected service type
      onServiceTypeSelect(null);
    }
  };

  const filterProviders = (providers: ServiceProvider[]) => {
    // Filter by search query
    let filtered = providers;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(provider => 
        provider.name.toLowerCase().includes(query) || 
        provider.email.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (activeCategory) {
      filtered = filtered.filter(provider => provider.category === activeCategory);
    }
    
    return filtered;
  };

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };

  const handleProviderSelect = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setShowConfirmation(true);
  };

  const handleConfirmProvider = () => {
    if (selectedProvider) {
      onSelectProvider(selectedProvider);
    }
    setShowConfirmation(false);
  };

  const handleCancelSelection = () => {
    setShowConfirmation(false);
    setSelectedProvider(null);
  };

  // If a service type is selected, show its specific providers
  if (selectedServiceType === 'water') {
    return (
      <>
        <WaterUtilityProvidersView 
          providers={waterUtilityData} 
          onBack={handleBackToServiceTypes} 
          onSelectProvider={handleProviderSelect}
        />
        {showConfirmation && selectedProvider && (
          <ConfirmationModal 
            isOpen={showConfirmation}
            onClose={handleCancelSelection}
            onConfirm={handleConfirmProvider}
            provider={selectedProvider}
          />
        )}
      </>
    );
  }
  
  if (selectedServiceType === 'electricity') {
    return (
      <>
        <ElectricityProvidersView 
          providers={electricityProviderData} 
          onBack={handleBackToServiceTypes} 
          onSelectProvider={handleProviderSelect}
        />
        {showConfirmation && selectedProvider && (
          <ConfirmationModal 
            isOpen={showConfirmation}
            onClose={handleCancelSelection}
            onConfirm={handleConfirmProvider}
            provider={selectedProvider}
          />
        )}
      </>
    );
  }

  if (selectedServiceType === 'internet') {
    return (
      <>
        <InternetProvidersView 
          providers={internetProviderData} 
          onBack={handleBackToServiceTypes} 
          onSelectProvider={handleProviderSelect}
        />
        {showConfirmation && selectedProvider && (
          <ConfirmationModal 
            isOpen={showConfirmation}
            onClose={handleCancelSelection}
            onConfirm={handleConfirmProvider}
            provider={selectedProvider}
          />
        )}
      </>
    );
  }

  // Check if the selected service type is one that doesn't have providers yet
  if (selectedServiceType && ['rent', 'shopping', 'transport', 'loan', 'phone'].includes(selectedServiceType)) {
    return (
      <ComingSoonView 
        onBack={handleBackToServiceTypes} 
        category={selectedServiceType} 
      />
    );
  }
  
  const filteredProviders = filterProviders(serviceProviders);
  
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
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <SearchIcon size={18} className="text-gray-400" />
        </div>
        <input 
          type="search"
          className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-[#8928A4] focus:border-[#8928A4]"
          placeholder="Search service providers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Categories */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-3 pb-2">
          {serviceCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg min-w-[80px] ${
                activeCategory === category.id 
                  ? 'bg-[#8928A4] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } transition-colors`}
            >
              <div className={`${activeCategory === category.id ? 'text-white' : ''}`}>
                {category.icon}
              </div>
              <span className="text-xs mt-1">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Service Providers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProviders.length > 0 ? (
          filteredProviders.map((provider) => (
            <button
              key={provider.id}
              onClick={() => {
                // For water, electricity, internet - show specific providers
                if (['water', 'electricity', 'internet'].includes(provider.id)) {
                  handleServiceTypeSelect(provider.id);
                } else {
                  // For other service providers, show ComingSoonView
                  handleServiceTypeSelect(provider.id);
                }
              }}
              className="flex items-center p-4 border rounded-lg hover:bg-purple-50 transition-colors"
            >
              <div className="p-3 rounded-full bg-purple-100 mr-3">
                {provider.icon}
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-800">{provider.name}</h4>
                <p className="text-sm text-gray-500">{provider.email}</p>
              </div>
            </button>
          ))
        ) : (
          <div className="col-span-full p-8 text-center">
            <p className="text-gray-500">No service providers found. Try a different search term or category.</p>
          </div>
        )}
      </div>
      
      {/* Confirmation Modal */}
      {showConfirmation && selectedProvider && (
        <ConfirmationModal 
          isOpen={showConfirmation}
          onClose={handleCancelSelection}
          onConfirm={handleConfirmProvider}
          provider={selectedProvider}
        />
      )}
    </div>
  );
};

// Confirmation Modal Component
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, provider }) => {
  if (!isOpen || !provider) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 animate-fade-in">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Confirm Selection</h3>
          <p className="text-gray-600 mt-2">Continue to iterate with this provider?</p>
        </div>
        
        <div className="flex items-center justify-center mb-6 p-4 border border-gray-200 rounded-lg">
          <div className="p-3 rounded-full bg-purple-100 mr-4">
            {provider.icon}
          </div>
          <div className="text-left">
            <h4 className="font-medium text-lg text-gray-800">{provider.name}</h4>
            <p className="text-sm text-gray-500">{provider.email}</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center px-4 py-3 rounded-md text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <XCircle size={20} className="mr-2" />
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center px-4 py-3 rounded-md text-white bg-[#8928A4] hover:bg-[#7a2391] transition-colors"
          >
            <CheckCircle size={20} className="mr-2" />
            Continue
          </button>
        </div>
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

// New ComingSoonView component for categories without providers yet
interface ComingSoonViewProps {
  onBack: () => void;
  category: string;
}

const ComingSoonView: React.FC<ComingSoonViewProps> = ({ onBack, category }) => {
  const getCategoryIcon = () => {
    switch (category) {
      case 'housing':
        return <Home size={48} className="text-blue-500" />;
      case 'subscriptions':
        return <ShoppingBag size={48} className="text-purple-500" />;
      case 'transport':
        return <Car size={48} className="text-red-500" />;
      case 'financial':
        return <Landmark size={48} className="text-cyan-500" />;
      case 'phone':
        return <Phone size={48} className="text-purple-500" />;
      default:
        return <Lightbulb size={48} className="text-yellow-500" />;
    }
  };

  const getCategoryName = () => {
    switch (category) {
      case 'housing':
        return "Housing Services";
      case 'subscriptions':
        return "Subscription Services";
      case 'transport':
        return "Transportation Services";
      case 'financial':
        return "Financial Services";
      case 'phone':
        return "Mobile Network Services";
      default:
        return "Services";
    }
  };

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
      </div>

      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="bg-purple-100 p-6 rounded-full mb-6">
          {getCategoryIcon()}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{getCategoryName()} Coming Soon</h2>
        <p className="text-gray-600 max-w-md mb-6">
          We're working diligently to bring you a comprehensive selection of {category.toLowerCase()} service providers. 
          Our team is establishing partnerships to offer you seamless payment experiences.
        </p>
        <div className="bg-gray-100 rounded-lg p-4 mb-6 max-w-md">
          <p className="text-sm text-gray-700">
            <strong>What to expect:</strong> In the coming weeks, we'll be adding trusted {category.toLowerCase()} providers to our platform, 
            allowing you to conveniently manage all your payments in one place.
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-[#8928A4] hover:bg-[#7a2391] text-white font-medium rounded-md transition-colors"
        >
          Explore Other Categories
        </button>
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
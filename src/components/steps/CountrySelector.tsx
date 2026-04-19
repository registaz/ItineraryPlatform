'use client';

import React, { useState, useMemo } from 'react';
import { useFormStore } from '@/stores/formStore';
import { COUNTRIES, getRegionsForCountry } from '@/lib/countriesData';
import { Search, MapPin } from 'lucide-react';

export default function CountrySelector() {
  const { formData, updateFormField } = useFormStore();
  const [countrySearchInput, setCountrySearchInput] = useState(formData.country || '');
  const [regionSearchInput, setRegionSearchInput] = useState(formData.region || '');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);

  const selectedCountry = formData.country;
  const selectedRegion = formData.region;

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!countrySearchInput) return COUNTRIES;
    const lowerInput = countrySearchInput.toLowerCase();
    return COUNTRIES.filter((country) =>
      country.toLowerCase().includes(lowerInput)
    );
  }, [countrySearchInput]);

  // Get regions for selected country
  const availableRegions = useMemo(() => {
    return getRegionsForCountry(selectedCountry);
  }, [selectedCountry]);

  // Filter regions based on search
  const filteredRegions = useMemo(() => {
    if (!regionSearchInput) return availableRegions;
    const lowerInput = regionSearchInput.toLowerCase();
    return availableRegions.filter((region) =>
      region.toLowerCase().includes(lowerInput)
    );
  }, [regionSearchInput, availableRegions]);

  const handleSelectCountry = (country: string) => {
    setCountrySearchInput(country);
    setRegionSearchInput(''); // Reset region when country changes
    updateFormField('country', country);
    updateFormField('region', '');
    setIsCountryDropdownOpen(false);
  };

  const handleSelectRegion = (region: string) => {
    setRegionSearchInput(region);
    updateFormField('region', region);
    setIsRegionDropdownOpen(false);
  };

  return (
    <div className="space-y-7">
      {/* Intro Tip */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <span className="text-2xl flex-shrink-0">💡</span>
        <p className="text-sm text-slate-700">
          Select your destination country and then choose a specific region or city for a more detailed itinerary.
        </p>
      </div>

      {/* Country Selection */}
      <div>
        <label htmlFor="country" className="block text-sm font-semibold text-slate-900 mb-2.5">
          Which country would you like to visit?
        </label>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
            <input
              id="country"
              type="text"
              placeholder="Search for a country..."
              value={countrySearchInput}
              onChange={(e) => {
                setCountrySearchInput(e.target.value);
                setIsCountryDropdownOpen(true);
              }}
              onFocus={() => setIsCountryDropdownOpen(true)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white text-slate-900 placeholder-slate-400"
            />
          </div>

          {/* Country Dropdown */}
          {isCountryDropdownOpen && filteredCountries.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {filteredCountries.map((country) => (
                <button
                  key={country}
                  type="button"
                  onClick={() => handleSelectCountry(country)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-b-0 text-slate-900 hover:text-blue-700"
                >
                  {country}
                </button>
              ))}
            </div>
          )}

          {isCountryDropdownOpen && filteredCountries.length === 0 && countrySearchInput && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg p-4 text-slate-500">
              No countries found
            </div>
          )}
        </div>
      </div>

      {/* Region Selection - only show if country is selected */}
      {selectedCountry && (
        <div>
          <label htmlFor="region" className="block text-sm font-semibold text-slate-900 mb-2.5">
            Which region or area in <span className="font-bold text-blue-600">{selectedCountry}</span>?
          </label>
          <div className="relative">
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 text-slate-400" size={20} />
              <input
                id="region"
                type="text"
                placeholder="Search for a region, city, or area..."
                value={regionSearchInput}
                onChange={(e) => {
                  setRegionSearchInput(e.target.value);
                  setIsRegionDropdownOpen(true);
                }}
                onFocus={() => setIsRegionDropdownOpen(true)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white text-slate-900 placeholder-slate-400"
              />
            </div>

            {/* Region Dropdown */}
            {isRegionDropdownOpen && filteredRegions.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {filteredRegions.map((region) => (
                  <button
                    key={region}
                    type="button"
                    onClick={() => handleSelectRegion(region)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-b-0 text-slate-900 hover:text-blue-700"
                  >
                    {region}
                  </button>
                ))}
              </div>
            )}

            {isRegionDropdownOpen && filteredRegions.length === 0 && regionSearchInput && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg p-4 text-slate-500">
                No regions found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selection Summary */}
      {selectedCountry && selectedRegion && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-2">Your Selection</p>
          <div className="flex items-center gap-3">
            <MapPin className="text-blue-600 flex-shrink-0" size={20} />
            <p className="text-lg font-bold text-blue-900">
              {selectedRegion}, {selectedCountry}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

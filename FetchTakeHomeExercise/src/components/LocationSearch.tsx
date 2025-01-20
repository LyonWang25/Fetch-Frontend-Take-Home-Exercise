import { useEffect,useState, forwardRef, useImperativeHandle  } from "react";
import { Location, LocationSearchParams, locationsAPI } from "../api";
import { US_STATES, USStateAbbreviation } from "../constants";

interface LocationSearchProps {
  onLocationSelect: (zipCodes: string[]) => void;
}

export interface LocationSearchRef {
  reset: () => void;
}

const LocationSearch = forwardRef<LocationSearchRef, LocationSearchProps>(
  ({ onLocationSelect }, ref) => {
    const [selectedStates, setSelectedStates] = useState<USStateAbbreviation[]>(
      []
    );
    const [isSearching, setIsSearching] = useState(false);
    const [locations, setLocations] = useState<Location[]>([]);

    const handleSearch = async () => {
      if (selectedStates.length === 0) return;

      setIsSearching(true);
      try {
        const searchParams: LocationSearchParams = {
          states: selectedStates,
          size: 100,
        };

        const { results } = await locationsAPI.searchLocations(searchParams);
        setLocations(results);

        // Pass the ZIP codes to parent component
        const zipCodes = results.map((loc) => loc.zip_code);
        onLocationSelect(zipCodes);
      } catch (error) {
        console.error("Error searching locations:", error);
      } finally {
        setIsSearching(false);
      }
    };

    // Effect to automatically search when states are selected
    useEffect(() => {
      handleSearch();
    }, [selectedStates]);

    const handleStateSelection = (
      event: React.ChangeEvent<HTMLSelectElement>
    ) => {
      const selectedOptions = Array.from(event.target.selectedOptions);
      const newSelectedStates = selectedOptions.map(
        (option) => option.value as USStateAbbreviation
      );
      setSelectedStates(newSelectedStates);
    };

    const handleReset = () => {
      setSelectedStates([]);
      setLocations([]);
      onLocationSelect([]);
    };

    useImperativeHandle(ref, () => ({
      reset: handleReset,
    }));

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select States
          </label>
          <select
            multiple
            value={selectedStates}
            onChange={handleStateSelection}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            size={5}
          >
            {US_STATES.map((state: USStateAbbreviation) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {isSearching && (
          <div className="text-sm text-gray-600">Loading locations...</div>
        )}

        {locations.length > 0 && (
          <div className="text-sm text-gray-600">
            Found dogs in {selectedStates.join(", ")}
          </div>
        )}
      </div>
    );
  }
);

LocationSearch.displayName = "LocationSearch";

export default LocationSearch;
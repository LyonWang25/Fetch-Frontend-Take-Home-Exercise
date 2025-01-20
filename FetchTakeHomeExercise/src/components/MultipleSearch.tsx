import React, { useState, useEffect, useCallback } from "react";
import { US_STATES } from "../constants";
import { Search as SearchIcon } from "lucide-react";
interface SearchOption {
  category: "breed" | "state" | "zipCode" | "age";
  value: string;
  label: string;
}

interface MultipleSearchProps {
  breeds: string[];
  onSearch: (options: SearchOption[]) => void;
}

const MultipleSearch: React.FC<MultipleSearchProps> = ({
  breeds,
  onSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<SearchOption[]>([]);
  const [suggestions, setSuggestions] = useState<SearchOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);


  const updateSuggestions = useCallback(() => {
    if (searchTerm.length < 1) {
      setSuggestions([]);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const newSuggestions: SearchOption[] = [];

    // Search breeds
    breeds.forEach((breed) => {
      if (breed.toLowerCase().includes(searchTermLower)) {
        newSuggestions.push({
          category: "breed",
          value: breed,
          label: breed,
        });
      }
    });

    // Search states
    US_STATES.forEach((state) => {
      if (state.toLowerCase().includes(searchTermLower)) {
        newSuggestions.push({
          category: "state",
          value: state,
          label: state,
        });
      }
    });

    // Check if input might be a ZIP code
    if (/^\d{5}$/.test(searchTerm)) {
      newSuggestions.push({
        category: "zipCode",
        value: searchTerm,
        label: `ZIP: ${searchTerm}`,
      });
    }

    // Check if input might be an age
    if (/^\d{1,2}$/.test(searchTerm)) {
      newSuggestions.push({
        category: "age",
        value: searchTerm,
        label: `Age: ${searchTerm} years`,
      });
    }

    setSuggestions(newSuggestions);
  }, [searchTerm, breeds]);

  useEffect(() => {
    updateSuggestions();
  }, [searchTerm, updateSuggestions]);

  const handleSelect = useCallback(
    (option: SearchOption) => {
      setSelectedOptions((prev) => {
        // Don't add duplicate options
        if (
          prev.some(
            (selected) =>
              selected.category === option.category &&
              selected.value === option.value
          )
        ) {
          return prev;
        }
        const newOptions = [...prev, option];
        onSearch(newOptions);
        return newOptions;
      });
      setSearchTerm("");
      setShowSuggestions(false);
    },
    [onSearch]
  );

  const handleRemoveOption = useCallback(
    (optionToRemove: SearchOption) => {
      setSelectedOptions((prev) => {
        const newOptions = prev.filter(
          (option) =>
            !(
              option.category === optionToRemove.category &&
              option.value === optionToRemove.value
            )
        );
        onSearch(newOptions);
        return newOptions;
      });
    },
    [onSearch]
  );

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const input = e.target.value;
  setSearchTerm(input);

  // Handle multiple inputs separated by commas
  if (input.includes(",")) {
    const terms = input
      .split(",")
      .map((term) => term.trim())
      .filter(Boolean);
    const lastTerm = terms[terms.length - 1];

    // Process all complete terms except the last one
    terms.slice(0, -1).forEach((term) => {
      // Check for ZIP code
      if (/^\d{5}$/.test(term)) {
        handleSelect({
          category: "zipCode",
          value: term,
          label: `ZIP: ${term}`,
        });
      }
      // Check for age
      else if (/^\d{1,2}$/.test(term)) {
        handleSelect({
          category: "age",
          value: term,
          label: `Age: ${term} years`,
        });
      }
      // Check for breed match
      else if (
        breeds.some((breed) => breed.toLowerCase() === term.toLowerCase())
      ) {
        handleSelect({
          category: "breed",
          value: term,
          label: term,
        });
      }
      // Check for state match
      else if (
        US_STATES.some((state) => state.toLowerCase() === term.toLowerCase())
      ) {
        handleSelect({
          category: "state",
          value: term.toUpperCase(),
          label: term.toUpperCase(),
        });
      }
    });

    // Keep only the last term in the input
    setSearchTerm(lastTerm);
  }

  setShowSuggestions(true);
};


//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const input = e.target.value;
//     setSearchTerm(input);
//     setShowSuggestions(true);

//     //Handle multiple inputs seperated by comma


//     // If it's a complete ZIP code, automatically add it
//     if (/^\d{5}$/.test(value)) {
//       handleSelect({
//         category: "zipCode",
//         value: value,
//         label: `ZIP: ${value}`,
//       });
//     }
//   };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "breed":
        return "bg-blue-100 text-blue-800";
      case "state":
        return "bg-green-100 text-green-800";
      case "zipCode":
        return "bg-purple-100 text-purple-800";
      case "age":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-white">
        {selectedOptions.map((option, index) => (
          <span
            key={`${option.category}-${option.value}-${index}`}
            className={`${getCategoryColor(
              option.category
            )} px-3 py-1 rounded-full text-sm flex items-center gap-2`}
          >
            {option.label}
            <button
              type="button"
              onClick={() => handleRemoveOption(option)}
              className="hover:text-red-500"
            >
              X123
            </button>
          </span>
        ))}
        <div className="flex w-full">
            <SearchIcon size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            className="w-full border-none focus:ring-0 p-1 text-sm"
            placeholder="Search by breed, state, ZIP code, or age..."
          />
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              type="button"
              key={`${suggestion.category}-${suggestion.value}-${index}`}
              onClick={() => handleSelect(suggestion)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
            >
              <span
                className={`${getCategoryColor(
                  suggestion.category
                )} px-2 py-0.5 rounded-full text-xs`}
              >
                {suggestion.category}
              </span>
              {suggestion.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultipleSearch;
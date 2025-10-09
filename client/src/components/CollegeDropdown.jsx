import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { colleges } from '../data/colleges';

const collegeOptions = colleges.map(college => ({ value: college, label: college }));

const CollegeDropdown = ({ id, value, onChange, onBlur, error }) => {
  const [isOther, setIsOther] = useState(false);
  const [customValue, setCustomValue] = useState('');

  useEffect(() => {
    const isPredefined = colleges.some(c => c === value);
    if (value && !isPredefined) {
      setIsOther(true);
      setCustomValue(value);
    }
  }, [value]);

  const handleChange = (selectedOption) => {
    if (selectedOption.value === 'Other') {
      setIsOther(true);
      onChange(''); // Clear the value when 'Other' is selected
    } else {
      setIsOther(false);
      onChange(selectedOption.value);
    }
  };

  const handleCustomChange = (e) => {
    setCustomValue(e.target.value);
    onChange(e.target.value);
  };

  const selectedValue = collegeOptions.find(option => option.value === value);

  return (
    <div>
      <Select
        id={id}
        options={collegeOptions}
        value={isOther ? { value: 'Other', label: 'Other' } : selectedValue}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder="Select or type to search..."
        isSearchable
        styles={{
          control: (base) => ({ ...base, borderColor: error ? 'red' : base.borderColor }),
        }}
      />
      {isOther && (
        <input
          type="text"
          value={customValue}
          onChange={handleCustomChange}
          onBlur={onBlur} // Pass onBlur to the text input as well
          placeholder="Please specify your college"
          className={`w-full px-3 py-2 mt-2 text-gray-700 bg-gray-200 rounded-lg focus:outline-none focus:bg-white ${error ? 'border border-red-500' : ''}`}
        />
      )}
    </div>
  );
};

export default CollegeDropdown;

export const CATEGORY_OPTIONS = [
  {
    value: 'FACILITIES',
    label: 'Facilities Maintenance',
    subCategories: [
      { value: 'LIGHTING', label: 'Lighting Issue' },
      { value: 'CEILING', label: 'Ceiling Damage' },
      { value: 'WALL', label: 'Wall Damage' },
      { value: 'FLOOR', label: 'Floor Damage' },
      { value: 'DOOR_WINDOW', label: 'Door / Window Issue' },
      { value: 'ROOF_LEAKAGE', label: 'Roof Leakage' },
    ],
  },
  {
    value: 'ELECTRICAL',
    label: 'Electrical Systems',
    subCategories: [
      { value: 'POWER_FAILURE', label: 'Power Failure' },
      { value: 'SOCKET', label: 'Socket Problem' },
      { value: 'WIRING', label: 'Electrical Wiring Issue' },
      { value: 'CIRCUIT_BREAKER', label: 'Circuit Breaker Problem' },
      { value: 'GENERATOR', label: 'Generator Issue' },
    ],
  },
  {
    value: 'PLUMBING',
    label: 'Plumbing',
    subCategories: [
      { value: 'WATER_LEAK', label: 'Water Leak' },
      { value: 'PIPE_DAMAGE', label: 'Pipe Damage' },
      { value: 'TAP_PROBLEM', label: 'Tap Problem' },
      { value: 'TOILET_ISSUE', label: 'Toilet Issue' },
      { value: 'DRAINAGE_BLOCK', label: 'Drainage Block' },
    ],
  },
  {
    value: 'IT_NETWORK',
    label: 'IT & Network Equipment',
    subCategories: [
      { value: 'WIFI_PROBLEM', label: 'Network / WiFi Issue' },
      { value: 'INTERNET_DOWN', label: 'Internet Down' },
      { value: 'LAN_PORT', label: 'LAN Port Problem' },
      { value: 'SERVER_ISSUE', label: 'Server Issue' },
    ],
  },
  {
    value: 'EQUIPMENT',
    label: 'Classroom / Lab Equipment',
    subCategories: [
      { value: 'PROJECTOR', label: 'Projector Not Working' },
      { value: 'LAB_PC', label: 'Computer / Lab PC Issue' },
      { value: 'PRINTER', label: 'Printer Problem' },
      { value: 'MICROPHONE', label: 'Microphone Issue' },
      { value: 'CAMERA', label: 'Camera Issue' },
    ],
  },
  {
    value: 'CLEANING',
    label: 'Cleaning & Housekeeping',
    subCategories: [
      { value: 'CLASSROOM_CLEANING', label: 'Classroom Cleaning' },
      { value: 'LAB_CLEANING', label: 'Lab Cleaning' },
      { value: 'WASHROOM_CLEANING', label: 'Washroom Cleaning' },
      { value: 'GARBAGE_COLLECTION', label: 'Garbage Collection' },
      { value: 'CHEMICAL_SPILL', label: 'Chemical Spill' },
    ],
  },
  {
    value: 'HVAC',
    label: 'Air Conditioning & Ventilation',
    subCategories: [
      { value: 'AC_NOT_COOLING', label: 'AC Not Cooling' },
      { value: 'AC_NOISE', label: 'AC Noise' },
      { value: 'AC_WATER_LEAK', label: 'AC Water Leak' },
      { value: 'VENTILATION_PROBLEM', label: 'Ventilation Problem' },
    ],
  },
  {
    value: 'SAFETY',
    label: 'Safety & Security',
    subCategories: [
      { value: 'FIRE_ALARM', label: 'Fire Alarm Issue' },
      { value: 'EMERGENCY_EXIT_BLOCKED', label: 'Emergency Exit Blocked' },
      { value: 'BROKEN_GLASS', label: 'Broken Glass' },
      { value: 'HAZARDOUS_AREA', label: 'Hazardous Area' },
      { value: 'SECURITY_CONCERN', label: 'Security Concern' },
    ],
  },
  {
    value: 'FURNITURE',
    label: 'Furniture Issues',
    subCategories: [
      { value: 'BROKEN_CHAIR', label: 'Broken Chair' },
      { value: 'BROKEN_TABLE', label: 'Broken Table' },
      { value: 'CABINET_DAMAGE', label: 'Cabinet Damage' },
      { value: 'WHITEBOARD_DAMAGE', label: 'Whiteboard Damage' },
    ],
  },
  {
    value: 'OTHER',
    label: 'Other',
    subCategories: [
      { value: 'GENERAL', label: 'General Complaint' },
      { value: 'UNKNOWN', label: 'Unknown Issue' },
    ],
  },
];

export const getCategoryOptions = () => CATEGORY_OPTIONS;

export const getCategoryLabel = (value) => CATEGORY_OPTIONS.find((item) => item.value === value)?.label || value || 'Unknown';

export const getSubCategoryOptions = (categoryValue) =>
  CATEGORY_OPTIONS.find((item) => item.value === categoryValue)?.subCategories || [];

export const getSubCategoryLabel = (categoryValue, subCategoryValue) => {
  const category = CATEGORY_OPTIONS.find((item) => item.value === categoryValue);
  return category?.subCategories.find((item) => item.value === subCategoryValue)?.label || subCategoryValue || 'Unknown';
};

export const formatCategoryDisplay = (categoryValue, subCategoryValue) => {
  const categoryLabel = getCategoryLabel(categoryValue);
  const subCategoryLabel = getSubCategoryValueLabel(categoryValue, subCategoryValue);
  return subCategoryLabel ? `${categoryLabel} / ${subCategoryLabel}` : categoryLabel;
};

function getSubCategoryValueLabel(categoryValue, subCategoryValue) {
  return getSubCategoryLabel(categoryValue, subCategoryValue);
}

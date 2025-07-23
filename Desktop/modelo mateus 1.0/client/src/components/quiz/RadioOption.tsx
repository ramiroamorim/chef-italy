interface RadioOptionProps {
  name: string;
  value: string;
  label: string;
  onSelect: () => void;
}

export default function RadioOption({ name, value, label, onSelect }: RadioOptionProps) {
  return (
    <label className="radio-option">
      <span className="flex items-center relative pl-6 sm:pl-8 cursor-pointer select-none text-sm sm:text-base">
        <input 
          type="radio" 
          name={name} 
          value={value} 
          onChange={onSelect}
          className="absolute opacity-0 cursor-pointer"
        />
        <span className="radio-checkmark absolute top-1/2 left-0 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 border-2 border-primary rounded-full"></span>
        <span dangerouslySetInnerHTML={{ __html: label }} />
      </span>
    </label>
  );
}

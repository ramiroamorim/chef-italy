interface RadioOptionProps {
  name: string;
  value: string;
  label: string;
  onSelect: () => void;
}

export default function RadioOption({ name, value, label, onSelect }: RadioOptionProps) {
  return (
    <label className="radio-option block mb-3">
      <span className="flex items-center relative pl-8 cursor-pointer select-none text-base leading-relaxed py-3 px-4 rounded-lg border border-gray-200 hover:border-primary transition-all duration-200 hover:bg-primary/5">
        <input 
          type="radio" 
          name={name} 
          value={value} 
          onChange={onSelect}
          className="absolute opacity-0 cursor-pointer"
        />
        <span className="radio-checkmark absolute top-1/2 left-3 transform -translate-y-1/2 h-5 w-5 border-2 border-primary rounded-full flex items-center justify-center">
          <span className="w-2.5 h-2.5 bg-primary rounded-full opacity-0 transition-opacity duration-200"></span>
        </span>
        <span className="ml-2" dangerouslySetInnerHTML={{ __html: label }} />
      </span>
    </label>
  );
}

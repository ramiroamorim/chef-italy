interface RadioOptionProps {
  name: string;
  value: string;
  label: string;
  isSelected?: boolean;
  onSelect: () => void;
}

export default function RadioOption({ name, value, label, isSelected = false, onSelect }: RadioOptionProps) {
  // Extrai emoji do início da label usando uma busca mais robusta
  const trimmedLabel = label.trim();
  
  // Lista de emojis específicos usados no quiz
  const knownEmojis = ['🍕', '🍮', '🧁', '🥧', '😩', '😐', '🙄', '🍝', '🍫', '⚖️', '💥', '🧘‍♀️', '🎁', '👩🏻‍🍳', '🎯', '👉🏻', '🍽️', '📛', '🛒', '🥀', '💚', '🌿', '🥗', '✨', '🚫', '🙅‍♀️', '🧪', '🌀', '⚠️', '📩'];
  
  // Encontra emoji no início da string
  let emoji = '';
  let text = trimmedLabel;
  
  for (const knownEmoji of knownEmojis) {
    if (trimmedLabel.startsWith(knownEmoji)) {
      emoji = knownEmoji;
      text = trimmedLabel.slice(knownEmoji.length).trim();
      break;
    }
  }
  
  return (
    <label className="radio-option block mb-2 cursor-pointer select-none">
      <span className="flex items-center gap-3">
        <input
          type="radio"
          name={name}
          value={value}
          checked={isSelected}
          onChange={onSelect}
          className="peer absolute opacity-0 w-6 h-6"
        />
        <span className="relative flex items-center justify-center w-6 h-6 mr-2 radio-checkmark">
          <span 
            className="block w-6 h-6 border-2 rounded-full bg-white" 
            style={{ borderColor: '#E07260' }}
          ></span>
          <span 
            className={`absolute left-1/2 top-1/2 w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 ${
              isSelected ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundColor: '#E07260' }}
          ></span>
        </span>
        {emoji && (
          <span 
            className="text-xl sm:text-2xl mr-2 flex-shrink-0" 
            style={{ 
              fontFamily: 'system-ui, -apple-system, "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif',
              lineHeight: '1',
              display: 'inline-block'
            }}
          >
            {emoji}
          </span>
        )}
        <span className={name === 'temptations' ? "text-sm font-medium text-[#222]" : "text-sm sm:text-base font-medium text-[#222]"}>{text}</span>
      </span>
    </label>
  );
}
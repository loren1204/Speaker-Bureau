interface CategoryFilterProps {
  categories: string[]
  selected: string
  onSelect: (category: string) => void
}

export default function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div>
      <p className="text-xs font-bold tracking-widest text-gray-400 mb-3">
        FILTER BY TOPIC
      </p>
      <ul className="flex flex-col gap-1">
        {categories.map((category) => (
          <li key={category}>
            <button
              onClick={() => onSelect(category)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selected === category
                  ? "bg-pink-50 text-pink-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {category}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
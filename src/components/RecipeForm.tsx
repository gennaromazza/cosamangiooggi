import { useState, FormEvent } from 'react';
import { Recipe, Ingredient } from '../types';
import { X, Plus, Trash2, Save } from 'lucide-react';

interface Props {
  onSave: (recipe: Omit<Recipe, 'id'>) => void;
  onClose: () => void;
}

export default function RecipeForm({ onSave, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Recipe['category']>('lunch');
  const [difficulty, setDifficulty] = useState<Recipe['difficulty']>('easy');
  const [timeMin, setTimeMin] = useState(30);
  const [servings, setServings] = useState(2);
  const [proteinType, setProteinType] = useState<Recipe['proteinType']>('veg');
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', amount: 0, unit: '' }]);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [tags, setTags] = useState<string>('');

  const addIngredient = () => setIngredients([...ingredients, { name: '', amount: 0, unit: '' }]);
  const removeIngredient = (index: number) => setIngredients(ingredients.filter((_, i) => i !== index));
  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const addInstruction = () => setInstructions([...instructions, '']);
  const removeInstruction = (index: number) => setInstructions(instructions.filter((_, i) => i !== index));
  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const recipe: Omit<Recipe, 'id'> = {
      title,
      category,
      difficulty,
      timeMin,
      servings,
      proteinType,
      ingredients: ingredients.filter(ing => ing.name.trim()),
      instructions: instructions.filter(inst => inst.trim()),
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      season: 'all',
      isWHOCompliant: false,
      hasCarbs: ingredients.some(ing => ['pasta', 'riso', 'pane', 'patate', 'farina'].some(c => ing.name.toLowerCase().includes(c))),
      hasProtein: proteinType !== 'veg',
      hasVeg: ingredients.some(ing => ['verdura', 'pomodoro', 'zucchine', 'melanzane', 'spinaci', 'piselli'].some(v => ing.name.toLowerCase().includes(v))),
    };

    onSave(recipe);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">Aggiungi Nuova Ricetta</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Titolo Ricetta</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="es. Risotto alla Milanese"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="lunch">Primo (Pasta/Riso/Zuppa)</option>
                  <option value="dinner">Secondo (Carne/Pesce/Uova)</option>
                  <option value="side">Contorno</option>
                  <option value="fast">Piatto Unico / Veloce</option>
                  <option value="dessert">Dolce</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Proteina Prevalente</label>
                <select
                  value={proteinType}
                  onChange={(e) => setProteinType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="white-meat">Carne Bianca</option>
                  <option value="red-meat">Carne Rossa</option>
                  <option value="fish">Pesce</option>
                  <option value="cheese">Formaggi</option>
                  <option value="eggs">Uova</option>
                  <option value="legumes">Legumi</option>
                  <option value="veg">Vegetariano/Vegano</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Difficoltà</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="easy">Facile</option>
                  <option value="medium">Media</option>
                  <option value="hard">Difficile</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tempo (min)</label>
                <input
                  type="number"
                  value={timeMin}
                  onChange={(e) => setTimeMin(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Porzioni Base</label>
                <input
                  type="number"
                  min="1"
                  value={servings}
                  onChange={(e) => setServings(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Tag (separati da virgola)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="es. vegan, gluten-free, leggero"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700">Ingredienti</label>
                <button type="button" onClick={addIngredient} className="text-indigo-600 text-xs font-bold flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Aggiungi
                </button>
              </div>
              {ingredients.map((ing, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nome"
                    value={ing.name}
                    onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                    className="flex-[2] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Q.tà"
                    value={ing.amount || ''}
                    onChange={(e) => updateIngredient(idx, 'amount', parseFloat(e.target.value))}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Unità"
                    value={ing.unit}
                    onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none"
                  />
                  <button type="button" onClick={() => removeIngredient(idx)} className="text-slate-300 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700">Istruzioni (una per riga)</label>
                <button type="button" onClick={addInstruction} className="text-indigo-600 text-xs font-bold flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Aggiungi
                </button>
              </div>
              {instructions.map((inst, idx) => (
                <div key={idx} className="flex gap-2">
                  <textarea
                    value={inst}
                    onChange={(e) => updateInstruction(idx, e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none h-20 resize-none"
                    placeholder={`Passaggio ${idx + 1}`}
                  />
                  <button type="button" onClick={() => removeInstruction(idx)} className="text-slate-300 hover:text-red-500 h-fit pt-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <button
            onClick={handleSubmit}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-2xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Salva Ricetta Personale
          </button>
        </div>
      </div>
    </div>
  );
}

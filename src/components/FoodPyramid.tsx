import React from 'react';
import { motion } from 'motion/react';
import { Droplets, Apple, Leaf, Milk, Wheat, Fish, Beef, Pizza, Info, CheckCircle2 } from 'lucide-react';

export const FoodPyramid: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Piramide Alimentare OMS</h2>
        <p className="text-slate-600">Guida per una dieta sana, equilibrata e sostenibile</p>
      </div>

      {/* Hero Icon Section */}
      <div className="relative flex flex-col items-center">
        {/* Occasional - Red */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[150px] bg-red-50 border-2 border-red-200 rounded-t-3xl p-4 flex flex-col items-center gap-2 mb-1"
        >
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider text-center">Occasionale</span>
          <div className="flex gap-1">
            <Pizza size={16} className="text-red-500" />
            <Beef size={16} className="text-red-700" />
          </div>
          <p className="text-[10px] text-red-800 text-center font-medium leading-tight">Dolci, snack, salumi, carni rosse</p>
        </motion.div>

        {/* Moderation - Orange */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-[250px] bg-orange-50 border-2 border-orange-200 p-4 flex flex-col items-center gap-2 mb-1"
        >
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider text-center">Moderazione (2-3/sett)</span>
          <div className="flex gap-2">
            <Fish size={20} className="text-orange-500" />
            <div className="flex -space-x-1">
                <div className="w-4 h-4 bg-orange-200 rounded-full border border-orange-300" />
                <div className="w-4 h-4 bg-white rounded-full border border-orange-300" />
            </div>
          </div>
          <p className="text-[10px] text-orange-800 text-center font-medium leading-tight">Pesce, uova, carni bianche</p>
        </motion.div>

        {/* Regular - Yellow */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-[350px] bg-yellow-50 border-2 border-yellow-200 p-4 flex flex-col items-center gap-2 mb-1"
        >
          <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider text-center">Regolarmente (Ogni giorno)</span>
          <div className="flex gap-3">
            <Milk size={20} className="text-yellow-600" />
            <Leaf size={20} className="text-emerald-600" />
          </div>
          <p className="text-[10px] text-yellow-900 text-center font-medium leading-tight">Legumi, latte, yogurt, frutta secca, olio EVO</p>
        </motion.div>

        {/* Base - Green */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-[450px] bg-emerald-50 border-2 border-emerald-200 p-4 flex flex-col items-center gap-2 mb-1"
        >
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider text-center">Ogni Giorno</span>
          <div className="flex gap-4">
            <Apple size={24} className="text-emerald-500" />
            <Wheat size={24} className="text-amber-600" />
            <span className="text-emerald-700 font-bold">FRUTTA e VERDURA</span>
          </div>
          <p className="text-[10px] text-emerald-900 text-center font-medium leading-tight">Verdura, frutta, cereali integrali</p>
        </motion.div>

        {/* Water - Blue */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-[500px] bg-blue-50 border-2 border-blue-200 rounded-b-3xl p-4 flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-2">
            <Droplets size={24} className="text-blue-500" />
            <span className="text-blue-700 font-bold uppercase tracking-widest">Acqua: 1.5 - 2 Litri al giorno</span>
          </div>
        </motion.div>
      </div>

      {/* Principles Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
            <Info size={20} className="text-indigo-600" />
            Principi Fondamentali OMS
          </h3>
          <ul className="space-y-3">
            {[
              "Attività fisica: almeno 30 minuti al giorno",
              "Meno sale: limita il consumo di sodio",
              "Meno zuccheri aggiunti e bevande zuccherate",
              "No grassi trans e cibi ultra-processati",
              "Scegli alimenti freschi e di stagione"
            ].map((text, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-md space-y-4">
          <h3 className="font-bold text-lg">Il Segreto della Salute</h3>
          <p className="text-indigo-100 text-sm leading-relaxed">
            "Varietà, equilibrio e moderazione sono la chiave per una vita sana e sostenibile."
          </p>
          <div className="pt-4 space-y-2">
            <p className="text-xs text-indigo-200 uppercase font-bold tracking-wider">Obiettivo del Piano:</p>
            <p className="text-sm">Assicurare che la tua rotazione settimanale rispetti queste proporzioni, favorendo legumi e proteine vegetali rispetto a carni rosse e processate.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

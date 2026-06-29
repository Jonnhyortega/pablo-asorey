const fs = require('fs');
let content = fs.readFileSync('src/app/student/page.tsx', 'utf-8');

const regex = /<\/main>\s*>\s*<div className="w-16 h-16 rounded-full bg-emerald-100/;
const replacement = `</main>
      </div>

      {/* Overlay de Confirmación de Fecha de Completado */}
      <AnimatePresence>
        {completingDayId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm"
              onClick={() => setCompletingDayId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/app/student/page.tsx', content, 'utf-8');
console.log('Fixed');

import fs from 'fs';
import path from 'path';

const file = 'src/app/student/page.tsx';
let content = fs.readFileSync(file, 'utf-8');

// 1. Add MessageSquare to lucide-react imports
content = content.replace('Upload, User, DollarSign } from "lucide-react";', 'Upload, User, DollarSign, MessageSquare, Menu } from "lucide-react";');

// 2. Add view states
content = content.replace(
  '// Collapsible Sections State',
  `// View State
  const [activeView, setActiveView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Collapsible Sections State`
);

// 3. Replace the main layout wrapper and add Sidebar
const layoutStartRegex = /return \(\s*<div className="min-h-screen[^>]*>[\s\S]*?<header[^>]*>[\s\S]*?<\/header>\s*<main[^>]*>/;

const newLayoutStart = `return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#0f0f13] text-gray-900 dark:text-white font-sans transition-colors duration-300 overflow-hidden">
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white/80 dark:bg-[#15151a]/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-white/5 h-screen shrink-0 relative z-40 transition-colors shadow-sm">
        <div className="p-6 border-b border-gray-200/50 dark:border-white/5 flex items-center gap-3">
          {student.profilePicture ? (
            <img src={student.profilePicture} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-neutral-800 shadow-md shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-lg font-bold text-white shadow-md shrink-0">
              {student.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-bold text-base leading-tight text-gray-900 dark:text-white truncate">Hola, {student.name.split(' ')[0]}</h1>
            <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider truncate">Panel Atleta</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button onClick={() => setActiveView('dashboard')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 \${activeView === 'dashboard' ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold' : 'text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800/50 font-medium'}\`}>
            <Activity className="w-5 h-5" /> Panel Atleta
          </button>
          <button onClick={() => setActiveView('upcoming')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 \${activeView === 'upcoming' ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold' : 'text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800/50 font-medium'}\`}>
            <Calendar className="w-5 h-5" /> Próximos Entrenamientos
          </button>
          <button onClick={() => setActiveView('history')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 \${activeView === 'history' ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold' : 'text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800/50 font-medium'}\`}>
            <CheckCircle className="w-5 h-5" /> Rutinas Realizadas
          </button>
          <button onClick={() => setActiveView('progress')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 \${activeView === 'progress' ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold' : 'text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800/50 font-medium'}\`}>
            <Dumbbell className="w-5 h-5" /> Registro de Progreso
          </button>
          
          <div className="pt-4 mt-4 border-t border-gray-200/50 dark:border-white/5">
            <button onClick={() => setActiveView('support')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 \${activeView === 'support' ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold' : 'text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800/50 font-medium'}\`}>
              <MessageSquare className="w-5 h-5" /> Soporte y Chat
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative bg-gray-50 dark:bg-[#0f0f13] transition-colors">
        
        {/* Header Superior (Mobile Menu Toggle & Actions) */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0f0f13]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5 transition-colors shadow-sm dark:shadow-none p-4 flex justify-between items-center">
          <div className="flex items-center gap-3 md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl">
              <Menu className="w-6 h-6" />
            </button>
            <div className="font-bold text-gray-900 dark:text-white">Panel Atleta</div>
          </div>
          <div className="hidden md:block font-bold text-lg text-gray-900 dark:text-white">
            {activeView === 'dashboard' && 'Panel Principal'}
            {activeView === 'upcoming' && 'Próximos Entrenamientos'}
            {activeView === 'history' && 'Historial de Rutinas'}
            {activeView === 'progress' && 'Registro de Progreso'}
            {activeView === 'support' && 'Soporte y Chat'}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => { setSettingsForm({ weight: student.weight || "", goals: student.goals ? student.goals.split(', ').filter(Boolean) : [], profilePicture: student.profilePicture || "", birthDate: student.birthDate ? student.birthDate.split('T')[0] : "" }); setShowSettings(true); }} className="p-2 text-gray-500 dark:text-neutral-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-xl transition-all">
              <Settings className="w-5 h-5" />
            </button>
            <StudentNotificationsBell />
            <ThemeToggle />
            <button onClick={handleLogout} className="p-2 text-gray-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" />
              <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#15151a] shadow-2xl z-50 md:hidden flex flex-col">
                <div className="p-6 border-b border-gray-200/50 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {student.profilePicture ? (
                      <img src={student.profilePicture} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-white">{student.name.charAt(0)}</div>
                    )}
                    <div>
                      <h1 className="font-bold text-gray-900 dark:text-white truncate">Hola, {student.name.split(' ')[0]}</h1>
                    </div>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500"><X className="w-5 h-5" /></button>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                  <button onClick={() => { setActiveView('dashboard'); setIsMobileMenuOpen(false); }} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl \${activeView === 'dashboard' ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold' : 'text-gray-500 dark:text-neutral-400'}\`}><Activity className="w-5 h-5" /> Panel Atleta</button>
                  <button onClick={() => { setActiveView('upcoming'); setIsMobileMenuOpen(false); }} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl \${activeView === 'upcoming' ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold' : 'text-gray-500 dark:text-neutral-400'}\`}><Calendar className="w-5 h-5" /> Próximos Entrenamientos</button>
                  <button onClick={() => { setActiveView('history'); setIsMobileMenuOpen(false); }} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl \${activeView === 'history' ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold' : 'text-gray-500 dark:text-neutral-400'}\`}><CheckCircle className="w-5 h-5" /> Rutinas Realizadas</button>
                  <button onClick={() => { setActiveView('progress'); setIsMobileMenuOpen(false); }} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl \${activeView === 'progress' ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold' : 'text-gray-500 dark:text-neutral-400'}\`}><Dumbbell className="w-5 h-5" /> Registro de Progreso</button>
                  <button onClick={() => { setActiveView('support'); setIsMobileMenuOpen(false); }} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl \${activeView === 'support' ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold' : 'text-gray-500 dark:text-neutral-400'}\`}><MessageSquare className="w-5 h-5" /> Soporte y Chat</button>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className="max-w-5xl mx-auto w-full px-4 py-8 pb-24 space-y-8">
`;

content = content.replace(layoutStartRegex, newLayoutStart);

// 4. Wrap "Resumen y Pagos" with activeView check
content = content.replace('{/* Resumen y Pagos (Diseño Moderno) */}', '{activeView === "dashboard" && (\n<>\n{/* Resumen y Pagos (Diseño Moderno) */}');
content = content.replace('{/* Próximas Rutinas */}', '</>\n)}\n{/* Próximas Rutinas */}');

// 5. Wrap "Próximas Rutinas"
content = content.replace('<section>', '{activeView === "upcoming" && (\n<section>');
content = content.replace('{/* Historial de Rutinas Realizadas */}', ')}\n{/* Historial de Rutinas Realizadas */}');

// 6. Wrap "Historial"
content = content.replace('{(completedDays.length > 0 || skippedDays.length > 0) && (', '{activeView === "history" && (completedDays.length > 0 || skippedDays.length > 0) && (');
content = content.replace('{/* Adherencia y Días Fallados */}', '{/* Adherencia y Días Fallados */}');

// 7. Wrap "Progreso" (Adherencia + Progreso de Fuerza)
content = content.replace('{adherenceStats.adherence && adherenceStats.adherence.total > 0 && (', '{activeView === "progress" && adherenceStats.adherence && adherenceStats.adherence.total > 0 && (');
// The end of adherence is tricky, let's wrap Progreso de Fuerza instead
content = content.replace('<section className="space-y-4">\n          <div \n              className="flex items-center justify-between mb-2 cursor-pointer select-none"', '{activeView === "progress" && (\n<section className="space-y-4">\n          <div \n              className="flex items-center justify-between mb-2 cursor-pointer select-none"');

// Close the activeView === "progress" before the overlays
content = content.replace('{/* Overlay de Confirmación de Fecha de Completado */}', ')}\n\n      {/* Vista de Soporte */}\n      {activeView === "support" && (\n        <div className="bg-white dark:bg-[#15151a] border border-gray-100 dark:border-white/5 rounded-3xl p-8 text-center shadow-sm">\n          <MessageSquare className="w-16 h-16 text-cyan-500 mx-auto mb-4 opacity-80" />\n          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Soporte y Chat</h2>\n          <p className="text-gray-500 dark:text-neutral-400 max-w-md mx-auto">Próximamente podrás chatear directamente con tu entrenador desde esta sección. ¡Mantente atento a las actualizaciones!</p>\n        </div>\n      )}\n\n      {/* Overlay de Confirmación de Fecha de Completado */}');

// 8. Close the new div wrapper at the end of the file
content = content.replace('</main>', '</main>\n      </div>');

fs.writeFileSync(file, content, 'utf-8');
console.log('Refactoring complete!');

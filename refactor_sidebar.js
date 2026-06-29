const fs = require('fs');
let code = fs.readFileSync('src/app/student/page.tsx', 'utf-8');

const startRegex = new RegExp('<div className=\"min-h-screen.*?>[\\s\\S]*?<main className=\"max-w-5xl mx-auto px-4 py-8 space-y-8\">');

const newLayoutHeader = `<div className="min-h-screen bg-gray-50 dark:bg-[#0f0f13] text-gray-900 dark:text-white font-sans transition-colors duration-300 flex overflow-hidden">
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 border-r border-gray-200 dark:border-white/5 bg-white dark:bg-[#0f0f13] z-10 shrink-0 h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-[#0f0f13]/90 backdrop-blur-md z-20">
          <div className="font-black text-xl text-gray-900 dark:text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500 text-white flex items-center justify-center font-bold">P</div>
            <span>Panel Atleta</span>
          </div>
        </div>

        <div className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-6">
            {student.profilePicture ? (
              <img src={student.profilePicture} alt="Profile" className="w-12 h-12 rounded-full object-cover ring-2 ring-cyan-500/20" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-cyan-500/20">{student.name.charAt(0)}</div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-gray-900 dark:text-white truncate">Hola, {student.name.split(' ')[0]}</h2>
              <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">Atleta Activo</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pb-6">
          <button onClick={() => setActiveView('dashboard')} className={\`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 \${activeView === 'dashboard' ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold shadow-sm shadow-cyan-500/5' : 'text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800/50 hover:text-gray-900 dark:hover:text-white'}\`}>
            <Activity className="w-5 h-5" /> <span>Resumen</span>
          </button>
          <button onClick={() => setActiveView('upcoming')} className={\`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 \${activeView === 'upcoming' ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold shadow-sm shadow-cyan-500/5' : 'text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800/50 hover:text-gray-900 dark:hover:text-white'}\`}>
            <Calendar className="w-5 h-5" /> <span>Entrenamientos</span>
          </button>
          <button onClick={() => setActiveView('history')} className={\`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 \${activeView === 'history' ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold shadow-sm shadow-cyan-500/5' : 'text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800/50 hover:text-gray-900 dark:hover:text-white'}\`}>
            <CheckCircle className="w-5 h-5" /> <span>Historial</span>
          </button>
          <button onClick={() => setActiveView('progress')} className={\`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 \${activeView === 'progress' ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold shadow-sm shadow-cyan-500/5' : 'text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800/50 hover:text-gray-900 dark:hover:text-white'}\`}>
            <Dumbbell className="w-5 h-5" /> <span>Progresos</span>
          </button>
          <button onClick={() => setActiveView('support')} className={\`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 \${activeView === 'support' ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold shadow-sm shadow-cyan-500/5' : 'text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800/50 hover:text-gray-900 dark:hover:text-white'}\`}>
            <MessageSquare className="w-5 h-5" /> <span>Soporte</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Mobile Header */}
        <header className="md:hidden flex-shrink-0 sticky top-0 z-40 bg-white/80 dark:bg-[#0f0f13]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5 transition-colors duration-300">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl">
                <Menu className="w-6 h-6" />
              </button>
              <div className="font-black text-lg text-gray-900 dark:text-white">Panel Atleta</div>
            </div>
            <div className="flex items-center gap-2">
              <StudentNotificationsBell />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex flex-shrink-0 sticky top-0 z-40 bg-white/80 dark:bg-[#0f0f13]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5 px-6 py-4 items-center justify-between transition-colors duration-300">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {activeView === 'dashboard' && 'Resumen General'}
            {activeView === 'upcoming' && 'Próximos Entrenamientos'}
            {activeView === 'history' && 'Historial de Rutinas'}
            {activeView === 'progress' && 'Tus Progresos'}
            {activeView === 'support' && 'Soporte y Chat'}
          </h1>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setSettingsForm({ weight: student.weight || "", goals: student.goals ? student.goals.split(', ').filter(Boolean) : [], profilePicture: student.profilePicture || "", birthDate: student.birthDate ? student.birthDate.split('T')[0] : "" });
                setShowSettings(true);
              }}
              className="p-2.5 text-gray-500 dark:text-neutral-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-xl transition-all"
            >
              <Settings className="w-5 h-5" />
            </button>
            <StudentNotificationsBell />
            <ThemeToggle />
            <button 
              onClick={handleLogout}
              className="p-2.5 text-gray-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/60 z-50 md:hidden backdrop-blur-sm" />
              <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#0f0f13] shadow-2xl z-50 md:hidden flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {student.profilePicture ? (
                      <img src={student.profilePicture} alt="Profile" className="w-10 h-10 rounded-full object-cover ring-2 ring-cyan-500/20" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">{student.name.charAt(0)}</div>
                    )}
                    <div className="min-w-0">
                      <h2 className="font-bold text-gray-900 dark:text-white truncate text-lg">Hola, {student.name.split(' ')[0]}</h2>
                    </div>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 bg-gray-100 dark:bg-neutral-800 rounded-full"><X className="w-5 h-5" /></button>
                </div>
                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                  <button onClick={() => { setActiveView('dashboard'); setIsMobileMenuOpen(false); }} className={\`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 \${activeView === 'dashboard' ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold' : 'text-gray-500 dark:text-neutral-400'}\`}><Activity className="w-5 h-5" /> <span>Resumen</span></button>
                  <button onClick={() => { setActiveView('upcoming'); setIsMobileMenuOpen(false); }} className={\`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 \${activeView === 'upcoming' ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold' : 'text-gray-500 dark:text-neutral-400'}\`}><Calendar className="w-5 h-5" /> <span>Entrenamientos</span></button>
                  <button onClick={() => { setActiveView('history'); setIsMobileMenuOpen(false); }} className={\`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 \${activeView === 'history' ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold' : 'text-gray-500 dark:text-neutral-400'}\`}><CheckCircle className="w-5 h-5" /> <span>Historial</span></button>
                  <button onClick={() => { setActiveView('progress'); setIsMobileMenuOpen(false); }} className={\`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 \${activeView === 'progress' ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold' : 'text-gray-500 dark:text-neutral-400'}\`}><Dumbbell className="w-5 h-5" /> <span>Progresos</span></button>
                  <button onClick={() => { setActiveView('support'); setIsMobileMenuOpen(false); }} className={\`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 \${activeView === 'support' ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold' : 'text-gray-500 dark:text-neutral-400'}\`}><MessageSquare className="w-5 h-5" /> <span>Soporte</span></button>
                </nav>
                <div className="p-4 border-t border-gray-200 dark:border-white/5">
                  <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl font-bold">
                    <LogOut className="w-5 h-5" /> Cerrar Sesión
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 pb-24 space-y-8">
`;

code = code.replace(startRegex, newLayoutHeader);

// Using Exact string match replacements
code = code.replace('{/* Resumen y Pagos */}', '{activeView === "dashboard" && (<>\n        {/* Resumen y Pagos */}');
code = code.replace('{/* Próximas Rutinas */}', '</>)}\n\n        {activeView === "upcoming" && (\n        {/* Próximas Rutinas */}');
code = code.replace('{/* Historial de Rutinas Realizadas */}', ')}\n\n        {activeView === "history" && (\n        {/* Historial de Rutinas Realizadas */}');
code = code.replace('{/* Adherencia y Días Fallados */}', ')}\n\n        {activeView === "progress" && (<>\n        {/* Adherencia y Días Fallados */}');

const supportSection = `</>)}\n\n        {activeView === "support" && (
          <div className="bg-white dark:bg-[#15151a] border border-gray-100 dark:border-white/5 rounded-3xl p-8 text-center shadow-sm">
            <MessageSquare className="w-16 h-16 text-cyan-500 mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Soporte y Chat</h2>
            <p className="text-gray-500 dark:text-neutral-400 max-w-md mx-auto">Próximamente podrás chatear directamente con tu entrenador desde esta sección. ¡Mantente atento a las actualizaciones!</p>
          </div>
        )}\n\n        {/* Overlay de Confirmación de Omisión */}`;

code = code.replace('{/* Overlay de Confirmación de Omisión */}', supportSection);

code = code.replace(/    <\/div>\s*  \);\s*}\s*$/, '          </div>\n        </main>\n      </div>\n    </div>\n  );\n}\n');

fs.writeFileSync('src/app/student/page.tsx', code);
console.log('Refactored accurately!');

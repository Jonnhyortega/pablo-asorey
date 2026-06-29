import sys

with open('src/app/student/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state variable
state_original = """  const [expandedCompletedDayId, setExpandedCompletedDayId] = useState<
    string | null
  >(null);
  const [exerciseEdits, setExerciseEdits] = useState<{"""

state_new = """  const [expandedCompletedDayId, setExpandedCompletedDayId] = useState<
    string | null
  >(null);
  const [expandedWeeks, setExpandedWeeks] = useState<{ [key: string]: boolean }>({});
  const [exerciseEdits, setExerciseEdits] = useState<{"""

content = content.replace(state_original, state_new)

# 2. Add weekly grouping logic
sort_original = """  // Ordenar completados por fecha de completado (descendente, más reciente primero)
  completedDays.sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );"""

sort_new = """  // Ordenar completados por fecha de completado (descendente, más reciente primero)
  completedDays.sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );

  // Agrupar por semanas
  const groupedCompletedDays: Record<string, any[]> = {};
  completedDays.forEach((day) => {
    const d = new Date(day.completedAt);
    const dayOfWeek = d.getDay();
    const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(d.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    const weekKey = `Semana del ${startOfWeek.toLocaleDateString()}`;
    if (!groupedCompletedDays[weekKey]) {
      groupedCompletedDays[weekKey] = [];
    }
    groupedCompletedDays[weekKey].push(day);
  });

  const toggleWeek = (week: string) => {
    setExpandedWeeks(prev => ({ ...prev, [week]: !prev[week] }));
  };"""

content = content.replace(sort_original, sort_new)

# 3. Modify checkbox UI to CheckButton wrapped in label
checkbox_original = """                                                <input
                                                  type="checkbox"
                                                  className="w-4 h-4 rounded border-gray-300 dark:border-neutral-700 text-emerald-500 focus:ring-emerald-500 bg-white dark:bg-neutral-900 cursor-pointer mt-1 shrink-0 transition-colors"
                                                  checked={
                                                    exerciseEdits[ex.id]
                                                      ?.isCompleted || false
                                                  }
                                                  onChange={(e) =>
                                                    handleExerciseChange(
                                                      ex.id,
                                                      "isCompleted",
                                                      e.target.checked,
                                                    )
                                                  }
                                                />
                                                <div className="flex flex-col">
                                                  <h4
                                                    className={`font-bold text-base transition-colors leading-tight break-words ${exerciseEdits[ex.id]?.isCompleted ? "text-gray-400 dark:text-neutral-500 line-through" : "text-red-500 dark:text-white"}`}
                                                  >
                                                    {ex.name}
                                                  </h4>"""

checkbox_new = """                                                <label className="flex items-start gap-3 cursor-pointer group flex-1">
                                                  <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                                                    <input
                                                      type="checkbox"
                                                      className="sr-only"
                                                      checked={
                                                        exerciseEdits[ex.id]?.isCompleted || false
                                                      }
                                                      onChange={(e) =>
                                                        handleExerciseChange(
                                                          ex.id,
                                                          "isCompleted",
                                                          e.target.checked,
                                                        )
                                                      }
                                                    />
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${exerciseEdits[ex.id]?.isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-300 dark:border-neutral-600 text-transparent group-hover:border-emerald-400"}`}>
                                                      <CheckCircle className="w-4 h-4" />
                                                    </div>
                                                  </div>
                                                  <div className="flex flex-col flex-1">
                                                    <h4
                                                      className={`font-bold text-base transition-colors leading-tight break-words ${exerciseEdits[ex.id]?.isCompleted ? "text-gray-400 dark:text-neutral-500 line-through" : "text-red-500 dark:text-white group-hover:text-emerald-500"}`}
                                                    >
                                                      {ex.name}
                                                    </h4>
                                                </label>"""

content = content.replace(checkbox_original, checkbox_new)


# 4. History rendering map
history_original = """                              {completedDays.map((day) => ("""

history_new = """                              {Object.entries(groupedCompletedDays).map(([week, daysInWeek]) => (
                                <div key={week} className="border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden mb-4">
                                  <div 
                                    className="bg-gray-50 dark:bg-neutral-900 px-4 py-3 flex items-center justify-between cursor-pointer select-none"
                                    onClick={() => toggleWeek(week)}
                                  >
                                    <h3 className="font-bold text-gray-800 dark:text-gray-200">{week}</h3>
                                    <div className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors">
                                      {expandedWeeks[week] ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                                    </div>
                                  </div>
                                  <AnimatePresence initial={false}>
                                    {expandedWeeks[week] && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="bg-white dark:bg-[#0f0f13]"
                                      >
                                        <div className="p-4 space-y-4">
                                          {daysInWeek.map((day) => ("""

# Replace only the first instance of completedDays.map (the one inside history section)
# Wait, are there other maps?
# Let's replace the block and properly close it
history_render_original = """                              {completedDays.map((day) => (
                                <div
                                  key={day.id}
                                  className="bg-white dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden transition-all shadow-sm dark:shadow-none"
                                >"""

history_render_new = """                              {Object.entries(groupedCompletedDays).map(([week, daysInWeek]) => (
                                <div key={week} className="border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden mb-4 shadow-sm dark:shadow-none">
                                  <div 
                                    className="bg-gray-50 dark:bg-neutral-900 px-4 py-3 flex items-center justify-between cursor-pointer select-none"
                                    onClick={() => toggleWeek(week)}
                                  >
                                    <h3 className="font-bold text-gray-800 dark:text-gray-200">{week}</h3>
                                    <div className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors">
                                      {expandedWeeks[week] ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                                    </div>
                                  </div>
                                  <AnimatePresence initial={false}>
                                    {expandedWeeks[week] && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="bg-white dark:bg-[#0f0f13]"
                                      >
                                        <div className="p-4 space-y-4">
                                          {daysInWeek.map((day) => (
                                <div
                                  key={day.id}
                                  className="bg-white dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden transition-all shadow-sm dark:shadow-none"
                                >"""

content = content.replace(history_render_original, history_render_new)

# Now we need to close the extra tags from the week grouping
# The original closed day rendering block with:
#                                 </div>
#                               ))}
# Let's find that block and add the closing tags for the week

closing_original = """                                </div>
                              ))}
                            </motion.div>"""

closing_new = """                                </div>
                                          ))}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              ))}
                            </motion.div>"""

content = content.replace(closing_original, closing_new)

# Fix a potential tag mismatch with the custom label. We left the <div className="flex flex-col"> open in the replacement. We need to find the closing div of that flex flex-col to close the label.
# Or rather, we replaced <div className="flex flex-col"> with <label><div...><div className="flex flex-col">
# Wait! In original:
# <div className="flex items-start gap-2 mb-1.5">
#   <input ... />
#   <div className="flex flex-col">
#     <h4>...</h4>
#     {(() => { ... })()}
#   </div>
# </div>

# In my replacement, I did:
# <label className="...">
#   <div ...><input/><CheckCircle/></div>
#   <div className="flex flex-col flex-1">
#     <h4>...</h4>
# </label>
# This completely swallows the {(() => {...})()} rendering that comes right after <h4> !!!
# That's very wrong. Let me fix the python replacement for the checkbox.
"""
"""

with open('fix.py', 'w', encoding='utf-8') as script:
    script.write(content)

print("Python code generated")

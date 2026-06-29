import sys

with open('src/app/student/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. State
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


# 2. Weekly logic
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


# 3. History
history_original = """                              {completedDays.map((day) => (
                                <div
                                  key={day.id}
                                  className="bg-white dark:bg-neutral-900/60 border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden transition-all shadow-sm dark:shadow-none"
                                >"""

history_new = """                              {Object.entries(groupedCompletedDays).map(([week, daysInWeek]) => (
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

content = content.replace(history_original, history_new)

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


# 4. Checkbox
checkbox_original = """                                              <div className="flex items-start gap-2 mb-1.5">
                                                <input
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

checkbox_new = """                                              <div className="flex flex-col mb-1.5">
                                                <label className="flex items-start gap-3 cursor-pointer group select-none">
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
                                                  <h4
                                                    className={`font-bold text-base transition-colors leading-tight break-words pt-0.5 ${exerciseEdits[ex.id]?.isCompleted ? "text-gray-400 dark:text-neutral-500 line-through" : "text-red-500 dark:text-white group-hover:text-emerald-500"}`}
                                                  >
                                                    {ex.name}
                                                  </h4>
                                                </label>
                                                <div className="flex flex-col mt-2">"""

# Replace ONLY the exercise header, keeping the historical stats rendering intact.
content = content.replace(checkbox_original, checkbox_new)


with open('fix2.py', 'w', encoding='utf-8') as script:
    script.write(content)

with open('src/app/student/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied fix successfully")

const fs = require('fs');
let content = fs.readFileSync('src/app/student/page.tsx', 'utf-8');

const sortLogic = `completedDays.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());`;
const groupingLogic = `  completedDays.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  // Agrupar completados por semana
  const getWeekStart = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    monday.setHours(0,0,0,0);
    return monday;
  };

  const groupedCompletedDays = completedDays.reduce((acc, day) => {
    const weekStart = getWeekStart(day.completedAt);
    const weekKey = weekStart.toISOString();
    if (!acc[weekKey]) acc[weekKey] = [];
    acc[weekKey].push(day);
    return acc;
  }, {});

  const sortedWeeks = Object.keys(groupedCompletedDays).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());`;

content = content.replace(sortLogic, groupingLogic);

const mapStart = `{completedDays.map((day) => (`;
const mapReplacementStart = `{sortedWeeks.map((weekKey) => {
                    const weekStartDate = new Date(weekKey);
                    const weekEndDate = new Date(weekStartDate);
                    weekEndDate.setDate(weekEndDate.getDate() + 6);
                    const isCurrentWeek = getWeekStart(new Date().toISOString()).toISOString() === weekKey;
                    const title = isCurrentWeek ? 'Esta semana' : \`Semana del \${weekStartDate.getDate()} al \${weekEndDate.getDate()} de \${weekStartDate.toLocaleString('es-ES', { month: 'short' })}\`;
                    
                    return (
                      <div key={weekKey} className="mb-6 last:mb-0">
                        <h3 className="text-sm font-bold text-gray-500 dark:text-neutral-400 mb-3 px-1 uppercase tracking-wider">{title}</h3>
                        <div className="space-y-3">
                          {groupedCompletedDays[weekKey].map((day: any) => (`;

content = content.replace(mapStart, mapReplacementStart);

const mapEnd = `                  ))}
                    </motion.div>`;
const mapReplacementEnd = `                  ))}
                        </div>
                      </div>
                    );
                  })}
                    </motion.div>`;

content = content.replace(mapEnd, mapReplacementEnd);

fs.writeFileSync('src/app/student/page.tsx', content, 'utf-8');
console.log('Done!');

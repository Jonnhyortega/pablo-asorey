# Rediseño "Noir y oro" — Spec de diseño

- **Fecha:** 2026-10-21
- **Estado:** aprobado en conversación, pendiente de revisión escrita
- **Alcance:** sub-proyecto 1 de 2 (rediseño visual). El sub-proyecto 2 (editor de textos para el dueño) tiene su propia spec más adelante.

## 1. Objetivo

Llevar la landing, el panel del profesor (`/admin`) y el panel del alumno (`/student`) a una estética premium, moderna y profesional de "lujo atlético" (referencias: Equinox, Whoop, Nike Training), evolucionando la identidad actual (violeta + dorado) en vez de reemplazarla.

**Éxito significa:**
- Las tres áreas se leen como una sola marca: mismos tokens, misma tipografía y los mismos componentes base.
- Ningún color fuera del sistema (desaparecen el naranja `#fc581e`, los azules del admin y el cyan del alumno).
- Cero cambios funcionales salvo las dos excepciones listadas en §1.2.

### 1.1 Restricciones

- **Los textos de la landing no se modifican.** Todo el copy de marketing sale de `src/config/site.ts`. No se agrega copy de marketing nuevo.
- Los textos que hoy están escritos a mano en los componentes de la landing (por ejemplo "PABLO" / "ASOREY" en `Hero.tsx` y el link `wa.me` del CTA) se mueven a `site.ts` con el mismo valor.
- La landing lee el contenido solo a través de `getSiteContent()` (nuevo, `src/lib/content.ts`), que hoy devuelve `siteConfig`. Es el punto de conexión del sub-proyecto 2.
- API, modelos de Prisma, auth y flujos no cambian.
- La UI de los paneles puede tener microcopy propio (etiquetas como "Hoy toca", "Racha actual").

### 1.2 Excepciones funcionales aprobadas

1. **Resumen del admin:** se agregan dos métricas, cada una con un `count` de Prisma sobre campos existentes de `Student`:
   - *Alumnos activos:* `lastActivityDate` dentro de los últimos 14 días. El total de alumnos se muestra como sufijo ("32 / 48").
   - *Pagos pendientes:* `paymentStatus` en `PENDING` u `OVERDUE`.
2. **Inicio del alumno:** tarjeta "próximo entrenamiento", derivada en el cliente del primer día pendiente de las rutinas que ya se cargan. No requiere endpoint nuevo.

## 2. Sistema de diseño

### 2.1 Tokens

Definidos en `src/app/globals.css` como variables CSS semánticas expuestas a Tailwind 4 vía `@theme`. Los componentes solo usan estos tokens, nunca hex sueltos.

| Token | Oscuro (default) | Claro (solo paneles) | Uso |
|---|---|---|---|
| `bg` | `#0A0810` | `#F6F3EE` | Fondo de página |
| `surface` | `#120E19` | `#FFFFFF` | Tarjetas |
| `surface-2` | `#17121F` | `#EFEAE2` | Hover, ítem activo |
| `line` | `#241D2E` | `#E2DBD0` | Bordes 1px |
| `text` | `#F3EEE6` | `#15111B` | Texto principal |
| `muted` | `#8B8494` | `#6E6676` | Texto secundario |
| `gold` | `#C8A24C` | `#9C7A2E` | Acento único |
| `gold-line` | `#5A4A24` | `#D9C7A0` | Borde de badges dorados |
| `success` | `#8FC9A0` | `#2F7A4A` | Estado OK |
| `danger` | `#E08A7A` | `#B0442F` | Error, destructivo |

- Las variables claras se activan con la clase `.light` sobre el contenedor de paneles (next-themes ya usa `attribute="class"`). El oscuro es el valor por defecto en `:root`.
- **La landing es siempre oscura:** su layout no aplica la clase de tema, y el toggle de tema solo existe en los paneles. El default de next-themes pasa de `system` a `dark`.
- Todo par texto/fondo cumple WCAG AA. `gold` sobre `bg` oscuro y `#9C7A2E` sobre claro se verifican en la implementación.

### 2.2 Tipografía

- **Display:** Anton (`next/font/google`), siempre en mayúsculas, sin itálica, con `leading` ajustado (0.9–1.0). Se usa en títulos y en números de métricas, con `tabular-nums`.
- **Texto:** Inter, igual que hoy.
- **Etiquetas** (`SectionLabel`): Inter 11–12px, mayúsculas, tracking amplio (`0.2em`–`0.3em`), en `gold` o `muted`.
- Se elimina Funnel Display.

### 2.3 Forma, espacio y profundidad

- Radios: 2px en la landing y 6px en los paneles. Las pastillas (`rounded-full`) solo se usan en avatares y en el botón flotante.
- Bordes de 1px `line`. **Sin sombras:** la profundidad viene de las capas `bg` → `surface` → `surface-2`.
- Secciones de la landing: `py-24` en móvil y `py-32` en escritorio. Ancho máximo del contenido: 1200px.

### 2.4 Regla del dorado

Como máximo **una** acción primaria dorada por pantalla. Además, el dorado se reserva para: el ítem activo de la navegación, los logros y medallas, los números destacados y el foco de los inputs. El resto de la interfaz va en `text` / `muted`.

### 2.5 Movimiento

- framer-motion (ya instalado). Landing: fade + desplazamiento de 16px al entrar en el viewport, una vez. Paneles: transiciones de 150–200 ms `ease-out`.
- Con `prefers-reduced-motion` se desactivan los desplazamientos y quedan solo los cambios de opacidad.

### 2.6 Componentes base (`src/components/ui/`)

| Componente | Responsabilidad |
|---|---|
| `Button` | Variantes `primary` (dorado), `secondary` (borde `line`), `ghost`, `danger`. Tamaños `sm` / `md` / `lg`. Estado `loading`. Funciona como `<a>` o `<button>`. |
| `Card` | Superficie `surface` con borde `line` y padding estándar. |
| `StatTile` | Etiqueta + número en Anton + sufijo opcional + barra de progreso opcional. |
| `Badge` | Estados con borde fino: `neutral`, `gold`, `success`, `danger`. |
| `Input`, `Select`, `Textarea` | Borde `line`, foco `gold`, label y mensaje de error. |
| `Table` | Tabla densa en escritorio con un modo apilado para móvil. |
| `PageHeader` | Título en Anton + subtítulo + slot de acciones. |
| `SectionLabel` | Etiqueta en mayúsculas con tracking amplio. |
| `Dialog` | Modal accesible (foco atrapado, Esc, overlay). Variante `sheet` (lateral en escritorio, desde abajo en móvil). Reemplaza `ConfirmDialog` y los overlays a mano. |
| `AppShell` | Sidebar + header + barra inferior en móvil (opcional), compartido por el admin y el alumno. Recibe los ítems de navegación por props. |

El tema de `react-hot-toast` se configura una vez en `layout.tsx` (fondo `surface`, borde `line`, ícono `gold`).

## 3. Landing

Los componentes viven en `src/components/` (se rehacen los existentes, no se duplican). Todos los textos vienen de `getSiteContent()`.

Orden final:

1. **Navbar:** transparente sobre el hero y `bg` con borde inferior `line` después de 24px de scroll. Wordmark `ASOREY.` con el punto en `gold`, links actuales y un CTA dorado `sm`. En móvil: menú a pantalla completa sobre `bg`.
2. **Hero:** `100svh`, dividido en dos. Izquierda: `SectionLabel` (`hero.subtitle`), nombre en Anton a `clamp(4rem, 12vw, 10rem)`, `hero.secondarySubtitle` y CTA primario (`hero.ctaText`, mismo destino de WhatsApp que hoy). Derecha: `hero.image` con `next/image` `priority`, fundida hacia `bg` con un gradiente de máscara. En móvil, la foto va detrás del texto con overlay oscuro.
3. **Asesoría online + Video** (fusión de `EntrenaSection` + `VideoSection`): texto (`entrena.*`) a la izquierda y video a la derecha en un marco `line`. El iframe de YouTube se monta recién al tocar play; antes se muestra la portada (`i.ytimg.com/vi/<id>/maxresdefault.jpg`) con un botón de play propio.
4. **Features:** tres columnas con numeración 01/02/03 en `gold`, título en Anton y divisores verticales `line`. Sin íconos ni cajas.
5. **Antes y después:** se ubica **antes** de Planes. Galería de 2 imágenes grandes, `SectionLabel` + título en Anton y el CTA actual.
6. **Planes:** 4 tarjetas `Card`, precio en Anton, features con íconos lucide de trazo fino en `muted`. El plan con `highlight: true` lleva borde `gold` y un `Badge gold`. En móvil, scroll horizontal con `snap`. Los CTA mantienen su destino actual.
7. **Valores:** lista numerada grande (una línea por ítem, divisores `line`) y `valores.image` al costado.
8. **Contacto:** formulario con los componentes `Input` / `Textarea` / `Button`, en dos columnas con los datos de contacto. Mismo endpoint `/api/contact`.
9. **Unite ahora:** a todo el ancho, `uniteAhora.image` con overlay `bg` al 70% y CTA primario.
10. **Footer:** columnas de newsletter (mismo endpoint `/api/newsletter`), redes y contacto. Debajo, el wordmark grande a todo el ancho con **el logo 3D (`Hero3DLogo`) en versión reducida al lado**, cargado con `next/dynamic` (`ssr: false`) y montado solo cuando entra en el viewport (IntersectionObserver).

Se mantiene `CasoExitoSection`, todavía comentada en `page.tsx`. Si se rehace, que sea con el sistema nuevo, pero sigue desactivada.

**Otros:**
- `FloatingWhatsApp`: círculo `bg` con borde `gold` e ícono en `text`.
- `/mi-historia`: hero con `historia.heroTitle` y timeline en una columna editorial (año en Anton `gold` y párrafos con fotos en grilla).
- `/aplicar`: mismo formulario y misma lógica, con los componentes nuevos.

## 4. Panel del profesor (`/admin`)

- **Shell:** `ClientAdminShell` pasa a usar `AppShell`.
  - Sidebar `bg` con el wordmark `ASOREY.`. Ítem activo: fondo `surface-2` + barra izquierda `gold` de 2px. Resto en `muted`.
  - Se mantienen los grupos Gestión / Sistema, el modo colapsado (solo íconos con tooltip) y el drawer en móvil.
  - Header: título en Anton, `AdminNotificationsBell` (punto `gold` si hay pendientes) y `ThemeToggle`.
  - Se eliminan "OMEGA ADMIN" y todo el azul.
- **Resumen (`/admin`):** `PageHeader` con saludo y fecha. Fila de `StatTile`: alumnos activos, pagos pendientes, mensajes y suscriptores. Debajo, la lista de últimos mensajes; los no leídos llevan un `Badge gold` "Nuevo".
- **Alumnos (`/admin/students`):** `Table` con nombre, plan, estado de pago (`Badge`), última actividad y acciones, con búsqueda arriba. En móvil, filas apiladas. `EditStudentModal` y la confirmación de borrado pasan a `Dialog`.
- **Rutinas (`/admin/students/[id]/routines`):** mismo comportamiento (drag & drop, autocompletado de la biblioteca, super series, HIIT, copiar días). Se divide en `RoutineCard`, `DayEditor`, `ExerciseRow`, `ExercisePicker` y `NewExerciseDialog` dentro de `src/app/admin/students/[id]/routines/_components/`. La lógica y el estado no se modifican, solo se reubican.
- **Biblioteca de ejercicios, Mensajes, Suscriptores:** `PageHeader` + `Table` + estados vacíos sobrios. Se conserva la confirmación estricta al borrar ejercicios.
- **Configuración:** solo se rediseña. Sigue sin persistir (se resuelve en el sub-proyecto 2).
- **Login del admin:** pantalla dividida, con el wordmark grande sobre `bg` de un lado y el formulario en `surface` del otro.

## 5. Panel del alumno (`/student`)

### 5.1 División del archivo

`src/app/student/page.tsx` (3.054 líneas) se divide **sin cambiar la lógica, el estado ni las llamadas a la API**:

```
src/app/student/
  page.tsx                  # estado, carga de datos, handlers; compone vistas
  _components/
    views/DashboardView.tsx
    views/UpcomingView.tsx
    views/HistoryView.tsx
    views/ProgressView.tsx
    views/SupportView.tsx
    NextWorkoutCard.tsx
    WorkoutDay.tsx
    ExerciseLogger.tsx      # series, peso, super series, HIIT
    XpCard.tsx
    StreakCard.tsx
    BadgeShowcase.tsx
    PaymentCard.tsx
    dialogs/CompleteDayDialog.tsx
    dialogs/SkipDayDialog.tsx
    dialogs/EditDateDialog.tsx
    dialogs/SettingsSheet.tsx
    dialogs/VideoDialog.tsx
    dialogs/XpInfoDialog.tsx
    dialogs/BadgesInfoDialog.tsx
```

Los handlers bajan por props. Si el traspaso de props se vuelve inmanejable, se permite un contexto local (`StudentDashboardContext`) dentro de `/student`.

### 5.2 Diseño

- **Navegación:** `AppShell` en escritorio, con avatar y nombre en la sidebar. En móvil, barra inferior fija de 5 ítems (Inicio, Próximos, Historial, Progreso, Soporte) con el activo en `gold`. Reemplaza la hamburguesa. Se elimina el cyan.
- **Inicio:** `NextWorkoutCard` ("Hoy toca" + nombre del día + `Button primary` que abre ese día en Próximos). `StreakCard` y `XpCard` (`StatTile` con barra `gold`). `BadgeShowcase`: las desbloqueadas en `gold`, las bloqueadas en contorno `muted`. `PaymentCard`.
- **Próximos:** días plegables. `ExerciseLogger` con inputs de al menos 44px de alto, teclado numérico (`inputMode="decimal"`), botón de video y check. "Completar día" es la única acción `primary` del día abierto.
- **Historial:** agrupado por semana, línea de tiempo `line` y resumen por día.
- **Progreso:** recharts re-tematizado (series `gold`/`text`, grilla `line`, tooltip `surface`). La adherencia pasa de torta rojo/verde a un anillo `gold` con el porcentaje en Anton. Días fallados: barras `muted` con la más alta en `danger`.
- **Soporte:** `Card` con el link actual de WhatsApp.
- **Configuración:** `Dialog` en variante `sheet` con los mismos campos (foto, peso, fecha de nacimiento, objetivos, medalla de perfil).
- **Toasts:** tema global (§2.6), sin confeti.
- **Login del alumno (`/login`):** mismo diseño que el login del admin.

## 6. Pruebas y verificación

El proyecto no tiene suite de tests. La verificación es:

1. `npm run build` y `npm run lint` sin errores nuevos.
2. Recorrido manual en el navegador (in-app browser) en escritorio y móvil (375px), con modo claro y oscuro en los paneles:
   - Landing completa, envío del formulario de contacto y de la newsletter, CTA de WhatsApp, `/mi-historia`, `/aplicar`.
   - Admin: login, resumen con las 4 métricas, CRUD de alumno, editor de rutinas (crear rutina, agregar día, drag & drop, super serie, HIIT), biblioteca, notificaciones y resolver pago.
   - Alumno: login, completar / omitir / cambiar la fecha de un día, cargar series, ver progreso, editar configuración, ganar XP/racha.
3. Comparación de la carga inicial de la landing antes y después (Lighthouse móvil). El LCP no debe empeorar; se espera que mejore al sacar three.js del hero.
4. `grep` de hex sueltos y de clases `blue-` / `cyan-` / `orange-` en `src/`: no debe quedar ninguno fuera de `globals.css`.

## 7. Fuera de alcance

- Editor de textos para el dueño y persistencia de Configuración (sub-proyecto 2).
- Cambios de API, de schema o de auth (salvo las 2 métricas de §1.2, que son solo lectura).
- Copy de marketing nuevo.
- Las vulnerabilidades de seguridad pendientes, que se tratan aparte.

## 8. Prerrequisito

El working tree tiene cambios sin commitear en `prisma/schema.prisma`, `src/app/api/routines/**`, `src/app/api/students/me/route.ts` y `src/app/student/page.tsx`. Antes de empezar hay que commitearlos o descartarlos, porque §5.1 reescribe la estructura de `student/page.tsx`.

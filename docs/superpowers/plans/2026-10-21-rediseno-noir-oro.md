# Rediseño "Noir y oro" — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar landing, panel de profesor y panel de alumno con el sistema "Noir y oro" sin cambiar textos ni funcionalidad (salvo las 2 excepciones de la spec §1.2).

**Architecture:** Primero tokens + componentes base (`src/components/ui/`) + `AppShell`; después se reconstruye cada área encima. Los dos archivos gigantes (`student/page.tsx`, `admin/students/[id]/routines/page.tsx`) se dividen en una tarea de "solo estructura" antes de rediseñarlos, para que el cambio visual nunca se mezcle con mover lógica.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4 (`@theme`), next-themes, framer-motion, lucide-react, recharts, react-hot-toast, Prisma 5.

**Spec:** `docs/superpowers/specs/2026-10-21-rediseno-noir-oro-design.md`

## Global Constraints

- Textos de landing: solo desde `getSiteContent()`; cero copy de marketing nuevo; valores de `site.ts` sin cambios.
- Ningún hex ni clase `blue-*` / `cyan-*` / `orange-*` / `slate-*` en `src/` fuera de `globals.css` al terminar (Task 16 lo verifica).
- Tokens exactos de spec §2.1 (oscuro por defecto, claro solo en paneles).
- Display: Anton, mayúsculas, sin itálica. Texto: Inter. Funnel Display se elimina.
- Radios: 2px landing, 6px paneles. Sin sombras. Bordes 1px `line`.
- Máximo una acción `primary` (dorada) por pantalla.
- `prefers-reduced-motion`: sin desplazamientos, solo opacidad.
- API, schema Prisma y auth sin cambios. Única lectura nueva: `getAdminMetrics()` (Task 9).
- El proyecto no tiene suite de tests (spec §6): cada tarea se verifica con `npm run lint`, `npm run build` y un recorrido concreto en el navegador in-app sobre `npm run dev` (http://localhost:3000), en escritorio y a 375px.
- Commits en la rama `dev`, uno por tarea, terminando con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Tema claro en paneles con `html.light`:** la landing debe seguir oscura aunque el usuario haya elegido claro en el panel (next-themes persiste la clase en `<html>`). → Verificación en Task 1 y Task 3.
2. **Barra inferior móvil del alumno tapando contenido o inputs** (último ejercicio, botón "Completar día", teclado en iOS). → Verificación en Task 14.
3. **Textos largos** (nombre de alumno de 40+ caracteres, nombre de ejercicio largo, email largo en tablas) rompiendo layouts. → Verificación en Task 10 y Task 15.
4. **Estados vacíos:** alumno sin rutinas o sin días pendientes (la `NextWorkoutCard` no puede romperse) y admin sin alumnos / sin mensajes. → Verificación en Task 9, Task 10 y Task 14.
5. **`Dialog` con teclado:** Esc cierra, el foco queda atrapado y vuelve al disparador, y el scroll del body se bloquea. Aplica a todos los diálogos migrados. → Verificación en Task 2, con re-chequeo en Task 11 y Task 16.

---

### Task 0: Prerrequisitos y línea base

**Files:**
- Commit: `docs/superpowers/specs/2026-10-21-rediseno-noir-oro-design.md`, `docs/superpowers/plans/2026-10-21-rediseno-noir-oro.md`

- [ ] **Step 1:** Preguntar al usuario qué hacer con los cambios sin commitear (`prisma/schema.prisma`, `src/app/api/routines/**`, `src/app/api/students/me/route.ts`, `src/app/student/page.tsx`) y con los archivos sueltos (`inspect_*.mjs`, `test_gamification.*`, `presupuesto/`). No continuar hasta que `git status` no muestre cambios en `src/` ni en `prisma/`.
- [ ] **Step 2:** Correr `npm run build`. Esperado: build OK. Si falla, reportarlo al usuario antes de seguir, porque es la línea base.
- [ ] **Step 3:** Lighthouse móvil sobre la landing (`npm run build && npm run start`, luego el skill `web-vitals-auditor:lighthouse-audit` contra http://localhost:3000). Guardar LCP, TBT y el peso de JS en `docs/superpowers/plans/2026-10-21-baseline.md`.
- [ ] **Step 4:** Commit de spec, plan y baseline: `docs: add Noir y oro redesign spec, plan and baseline`.

### Task 1: Tokens, tipografía y tema

**Files:**
- Modify: `src/app/globals.css`, `src/app/layout.tsx`

**Interfaces:**
- Produces: clases Tailwind `bg-bg`, `bg-surface`, `bg-surface-2`, `border-line`, `text-text`, `text-muted`, `text-gold`, `bg-gold`, `border-gold`, `border-gold-line`, `text-success`, `text-danger` (y sus variantes `bg-`/`border-`); `font-display` (Anton) y `font-sans` (Inter); atributo `data-panel` que activa los tokens claros bajo `html.light [data-panel]`; utilidades `.radius-brand` (2px) y `.radius-panel` (6px) como `--radius-brand` / `--radius-panel` en `@theme`.

- [ ] **Step 1:** En `globals.css`, declarar las variables semánticas de la spec §2.1 en `:root` (valores oscuros) y en `html.light [data-panel]` (valores claros). Exponerlas con `@theme inline` como `--color-bg`, `--color-surface`, etc. Mantener `@custom-variant dark` hasta la Task 16 (el código viejo lo usa). Eliminar `--color-primary-orange`, `--color-dark-bg`, etc. y la regla de `h1..h6` con `--font-funnel`. Agregar `--font-display: var(--font-anton)` y, en `body`: `background: var(--color-bg)` y `color: var(--color-text)`.
- [ ] **Step 2:** En `layout.tsx`, reemplazar `Funnel_Display` por `Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton" })`. Cambiar el `ThemeProvider` a `defaultTheme="dark"` y `enableSystem={false}`. Quitar del `<body>` las clases `bg-white dark:bg-[#0f0f13] text-gray-900 dark:text-gray-100`. Configurar `<Toaster toastOptions={{ style: { background: "var(--color-surface)", color: "var(--color-text)", border: "1px solid var(--color-line)", borderRadius: 6 }, iconTheme: { primary: "var(--color-gold)", secondary: "var(--color-bg)" } }} />`.
- [ ] **Step 3:** Reemplazar `font-funnel` por `font-display` en `src/components/Navbar.tsx:53` y `src/components/Footer.tsx:22` (las rehacen las Tasks 5 y 6; acá solo se evita que el build pierda la fuente).
- [ ] **Step 4:** `npm run lint && npm run build`. Esperado: sin errores nuevos.
- [ ] **Step 5:** Navegador: `/` se ve con fondo `#0A0810`. En la consola: `document.documentElement.classList.add('light')`. La landing sigue oscura (Review Focus 1).
- [ ] **Step 6:** Commit `feat(design): Noir y oro tokens, Anton display font, dark default theme`.

### Task 2: Componentes base

**Files:**
- Create: `src/components/ui/Button.tsx`, `Card.tsx`, `StatTile.tsx`, `Badge.tsx`, `Field.tsx` (exporta `Input`, `Select`, `Textarea`), `Table.tsx`, `PageHeader.tsx`, `SectionLabel.tsx`, `Dialog.tsx`, `index.ts`, `src/lib/cn.ts`
- Create: `src/app/ui-kit/page.tsx` (vitrina de desarrollo)

**Interfaces:**
- Produces (exportado desde `@/components/ui`):
  - `cn(...classes: (string | false | null | undefined)[]): string` (en `@/lib/cn`, sin dependencias nuevas).
  - `Button`: props `{ variant?: "primary" | "secondary" | "ghost" | "danger"; size?: "sm" | "md" | "lg"; loading?: boolean; href?: string; external?: boolean; className?: string } & ButtonHTMLAttributes`. Con `href`, renderiza `next/link`; con `external`, renderiza `<a target="_blank" rel="noopener noreferrer">`.
  - `Card`: `{ as?: "div" | "section" | "article"; padded?: boolean; className?; children }`.
  - `StatTile`: `{ label: string; value: string | number; suffix?: React.ReactNode; tone?: "default" | "gold"; progress?: number /* 0–1 */ }`.
  - `Badge`: `{ tone?: "neutral" | "gold" | "success" | "danger"; children }`.
  - `Input` / `Select` / `Textarea`: los props nativos + `{ label?: string; error?: string }`. Con `forwardRef`.
  - `Table`: `Table`, `Table.Head`, `Table.Row`, `Table.Cell`, `Table.HeadCell`; prop `stackOnMobile?: boolean` en `Table`. Con ese prop, cada `Table.Cell` usa `data-label` para mostrar su encabezado en móvil.
  - `PageHeader`: `{ title: string; eyebrow?: string; actions?: React.ReactNode }`.
  - `SectionLabel`: `{ tone?: "gold" | "muted"; children }`.
  - `Dialog`: `{ open: boolean; onClose: () => void; title: string; description?: string; variant?: "modal" | "sheet"; children; footer?: React.ReactNode }`. Se monta en un portal con overlay `bg/70`, foco atrapado, Esc cierra, devuelve el foco al disparador y bloquea el scroll del body. Animación con framer-motion que respeta `useReducedMotion()`. `sheet`: panel lateral derecho en `md+` y hoja desde abajo en móvil.
- [ ] **Step 1:** Implementar `cn` y los componentes según las firmas de arriba, usando solo los tokens de la Task 1. Los componentes de panel usan `rounded-[6px]` y `Button` acepta `className` para el `rounded-[2px]` de la landing.
- [ ] **Step 2:** `src/app/ui-kit/page.tsx`: hace `notFound()` si `process.env.NODE_ENV === "production"`. Debe estar envuelto en `<div data-panel>` y mostrar cada variante: Buttons (4 variantes × 3 tamaños + loading), StatTile con progreso, Badges, Inputs con error, una Table de 3 filas con `stackOnMobile` (una fila con un nombre de 45 caracteres) y botones que abren un Dialog modal y uno sheet.
- [ ] **Step 3:** `npm run lint && npm run build`.
- [ ] **Step 4:** Navegador en `/ui-kit`, primero en escritorio y después a 375px:
  - Tab llega a cada control y el foco se ve en dorado.
  - Al abrir el Dialog, Tab no sale del diálogo, Esc lo cierra y el foco vuelve al botón (Review Focus 5).
  - Con `html.light` los componentes cambian a claro.
  - El nombre largo se trunca sin desbordar.
- [ ] **Step 5:** Commit `feat(ui): base component kit (Button, Card, StatTile, Badge, fields, Table, Dialog)`.

### Task 3: AppShell

**Files:**
- Create: `src/components/ui/AppShell.tsx`
- Modify: `src/components/ThemeToggle.tsx` (rediseño con tokens; misma API `isCollapsed?: boolean`)

**Interfaces:**
- Produces: `AppShell` con props:
  ```ts
  type NavItem = { href?: string; onSelect?: () => void; label: string; icon: LucideIcon; active: boolean; group?: string };
  {
    brand?: React.ReactNode;           // default: wordmark ASOREY.
    nav: NavItem[];
    title: string;                     // en Anton, en el header
    headerActions?: React.ReactNode;   // campana, etc.
    sidebarTop?: React.ReactNode;      // avatar del alumno
    sidebarFooter?: React.ReactNode;   // ThemeToggle, logout
    mobileNav?: "drawer" | "bottom";   // admin: drawer, alumno: bottom
    children: React.ReactNode;
  }
  ```
  Envuelve todo en `<div data-panel>`. Sidebar colapsable en `lg+` (estado interno). Agrupa los `nav` por `group` con el rótulo `SectionLabel tone="muted"`. Ítem activo: `bg-surface-2` + barra izquierda `gold` de 2px. Con `"bottom"`, hasta 5 ítems en una barra fija con `pb-[env(safe-area-inset-bottom)]`, y el `main` recibe `pb-24` en móvil.
- [ ] **Step 1:** Implementar `AppShell` con la API de arriba. Extraer el wordmark `ASOREY.` a `src/components/ui/Wordmark.tsx` (`{ size?: "sm" | "md" | "lg" | "xl"; className? }`), que lo reutilizan Navbar, Footer y los logins.
- [ ] **Step 2:** Agregar al `/ui-kit` una demo de `AppShell` con 5 ítems en `/ui-kit?shell=bottom` y en `/ui-kit?shell=drawer`.
- [ ] **Step 3:** `npm run lint && npm run build`.
- [ ] **Step 4:** Navegador: en escritorio colapsar y expandir la sidebar. A 375px, abrir el drawer y cerrarlo tocando el overlay. En modo bottom, el último elemento de la página queda visible por encima de la barra. Con el toggle a claro y después yendo a `/`, la landing sigue oscura (Review Focus 1).
- [ ] **Step 5:** Commit `feat(ui): shared AppShell with sidebar, drawer and bottom nav`.

### Task 4: Accesor de contenido

**Files:**
- Create: `src/lib/content.ts`
- Modify: `src/config/site.ts` (solo agregar claves), todos los componentes de landing que importan `siteConfig` (lista: `grep -rln "siteConfig" src/components src/app/page.tsx src/app/mi-historia src/app/aplicar`)

**Interfaces:**
- Produces: `getSiteContent(): SiteContent` y `export type SiteContent = typeof siteConfig`. Hoy devuelve `siteConfig` y es síncrona. El sub-proyecto 2 la va a cambiar, así que nadie importa `siteConfig` directamente desde la landing.
- [ ] **Step 1:** Agregar a `site.ts`:
  - `hero.titleLines: ["PABLO", "ASOREY"]`.
  - `hero.ctaHref: "https://wa.me/541160218709"`.
  - Cualquier otro literal visible o URL que hoy esté escrito a mano en los componentes de landing (revisar cada archivo de la lista). El valor tiene que ser idéntico al actual.
- [ ] **Step 2:** Crear `content.ts` y reemplazar los imports de `siteConfig` por `getSiteContent()` en los componentes de landing. Admin y alumno quedan fuera.
- [ ] **Step 3:** `npm run lint && npm run build`. Correr `grep -rn "siteConfig" src/components src/app/page.tsx src/app/mi-historia src/app/aplicar`. Esperado: sin resultados.
- [ ] **Step 4:** Navegador: la landing se ve igual que antes de esta tarea, con los mismos textos.
- [ ] **Step 5:** Commit `refactor(content): route landing copy through getSiteContent()`.

### Task 5: Landing, estructura de marca (Navbar, Hero, Footer con 3D, WhatsApp)

**Files:**
- Modify: `src/components/Navbar.tsx`, `Hero.tsx`, `Footer.tsx`, `FloatingWhatsApp.tsx`, `src/components/animations/FadeIn.tsx`
- Create: `src/components/LazyLogo3D.tsx`

**Interfaces:**
- Consumes: `getSiteContent()`, `Button`, `SectionLabel`, `Wordmark`.
- Produces: `FadeIn` que respeta `useReducedMotion()` (solo opacidad) y anima una sola vez al entrar en el viewport, con desplazamiento de 16px. Mantiene sus props actuales.
- [ ] **Step 1:** Navbar según spec §3.1: transparente y, con `scrollY > 24`, pasa a `bg-bg border-b border-line`. Links actuales sin cambios, CTA `Button primary sm` y menú móvil a pantalla completa.
- [ ] **Step 2:** Hero según spec §3.2: `min-h-[100svh]`, dividido en dos, nombre desde `hero.titleLines` con `clamp(4rem,12vw,10rem)` y `hero.image` con `next/image priority` + máscara de gradiente hacia `bg`. Se quita `Hero3DLogo` del Hero.
- [ ] **Step 3:** `LazyLogo3D`: `next/dynamic(() => import("./Hero3DLogo"), { ssr: false })`, montado solo cuando un `IntersectionObserver` (`rootMargin: "200px"`) lo marca visible. Contenedor de 220px de alto en móvil y 320px en escritorio.
- [ ] **Step 4:** Footer según spec §3.10, con `LazyLogo3D` al lado del `Wordmark size="xl"`. La newsletter sigue enviando a `/api/newsletter`.
- [ ] **Step 5:** `FloatingWhatsApp`: círculo `bg-bg border border-gold` con ícono `text-text`, mismo link.
- [ ] **Step 6:** `npm run lint && npm run build`.
- [ ] **Step 7:** Navegador:
  - En la pestaña Network, al cargar `/` no se pide ningún chunk de three.js hasta hacer scroll al footer.
  - A 375px, el nombre no desborda horizontalmente (`document.documentElement.scrollWidth === innerWidth`).
  - Con "reducir movimiento" emulado, no hay desplazamientos.
  - Enviar la newsletter con un email de prueba muestra el toast nuevo.
- [ ] **Step 8:** Commit `feat(landing): Noir y oro navbar, hero, footer with lazy 3D logo`.

### Task 6: Landing, secciones de contenido

**Files:**
- Create: `src/components/AsesoriaSection.tsx` (fusiona `EntrenaSection` + `VideoSection`, que se eliminan), `src/components/LiteYouTube.tsx`
- Modify: `FeaturesSection.tsx`, `AntesDespuesSection.tsx`, `PlanesSection.tsx`, `ValoresSection.tsx`, `ContactSection.tsx`, `UniteAhoraSection.tsx`, `CasoExitoSection.tsx`, `src/app/page.tsx`

**Interfaces:**
- Produces:
  - `LiteYouTube({ url: string; title: string })`. Extrae el id con `/(?:embed\/|v=|youtu\.be\/)([\w-]{11})/`. Si no lo encuentra, renderiza el iframe directo. Muestra la portada `https://i.ytimg.com/vi/<id>/maxresdefault.jpg` y, al hacer clic, monta `https://www.youtube-nocookie.com/embed/<id>?autoplay=1`.
  - Orden en `page.tsx`: `Hero, AsesoriaSection, FeaturesSection, AntesDespuesSection, PlanesSection, ValoresSection, ContactSection, UniteAhoraSection` (`CasoExitoSection` sigue comentado).
- [ ] **Step 1:** Implementar cada sección según spec §3.3–§3.9, con `FadeIn`, `SectionLabel`, `Card`, `Badge`, `Button` y los campos de formulario. Planes: el plan con `highlight` lleva `border-gold` y `Badge tone="gold"`; en móvil, `flex overflow-x-auto snap-x snap-mandatory` con tarjetas `min-w-[85%]`. Los CTA mantienen su `href` actual.
- [ ] **Step 2:** Agregar a `next.config.ts` `images.remotePatterns` para `i.ytimg.com` si la portada usa `next/image`.
- [ ] **Step 3:** `npm run lint && npm run build`.
- [ ] **Step 4:** Navegador:
  - Recorrer `/` completa en escritorio y a 375px sin scroll horizontal.
  - Clic en el video: se reproduce.
  - En el carrusel de planes, el snap funciona y el destacado se distingue.
  - Enviar el formulario de contacto con datos de prueba: aparece el toast de éxito y el mensaje figura en `/admin/leads`.
  - Comparar los textos visibles contra `site.ts`: sin cambios.
- [ ] **Step 5:** Commit `feat(landing): redesign content sections, merge entrena+video with lite YouTube`.

### Task 7: Landing, páginas secundarias

**Files:**
- Modify: `src/app/mi-historia/page.tsx`, `src/components/HistoriaTimeline.tsx`, `src/app/aplicar/page.tsx`

- [ ] **Step 1:** `/mi-historia` según spec §3 "Otros": timeline en una sola columna, año en `font-display text-gold` y fotos en grilla con `next/image`.
- [ ] **Step 2:** `/aplicar`: reemplazar inputs y botones por los componentes de `ui`, sin tocar el estado ni el submit.
- [ ] **Step 3:** `npm run lint && npm run build`.
- [ ] **Step 4:** Navegador: recorrer `/mi-historia` a 375px y en escritorio. En `/aplicar`, enviar con un campo requerido vacío: el error aparece en el campo. Con datos de prueba, el envío llega igual que antes.
- [ ] **Step 5:** Commit `feat(landing): redesign mi-historia and aplicar`.

### Task 8: Logins

**Files:**
- Create: `src/components/AuthLayout.tsx`
- Modify: `src/app/login/page.tsx`, `src/app/admin/login/page.tsx`

**Interfaces:**
- Produces: `AuthLayout({ eyebrow: string; title: string; children })`. A la izquierda (oculto en móvil) va el `Wordmark size="xl"` sobre `bg`; a la derecha, el formulario en `surface`.
- [ ] **Step 1:** Implementar `AuthLayout` y migrar ambos logins sin cambiar la lógica de submit ni los redirects.
- [ ] **Step 2:** `npm run lint && npm run build`.
- [ ] **Step 3:** Navegador: ingresar con un usuario de prueba del seed (`prisma/seed.js` / `seed.mjs`) en `/login` y en `/admin/login`. Las credenciales incorrectas muestran error. A 375px, no hay desborde.
- [ ] **Step 4:** Commit `feat(auth): Noir y oro login screens`.

### Task 9: Admin, shell y Resumen con métricas

**Files:**
- Create: `src/lib/admin-metrics.ts`
- Modify: `src/app/admin/ClientAdminShell.tsx`, `src/app/admin/page.tsx`, `src/app/admin/LogoutButton.tsx`

**Interfaces:**
- Consumes: `AppShell` (`mobileNav="drawer"`), `PageHeader`, `StatTile`, `Badge`, `Card`.
- Produces: `getAdminMetrics(now?: Date): Promise<{ activeStudents: number; totalStudents: number; pendingPayments: number; messages: number; subscribers: number }>`.
  - `activeStudents` = `lastActivityDate >= now - 14 días`.
  - `pendingPayments` = `paymentStatus in ["PENDING", "OVERDUE"]`.
  - Las 5 consultas van en un solo `Promise.all`.
- [ ] **Step 1:** Implementar `getAdminMetrics`.
- [ ] **Step 2:** `ClientAdminShell` usa `AppShell`, con los mismos ítems y grupos (Gestión / Sistema) y la misma excepción para `/admin/login`. Va `AdminNotificationsBell` en `headerActions`, y `ThemeToggle` + `LogoutButton` en `sidebarFooter`. El título del header se deriva del pathname (Resumen, Alumnos, Ejercicios, Mensajes, Suscriptores, Configuración).
- [ ] **Step 3:** `admin/page.tsx`: `PageHeader` con eyebrow = fecha (`toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "short" })`) y título "Buen día, Pablo". Grilla de 4 `StatTile`:
  - Activos con `suffix={`/ ${totalStudents}`}`.
  - Pagos pendientes con `tone="gold"` cuando el valor es mayor a 0.
  - Mensajes.
  - Suscriptores.

  Debajo, la lista de últimos mensajes con `Badge tone="gold"` "Nuevo" en los no leídos. Estado vacío sobrio.
- [ ] **Step 4:** `npm run lint && npm run build`.
- [ ] **Step 5:** Navegador: las 4 métricas coinciden con un conteo manual (`node inspect_db.mjs` o Prisma Studio). Con la base sin mensajes, se ve el estado vacío (Review Focus 4). Drawer a 375px y tema claro OK.
- [ ] **Step 6:** Commit `feat(admin): AppShell and overview with active students and pending payments`.

### Task 10: Admin, Alumnos

**Files:**
- Modify: `src/app/admin/students/page.tsx`

- [ ] **Step 1:** Lista con `PageHeader` (acción: el botón actual de crear alumno, si existe), `Input` de búsqueda (filtro en cliente por nombre/email sobre los datos ya cargados) y `Table stackOnMobile` con nombre, plan, `Badge` de `paymentStatus` (`UP_TO_DATE`→success "Al día", `PENDING`→gold "Pendiente", `OVERDUE`→danger "Vencido"), última actividad y acciones.
- [ ] **Step 2:** `EditStudentModal` y la confirmación de borrado usan `Dialog`. La lógica de guardado no cambia.
- [ ] **Step 3:** `npm run lint && npm run build`.
- [ ] **Step 4:** Navegador:
  - Editar un alumno y guardar: el cambio persiste al recargar.
  - Crear un alumno con un nombre de 45 caracteres: la tabla no se rompe (Review Focus 3).
  - Borrar un alumno de prueba.
  - Una búsqueda sin resultados muestra el estado vacío (Review Focus 4).
  - A 375px, las filas se ven apiladas.
- [ ] **Step 5:** Commit `feat(admin): students table and dialogs`.

### Task 11: Admin, editor de rutinas

**Files:**
- Create: `src/app/admin/students/[id]/routines/_components/RoutineCard.tsx`, `DayEditor.tsx`, `ExerciseRow.tsx`, `ExercisePicker.tsx`, `NewExerciseDialog.tsx`
- Modify: `src/app/admin/students/[id]/routines/page.tsx`
- Delete: `src/components/ConfirmDialog.tsx` (su único otro uso es este archivo; se reemplaza por `Dialog`)

**Interfaces:**
- Los componentes reciben estado y handlers por props desde `page.tsx`. El estado (`formData`, `draggingEx`, `dragOverEx`, `searchQueries`, `dropdownOpen`, `focusedIndex`, `exerciseLibrary`, etc.) y todos los `fetch` quedan en `page.tsx`.
- [ ] **Step 1 (solo estructura):** Mover el JSX a los 5 componentes sin cambiar clases ni lógica. `npm run lint && npm run build`. En el navegador, el editor se ve y funciona igual. Commit `refactor(admin): split routines editor into components`.
- [ ] **Step 2 (visual):**
  - Rutinas como acordeón `Card` con borde `line` y días como sub-bloques.
  - `ExerciseRow` compacta, con campos en línea (`Input` sm) y asa de arrastre visible en `muted`.
  - `ExercisePicker` como desplegable `surface`, con el ítem enfocado en `surface-2` y la navegación con teclado que ya tiene.
  - Confirmaciones con `Dialog`.
- [ ] **Step 3:** `npm run lint && npm run build`.
- [ ] **Step 4:** Navegador, recorrido completo:
  - Crear una rutina.
  - Agregar un día copiando otro.
  - Agregar un ejercicio desde la biblioteca con teclado (flechas + Enter).
  - Crear un ejercicio nuevo vía `NewExerciseDialog`.
  - Reordenar por drag & drop.
  - Armar una super serie y un bloque HIIT.
  - Guardar y recargar: todo persiste.
  - Borrar un día con confirmación: Esc cancela (Review Focus 5).
- [ ] **Step 5:** Commit `feat(admin): Noir y oro routines editor`.

### Task 12: Admin, páginas restantes

**Files:**
- Modify: `src/app/admin/exercises/page.tsx`, `leads/page.tsx`, `subscribers/page.tsx`, `settings/page.tsx`, `src/app/admin/AdminNotificationsBell.tsx`

- [ ] **Step 1:** Ejercicios, Mensajes y Suscriptores pasan a `PageHeader` + `Table stackOnMobile` + estados vacíos. Se conserva la confirmación estricta (escribir el nombre) al borrar un ejercicio, ahora dentro de `Dialog`.
- [ ] **Step 2:** Configuración: se rediseña con los componentes de formulario. Se mantiene el aviso de que todavía no guarda, con `Card` + `Badge tone="gold"`. La lógica no cambia.
- [ ] **Step 3:** Campana: botón `ghost` con punto `bg-gold` si hay pendientes y desplegable `surface` + `border-line`. Las acciones de resolver pago no cambian.
- [ ] **Step 4:** `npm run lint && npm run build`.
- [ ] **Step 5:** Navegador: crear y borrar un ejercicio en la biblioteca. Ver mensajes y suscriptores. Resolver una notificación de pago de prueba (generarla desde el panel de alumno con "solicitar verificación de pago").
- [ ] **Step 6:** Commit `feat(admin): exercises, leads, subscribers, settings and notifications`.

### Task 13: Alumno, dividir el archivo (solo estructura)

**Files:**
- Create: los archivos de spec §5.1 bajo `src/app/student/_components/`
- Modify: `src/app/student/page.tsx`

**Interfaces:**
- `page.tsx` conserva todo el estado, los efectos, los handlers y el cálculo de `pendingDays` / `completedDays` / `skippedDays` / `groupedCompletedDays`, y se los pasa a cada vista por props.
- Si alguna vista necesita más de ~12 props, crear `src/app/student/_components/StudentDashboardContext.tsx` con `StudentDashboardProvider` y `useStudentDashboard()`, que exponen exactamente esos valores y handlers.
- `NextWorkoutCard` recibe `{ day: any | null; onStart: () => void }`, con `day = pendingDays[0] ?? null`. Se usa `any`, igual que el resto del archivo; tipar los datos queda fuera del alcance.
- [ ] **Step 1:** Mover el JSX de cada vista, componente y overlay a su archivo **sin cambiar ninguna clase ni lógica**.
- [ ] **Step 2:** `npm run lint && npm run build`. `page.tsx` debe quedar por debajo de 800 líneas.
- [ ] **Step 3:** Navegador, con un alumno de prueba: recorrer las 5 vistas, completar un día con fecha, omitir otro, cambiar una fecha, cargar series de una super serie, abrir un video, abrir la info de XP y de medallas, y editar la configuración. Todo se comporta igual que en `dev` antes de esta tarea.
- [ ] **Step 4:** Commit `refactor(student): split dashboard into views, components and dialogs`.

### Task 14: Alumno, shell, navegación inferior e Inicio

**Files:**
- Modify: `src/app/student/page.tsx`, `_components/views/DashboardView.tsx`, `NextWorkoutCard.tsx`, `XpCard.tsx`, `StreakCard.tsx`, `BadgeShowcase.tsx`, `PaymentCard.tsx`, `src/app/student/StudentNotificationsBell.tsx`

- [ ] **Step 1:** `page.tsx` usa `AppShell` con `mobileNav="bottom"`. Los 5 ítems llaman a `setActiveView` vía `onSelect`. El `sidebarTop` muestra avatar y nombre, y la campana va en `headerActions`. Se elimina la sidebar y el drawer propios y todo el cyan.
- [ ] **Step 2:** Inicio según spec §5.2:
  - `NextWorkoutCard`: "Hoy toca" + `day.dayName` + `Button primary`, que hace `setActiveView("upcoming")` y `setExpandedDayId(day.id)`. Si `day === null`, muestra "Sin entrenamientos pendientes" sin botón.
  - `StreakCard` y `XpCard` como `StatTile` con `progress`.
  - `BadgeShowcase`: las desbloqueadas en `text-gold`, las bloqueadas en `text-muted` con borde `line` (sin `opacity`).
  - `PaymentCard` con `Badge` de estado.
- [ ] **Step 3:** `npm run lint && npm run build`.
- [ ] **Step 4:** Navegador a 375px:
  - La barra inferior es visible y el último elemento de cada vista queda por encima (Review Focus 2).
  - "Empezar entrenamiento" abre el día correcto en Próximos.
  - Con un alumno sin días pendientes, la tarjeta muestra el estado vacío (Review Focus 4).
  - En escritorio, sidebar con avatar. Tema claro OK.
- [ ] **Step 5:** Commit `feat(student): AppShell with bottom nav and redesigned home`.

### Task 15: Alumno, Próximos e Historial

**Files:**
- Modify: `_components/views/UpcomingView.tsx`, `HistoryView.tsx`, `WorkoutDay.tsx`, `ExerciseLogger.tsx`

- [ ] **Step 1:** Días plegables en `Card`. `ExerciseLogger` con `Input` de `min-h-11` (44px) e `inputMode="decimal"` en peso, botón de video `ghost` y check como toggle con `aria-pressed`. "Completar día" es el único `Button primary` del día abierto; omitir y cambiar fecha van en `secondary` / `ghost`.
- [ ] **Step 2:** Historial agrupado por semana (`groupedCompletedDays`), con línea de tiempo `border-l border-line`, el día en `font-display` y su resumen. Los omitidos llevan `Badge tone="neutral"`.
- [ ] **Step 3:** `npm run lint && npm run build`.
- [ ] **Step 4:** Navegador a 375px:
  - Cargar peso y observaciones en 3 ejercicios (incluida una super serie y un HIIT).
  - Completar el día: aparece el toast, suben XP/racha y el día pasa al historial.
  - Con un ejercicio de nombre largo, no hay desborde (Review Focus 3).
  - Con el teclado abierto en iOS emulado, el input enfocado no queda tapado por la barra inferior (Review Focus 2).
- [ ] **Step 5:** Commit `feat(student): redesigned workout logging and history`.

### Task 16: Alumno, Progreso, Soporte y diálogos, más limpieza global

**Files:**
- Modify: `_components/views/ProgressView.tsx`, `SupportView.tsx`, `_components/dialogs/*`, `src/app/globals.css`
- Create: `src/lib/chart-theme.ts`

**Interfaces:**
- Produces: `chartTheme` con `{ gold: "var(--color-gold)", text: "var(--color-text)", muted: "var(--color-muted)", line: "var(--color-line)", danger: "var(--color-danger)", surface: "var(--color-surface)" }` y `tooltipStyle: React.CSSProperties`.
- [ ] **Step 1:** Progreso:
  - Las líneas de fuerza en `gold` / `text` con grilla `line`.
  - La adherencia pasa a `PieChart` con `innerRadius` (anillo `gold` sobre `line`) y el porcentaje en `font-display` centrado.
  - Días fallados: barras `muted`, con la de mayor valor en `danger`.
- [ ] **Step 2:** Soporte: `Card` con el link actual de WhatsApp y `Button secondary`.
- [ ] **Step 3:** Los 7 diálogos usan `Dialog`. `SettingsSheet` usa `variant="sheet"` con los mismos campos y la misma lógica de subida de foto.
- [ ] **Step 4:** Limpieza global:
  - Quitar `@custom-variant dark` si `grep -rn "dark:" src` da 0. Si no, migrar esos usos a tokens.
  - `grep -rnE "#[0-9a-fA-F]{3,6}\b|(blue|cyan|orange|slate|neutral)-[0-9]" src --include=*.tsx`. Esperado: sin resultados, salvo `Hero3DLogo.tsx` (materiales three.js; documentar la excepción) y `chart-theme.ts` si aplica.
  - Borrar `/ui-kit` o mantenerlo con el `notFound()` de producción (preguntar al usuario).
- [ ] **Step 5:** `npm run lint && npm run build`.
- [ ] **Step 6:** Navegador:
  - Abrir y cerrar cada diálogo con Esc y verificar que el foco vuelve (Review Focus 5).
  - Editar la configuración y subir una foto.
  - Gráficos legibles en oscuro y en claro.
- [ ] **Step 7:** Lighthouse móvil igual que en la Task 0, Step 3. Comparar con `2026-10-21-baseline.md` usando `perf-profiler:perf-compare`. Esperado: el LCP no empeora. Reportar los números al usuario.
- [ ] **Step 8:** Commit `feat(student): progress charts, support and dialogs; remove legacy colors`.

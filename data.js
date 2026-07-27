/* ============================================================
   EduMap — data.js
   This is the single "source of truth" file that every page
   loads with <script src="data.js"></script>.

   In a real product this would be replaced by calls to a
   backend (e.g. GET /api/schools). For this prototype we do
   two things instead:

   1. SEED_SCHOOLS - starter data so the app isn't empty the
      first time it's opened.
   2. A tiny storage wrapper around localStorage (the browser's
      own built-in storage) so that when you add a school on the
      Admin page, it actually shows up on the Schools, Map and
      Dashboard pages too (it persists between visits, on the
      device that made the change).

   Every function here returns a Promise, so pages use
   `await getSchools()` to read data. This matches a real backend
   call's shape, so swapping in an actual API later (e.g. fetch()
   to a server) means only this file changes, not every page.
   ============================================================ */

// A school "record". Every field here maps directly to something
// the brief asked for: ratio, class size, water, and a status
// used to flag schools that need help.
const SEED_SCHOOLS = [
  {
    id: "sch_001",
    name: "Kigamboni Primary School",
    region: "Dar es Salaam",
    lat: -6.8235,
    lng: 39.2946,
    status: "critical", // critical | moderate | stable
    students: 612,
    teachers: 9,
    classrooms: 6,
    water: false,
    electricity: false,
    latrinesPerStudents: 85, // 1 latrine per N students
    description:
      "A coastal-ward primary school serving fishing families. Classrooms are shared across two grade levels due to space shortage.",
    needs: ["Clean water source", "3 more classrooms", "Teacher housing"],
    lastUpdated: "2026-06-02",
    activity: [
      { date: "2026-07-10", note: "Received 40 donated desks from a local NGO." },
      { date: "2026-05-18", note: "Borehole survey completed; funding still needed." }
    ]
  },
  {
    id: "sch_002",
    name: "Mwenge Secondary School",
    region: "Dar es Salaam",
    lat: -6.7735,
    lng: 39.2412,
    status: "moderate",
    students: 940,
    teachers: 22,
    classrooms: 18,
    water: true,
    electricity: true,
    latrinesPerStudents: 55,
    description:
      "An urban secondary school with a growing enrollment. Science labs exist but lack equipment.",
    needs: ["Lab equipment", "Library books"],
    lastUpdated: "2026-06-20",
    activity: [
      { date: "2026-06-20", note: "Government grant approved for lab renovation." }
    ]
  },
  {
    id: "sch_003",
    name: "Ilula Ward Primary School",
    region: "Iringa",
    lat: -7.7167,
    lng: 35.75,
    status: "critical",
    students: 480,
    teachers: 5,
    classrooms: 4,
    water: false,
    electricity: false,
    latrinesPerStudents: 120,
    description:
      "A rural school on the Iringa plateau. The nearest health facility is 12km away and many pupils walk over an hour to attend.",
    needs: ["More teachers", "Clean water source", "Sanitation blocks"],
    lastUpdated: "2026-05-30",
    activity: [
      { date: "2026-05-30", note: "Added to EduMap after community outreach visit." }
    ]
  },
  {
    id: "sch_004",
    name: "Moshi Girls Secondary School",
    region: "Kilimanjaro",
    lat: -3.3333,
    lng: 37.3333,
    status: "stable",
    students: 700,
    teachers: 34,
    classrooms: 20,
    water: true,
    electricity: true,
    latrinesPerStudents: 30,
    description:
      "A well-resourced girls' boarding school. Included as a benchmark for what 'stable' looks like on EduMap.",
    needs: [],
    lastUpdated: "2026-04-11",
    activity: [
      { date: "2026-04-11", note: "Annual facilities audit completed — no critical gaps." }
    ]
  },
  {
    id: "sch_005",
    name: "Mtwara Rural Primary School",
    region: "Mtwara",
    lat: -10.2667,
    lng: 40.1833,
    status: "critical",
    students: 530,
    teachers: 6,
    classrooms: 5,
    water: false,
    electricity: false,
    latrinesPerStudents: 106,
    description:
      "One of the most under-resourced schools in the southern region, currently unreachable by tarmac road during rainy season.",
    needs: ["Access road", "Teacher housing", "Clean water source"],
    lastUpdated: "2026-06-15",
    activity: [
      { date: "2026-06-15", note: "Flagged as high priority by regional education officer." }
    ]
  },
  {
    id: "sch_006",
    name: "Arusha Central Secondary School",
    region: "Arusha",
    lat: -3.3869,
    lng: 36.6822,
    status: "moderate",
    students: 1100,
    teachers: 28,
    classrooms: 22,
    water: true,
    electricity: true,
    latrinesPerStudents: 60,
    description:
      "Large urban secondary school. Overcrowding is the main pressure point rather than lack of infrastructure.",
    needs: ["Additional classrooms", "More teachers"],
    lastUpdated: "2026-06-28",
    activity: [
      { date: "2026-06-28", note: "Enrollment up 12% year over year." }
    ]
  }
];

const STORAGE_KEY = "edumap:schools";

/* ---------- storage helpers ---------- */

// Reads schools from persistent storage. If nothing has been saved
// yet (first run), it seeds storage with SEED_SCHOOLS so every page
// has consistent starter data. Wrapped in a Promise (via async) so
// every page can keep using `await getSchools()`.
async function getSchools() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // localStorage blocked (private browsing, etc.) — fall through
    // and just hand back the seed data for this session.
    console.warn("EduMap: couldn't read local storage, using seed data.", e);
    return SEED_SCHOOLS;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_SCHOOLS));
  return SEED_SCHOOLS;
}

// Overwrites the whole schools list. Used by the Admin page after
// adding, editing, or deleting a school.
async function saveSchools(schools) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schools));
  } catch (e) {
    console.warn("EduMap: couldn't save to local storage.", e);
  }
}

// Restores the original six seed schools, wiping any local edits.
// Used by Admin's "Reset demo data" action.
async function resetSchools() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_SCHOOLS));
  return SEED_SCHOOLS;
}

/* ---------- shared small utilities ---------- */

// Student-to-teacher ratio, formatted as "68:1"
function ratio(students, teachers) {
  if (!teachers) return "—";
  return Math.round(students / teachers) + ":1";
}

// Turns a status string into a color + human label, used anywhere
// we show a status dot or badge so every page looks consistent.
function statusMeta(status) {
  switch (status) {
    case "critical":
      return { color: "#D64550", label: "Critical need" };
    case "moderate":
      return { color: "#E8A33D", label: "Moderate need" };
    default:
      return { color: "#3FA796", label: "Stable" };
  }
}

// Reads ?id=sch_003 style query params.
function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// Generates a simple unique id for new schools added via Admin.
function makeId() {
  return "sch_" + Date.now().toString(36);
}

// One shared aggregate calculation, so the home page, dashboard,
// and about page all report the exact same numbers instead of
// each computing their own slightly-different version.
function computeStats(schools) {
  const total = schools.length;
  const critical = schools.filter(s => s.status === "critical").length;
  const withoutWater = schools.filter(s => !s.water).length;
  const regions = new Set(schools.map(s => s.region)).size;
  const avgRatio = total
    ? Math.round(schools.reduce((sum, s) => sum + (s.students / (s.teachers || 1)), 0) / total)
    : 0;
  // The single most urgent school: critical status first, then by
  // the worst student-teacher ratio. Used for the home page spotlight.
  const mostUrgent = [...schools].sort((a, b) => {
    const rank = { critical: 0, moderate: 1, stable: 2 };
    if (rank[a.status] !== rank[b.status]) return rank[a.status] - rank[b.status];
    return (b.students / (b.teachers || 1)) - (a.students / (a.teachers || 1));
  })[0];
  return { total, critical, withoutWater, regions, avgRatio, mostUrgent };
}

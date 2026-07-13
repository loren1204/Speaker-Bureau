"use client"

import { useState } from "react"

type Item = { q: string; a: string }
type Section = { title: string; items: Item[] }

const sections: Section[] = [
  {
    title: "Getting Started",
    items: [
      {
        q: "How do I log in as an admin?",
        a: "Go to /login and sign in with the email/password set up for you. If you don't have an account yet, someone with an existing stakeholder account needs to either invite you through the Supabase dashboard (Authentication → Users → Invite) or you sign up and then have your role manually upgraded — see 'How do I give someone admin access?' below.",
      },
      {
        q: "I logged in but I see 'Access restricted'. What do I do?",
        a: "This means your account exists but its role in the database is still 'guest' instead of 'stakeholder'. Every new account defaults to guest for safety. Ask an existing stakeholder to run the SQL update described in 'How do I give someone admin access?' below.",
      },
      {
        q: "How do I give someone admin (stakeholder) access?",
        a: "Have them sign up or log in once first so their account exists in Supabase Auth. Then, in the Supabase SQL editor, run: update public.profiles set role = 'stakeholder' where id = (select id from auth.users where email = 'their-email@example.com'); They'll need to refresh the page or log out/in for the change to take effect.",
      },
      {
        q: "I forgot my password. What do I do?",
        a: "On the login page, click 'Forgot password?', enter your email, and click Send Reset Link. Check your inbox (and spam folder) for the reset email, click the link, and set a new password. The link only works once and expires after a set time set by Supabase (default 1 hour).",
      },
    ],
  },
  {
    title: "Importing & Exporting Data",
    items: [
      {
        q: "What format does the import spreadsheet need to be in?",
        a: "An .xlsx or .xls file with a header row containing exactly these column names: Provider, Credentials, Department, Category, Status, Seminars, Description. Provider should be the speaker's full name written the same way each time (e.g. 'Lastname, Firstname') since the system uses this name to match existing speakers.",
      },
      {
        q: "What happens if a Category or Department in my spreadsheet doesn't match anything in the database?",
        a: "That row will be flagged in red in the preview table with a message like 'Category \"X\" not found in DB', and it will NOT be imported. This is intentional — the system won't guess or silently create a mismatched category. Fix the spelling in your spreadsheet to match an existing category exactly, or add the new category/department to the database first (see 'How do I add a new Category?' below), then re-upload.",
      },
      {
        q: "Will importing the same spreadsheet twice create duplicates?",
        a: "No, for speakers — the system matches by exact full name and reuses the existing speaker_id rather than creating a new one. For seminars, it checks whether that exact seminar title already exists for that speaker before inserting, so re-running the same import is safe and won't duplicate rows. However, if a name is spelled even slightly differently (extra space, different capitalization), it WILL be treated as a new/different speaker.",
      },
      {
        q: "How do I get a full backup or copy of the current data?",
        a: "On the 'Manage Speaker Data' page, click 'Export current data to Excel'. This downloads a spreadsheet of every speaker and their seminars in the same column format used for import, so it can also be edited and re-imported later.",
      },
      {
        q: "Should I export before doing a big import, just in case?",
        a: "Yes — this is good practice before any bulk change. There's no 'undo' button for an import, so exporting first gives you a snapshot you could manually reference if something needs to be corrected.",
      },
    ],
  },
  {
    title: "Managing Categories, Departments & Statuses",
    items: [
      {
        q: "How do I add a new Category (e.g. a new medical specialty)?",
        a: "Go to the Supabase dashboard → Table Editor → categories table, and insert a new row with a name and a color_hex (a hex color code like #a5d8ff used for that category's badge color on the public site). The name must be unique and should match exactly what you'll use in future spreadsheet imports.",
      },
      {
        q: "How do I add a new Department or Status the same way?",
        a: "Same process, just in the departments or statuses table instead. departments only needs a name. statuses needs a label and a color_hex.",
      },
      {
        q: "Where do the colors on the speaker cards come from?",
        a: "The public speakers page has its own hardcoded color mapping in the frontend code (categoryConfig inside the speakers page component) that's separate from the color_hex values stored in the database. If you add a brand-new category, it will still display using a default 'Specialists' gray/teal style until a developer adds a matching entry to that categoryConfig object in the code.",
      },
    ],
  },
  {
    title: "Understanding the Data Structure",
    items: [
      {
        q: "What's the difference between a 'speaker' and a 'seminar'?",
        a: "A speaker is one person (e.g. Dr. Jane Smith). A seminar is one specific talk/topic that speaker gives (e.g. 'Understanding Diabetes'). One speaker can have many seminars. Category, Department, and Status are attributes of each individual seminar, not the speaker directly — in practice, most speakers only give seminars in one category, but the database technically allows a speaker to have seminars across different categories.",
      },
      {
        q: "What does 'is_active' / Available vs Limited mean on the public site?",
        a: "This comes from the is_active column on the speakers table (true/false). It controls the green 'Available' vs amber 'Limited' dot shown on their card. This isn't currently exposed in the import spreadsheet format — it must be toggled manually in Supabase (Table Editor → speakers → is_active column) or a developer would need to add it to the import mapping.",
      },
      {
        q: "What are speaker_topics for?",
        a: "This is a separate table linking speakers to general topic keywords (e.g. 'Nutrition', 'Heart Health') shown as small tags on their card, independent of their seminar's category. This is also not currently part of the Excel import — topics must be added manually via Supabase for now.",
      },
    ],
  },
  {
    title: "Troubleshooting",
    items: [
      {
        q: "The site shows the wrong or missing category for a speaker.",
        a: "This usually means that speaker's seminar row has a NULL category_id in the seminars table — i.e. it was never assigned a category. Check the seminars table in Supabase for that speaker's row and confirm category_id is filled in. This can happen if a speaker was added manually in Supabase without setting category_id, or if an import row for them was skipped due to a category mismatch.",
      },
      {
        q: "I'm getting a 404 when I click a link.",
        a: "In this Next.js project, a page only exists at a URL if there's a file literally named page.tsx inside the matching folder under src/app/. If a page seems missing, check that the correct folder contains a page.tsx (not some other filename) — this is a common cause of unexpected 404s here.",
      },
      {
        q: "A password reset email arrives but the link doesn't prompt for a new password.",
        a: "This means the redirect URL Supabase is using doesn't match a page in this app that's set up to handle it. Check Supabase Dashboard → Authentication → URL Configuration → Redirect URLs includes the site's /reset-password page (e.g. https://yourdomain.com/reset-password), and that a page.tsx exists at src/app/reset-password/ in the code.",
      },
      {
        q: "Someone made changes to the code and now the site won't load / shows errors.",
        a: "Check the terminal running the dev server (npm run dev) for the specific error message — it will point to a file and line number. If it's a hosted/live site (e.g. on Vercel) that broke after a deploy, check the deployment logs in the Vercel dashboard for the same kind of error message.",
      },
      {
        q: "Who do I contact if something breaks and no one on the current team knows how to fix it?",
        a: "[Fill this in before handoff — e.g. name/contact of the original developer, or an IT contact at Lee Health who manages the Vercel/Supabase accounts.]",
      },
    ],
  },
  {
    title: "Accounts & Where Things Live",
    items: [
      {
        q: "Where is the database?",
        a: "Supabase (a hosted Postgres database + authentication service). Log in at supabase.com with the project's account credentials to view/edit data directly, manage user accounts, or check logs.",
      },
      {
        q: "Where is the website hosted?",
        a: "Vercel, based on the metadataBase URL configured in the code (lee-speakers-bureau.vercel.app). Log in at vercel.com to see deployment status, environment variables, and custom domain settings.",
      },
      {
        q: "What are environment variables and do I need to touch them?",
        a: "The app needs a Supabase project URL and a public API key to connect to the database, usually stored as environment variables (commonly NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY). You generally won't need to change these unless the Supabase project itself is ever recreated or migrated — in that case, both Supabase's dashboard and Vercel's project settings need the new values.",
      },
    ],
  },
]

function AccordionItem({ item }: { item: Item }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-slate-200/70 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-bold text-slate-800">{item.q}</span>
        <span className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open && <p className="pb-4 text-sm leading-relaxed text-slate-600">{item.a}</p>}
    </div>
  )
}

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-black text-slate-900">Handoff & FAQ Guide</h1>
      <p className="mt-1 text-sm text-slate-500">
        A reference for maintaining the Speakers Bureau site after handoff — logins, data imports, common issues, and where everything lives.
      </p>

      <div className="mt-8 space-y-6">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-[24px] border border-white/80 bg-white/72 p-6 shadow-[0_14px_34px_rgba(15,23,42,0.08)] backdrop-blur-2xl"
          >
            <h2 className="mb-1 text-base font-black text-emerald-700">{section.title}</h2>
            <div className="mt-2">
              {section.items.map((item) => (
                <AccordionItem key={item.q} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
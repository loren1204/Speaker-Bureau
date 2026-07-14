import "server-only"

import type { FaqItem } from "@/components/faq/FaqBrowser"

export const teamFaqItems: FaqItem[] = [
  {
    id: "team-login",
    topic: "Team access",
    question: "How do team members sign in?",
    answer: "Use Team login in the site navigation and enter the email and password connected to your Supabase Auth account. Your profile must also have the stakeholder role before the portal will open.",
  },
  {
    id: "access-restricted",
    topic: "Team access",
    question: "Why does my account show restricted access?",
    answer: "Your authentication succeeded, but your database profile is not assigned the stakeholder role. A current administrator must update your profile in Supabase. Signing in alone does not grant portal access.",
  },
  {
    id: "reset-password",
    topic: "Team access",
    question: "How do I reset my password?",
    answer: "Choose Forgot password on the team login page and enter your account email. The reset link must return to the site's /reset-password route, which should also be listed in Supabase Authentication redirect URLs.",
  },
  {
    id: "edit-speaker",
    topic: "Managing speakers",
    question: "How do I update a speaker?",
    answer: "Open Speakers in the team portal, search for the record, and choose Edit speaker. You can update contact information, biography, availability, photo, and associated seminars. Saving creates an activity entry for the team.",
  },
  {
    id: "speaker-photos",
    topic: "Managing speakers",
    question: "What photo files can I upload?",
    answer: "Use a JPEG, PNG, or WebP image no larger than 5 MB. The portal stores each image at a stable path in the speaker-photos bucket and saves its public URL on the speaker record.",
  },
  {
    id: "excel-import",
    topic: "Excel",
    question: "How does Excel import work?",
    answer: "Download the template from the Speakers page, prepare an .xlsx or .xls workbook, then choose Import speakers. The portal validates columns and lookup values, shows every row in a preview, and requires confirmation before any records are written.",
  },
  {
    id: "excel-matching",
    topic: "Excel",
    question: "How are imported rows matched?",
    answer: "The importer uses Speaker ID first, then email, and only then an exact full-name match. A name is not guaranteed unique, so include Speaker ID or email whenever you are updating existing records.",
  },
  {
    id: "request-status",
    topic: "Requests",
    question: "How do I manage a new request?",
    answer: "Open Requests in the portal, select Review request, then update its status, assignment, and internal notes. New requests appear through Supabase Realtime when that migration and publication are enabled.",
  },
  {
    id: "notifications",
    topic: "Requests",
    question: "What notifications are supported?",
    answer: "The portal provides an in-app new-request count and live request updates. Team members can enable or disable that preference in their profile. Browser alerts require explicit permission and only operate while the site is active; background push is not currently implemented.",
  },
]

export type Testament = 'AT' | 'NT'
export type ProjectStatus = 'draft' | 'in_progress' | 'completed'
export type SectionStatus = 'empty' | 'draft' | 'reviewed'
export type AIMode = 'generate' | 'correct' | 'refine' | 'reference' | 'narrative' | 'synthesis'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  plan: 'free' | 'student' | 'pastor' | 'ministry' | 'seminary'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: string | null
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  title: string
  book: string
  passage_ref: string
  testament: Testament
  original_language: string
  bible_version: string
  status: ProjectStatus
  created_at: string
  updated_at: string
}

export interface Section {
  id: string
  project_id: string
  user_id: string
  slug: string
  module: 'inventio' | 'dispositio' | 'elocutio' | 'memoria' | 'pronuntiatio'
  title: string
  content: Record<string, unknown> | null
  ai_output: string | null
  status: SectionStatus
  created_at: string
  updated_at: string
}

export interface Field {
  id: string
  section_id: string
  key: string
  label: string | null
  content_user: string | null
  content_ai: string | null
  content_final: string | null
  field_type: 'rich' | 'outline' | 'list' | 'table'
  approved: boolean
  updated_at: string
}

export interface Footnote {
  id: string
  project_id: string
  section_id: string | null
  number: number
  author: string | null
  work: string | null
  publisher: string | null
  city: string | null
  year: string | null
  page: string | null
  full_citation: string
  created_at: string
}

export interface StructureEvaluation {
  id: string
  project_id: string
  section_id: string | null
  user_structure: string
  ai_evaluation: string | null
  corrected_structure: string | null
  grade: number | null
  classification: string | null
  created_at: string
}

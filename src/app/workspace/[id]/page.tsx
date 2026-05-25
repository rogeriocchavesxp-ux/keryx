import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import WorkspaceClient from './WorkspaceClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function WorkspacePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!project) notFound()

  const { data: sections } = await supabase
    .from('sections')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: true })

  return (
    <WorkspaceClient
      user={user}
      project={project}
      initialSections={sections || []}
    />
  )
}

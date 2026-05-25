'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Project, Profile } from '@/types/database'

const BOOKS_AT = [
  'Gênesis','Êxodo','Levítico','Números','Deuteronômio',
  'Josué','Juízes','Rute','1 Samuel','2 Samuel','1 Reis','2 Reis',
  '1 Crônicas','2 Crônicas','Esdras','Neemias','Ester','Jó',
  'Salmos','Provérbios','Eclesiastes','Cântico dos Cânticos',
  'Isaías','Jeremias','Lamentações','Ezequiel','Daniel',
  'Oséias','Joel','Amós','Obadias','Jonas','Miquéias',
  'Naum','Habacuque','Sofonias','Ageu','Zacarias','Malaquias'
]

const BOOKS_NT = [
  'Mateus','Marcos','Lucas','João','Atos','Romanos',
  '1 Coríntios','2 Coríntios','Gálatas','Efésios','Filipenses',
  'Colossenses','1 Tessalonicenses','2 Tessalonicenses',
  '1 Timóteo','2 Timóteo','Tito','Filemom','Hebreus',
  'Tiago','1 Pedro','2 Pedro','1 João','2 João','3 João',
  'Judas','Apocalipse'
]

interface Props {
  user: User
  projects: Project[]
  profile: Profile | null
}

export default function DashboardClient({ user, projects, profile }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [showNew, setShowNew] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    title: '',
    book: '',
    passage_ref: '',
    testament: 'NT' as 'AT' | 'NT',
  })

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.book || !form.passage_ref) return
    setCreating(true)

    const language = form.testament === 'AT' ? 'hebraico' : 'grego'

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        title: form.title,
        book: form.book,
        passage_ref: form.passage_ref,
        testament: form.testament,
        original_language: language,
        bible_version: 'NAA',
        status: 'draft',
      })
      .select()
      .single()

    if (!error && data) {
      router.push(`/workspace/${data.id}`)
    }
    setCreating(false)
  }

  const statusLabel = (s: string) => ({
    draft: 'Rascunho', in_progress: 'Em andamento', completed: 'Concluído'
  }[s] || s)

  const statusColor = (s: string) => ({
    draft: 'var(--text-muted)',
    in_progress: 'var(--accent)',
    completed: 'var(--success)',
  }[s] || 'var(--text-muted)')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>

      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 2rem',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--surface)',
      }}>
        <Image src="/logo.png" alt="Keryx" width={36} height={36} style={{ display: 'block' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{user.email}</span>
          <button onClick={handleSignOut} style={{
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', padding: '0.3rem 0.75rem',
            borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem',
            fontFamily: 'inherit',
          }}>
            Sair
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ marginBottom: '0.25rem' }}>Exegeses</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              {projects.length} projeto{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={() => setShowNew(true)} style={{
            background: 'var(--accent)', color: '#1a1208',
            border: 'none', borderRadius: '8px',
            padding: '0.6rem 1.25rem', fontWeight: '600',
            cursor: 'pointer', fontSize: '0.9rem',
            fontFamily: 'inherit',
          }}>
            + Nova exegese
          </button>
        </div>

        {/* Projects grid */}
        {projects.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '4rem 2rem',
            background: 'var(--surface)', borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.4 }}>📖</div>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Nenhuma exegese ainda
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Comece selecionando um texto bíblico
            </p>
            <button onClick={() => setShowNew(true)} style={{
              background: 'var(--accent)', color: '#1a1208',
              border: 'none', borderRadius: '8px',
              padding: '0.6rem 1.25rem', fontWeight: '600',
              cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit',
            }}>
              Criar primeira exegese
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {projects.map(p => (
              <div
                key={p.id}
                onClick={() => router.push(`/workspace/${p.id}`)}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px', padding: '1.25rem 1.5rem',
                  cursor: 'pointer', transition: 'border-color 0.15s',
                  display: 'flex', alignItems: 'center', gap: '1.5rem',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '8px',
                  background: 'var(--accent-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: '700', color: 'var(--accent)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  flexShrink: 0,
                }}>
                  {p.testament}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.15rem', fontSize: '0.95rem' }}>
                    {p.title}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    {p.book} {p.passage_ref} · {p.original_language}
                  </div>
                </div>
                <div style={{
                  fontSize: '0.78rem', color: statusColor(p.status),
                  flexShrink: 0,
                }}>
                  {statusLabel(p.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* New project modal */}
      {showNew && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, padding: '1rem',
        }} onClick={e => { if (e.target === e.currentTarget) setShowNew(false) }}>
          <div style={{
            background: 'var(--surface)', borderRadius: '12px',
            border: '1px solid var(--border)',
            padding: '2rem', width: '100%', maxWidth: '480px',
            animation: 'fadeIn 0.15s ease-out',
          }}>
            <h2 style={{ marginBottom: '0.25rem' }}>Nova exegese</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Selecione o texto que vai estudar
            </p>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Field label="Título">
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: A soberania de Deus em Romanos 9"
                  required
                />
              </Field>

              <Field label="Testamento">
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(['NT', 'AT'] as const).map(t => (
                    <button
                      key={t} type="button"
                      onClick={() => setForm(f => ({ ...f, testament: t, book: '' }))}
                      style={{
                        flex: 1, padding: '0.55rem',
                        background: form.testament === t ? 'var(--accent-subtle)' : 'var(--surface-2)',
                        border: `1px solid ${form.testament === t ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: '6px', color: form.testament === t ? 'var(--accent)' : 'var(--text-secondary)',
                        cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600',
                        fontFamily: 'inherit',
                      }}
                    >
                      {t === 'NT' ? 'Novo Testamento' : 'Antigo Testamento'}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Livro">
                <select
                  value={form.book}
                  onChange={e => setForm(f => ({ ...f, book: e.target.value }))}
                  required
                >
                  <option value="">Selecione o livro</option>
                  {(form.testament === 'NT' ? BOOKS_NT : BOOKS_AT).map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </Field>

              <Field label="Passagem">
                <input
                  value={form.passage_ref}
                  onChange={e => setForm(f => ({ ...f, passage_ref: e.target.value }))}
                  placeholder="Ex: 19.1-12"
                  required
                />
              </Field>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowNew(false)} style={{
                  flex: 1, padding: '0.65rem',
                  background: 'transparent', border: '1px solid var(--border)',
                  borderRadius: '8px', color: 'var(--text-secondary)',
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem',
                }}>
                  Cancelar
                </button>
                <button type="submit" disabled={creating} style={{
                  flex: 2, padding: '0.65rem',
                  background: 'var(--accent)', color: '#1a1208',
                  border: 'none', borderRadius: '8px',
                  fontWeight: '600', cursor: creating ? 'wait' : 'pointer',
                  fontFamily: 'inherit', fontSize: '0.9rem',
                }}>
                  {creating ? 'Criando...' : 'Criar exegese'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: '0.78rem',
        color: 'var(--text-secondary)', marginBottom: '0.35rem',
        textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '600',
      }}>
        {label}
      </label>
      <style>{`
        .field-input input, .field-input select {
          width: 100%;
          padding: 0.6rem 0.85rem;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 7px;
          color: var(--text-primary);
          font-size: 0.92rem;
          outline: none;
          font-family: inherit;
          transition: border-color 0.15s;
        }
        .field-input input:focus, .field-input select:focus {
          border-color: var(--accent);
        }
        .field-input select option {
          background: var(--surface-2);
        }
      `}</style>
      <div className="field-input">{children}</div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--background)',
      padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Image
            src="/logo.png"
            alt="Keryx"
            width={120}
            height={120}
            style={{ margin: '0 auto 0.75rem', display: 'block' }}
            priority
          />
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', letterSpacing: '0.04em' }}>
            κῆρυξ — o arauto da Palavra
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '2rem',
        }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✉️</div>
              <h2 style={{ marginBottom: '0.5rem' }}>Verifique seu email</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Enviamos um link de acesso para{' '}
                <strong style={{ color: 'var(--accent)' }}>{email}</strong>
              </p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                style={{
                  marginTop: '1.5rem',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                Usar outro email
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ marginBottom: '0.25rem' }}>Entrar no Keryx</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Insira seu email para receber o link de acesso
              </p>

              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '0.4rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      borderRadius: '7px',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                      outline: 'none',
                      transition: 'border-color 0.15s',
                      fontFamily: 'inherit',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>

                {error && (
                  <p style={{
                    color: 'var(--error)',
                    fontSize: '0.82rem',
                    marginBottom: '0.75rem',
                  }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  style={{
                    width: '100%',
                    padding: '0.7rem',
                    background: loading || !email ? 'var(--surface-3)' : 'var(--accent)',
                    color: loading || !email ? 'var(--text-muted)' : '#1a1208',
                    border: 'none',
                    borderRadius: '7px',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: loading || !email ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                    fontFamily: 'inherit',
                  }}
                >
                  {loading ? 'Enviando...' : 'Continuar com email'}
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.78rem',
          marginTop: '1.5rem',
          lineHeight: '1.6',
        }}>
          Sistema de exegese e homilética reformada.<br />
          Para pastores e seminaristas.
        </p>
      </div>
    </div>
  )
}

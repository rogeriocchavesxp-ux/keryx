import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--text-primary)' }}>

      {/* Nav */}
      <nav style={{
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 2rem',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%',
      }}>
        <Image src="/logo.png" alt="Keryx" width={40} height={40} style={{ display: 'block' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a href="#metodologia" style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', textDecoration: 'none' }}>
            Metodologia
          </a>
          <a href="#modulos" style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', textDecoration: 'none' }}>
            Módulos
          </a>
          <Link href="/auth/login" style={{
            background: 'var(--accent)', color: '#1a1208',
            padding: '0.45rem 1.1rem', borderRadius: '7px',
            fontSize: '0.88rem', fontWeight: '600', textDecoration: 'none',
          }}>
            Entrar
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        maxWidth: '780px',
        margin: '0 auto',
        padding: '6rem 2rem 5rem',
        textAlign: 'center',
      }}>
        <Image
          src="/logo.png"
          alt="Keryx"
          width={100}
          height={100}
          style={{ margin: '0 auto 1.5rem', display: 'block' }}
          priority
        />
        <div style={{
          display: 'inline-block',
          background: 'var(--accent-subtle)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '0.3rem 1rem',
          fontSize: '0.78rem',
          color: 'var(--accent)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontWeight: '600',
          marginBottom: '2rem',
        }}>
          κῆρυξ — o arauto da Palavra
        </div>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
          fontWeight: '700',
          lineHeight: '1.1',
          letterSpacing: '-0.03em',
          marginBottom: '1.5rem',
          fontFamily: 'var(--font-serif)',
        }}>
          Do texto ao púlpito,<br />
          <span style={{ color: 'var(--accent)' }}>com rigor e clareza.</span>
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1.1rem',
          lineHeight: '1.7',
          maxWidth: '580px',
          margin: '0 auto 2.5rem',
        }}>
          Sistema guiado de exegese reformada e produção homilética com IA.
          Para pastores e seminaristas que levam a sério o trabalho com o texto.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/login" style={{
            background: 'var(--accent)', color: '#1a1208',
            padding: '0.75rem 2rem', borderRadius: '8px',
            fontSize: '1rem', fontWeight: '700', textDecoration: 'none',
            letterSpacing: '-0.01em',
          }}>
            Começar gratuitamente
          </Link>
          <a href="#metodologia" style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            padding: '0.75rem 2rem', borderRadius: '8px',
            fontSize: '1rem', fontWeight: '500', textDecoration: 'none',
          }}>
            Ver metodologia
          </a>
        </div>
      </section>

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', maxWidth: '900px', margin: '0 auto' }} />

      {/* Methodology section */}
      <section id="metodologia" style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '5rem 2rem',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: '600' }}>
            Metodologia
          </div>
          <h2 style={{ fontSize: '2rem', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            Exegese em três etapas
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto', lineHeight: '1.65' }}>
            Cada projeto percorre um caminho estruturado — do contexto histórico ao significado teológico.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {[
            {
              num: '01',
              title: 'Estudo Contextual',
              items: ['Contexto histórico-cultural', 'Autor e destinatários', 'Ocasião e propósito', 'Gênero literário', 'Estrutura do livro'],
            },
            {
              num: '02',
              title: 'Estudo Textual',
              items: ['Delimitação da perícope', 'Análise morfossintática', 'Termos-chave (BDAG/HALOT)', 'Estrutura literária', 'Comparação de versões'],
            },
            {
              num: '03',
              title: 'Estudo Teológico',
              items: ['Contexto canônico', 'Progressão revelacional', 'Síntese (Grande Ideia)', 'Mensagem do texto', 'Conceito central + confrontado'],
            },
          ].map(({ num, title, items }) => (
            <div key={num} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '1.75rem',
            }}>
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: 'var(--accent)', fontWeight: '700', marginBottom: '0.75rem' }}>
                {num}
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '1rem', letterSpacing: '-0.01em' }}>
                {title}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {items.map(item => (
                  <li key={item} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--accent)', fontSize: '0.6rem' }}>▸</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Modules section */}
      <section id="modulos" style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '5rem 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: '600' }}>
              5 Cânones da Retórica Clássica
            </div>
            <h2 style={{ fontSize: '2rem', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
              Do texto ao púlpito
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto', lineHeight: '1.65' }}>
              Cada módulo corresponde a uma etapa da produção homilética.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { canon: 'I · Inventio', name: 'Exegese', desc: 'Análise contextual, textual e teológica do texto. Morfossintaxe, termos-chave, estrutura literária, síntese.', color: 'var(--accent)' },
              { canon: 'II · Dispositio', name: 'Homilética', desc: 'Estruturação do sermão: tese, introdução, pontos, transições e conclusão. Com avaliação de coerência.', color: 'var(--ai)' },
              { canon: 'III · Elocutio', name: 'Estilo', desc: 'Refinamento da linguagem: clareza, concisão, registro pastoral. Modos de reescrita com IA.', color: '#9b8ac4' },
              { canon: 'IV · Memoria', name: 'Internalização', desc: 'Mapas visuais, cartões de revisão, quizzes. Domine o texto antes de subir ao púlpito.', color: '#6db8a0' },
              { canon: 'V · Pronuntiatio', name: 'Proclamação', desc: 'Notas de púlpito, blocos visuais, avaliação de áudio em PT-BR.', color: '#c47a6d' },
            ].map(({ canon, name, desc, color }) => (
              <div key={canon} style={{
                background: 'var(--background)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1.5rem',
              }}>
                <div style={{
                  minWidth: '90px',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  color,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  paddingTop: '0.1rem',
                }}>
                  {canon}
                </div>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.95rem' }}>{name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.55' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: '700px', margin: '0 auto', padding: '6rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', letterSpacing: '-0.02em', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>
          Pronto para estudar com rigor?
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2.5rem', lineHeight: '1.65' }}>
          Crie sua conta e comece sua primeira exegese agora mesmo.
        </p>
        <Link href="/auth/login" style={{
          background: 'var(--accent)', color: '#1a1208',
          padding: '0.85rem 2.5rem', borderRadius: '8px',
          fontSize: '1rem', fontWeight: '700', textDecoration: 'none',
          letterSpacing: '-0.01em',
        }}>
          Criar conta gratuita
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--accent)', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
          Keryx
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
          κῆρυξ — o arauto da Palavra · Sistema de exegese e homilética reformada
        </p>
      </footer>
    </div>
  )
}

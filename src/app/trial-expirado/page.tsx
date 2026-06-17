import Image from 'next/image'

export default function TrialExpiradoPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-app)', padding: 16 }}>
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 32, width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
          <Image src="/logo.svg" alt="Cliniq" width={120} height={36} />
        </div>

        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--danger-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <span style={{ color: 'var(--danger-600)', fontSize: 20 }}>⏰</span>
        </div>

        <h1 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>
          Seu período de teste acabou
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          Seus 30 dias gratuitos no Cliniq chegaram ao fim. Para continuar usando, entre em contato com a gente para ativar seu plano.
        </p>

        <a
          href="https://wa.me/5500000000000"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            marginTop: 20,
            background: 'var(--brand)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-medium)',
            textDecoration: 'none',
          }}
        >
          Falar no WhatsApp
        </a>
      </div>
    </div>
  )
}
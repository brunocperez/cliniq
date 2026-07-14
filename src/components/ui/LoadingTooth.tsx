export default function LoadingTooth({ mensagem = 'Carregando...' }: { mensagem?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 16,
      }}
    >
      <div style={{ position: 'relative', width: 64, height: 80 }}>
        <svg
          className="loading-dente-icone"
          width="64"
          height="64"
          viewBox="0 0 64 64"
          style={{ display: 'block' }}
        >
          <path
            d="M32 6c-8 0-13 5-14 5-3 0-9 2-9 12 0 8 3 12 4 18 1 7 4 15 9 15 4 0 4-8 6-8s2 8 6 8c5 0 8-8 9-15 1-6 4-10 4-18 0-10-6-12-9-12-1 0-6-5-14-5z"
            fill="var(--brand)"
          />
          <ellipse cx="24" cy="20" rx="4" ry="6" fill="white" opacity="0.35" />
        </svg>
        <div
          className="loading-dente-sombra"
          style={{
            position: 'absolute',
            bottom: -6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 40,
            height: 8,
            borderRadius: '50%',
            background: 'var(--text-strong)',
            opacity: 0.15,
          }}
        />
      </div>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', margin: 0 }}>
        {mensagem}
      </p>
    </div>
  )
}
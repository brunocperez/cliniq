'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import OdontogramaDetalheModal, {
  STATUS_CONFIG, FACES, type DenteData, type Face, type StatusFace, type HistoricoItem,
} from './OdontogramaDetalheModal'

export type { DenteData }

interface Props {
  pacienteId: string
  odontogramaInicial: Record<string, DenteData>
}

// ---------------------------------------------------------------------------
// Contorno real de cada dente sobre a imagem-base, em coordenadas de pixel
// nativas da imagem (viewBox = tamanho original da imagem). Extraído por
// detecção de contorno (visão computacional) a partir da imagem fornecida —
// a cor de status preenche exatamente a silhueta do dente, não uma caixa.
//
// IMPORTANTE: se você trocar a imagem-base por uma versão em resolução
// maior/melhor, esses pontos precisam ser recalibrados nela (me manda a
// nova imagem que eu regenero essa lista, ou ajuste IMG_W/IMG_H e os pontos
// manualmente se preferir fazer você mesmo).
// ---------------------------------------------------------------------------
const IMG_W = 2200
const IMG_H = 1326

const TOOTH_SHAPES: { numero: number; points: string }[] = [
  { numero: 11, points: '1021,251 1010,274 997,445 986,515 967,581 966,610 975,637 992,652 1023,657 1088,654 1108,639 1113,607 1087,520 1055,292 1036,259' },
  { numero: 12, points: '907,274 891,291 879,343 878,524 870,621 875,639 883,648 949,652 962,641 964,625 919,380 919,288 914,277' },
  { numero: 13, points: '797,208 789,222 792,290 774,435 773,523 754,605 761,628 794,661 813,666 829,659 862,619 866,597 848,515 823,256 813,225' },
  { numero: 14, points: '681,279 671,286 664,304 672,382 670,435 642,606 645,623 659,644 679,658 697,661 717,653 739,633 749,614 752,593 749,575 731,540 728,460 708,309 697,287' },
  { numero: 15, points: '571,292 558,312 552,476 541,545 525,583 525,624 541,646 559,658 575,661 623,626 634,611 637,594 624,549 597,338 585,301' },
  { numero: 16, points: '438,308 430,318 434,372 424,413 410,344 395,334 382,347 397,492 387,534 366,569 361,606 369,632 392,653 436,647 469,658 501,645 521,616 519,590 499,544 507,369 501,344 487,340 478,353 475,387 454,324' },
  { numero: 17, points: '260,344 251,354 252,379 241,363 224,379 231,490 223,533 208,564 205,621 208,601 215,628 233,649 268,645 298,657 325,658 349,638 357,604 354,578 342,561 333,420 315,375 289,353 284,364 293,418 279,362 270,347' },
  { numero: 18, points: '118,357 105,371 89,371 82,385 88,425 104,469 94,534 77,586 76,616 86,642 98,656 113,657 138,646 174,660 194,644 208,601 211,616 211,558 207,592 174,514 152,384 135,362' },
  { numero: 21, points: '1209,251 1185,273 1175,294 1144,520 1119,606 1123,639 1144,655 1239,652 1256,636 1265,611 1264,582 1245,513 1234,444 1221,273' },
  { numero: 22, points: '1323,274 1311,289 1312,380 1266,626 1269,643 1282,652 1346,649 1355,642 1360,622 1353,522 1351,340 1339,289' },
  { numero: 23, points: '1432,208 1414,227 1406,253 1380,515 1363,595 1365,615 1398,658 1415,666 1436,661 1454,645 1470,623 1475,604 1455,524 1454,428 1436,282 1439,223' },
  { numero: 24, points: '1549,279 1531,287 1521,308 1500,465 1497,539 1477,591 1486,628 1509,652 1531,661 1552,657 1569,644 1584,623 1587,604 1558,432 1556,380 1565,305 1559,288' },
  { numero: 25, points: '1654,292 1642,305 1632,340 1605,549 1591,599 1596,614 1616,637 1644,658 1660,661 1678,654 1696,638 1704,623 1706,601 1702,576 1688,544 1677,477 1671,311 1664,297' },
  { numero: 26, points: '1792,308 1774,326 1753,388 1751,352 1742,340 1729,343 1722,368 1730,544 1709,592 1708,615 1726,643 1759,658 1793,647 1836,654 1859,634 1868,609 1863,568 1840,532 1832,493 1846,346 1835,335 1819,343 1804,413 1794,368 1799,319' },
  { numero: 27, points: '1968,344 1959,348 1949,364 1935,417 1945,364 1939,353 1913,376 1896,419 1887,562 1875,579 1871,601 1879,638 1905,658 1931,657 1962,645 1995,649 2019,613 2020,565 2006,532 1997,487 2005,379 1990,363 1981,367 1977,379 1977,353' },
  { numero: 28, points: '2115,357 2097,362 2081,386 2060,513 2045,556 2026,592 2026,613 2045,652 2058,660 2072,658 2094,646 2123,657 2135,656 2148,641 2157,616 2156,586 2140,541 2130,473 2148,414 2151,385 2144,372 2128,371' },
  { numero: 31, points: '1136,699 1122,709 1121,744 1135,828 1145,968 1162,1036 1174,1053 1187,1059 1195,1045 1188,1001 1187,942 1208,716 1204,706 1193,700' },
  { numero: 32, points: '1229,700 1216,711 1215,755 1237,989 1253,1061 1267,1079 1281,1084 1290,1069 1280,990 1282,907 1313,729 1307,713 1297,705' },
  { numero: 33, points: '1361,697 1343,704 1328,722 1317,747 1316,783 1324,822 1333,955 1349,1067 1369,1137 1382,1152 1393,1155 1405,1135 1397,1057 1402,957 1430,761 1418,727 1388,705' },
  { numero: 34, points: '1484,697 1467,702 1448,720 1436,740 1432,764 1451,827 1466,1028 1478,1057 1489,1071 1500,1074 1510,1058 1507,992 1512,936 1543,812 1549,758 1542,734 1524,714 1503,700' },
  { numero: 35, points: '1608,699 1587,705 1566,723 1553,740 1550,760 1563,814 1590,1036 1603,1070 1627,1087 1633,1077 1626,1004 1631,926 1670,764 1665,741 1650,720 1626,703' },
  { numero: 36, points: '1690,702 1674,721 1673,759 1690,841 1691,956 1706,1014 1726,1045 1755,1056 1736,983 1732,917 1740,896 1757,887 1791,936 1819,1040 1832,1063 1847,1069 1857,1051 1856,1010 1829,855 1851,787 1849,724 1835,708 1814,701 1763,711 1720,698' },
  { numero: 37, points: '1878,704 1860,723 1856,768 1875,834 1879,911 1894,970 1920,1017 1940,1026 1944,1007 1925,906 1928,889 1941,886 1969,944 1993,1027 2011,1041 2019,1010 1998,856 1998,824 2013,774 2011,735 1998,716 1982,708 1930,715 1902,703' },
  { numero: 38, points: '2056,703 2038,713 2023,731 2021,752 2030,789 2054,841 2079,942 2111,982 2127,990 2143,990 2157,981 2162,968 2140,887 2147,815 2157,794 2158,729 2146,713 2134,706 2109,705 2085,712 2068,702' },
  { numero: 41, points: '1097,699 1039,700 1025,715 1045,935 1045,996 1038,1045 1046,1059 1057,1054 1071,1034 1088,965 1098,828 1112,742 1111,709' },
  { numero: 42, points: '1005,700 934,705 920,729 951,906 953,991 943,1068 953,1084 966,1078 980,1061 996,991 1018,768 1018,714' },
  { numero: 43, points: '874,697 850,702 816,726 803,761 834,995 836,1070 828,1134 840,1155 864,1137 884,1070 899,966 909,822 918,784 911,733 894,706' },
  { numero: 44, points: '750,697 731,699 710,713 690,737 684,758 690,812 721,931 727,990 723,1057 734,1074 756,1057 768,1028 782,827 801,765 797,741 786,722 769,704' },
  { numero: 45, points: '625,699 604,703 586,716 569,736 562,761 600,924 605,1000 598,1074 604,1087 628,1070 641,1034 669,813 681,759 678,739 645,706' },
  { numero: 46, points: '542,702 511,698 470,711 417,701 383,722 381,788 403,853 376,1011 375,1050 384,1069 400,1063 413,1039 441,935 475,887 493,898 500,920 495,987 477,1056 502,1048 525,1018 540,956 542,841 559,761 557,721' },
  { numero: 47, points: '354,703 331,703 302,715 253,707 235,716 223,734 220,774 235,845 215,1010 222,1041 240,1027 265,944 293,885 305,888 308,904 305,949 289,1005 293,1026 313,1018 339,970 354,909 358,833 377,769 373,723' },
  { numero: 48, points: '183,703 170,702 152,712 129,705 105,706 91,713 80,730 80,792 90,815 98,885 75,966 81,981 95,990 109,990 127,981 159,942 184,840 207,791 216,734 203,716' },
]

// Caminho da imagem-base — salve o arquivo em /public com este nome
// (ou ajuste o caminho abaixo).
const IMAGEM_BASE = '/odontograma-base.png'

// Bounding box de cada dente (calculado uma vez a partir dos pontos do
// contorno), usado só para posicionar o tooltip de hover perto do dente.
const TOOTH_BBOX: Record<number, { minX: number; minY: number; maxX: number; maxY: number }> = {}
for (const t of TOOTH_SHAPES) {
  const coords = t.points.split(' ').map(p => p.split(',').map(Number))
  const xs = coords.map(c => c[0])
  const ys = coords.map(c => c[1])
  TOOTH_BBOX[t.numero] = { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) }
}

// ---------------------------------------------------------------------------
// Regra de severidade agregada por dente (cor do painel geral).
// Fácil de ajustar: só mexer nesta função.
// ---------------------------------------------------------------------------
type Severidade = 'vermelho' | 'amarelo' | 'verde' | null

const SEVERIDADE_COR: Record<Exclude<Severidade, null>, string> = {
  vermelho: '#dc2626',
  amarelo: '#eab308',
  verde: '#16a34a',
}

function calcularSeveridade(data: DenteData): Severidade {
  const statuses = FACES.map(f => data[f]).filter(Boolean) as StatusFace[]
  if (statuses.includes('cariado')) return 'vermelho'
  if (statuses.includes('canal')) return 'amarelo'
  if (statuses.includes('restaurado') || statuses.includes('implante')) return 'verde'
  return null
}

const FACE_LABEL: Record<Face, string> = {
  oclusal: 'Oclusal',
  mesial: 'Mesial',
  distal: 'Distal',
  vestibular: 'Vestibular',
  lingual: 'Lingual',
}

function resumoFaces(data: DenteData): { face: string; label: string; cor: string }[] {
  return FACES
    .filter(face => !!data[face])
    .map(face => {
      const status = data[face] as StatusFace
      return { face: FACE_LABEL[face], label: STATUS_CONFIG[status].label, cor: STATUS_CONFIG[status].cor }
    })
}

export default function Odontograma({ pacienteId, odontogramaInicial }: Props) {
  const [odontograma, setOdontograma] = useState<Record<string, DenteData>>(odontogramaInicial)
  const [denteAberto, setDenteAberto] = useState<number | null>(null)
  const [faceSelecionada, setFaceSelecionada] = useState<Face | null>('oclusal')
  const [salvando, setSalvando] = useState(false)
  const [denteHover, setDenteHover] = useState<number | null>(null)
  const [historico, setHistorico] = useState<HistoricoItem[]>([])
  const [carregandoHistorico, setCarregandoHistorico] = useState(false)

  function handleAbrirDente(numero: number) {
    setDenteAberto(numero)
    setFaceSelecionada('oclusal')
  }

  function handleFecharModal() {
    setDenteAberto(null)
    setFaceSelecionada(null)
  }

  useEffect(() => {
    if (!denteAberto) return
    let cancelado = false
    async function carregar() {
      setCarregandoHistorico(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('odontograma_historico')
        .select('*')
        .eq('patient_id', pacienteId)
        .eq('dente', denteAberto)
        .order('criado_em', { ascending: false })
        .limit(20)
      if (!cancelado && !error && data) setHistorico(data as HistoricoItem[])
      if (!cancelado) setCarregandoHistorico(false)
    }
    carregar()
    return () => { cancelado = true }
  }, [denteAberto, pacienteId])

  async function salvar(novoOdontograma: Record<string, DenteData>) {
    setOdontograma(novoOdontograma)
    setSalvando(true)
    const supabase = createClient()
    await supabase.from('patients').update({ odontograma: novoOdontograma }).eq('id', pacienteId)
    setSalvando(false)
  }

  async function registrarHistorico(
    dente: number,
    campo: 'status' | 'nota',
    face: Face | null,
    valorAnterior: string | null,
    valorNovo: string | null,
  ) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('odontograma_historico')
      .insert({ patient_id: pacienteId, dente, campo, face, valor_anterior: valorAnterior, valor_novo: valorNovo })
      .select()
      .single()
    if (!error && data && dente === denteAberto) {
      setHistorico(prev => [data as HistoricoItem, ...prev])
    }
  }

  async function handleSelecionarStatus(status: StatusFace) {
    if (!denteAberto || !faceSelecionada) return
    const valorAnterior = odontograma[denteAberto]?.[faceSelecionada] ?? null
    const novoOdontograma = {
      ...odontograma,
      [denteAberto]: { ...odontograma[denteAberto], [faceSelecionada]: status },
    }
    await salvar(novoOdontograma)
    await registrarHistorico(denteAberto, 'status', faceSelecionada, valorAnterior, status)
  }

  async function handleLimparFace() {
    if (!denteAberto || !faceSelecionada) return
    const valorAnterior = odontograma[denteAberto]?.[faceSelecionada] ?? null
    const novoOdontograma = { ...odontograma }
    if (novoOdontograma[denteAberto]) {
      const novoDente = { ...novoOdontograma[denteAberto] }
      delete novoDente[faceSelecionada]
      if (Object.keys(novoDente).length === 0) delete novoOdontograma[denteAberto]
      else novoOdontograma[denteAberto] = novoDente
    }
    await salvar(novoOdontograma)
    if (valorAnterior) await registrarHistorico(denteAberto, 'status', faceSelecionada, valorAnterior, null)
  }

  async function handleLimparDente() {
    if (!denteAberto) return
    const denteAntes = odontograma[denteAberto] ?? {}
    const novoOdontograma = { ...odontograma }
    delete novoOdontograma[denteAberto]
    await salvar(novoOdontograma)
    for (const face of FACES) {
      const valorAnterior = denteAntes[face]
      if (valorAnterior) await registrarHistorico(denteAberto, 'status', face, valorAnterior, null)
    }
    if (denteAntes.nota) await registrarHistorico(denteAberto, 'nota', null, denteAntes.nota, null)
  }

  async function handleSalvarNota(nota: string) {
    if (!denteAberto) return
    const valorAnterior = odontograma[denteAberto]?.nota ?? null
    const novoOdontograma = { ...odontograma }
    const denteAtual = { ...(novoOdontograma[denteAberto] ?? {}) }
    if (nota.trim()) {
      denteAtual.nota = nota
    } else {
      delete denteAtual.nota
    }
    if (Object.keys(denteAtual).length === 0) delete novoOdontograma[denteAberto]
    else novoOdontograma[denteAberto] = denteAtual
    await salvar(novoOdontograma)
    await registrarHistorico(denteAberto, 'nota', null, valorAnterior, nota.trim() ? nota : null)
  }

  const dataDenteAberto = denteAberto ? (odontograma[denteAberto] ?? {}) : {}

  const contagem = { vermelho: 0, amarelo: 0, verde: 0 }
  for (const t of TOOTH_SHAPES) {
    const sev = calcularSeveridade(odontograma[t.numero] ?? {})
    if (sev) contagem[sev]++
  }

  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-divider)' }}>
        <h2 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-strong)' }}>Odontograma</h2>
        <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          Clique em um dente para ver e editar os detalhes
        </p>
      </div>

      {/* Legenda de severidade + contador */}
      <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--border-divider)', display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {[
          { cor: SEVERIDADE_COR.vermelho, label: 'Problema pendente', qtd: contagem.vermelho },
          { cor: SEVERIDADE_COR.amarelo, label: 'Em acompanhamento', qtd: contagem.amarelo },
          { cor: SEVERIDADE_COR.verde, label: 'Tratamento concluído', qtd: contagem.verde },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: item.cor, flexShrink: 0 }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text-strong)', fontWeight: 600 }}>{item.qtd}</strong> {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Painel panorâmico */}
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 720 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMAGEM_BASE} alt="Odontograma panorâmico" style={{ width: '100%', display: 'block', userSelect: 'none' }} draggable={false} />
          <svg
            viewBox={`0 0 ${IMG_W} ${IMG_H}`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          >
            {TOOTH_SHAPES.map(t => {
              const data = odontograma[t.numero] ?? {}
              const severidade = calcularSeveridade(data)
              const ausente = data.oclusal === 'ausente' || data.mesial === 'ausente' || data.vestibular === 'ausente'
              const corBase = severidade ? SEVERIDADE_COR[severidade] : 'var(--brand)'
              const opacidadeBase = severidade ? (ausente ? 0.3 : 0.55) : ausente ? 0.18 : 0
              return (
                <polygon
                  key={t.numero}
                  points={t.points}
                  onClick={() => handleAbrirDente(t.numero)}
                  style={{ cursor: 'pointer', transition: 'opacity 120ms ease', mixBlendMode: severidade ? 'multiply' : 'normal' }}
                  fill={corBase}
                  opacity={opacidadeBase}
                  onMouseEnter={e => { setDenteHover(t.numero); if (!severidade) e.currentTarget.setAttribute('opacity', '0.15') }}
                  onMouseLeave={e => { setDenteHover(null); e.currentTarget.setAttribute('opacity', String(opacidadeBase)) }}
                />
              )
            })}
          </svg>

          {/* Tooltip de hover — resumo rápido sem precisar abrir o modal */}
          {denteHover && TOOTH_BBOX[denteHover] && (() => {
            const bbox = TOOTH_BBOX[denteHover]
            const data = odontograma[denteHover] ?? {}
            const faces = resumoFaces(data)
            const centerXPct = ((bbox.minX + bbox.maxX) / 2 / IMG_W) * 100
            const acimaDaLinha = bbox.minY < IMG_H / 2
            const anchorYPct = (acimaDaLinha ? bbox.minY : bbox.maxY) / IMG_H * 100
            return (
              <div
                style={{
                  position: 'absolute',
                  left: `${centerXPct}%`,
                  top: `${anchorYPct}%`,
                  transform: `translate(-50%, ${acimaDaLinha ? '-100%' : '0%'}) translateY(${acimaDaLinha ? '-8px' : '8px'})`,
                  pointerEvents: 'none',
                  zIndex: 20,
                  background: 'var(--surface-card)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md, 8px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  padding: '8px 12px',
                  minWidth: 140,
                  maxWidth: 200,
                }}
              >
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--text-strong)' }}>Dente {denteHover}</p>
                {faces.length === 0 ? (
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>Sem alterações registradas</p>
                ) : (
                  <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {faces.map(f => (
                      <div key={f.face} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: f.cor, flexShrink: 0 }} />
                        <span style={{ color: 'var(--text-muted)' }}>{f.face}:</span>
                        <span style={{ color: 'var(--text-strong)', fontWeight: 500 }}>{f.label}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p style={{ margin: '6px 0 0', fontSize: 10, color: 'var(--text-faint, #9ca3af)' }}>Clique para editar</p>
                {data.nota && (
                  <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--text-strong)', fontStyle: 'italic', borderTop: '1px solid var(--border-divider)', paddingTop: 6 }}>
                    “{data.nota}”
                  </p>
                )}
              </div>
            )
          })()}
        </div>
      </div>

      {denteAberto && (
        <OdontogramaDetalheModal
          key={denteAberto}
          numero={denteAberto}
          data={dataDenteAberto}
          faceSelecionada={faceSelecionada}
          salvando={salvando}
          onSelecionarFace={setFaceSelecionada}
          onSelecionarStatus={handleSelecionarStatus}
          onLimparFace={handleLimparFace}
          onLimparDente={handleLimparDente}
          onSalvarNota={handleSalvarNota}
          onFechar={handleFecharModal}
          historico={historico}
          carregandoHistorico={carregandoHistorico}
        />
      )}

      {/* Legenda de status (referência, aparece também dentro do modal) */}
      <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border-divider)', display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: cfg.cor }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{cfg.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
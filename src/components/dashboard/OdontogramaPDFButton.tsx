'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  STATUS_CONFIG, FACES, type DenteData, type Face, type StatusFace,
} from '@/components/dashboard/OdontogramaDetalheModal'
import {
  TOOTH_SHAPES, IMG_W, IMG_H, IMAGEM_BASE, SEVERIDADE_COR, calcularSeveridade,
} from '@/components/dashboard/Odontograma'

// Tipo do item do plano que vamos buscar (só os campos que o PDF usa)
interface ItemPlanoPDF {
  dentes: number[]
  status: string
  valor_estimado: number | null
  services: { name: string } | null
}

interface Props {
  pacienteId: string
  pacienteNome: string | null
  pacienteTelefone: string
  odontograma: Record<string, DenteData>
}

const FACE_LABEL: Record<Face, string> = {
  oclusal: 'Oclusal', mesial: 'Mesial', distal: 'Distal', vestibular: 'Vestibular', lingual: 'Lingual',
}

const STATUS_ITEM_LABEL: Record<string, string> = {
  planejado: 'Planejado', andamento: 'Em andamento', concluido: 'Concluído',
}

// Ordem clínica de leitura dos dentes (superior 18→28, depois inferior 48→38)
const ORDEM_DENTES = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
]

// Desenha o odontograma (imagem-base + dentes coloridos) direto num canvas,
// em vez de fotografar a tela. Assim não depende do html2canvas ler CSS.
function desenharOdontogramaCanvas(odontograma: Record<string, DenteData>): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = IMG_W
      canvas.height = IMG_H
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('canvas sem contexto')); return }

      // 1. Fundo branco + a imagem-base do odontograma
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, IMG_W, IMG_H)
      ctx.drawImage(img, 0, 0, IMG_W, IMG_H)

      // 2. Pinta cada dente que tem status, por cima, no modo "multiply"
      ctx.globalCompositeOperation = 'multiply'
      for (const t of TOOTH_SHAPES) {
        const data = odontograma[t.numero]
        if (!data) continue
        const severidade = calcularSeveridade(data)
        if (!severidade) continue

        const ausente = data.oclusal === 'ausente' || data.mesial === 'ausente' || data.vestibular === 'ausente'
        ctx.globalAlpha = ausente ? 0.3 : 0.55
        ctx.fillStyle = SEVERIDADE_COR[severidade]

        // O "points" é "x1,y1 x2,y2 ..." — mesma string usada no SVG da tela
        const pts = t.points.split(' ').map(p => p.split(',').map(Number))
        ctx.beginPath()
        pts.forEach(([x, y], i) => {
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.closePath()
        ctx.fill()
      }

      // 3. Escreve o número de cada dente no desenho
      ctx.globalCompositeOperation = 'source-over'  // volta ao normal pra texto nítido
      ctx.globalAlpha = 1
      ctx.fillStyle = '#374151'
      ctx.font = 'bold 30px Arial'
      ctx.textAlign = 'center'
      const meioImagem = IMG_H / 2
      for (const t of TOOTH_SHAPES) {
        const pts = t.points.split(' ').map(p => p.split(',').map(Number))
        const xs = pts.map(p => p[0])
        const ys = pts.map(p => p[1])
        const centroX = (Math.min(...xs) + Math.max(...xs)) / 2
        const minY = Math.min(...ys)
        const maxY = Math.max(...ys)
        // Dente de cima → número acima dele; dente de baixo → número abaixo
        const ehSuperior = (minY + maxY) / 2 < meioImagem
        const y = ehSuperior ? minY - 12 : maxY + 34
        ctx.fillText(String(t.numero), centroX, y)
      }

      // Restaura os padrões do canvas
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'

      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => reject(new Error('falha ao carregar imagem-base'))
    img.src = IMAGEM_BASE
  })
}

export default function OdontogramaPDFButton({ pacienteId, pacienteNome, pacienteTelefone, odontograma }: Props) {
  const [gerando, setGerando] = useState(false)

  async function gerarPDF() {
    setGerando(true)
    try {
      // Carrega as libs só na hora do clique (não pesa no carregamento da página)
      const [{ default: jsPDF }, html2canvasMod] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ])
      const html2canvas = html2canvasMod.default

      // 1. Busca o plano de tratamento do paciente no banco
      const supabase = createClient()
      const { data: planoData } = await supabase
        .from('plano_tratamento_itens')
        .select('dentes, status, valor_estimado, services(name)')
        .eq('patient_id', pacienteId)
        .order('ordem', { ascending: true })
      const plano = (planoData ?? []) as unknown as ItemPlanoPDF[]

      // 2. Monta a lista de dentes que têm alguma face marcada ou nota
      const dentesComDados = ORDEM_DENTES
        .filter(n => {
          const d = odontograma[n]
          if (!d) return false
          return FACES.some(f => d[f]) || d.nota
        })
        .map(n => {
          const d = odontograma[n]
          const faces = FACES
            .filter(f => d[f])
            .map(f => `${FACE_LABEL[f]}: ${STATUS_CONFIG[d[f] as StatusFace].label}`)
            .join(' · ')
          return { numero: n, faces, nota: d.nota ?? '' }
        })

      const valorTotal = plano.reduce((s, i) => s + (i.valor_estimado ?? 0), 0)

      // 3. Desenha o odontograma num canvas (robusto, não depende de CSS)
      let odontoImg = ''
      try {
        odontoImg = await desenharOdontogramaCanvas(odontograma)
      } catch (err) {
        console.error('Falha ao desenhar odontograma:', err)
      }

      // 4. Monta um HTML de relatório, invisível (fora da tela, à esquerda)
      const container = document.createElement('div')
      container.style.cssText = 'position:absolute;left:-9999px;top:0;width:794px;padding:40px;background:#fff;font-family:Arial,sans-serif;color:#111827;'
      container.innerHTML = `
        <div style="border-bottom:2px solid #0F6E56;padding-bottom:16px;margin-bottom:24px;">
          <h1 style="margin:0;font-size:22px;color:#0F6E56;">Odontograma — Relatório Clínico</h1>
          <p style="margin:6px 0 0;font-size:14px;color:#374151;">
            <strong>Paciente:</strong> ${pacienteNome ?? 'Sem nome'} &nbsp;·&nbsp;
            <strong>Telefone:</strong> ${pacienteTelefone}
          </p>
          <p style="margin:2px 0 0;font-size:12px;color:#6B7280;">
            Emitido em ${new Date().toLocaleString('pt-BR')}
          </p>
        </div>

        ${odontoImg ? `<div style="text-align:center;margin-bottom:24px;"><img src="${odontoImg}" style="max-width:100%;"/></div>` : ''}

        <h2 style="font-size:16px;color:#0F6E56;border-bottom:1px solid #E5E7EB;padding-bottom:6px;">Dentes com registro</h2>
        ${dentesComDados.length === 0
          ? '<p style="font-size:13px;color:#6B7280;">Nenhum dente com alteração registrada.</p>'
          : `<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:24px;">
              <thead>
                <tr style="background:#F9FAFB;text-align:left;">
                  <th style="padding:6px 8px;border:1px solid #E5E7EB;width:60px;">Dente</th>
                  <th style="padding:6px 8px;border:1px solid #E5E7EB;">Faces / Status</th>
                  <th style="padding:6px 8px;border:1px solid #E5E7EB;">Nota</th>
                </tr>
              </thead>
              <tbody>
                ${dentesComDados.map(d => `
                  <tr>
                    <td style="padding:6px 8px;border:1px solid #E5E7EB;font-weight:bold;">${d.numero}</td>
                    <td style="padding:6px 8px;border:1px solid #E5E7EB;">${d.faces || '—'}</td>
                    <td style="padding:6px 8px;border:1px solid #E5E7EB;color:#374151;">${d.nota || '—'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>`
        }

        <h2 style="font-size:16px;color:#0F6E56;border-bottom:1px solid #E5E7EB;padding-bottom:6px;">Plano de Tratamento</h2>
        ${plano.length === 0
          ? '<p style="font-size:13px;color:#6B7280;">Nenhum item no plano de tratamento.</p>'
          : `<table style="width:100%;border-collapse:collapse;font-size:12px;">
              <thead>
                <tr style="background:#F9FAFB;text-align:left;">
                  <th style="padding:6px 8px;border:1px solid #E5E7EB;">Procedimento</th>
                  <th style="padding:6px 8px;border:1px solid #E5E7EB;">Dente(s)</th>
                  <th style="padding:6px 8px;border:1px solid #E5E7EB;">Status</th>
                  <th style="padding:6px 8px;border:1px solid #E5E7EB;text-align:right;">Valor</th>
                </tr>
              </thead>
              <tbody>
                ${plano.map(i => `
                  <tr>
                    <td style="padding:6px 8px;border:1px solid #E5E7EB;">${i.services?.name ?? '—'}</td>
                    <td style="padding:6px 8px;border:1px solid #E5E7EB;">${i.dentes.join(', ')}</td>
                    <td style="padding:6px 8px;border:1px solid #E5E7EB;">${STATUS_ITEM_LABEL[i.status] ?? i.status}</td>
                    <td style="padding:6px 8px;border:1px solid #E5E7EB;text-align:right;">R$ ${(i.valor_estimado ?? 0).toFixed(2)}</td>
                  </tr>
                `).join('')}
                <tr style="background:#F9FAFB;font-weight:bold;">
                  <td colspan="3" style="padding:6px 8px;border:1px solid #E5E7EB;text-align:right;">Total</td>
                  <td style="padding:6px 8px;border:1px solid #E5E7EB;text-align:right;">R$ ${valorTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>`
        }
      `
      document.body.appendChild(container)

      // 5. Converte o HTML do relatório em imagem, depois em PDF
      const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff' })
      document.body.removeChild(container)

      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0
      const imgData = canvas.toDataURL('image/png')

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight

      // Se o conteúdo passar de 1 página A4, adiciona páginas extras
      while (heightLeft > 0) {
        position -= pdfHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight
      }

      const nomeArquivo = `odontograma-${(pacienteNome ?? 'paciente').replace(/\s+/g, '-').toLowerCase()}.pdf`
      pdf.save(nomeArquivo)
    } catch (e) {
      console.error('Erro ao gerar PDF:', e)
      alert('Não foi possível gerar o PDF. Tente novamente.')
    } finally {
      setGerando(false)
    }
  }

  return (
    <button
      onClick={gerarPDF}
      disabled={gerando}
      style={{
        fontSize: 'var(--text-xs)', padding: '6px 14px', borderRadius: 'var(--radius-pill)',
        border: '1px solid var(--border-default)', background: 'var(--surface-card)',
        color: 'var(--text-strong)', cursor: gerando ? 'wait' : 'pointer', fontFamily: 'var(--font-sans)',
        opacity: gerando ? 0.6 : 1,
      }}
    >
      {gerando ? 'Gerando PDF...' : '↓ Exportar PDF'}
    </button>
  )
}
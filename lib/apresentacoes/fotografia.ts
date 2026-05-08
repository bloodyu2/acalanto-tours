import type { Presentation } from './types'

const presentation: Presentation = {
  vertical: 'fotografia',
  title: 'Fotografia',
  tagline: 'Transforme momentos de viagem em memórias eternas',
  accentColor: '#7C3AED',
  slides: [
    { type: 'cover' },
    { type: 'who-we-are' },
    { type: 'how-it-works', middleStepLabel: 'Você realiza o ensaio' },
    { type: 'advantages', extras: ['Seu portfólio fica visível para todos os turistas da plataforma', 'Clientes já chegam com expectativas alinhadas', 'Entrega digital direto pelo app'] },
    { type: 'platform' },
    { type: 'repasses' },
    { type: 'agreements', extraItem: 'Portfolio atualizado na plataforma' },
    { type: 'guarantees' },
    { type: 'cta' },
  ],
}

export default presentation

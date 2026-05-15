import type { Presentation } from './types'

const presentation: Presentation = {
  vertical: 'jeep',
  title: 'Jeep & Transfer',
  tagline: 'Conecte turistas ao interior de Paraty com segurança e conforto',
  accentColor: '#16A34A',
  repasse: 'Consulte',
  repasseLabel: 'condições personalizadas por tipo de parceiro',
  slides: [
    { type: 'cover' },
    { type: 'who-we-are' },
    { type: 'how-it-works', middleStepLabel: 'Você realiza o traslado' },
    { type: 'advantages', extras: ['Roteiros para trilhas e cachoeiras inclusos no catálogo', 'Veículo adaptado para estradas de terra', 'Visibilidade para turistas do Brasil inteiro'] },
    { type: 'platform' },
    { type: 'repasses' },
    { type: 'agreements', extraItem: 'Veículo em boas condições e documentado' },
    { type: 'guarantees' },
    { type: 'cta' },
  ],
}

export default presentation

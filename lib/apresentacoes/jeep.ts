import type { Presentation } from './types'

const presentation: Presentation = {
  vertical: 'jeep',
  title: 'Jeep & Transfer',
  tagline: 'Conecte turistas ao interior de Paraty com segurança e conforto',
  accentColor: '#16A34A',
  repasse: '70%',
  repasseLabel: 'do valor por traslado, via PIX',
  slides: [
    { type: 'cover' },
    { type: 'who-we-are' },
    { type: 'how-it-works', middleStepLabel: 'Você realiza o traslado' },
    { type: 'advantages', extras: ['Ensaio fotográfico do seu negócio incluso ao fechar parceria', 'Roteiros para trilhas e cachoeiras', 'Veículo adaptado para estradas de terra'] },
    { type: 'platform' },
    { type: 'repasses' },
    { type: 'agreements', extraItem: 'Veículo em boas condições e documentado' },
    { type: 'guarantees' },
    { type: 'cta' },
  ],
}

export default presentation

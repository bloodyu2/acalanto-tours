import type { Presentation } from './types'

const presentation: Presentation = {
  vertical: 'hospedagem',
  title: 'Hospedagem',
  tagline: 'Aumente sua ocupação com turistas que já chegam reservados',
  accentColor: '#F4A623',
  repasse: '70%',
  repasseLabel: 'do valor por reserva, via PIX',
  slides: [
    { type: 'cover' },
    { type: 'who-we-are' },
    { type: 'how-it-works', middleStepLabel: 'Você hospeda com qualidade' },
    { type: 'advantages', extras: ['Ensaio fotográfico do seu negócio incluso ao fechar parceria', 'Sincronização de calendário com Airbnb e Booking', 'Sem comissão de plataformas terceiras'] },
    { type: 'platform' },
    { type: 'repasses' },
    { type: 'agreements', extraItem: 'Check-in confirmado no dia anterior' },
    { type: 'guarantees' },
    { type: 'cta' },
  ],
}

export default presentation

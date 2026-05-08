import type { Presentation } from './types'

const presentation: Presentation = {
  vertical: 'escunas',
  title: 'Escunas & Passeios',
  tagline: 'Leve turistas para os lugares mais bonitos de Paraty',
  accentColor: '#0A3D5C',
  repasse: '60% a 75%',
  repasseLabel: 'do valor por reserva, via PIX',
  slides: [
    { type: 'cover' },
    { type: 'who-we-are' },
    { type: 'how-it-works', middleStepLabel: 'Você executa o passeio' },
    { type: 'advantages', extras: ['Ensaio fotográfico do seu negócio incluso ao fechar parceria', 'Pagamento garantido antes do embarque', 'Licenças e rotas de navegação respeitadas'] },
    { type: 'platform' },
    { type: 'repasses' },
    { type: 'agreements', extraItem: 'Licenças de navegação em dia' },
    { type: 'guarantees' },
    { type: 'cta' },
  ],
}

export default presentation

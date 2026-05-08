export type SlideType =
  | 'cover'
  | 'who-we-are'
  | 'how-it-works'
  | 'advantages'
  | 'platform'
  | 'repasses'
  | 'agreements'
  | 'guarantees'
  | 'cta'

export type Slide =
  | { type: 'cover' }
  | { type: 'who-we-are' }
  | { type: 'how-it-works'; middleStepLabel: string }
  | { type: 'advantages'; extras: string[] }
  | { type: 'platform' }
  | { type: 'repasses' }
  | { type: 'agreements'; extraItem?: string }
  | { type: 'guarantees' }
  | { type: 'cta' }

export type Presentation = {
  vertical: string
  title: string
  tagline: string
  accentColor: string
  slides: Slide[]
}

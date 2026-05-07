# Acalanto Turismo — Design System v1.0
## Assets exportados em 07/MAI/2026

---

## 📁 Estrutura de pastas

```
acalanto-ds/
├── Design System Acalanto.html   ← Deck completo (28 slides)
├── assets/
│   ├── icons/                    ← App icons + PWA
│   │   ├── icon-512.png          ← App icon principal
│   │   ├── icon-384.png          ← PWA Android
│   │   ├── icon-192.png          ← PWA manifest (any)
│   │   ├── icon-180.png          ← Apple Touch Icon
│   │   ├── icon-152.png          ← Apple Touch Icon iPad
│   │   ├── icon-120.png          ← Apple Touch Icon iPhone
│   │   ├── icon-96.png           ← Android MDPI
│   │   ├── icon-72.png           ← Android legacy
│   │   ├── icon-48.png           ← Android LDPI
│   │   ├── icon-32.png           ← Browser tab (Retina)
│   │   ├── icon-16.png           ← Browser tab padrão
│   │   ├── maskable-512.png      ← PWA maskable (safe zone 80%)
│   │   ├── icon-light-512.png    ← Fundo areia (#F5EDD8)
│   │   ├── icon-light-192.png    ← Fundo areia pequeno
│   │   ├── icon-light-96.png     ← Fundo areia mini
│   │   ├── icon-white-512.png    ← Fundo branco sem raio
│   │   └── icon-white-192.png    ← Fundo branco pequeno
│   ├── logos/
│   │   ├── logo-horizontal-light.png  ← Logo completo sobre branco
│   │   ├── logo-horizontal-sand.png   ← Logo completo sobre areia
│   │   ├── logo-horizontal-dark.png   ← Logo completo sobre ocean-deep
│   │   ├── logo-horizontal-mono.png   ← Logo monocromático 1 cor
│   │   ├── logo-email-header.png      ← Logo para header de e-mail
│   │   ├── logo-stacked-light.png     ← Logo empilhado (ícone sobre nome) claro
│   │   ├── logo-stacked-dark.png      ← Logo empilhado escuro
│   │   ├── icon-512-dark.png          ← Ícone isolado escuro 512px
│   │   ├── icon-512-light.png         ← Ícone isolado areia 512px
│   │   ├── icon-512-white.png         ← Ícone isolado branco 512px
│   │   └── icon-512-mono.png          ← Ícone isolado mono 512px
│   ├── social/
│   │   ├── og-image.jpg               ← Open Graph 1200×630
│   │   ├── instagram-post.jpg         ← Instagram post 1080×1080
│   │   ├── instagram-story.jpg        ← Instagram story 1080×1920
│   │   ├── whatsapp-status.jpg        ← WhatsApp status 750×1334
│   │   ├── email-banner.jpg           ← E-mail header banner 600×200
│   │   └── facebook-cover.jpg         ← Facebook cover 820×312
│   ├── brand/
│   │   ├── paleta-cores.jpg           ← Guia de cores 1200×800
│   │   └── guia-tipografia.jpg        ← Guia de tipografia 1200×800
│   └── pwa/
│       └── manifest.json              ← manifest.json atualizado com ícones
```

---

## 🎨 Paleta de cores

| Token | Hex | Uso |
|-------|-----|-----|
| `--ocean-deep` | `#0A3D5C` | Header, footer, botão primário |
| `--ocean-mid` | `#1A6B8A` | Links, hover, tag Passeios |
| `--ocean-light` | `#2E9CBF` | Ícones, acentos |
| `--ocean-pale` | `#D6EEF5` | Backgrounds suaves |
| `--sand-warm` | `#F5EDD8` | Background alternado |
| `--sand-mid` | `#E8D9B8` | Bordas, divisores |
| `--sunset-gold` | `#F4A623` | CTA, badge preço |
| `--sunset-coral` | `#E8673A` | Alertas, proibições |

## 📝 Tipografia

- **Display / Marca:** Playfair Display (italic 400–700)
- **UI / Corpo:** Plus Jakarta Sans (400–800)
- **Dados / Preços:** JetBrains Mono (400–500)

## 📱 PWA — Como usar

1. Copiar todos os arquivos de `assets/icons/` para `public/`
2. Copiar `assets/pwa/manifest.json` para `public/manifest.json`
3. Adicionar no `<head>`:
   ```html
   <link rel="icon" href="/icon-32.png" sizes="32x32">
   <link rel="icon" href="/icon-16.png" sizes="16x16">
   <link rel="apple-touch-icon" href="/icon-180.png">
   <link rel="manifest" href="/manifest.json">
   <meta name="theme-color" content="#0A3D5C">
   ```

## 🤖 Prompt para IA (Claude)

> Você está trabalhando no site da **Acalanto Turismo**, empresa de passeios de escuna em Paraty, RJ.
> Paleta: Ocean Deep #0A3D5C · Ocean Mid #1A6B8A · Sand Warm #F5EDD8 · Sunset Gold #F4A623.
> Fontes: Playfair Display (headings) + Plus Jakarta Sans (body) + JetBrains Mono (dados).
> Tom: caloroso, náutico, autêntico. Nunca corporativo.
> Consulte o Design System Acalanto.html para todos os padrões visuais.

---

*Design System v1.0 · Balaio Digital · victor.lima@balaio.net · Paraty, RJ · 07.MAI.2026*

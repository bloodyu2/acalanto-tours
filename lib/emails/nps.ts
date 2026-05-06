export function npsEmailHtml(customerName: string, boatName: string, surveyUrl: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:sans-serif;background:#f5f5f5">
<div style="max-width:600px;margin:0 auto;background:white">
  <div style="background:#0A3D5C;padding:2rem;text-align:center">
    <h1 style="color:white;margin:0;font-size:1.5rem">Acalanto Tours</h1>
  </div>
  <div style="padding:2rem;text-align:center">
    <h2 style="color:#0A3D5C">Como foi seu passeio?</h2>
    <p>Ola, ${customerName}! Esperamos que seu passeio na ${boatName} tenha sido incrivel.</p>
    <p>Leva so 1 minuto e nos ajuda muito a melhorar.</p>
    <a href="${surveyUrl}" style="display:inline-block;background:#1A6B8A;color:white;padding:0.875rem 2rem;border-radius:8px;text-decoration:none;font-weight:600;margin:1.5rem 0">Avaliar meu passeio</a>
    <p style="color:#999;font-size:0.8rem;margin-top:1rem">Link valido por 7 dias</p>
  </div>
  <div style="background:#f9f9f9;padding:1rem 2rem;text-align:center;color:#999;font-size:0.75rem">
    <p>Acalanto Tours - Paraty, RJ</p>
  </div>
</div>
</body></html>`
}

export function npsEmailText(customerName: string, boatName: string, surveyUrl: string): string {
  return `Como foi seu passeio na ${boatName}?\n\nOla, ${customerName}!\n\nAcesse o link para avaliar: ${surveyUrl}\n\n(Link valido por 7 dias)`
}

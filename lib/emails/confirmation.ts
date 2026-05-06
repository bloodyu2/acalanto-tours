interface ConfirmationData {
  customerName: string
  tourDate: string
  boatName: string
  adults: number
  children: number
  totalCents: number
}

export function confirmationEmailHtml(data: ConfirmationData): string {
  const total = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.totalCents / 100)
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:sans-serif;background:#f5f5f5">
<div style="max-width:600px;margin:0 auto;background:white">
  <div style="background:#0A3D5C;padding:2rem;text-align:center">
    <h1 style="color:white;margin:0;font-size:1.5rem">Acalanto Tours</h1>
    <p style="color:rgba(255,255,255,0.8);margin:0.5rem 0 0">Paraty, Costa Verde</p>
  </div>
  <div style="padding:2rem">
    <h2 style="color:#0A3D5C">Reserva Confirmada!</h2>
    <p>Ola, ${data.customerName}! Sua reserva foi confirmada com sucesso.</p>
    <div style="background:#f5f5f5;border-radius:8px;padding:1.5rem;margin:1.5rem 0">
      <p style="margin:0.5rem 0"><strong>Embarcacao:</strong> ${data.boatName}</p>
      <p style="margin:0.5rem 0"><strong>Data:</strong> ${data.tourDate}</p>
      <p style="margin:0.5rem 0"><strong>Passageiros:</strong> ${data.adults} adulto(s)${data.children > 0 ? `, ${data.children} crianca(s)` : ''}</p>
      <p style="margin:0.5rem 0"><strong>Total pago:</strong> ${total}</p>
    </div>
    <p style="color:#666">Nos encontramos no pier de embarque. Leve protetor solar, chapeu e agua. Chegue 15 minutos antes do horario de saida.</p>
    <p>Qualquer duvida, fale com a gente no WhatsApp: <a href="https://wa.me/5524999627968" style="color:#1A6B8A">+55 24 99962-7968</a></p>
  </div>
  <div style="background:#f9f9f9;padding:1rem 2rem;text-align:center;color:#999;font-size:0.75rem">
    <p>Acalanto Tours - Paraty, RJ</p>
  </div>
</div>
</body></html>`
}

export function confirmationEmailText(data: ConfirmationData): string {
  const total = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.totalCents / 100)
  return `Reserva Confirmada - Acalanto Tours\n\nOla, ${data.customerName}!\n\nEmbarcacao: ${data.boatName}\nData: ${data.tourDate}\nPassageiros: ${data.adults} adulto(s)${data.children > 0 ? `, ${data.children} crianca(s)` : ''}\nTotal: ${total}\n\nNos encontramos no pier. Chegue 15 min antes.\nWhatsApp: +55 24 99962-7968`
}

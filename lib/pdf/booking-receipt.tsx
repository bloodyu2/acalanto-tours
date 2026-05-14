import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import React from 'react'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11 },
  h1:   { fontSize: 18, fontWeight: 700, marginBottom: 12 },
  row:  { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  label:{ color: '#666' },
  total:{ marginTop: 20, fontSize: 16, fontWeight: 700 },
})

export interface BookingForReceipt {
  id: string
  customerName: string
  customerEmail: string
  tourDate: string | null
  boatName: string | null
  adults: number
  children: number
  totalCents: number
  paymentMethod: string | null
  paidAt: string | null
}

function ReceiptDoc({ b }: { b: BookingForReceipt }) {
  const fmt = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Acalanto Turismo — Comprovante de reserva</Text>
        <View style={styles.row}><Text style={styles.label}>Reserva:</Text><Text>{b.id}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Cliente:</Text><Text>{b.customerName}</Text></View>
        <View style={styles.row}><Text style={styles.label}>E-mail:</Text><Text>{b.customerEmail}</Text></View>
        {b.boatName && <View style={styles.row}><Text style={styles.label}>Escuna:</Text><Text>{b.boatName}</Text></View>}
        {b.tourDate && <View style={styles.row}><Text style={styles.label}>Data:</Text><Text>{b.tourDate}</Text></View>}
        <View style={styles.row}><Text style={styles.label}>Passageiros:</Text><Text>{b.adults}A{b.children ? ` ${b.children}C` : ''}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Pagamento:</Text><Text>{b.paymentMethod ?? '—'}</Text></View>
        {b.paidAt && <View style={styles.row}><Text style={styles.label}>Pago em:</Text><Text>{new Date(b.paidAt).toLocaleString('pt-BR')}</Text></View>}
        <Text style={styles.total}>Total: {fmt(b.totalCents)}</Text>
      </Page>
    </Document>
  )
}

export async function renderBookingReceipt(b: BookingForReceipt): Promise<Buffer> {
  return await renderToBuffer(<ReceiptDoc b={b} />)
}

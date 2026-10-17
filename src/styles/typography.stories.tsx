import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge, Button, Input, Label, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../index'

/*
 * The library's typeface (Inter, from theme.css) under the checks a Turkish
 * interface needs: the dotted and dotless i, cedillas and breves near the next
 * line, "fi" keeping its dot, and lira amounts lining up in a column.
 */

const meta = { title: 'Foundations/Typography' } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const weights: Array<[number, string]> = [
  [400, 'Normal'],
  [500, 'Orta'],
  [600, 'Yarı kalın'],
  [700, 'Kalın'],
]

const sizes = [36, 28, 24, 20, 16, 14, 12]

const rows: Array<[string, string, string]> = [
  ['Şükrü Öztürk', 'İnsan Kaynakları', '48.250,00 ₺'],
  ['Gülşen Çağlayan', 'Finans', '112.900,50 ₺'],
  ['İlker Ilıcalı', 'Bilgi İşlem', '7.111,11 ₺'],
]

export const Specimen: Story = {
  render: () => (
    <div lang="tr" className="flex w-[40rem] max-w-full flex-col gap-8">
      <section className="flex flex-col gap-2">
        {sizes.map((size) => (
          <p key={size} className="flex items-baseline justify-between gap-4" style={{ fontSize: size, fontWeight: size >= 16 ? 600 : 400 }}>
            <span className="truncate">Çalışanlar ve izinler</span>
            <span className="shrink-0 text-xs font-normal text-muted-foreground">{size}px</span>
          </p>
        ))}
      </section>

      <section className="flex flex-col gap-1 text-sm">
        {weights.map(([weight, name]) => (
          <p key={weight} style={{ fontWeight: weight }}>
            Pijamalı hasta yağız şoföre çabucak güvendi. <span className="text-muted-foreground">{name} · {weight}</span>
          </p>
        ))}
        <p className="italic">Pijamalı hasta yağız şoföre çabucak güvendi. İtalik</p>
        <p>fiyat · ofis · filtre · şifre · İSTANBUL · ŞUBAT · ĞÜÇÖ · ıiIİ · Âdet · Hâlâ</p>
      </section>

      <section className="text-2xl font-semibold">
        <p className="max-w-[24rem]">İş Güvenliği Eğitimi Şubat Ayında Çevrimiçi</p>
        <p className="mt-1 text-sm font-normal text-muted-foreground">
          İki satıra taşan başlıkta Ş, Ç ve İ işaretleri komşu satıra değmemeli.
        </p>
      </section>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ad Soyad</TableHead>
            <TableHead>Birim</TableHead>
            <TableHead className="text-right">Maaş</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(([person, unit, pay]) => (
            <TableRow key={person}>
              <TableCell>{person}</TableCell>
              <TableCell>{unit}</TableCell>
              <TableCell className="text-right tabular-nums">{pay}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <section className="flex flex-col gap-2">
        <Label htmlFor="typography-search">Personel ara</Label>
        <Input id="typography-search" placeholder="Ad, soyad, sicil no" />
        <div className="flex items-center gap-2">
          <Button>Yeni çalışan</Button>
          <Button variant="secondary">Sütunlar</Button>
          <Badge tone="success" variant="soft">Aktif</Badge>
        </div>
      </section>
    </div>
  ),
}

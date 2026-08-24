/** A rotating set of accent colors used for decorative per-item variety (feature icons, module
 * categories, differentiators) — kept separate from the brand tokens (primary/accent) in
 * globals.css, which stay consistent everywhere else in the product. */
export interface ColorTheme {
  icon: string
  iconBg: string
  ring: string
  bar: string
  chipBg: string
  chipText: string
}

export const COLOR_THEMES: ColorTheme[] = [
  { icon: 'text-blue-600', iconBg: 'bg-blue-500/10', ring: 'group-hover:border-blue-500/30', bar: 'from-blue-500 to-sky-400', chipBg: 'bg-blue-50', chipText: 'text-blue-700' },
  { icon: 'text-violet-600', iconBg: 'bg-violet-500/10', ring: 'group-hover:border-violet-500/30', bar: 'from-violet-500 to-purple-400', chipBg: 'bg-violet-50', chipText: 'text-violet-700' },
  { icon: 'text-emerald-600', iconBg: 'bg-emerald-500/10', ring: 'group-hover:border-emerald-500/30', bar: 'from-emerald-500 to-teal-400', chipBg: 'bg-emerald-50', chipText: 'text-emerald-700' },
  { icon: 'text-amber-600', iconBg: 'bg-amber-500/10', ring: 'group-hover:border-amber-500/30', bar: 'from-amber-500 to-orange-400', chipBg: 'bg-amber-50', chipText: 'text-amber-700' },
  { icon: 'text-pink-600', iconBg: 'bg-pink-500/10', ring: 'group-hover:border-pink-500/30', bar: 'from-pink-500 to-rose-400', chipBg: 'bg-pink-50', chipText: 'text-pink-700' },
  { icon: 'text-cyan-600', iconBg: 'bg-cyan-500/10', ring: 'group-hover:border-cyan-500/30', bar: 'from-cyan-500 to-blue-400', chipBg: 'bg-cyan-50', chipText: 'text-cyan-700' },
]

export function colorTheme(index: number): ColorTheme {
  return COLOR_THEMES[index % COLOR_THEMES.length]
}

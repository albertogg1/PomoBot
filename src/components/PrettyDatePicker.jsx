import React from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './PrettyDatePicker.css'
import { addDays, addMonths, startOfWeek } from 'date-fns'
import es from 'date-fns/locale/es'

export default function PrettyDatePicker({ mode = 'day', value, onChange }) {
  // value: Date for day/week, {year, month} for month
  const toDate = () => {
    if (mode === 'month') {
      const y = (value && value.year) || new Date().getFullYear()
      const m = (value && typeof value.month === 'number') ? value.month : new Date().getMonth()
      return new Date(y, m, 1)
    }
    return value || new Date()
  }

  const selected = toDate()

  const handleChange = (d) => {
    if (!d) return
    if (mode === 'day') return onChange && onChange(d)
    if (mode === 'week') return onChange && onChange(startOfWeek(d, { weekStartsOn: 1 }))
    if (mode === 'month') return onChange && onChange({ year: d.getFullYear(), month: d.getMonth() })
  }

  const onPrev = () => {
    if (mode === 'day') return onChange && onChange(addDays(selected, -1))
    if (mode === 'week') return onChange && onChange(addDays(selected, -7))
    if (mode === 'month') return onChange && onChange({ year: selected.getFullYear(), month: selected.getMonth() === 0 ? 11 : selected.getMonth() - 1 })
  }

  const onNext = () => {
    if (mode === 'day') return onChange && onChange(addDays(selected, 1))
    if (mode === 'week') return onChange && onChange(addDays(selected, 7))
    if (mode === 'month') return onChange && onChange({ year: selected.getFullYear(), month: selected.getMonth() === 11 ? 0 : selected.getMonth() + 1 })
  }

  const dateFormat = mode === 'month' ? 'MMM yyyy' : (mode === 'day' ? 'dd/MM' : 'dd/MM')

  return (
    <div className="pretty-datepicker-compact">
      <button type="button" className="pretty-nav" onClick={onPrev} aria-label="prev"></button>
      <DatePicker
        selected={selected}
        onChange={handleChange}
        inline={false}
        dateFormat={dateFormat}
        locale={es}
        showMonthYearPicker={mode === 'month'}
        showWeekNumbers={false}
        weekLabel=""
        className="pretty-datepicker-input"
        popperPlacement="bottom-end"
        popperModifiers={[{ name: 'offset', options: { offset: [0, 6] } }]}
        showPopperArrow={false}
      />
      <button type="button" className="pretty-nav" onClick={onNext} aria-label="next"></button>
    </div>
  )
}

import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"

const cn = (...classes) => classes.filter(Boolean).join(" ")

function Calendar({ className, classNames, ...props }) {
  return (
    <DayPicker
      className={cn("p-3", className)}
      weekStartsOn={1}
      captionLayout="dropdown"
      classNames={{
        ...classNames,
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }

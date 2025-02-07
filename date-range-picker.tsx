"use client"
import { format, startOfWeek, endOfWeek } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Props {
  className?: string
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
}

const DatePickerWithRange = ({ className, date, setDate }: Props) => {
  const handleSelect = (selectedDate: DateRange | undefined) => {
    if (selectedDate?.from) {
      const weekStart = startOfWeek(selectedDate.from, { weekStartsOn: 1 })
      const weekEnd = selectedDate.to ? endOfWeek(selectedDate.to, { weekStartsOn: 1 }) : endOfWeek(selectedDate.from, { weekStartsOn: 1 })
      setDate({ from: weekStart, to: weekEnd })
    } else {
      setDate(selectedDate)
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal bg-white border-gray-200 hover:bg-gray-50",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
            {date?.from ? (
              date.to ? (
                <>
                  Week of {format(date.from, "MMM d")} - Week of {format(date.to, "MMM d, yyyy")}
                </>
              ) : (
                `Week of ${format(date.from, "MMMM d, yyyy")}`
              )
            ) : (
              <span>Select week range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 bg-white shadow-lg rounded-md border border-gray-200" 
          align="start"
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            className="p-3"
            classNames={{
              months: "flex space-x-4",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium text-gray-900",
              nav: "space-x-1 flex items-center",
              nav_button: cn(
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity",
                "text-gray-500 hover:text-gray-900"
              ),
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
              day: cn(
                "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md transition-colors",
                "text-gray-900 hover:text-gray-900"
              ),
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default DatePickerWithRange


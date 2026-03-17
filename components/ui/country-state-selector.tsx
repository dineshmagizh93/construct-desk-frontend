"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Country, State } from "country-state-city"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface CountrySelectorProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function CountrySelector({ value, onChange, disabled, className }: CountrySelectorProps) {
  const [open, setOpen] = React.useState(false)
  const countries = React.useMemo(() => {
    const allCountries = Country.getAllCountries()
    // Sort countries alphabetically for better UX
    return allCountries.sort((a, b) => a.name.localeCompare(b.name))
  }, [])

  const selectedCountry = React.useMemo(() => {
    return countries.find((country) => country.name === value)
  }, [countries, value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">
            {selectedCountry?.name || value || "Select country..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0" 
        align="start"
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => {
                // Use country name and isoCode as the value for proper filtering
                // cmdk filters case-insensitively by default
                return (
                  <CommandItem
                    key={country.isoCode}
                    value={`${country.name} ${country.isoCode}`}
                    onSelect={() => {
                      const newValue = country.name === value ? "" : country.name
                      onChange(newValue)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === country.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="flex items-center gap-2">
                      {country.flag && <span>{country.flag}</span>}
                      <span>{country.name}</span>
                    </span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

interface StateSelectorProps {
  countryName?: string
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function StateSelector({ countryName, value, onChange, disabled, className }: StateSelectorProps) {
  const [open, setOpen] = React.useState(false)

  const states = React.useMemo(() => {
    if (!countryName) return []
    const country = Country.getAllCountries().find(c => c.name === countryName)
    if (!country) return []
    const countryStates = State.getStatesOfCountry(country.isoCode)
    // Sort states alphabetically for better UX
    return countryStates.sort((a, b) => a.name.localeCompare(b.name))
  }, [countryName])

  const selectedState = React.useMemo(() => {
    return states.find((state) => state.name === value)
  }, [states, value])

  // Reset state value when country changes
  React.useEffect(() => {
    if (value && !selectedState) {
      onChange("")
    }
  }, [countryName, value, selectedState, onChange])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || !countryName || states.length === 0}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">
            {value
              ? selectedState?.name || value
              : !countryName
              ? "Select country first"
              : states.length === 0
              ? "No states available"
              : "Select state/province..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0" 
        align="start"
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        <Command>
          <CommandInput placeholder="Search state..." />
          <CommandList>
            <CommandEmpty>No state found.</CommandEmpty>
            <CommandGroup>
              {states.map((state) => {
                // Use state name and isoCode as the value for proper filtering
                return (
                  <CommandItem
                    key={state.isoCode}
                    value={`${state.name} ${state.isoCode}`}
                    onSelect={() => {
                      const newValue = state.name === value ? "" : state.name
                      onChange(newValue)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === state.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {state.name}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

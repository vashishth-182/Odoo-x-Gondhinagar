"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore } from "@/lib/store"
import { fetchCountries, type CountryData } from "@/lib/currency-api"
import { Loader2, User, Mail, Lock, Building2, Globe, DollarSign } from "lucide-react"

export function SignupForm() {
  const router = useRouter()
  const signup = useStore((state) => state.signup)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedCurrency, setSelectedCurrency] = useState("")
  const [countries, setCountries] = useState<CountryData[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCountries, setLoadingCountries] = useState(true)

  useEffect(() => {
    const loadCountries = async () => {
      const data = await fetchCountries()
      const filtered = data.filter((c) => c.currencies && Object.keys(c.currencies).length > 0)
      setCountries(filtered)
      setLoadingCountries(false)
    }
    loadCountries()
  }, [])

  const handleCountryChange = (countryName: string) => {
    setSelectedCountry(countryName)
    const country = countries.find((c) => c.name.common === countryName)
    if (country && country.currencies) {
      const currencyCode = Object.keys(country.currencies)[0]
      setSelectedCurrency(currencyCode)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    await signup(email, password, name, companyName, selectedCountry, selectedCurrency)
    router.push("/dashboard")

    setLoading(false)
  }

  const selectedCountryData = countries.find((c) => c.name.common === selectedCountry)
  const currencies = selectedCountryData?.currencies || {}

  return (
    <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
      <CardHeader className="space-y-2 pb-6">
        <CardTitle className="text-2xl text-slate-900">Create account</CardTitle>
        <CardDescription className="text-slate-600">Get started with your free account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-slate-700">
              Full name
            </Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 h-11 border-slate-300 focus-visible:ring-blue-600"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11 border-slate-300 focus-visible:ring-blue-600"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-11 border-slate-300 focus-visible:ring-blue-600"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-medium text-slate-700">
              Company name
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="company"
                placeholder="Acme Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="pl-10 h-11 border-slate-300 focus-visible:ring-blue-600"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium text-slate-700">
                Country
              </Label>
              <Select value={selectedCountry} onValueChange={handleCountryChange} required>
                <SelectTrigger id="country" className="h-11 border-slate-300">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-slate-400" />
                    <SelectValue placeholder={loadingCountries ? "Loading..." : "Select country"} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.name.common} value={country.name.common}>
                      {country.name.common}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCountry && (
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-sm font-medium text-slate-700">
                  Currency
                </Label>
                <Select value={selectedCurrency} onValueChange={setSelectedCurrency} required>
                  <SelectTrigger id="currency" className="h-11 border-slate-300">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-slate-400" />
                      <SelectValue placeholder="Select currency" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(currencies).map(([code, currency]) => (
                      <SelectItem key={code} value={code}>
                        {code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm mt-6"
            disabled={loading || loadingCountries}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

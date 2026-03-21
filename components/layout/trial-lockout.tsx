"use client"

import * as React from "react"
import { AlertTriangle, CreditCard, Lock, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function TrialExpiredLockout() {
  const router = useRouter()

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 text-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden relative">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-red-500 to-orange-500" />
        
        <div className="p-8 sm:p-10">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="h-10 w-10 text-red-500" />
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
            Trial Expired
          </h2>
          
          <p className="text-slate-600 mb-8 leading-relaxed">
            Your 3-day free trial has concluded. To regain full access to all modules, projects, and your team's data, please upgrade your subscription.
          </p>
          
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-8 flex flex-col gap-3">
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>3-day trial period <strong className="text-red-600">Finished</strong></span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>Dashboard access locked</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              size="lg" 
              className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-white shadow-md hover:-translate-y-0.5 transition-all"
              onClick={() => router.push("/settings")}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Upgrade Now
            </Button>
            <Button 
              variant="outline"
              size="lg" 
              className="flex-1 rounded-full text-slate-700 border-slate-200 hover:bg-slate-50 transition-colors"
              onClick={() => {
                sessionStorage.clear()
                localStorage.clear()
                router.push("/login")
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

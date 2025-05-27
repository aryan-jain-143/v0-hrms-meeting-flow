"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Database, Copy, ExternalLink, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DatabaseInitializer() {
  const [sqlScript, setSqlScript] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Fetch the SQL script
    const fetchSqlScript = async () => {
      try {
        const response = await fetch("/api/db-init")
        const data = await response.json()
        setSqlScript(data.sql || "")
      } catch (error) {
        console.error("Error fetching SQL script:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSqlScript()
  }, [])

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "SQL script copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-6">
        <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Database Setup Required</h2>
        <p className="text-gray-600">
          The meetings table needs to be created in your Supabase database. Follow the steps below to set it up.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full mr-2">
                Step 1
              </span>
              Open Supabase SQL Editor
            </CardTitle>
            <CardDescription>Navigate to your Supabase project dashboard and open the SQL Editor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600 flex-1">Go to your Supabase project → SQL Editor → New query</p>
              <Button variant="outline" size="sm" asChild>
                <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Supabase
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full mr-2">
                Step 2
              </span>
              Copy and Run SQL Script
            </CardTitle>
            <CardDescription>Copy the SQL script below and paste it into the SQL Editor, then run it</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">SQL Script to create the meetings table:</p>
                <Button variant="outline" size="sm" onClick={handleCopyScript} disabled={isLoading || !sqlScript}>
                  {copied ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Script
                    </>
                  )}
                </Button>
              </div>

              {isLoading ? (
                <div className="bg-gray-100 p-4 rounded-md">
                  <p className="text-gray-500">Loading SQL script...</p>
                </div>
              ) : (
                <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto max-h-96 overflow-y-auto">
                  <code>{sqlScript}</code>
                </pre>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full mr-2">
                Step 3
              </span>
              Refresh Application
            </CardTitle>
            <CardDescription>
              After running the SQL script, refresh this page to start using the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRefresh} className="w-full">
              <Database className="mr-2 h-4 w-4" />
              Refresh Application
            </Button>
          </CardContent>
        </Card>
      </div>

      <Alert className="mt-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Make sure you're running the SQL script in the correct Supabase project that matches your environment
          variables.
        </AlertDescription>
      </Alert>
    </div>
  )
}

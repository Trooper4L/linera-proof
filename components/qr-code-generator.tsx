"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { generateClaimCode, generateQRCodeURL, encodeQRData, type QRCodeData } from "@/lib/qr-utils"

interface QRCodeGeneratorProps {
  eventId: string
  eventName: string
  issuer: string
}

export default function QRCodeGenerator({ eventId, eventName, issuer }: QRCodeGeneratorProps) {
  const [generatedCodes, setGeneratedCodes] = useState<Array<{ code: string; qrUrl: string }>>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateQRCodes = async (count = 10) => {
    setIsGenerating(true)

    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newCodes = Array.from({ length: count }, (_, i) => {
      const claimCode = generateClaimCode(eventId, i)
      const qrData: QRCodeData = {
        claimCode,
        eventId,
        eventName,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        issuer,
      }
      const encoded = encodeQRData(qrData)
      const qrUrl = generateQRCodeURL(encoded)

      return {
        code: claimCode,
        qrUrl,
      }
    })

    setGeneratedCodes([...generatedCodes, ...newCodes])
    setIsGenerating(false)
  }

  const handleDownloadQRCode = (qrUrl: string, claimCode: string) => {
    const link = document.createElement("a")
    link.href = qrUrl
    link.download = `qr-code-${claimCode}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle>QR Code Management</CardTitle>
        <CardDescription>Generate and manage QR codes for attendee claim codes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={() => handleGenerateQRCodes(10)}
            disabled={isGenerating}
            className="bg-primary hover:bg-primary/90"
          >
            {isGenerating ? "Generating..." : "Generate 10 QR Codes"}
          </Button>
          <Button
            onClick={() => handleGenerateQRCodes(50)}
            disabled={isGenerating}
            variant="outline"
            className="bg-transparent"
          >
            Generate 50
          </Button>
        </div>

        {generatedCodes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground">Generated Codes ({generatedCodes.length})</h4>
              <Badge variant="outline">{generatedCodes.length} codes</Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
              {generatedCodes.map((item, index) => (
                <Dialog key={index}>
                  <DialogTrigger asChild>
                    <div className="p-3 border rounded-lg hover:border-primary/50 cursor-pointer transition-colors">
                      <div className="aspect-square bg-muted rounded mb-2 flex items-center justify-center">
                        <img
                          src={item.qrUrl || "/placeholder.svg"}
                          alt={`QR Code ${item.code}`}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <p className="text-xs font-mono text-center truncate text-muted-foreground">{item.code}</p>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>QR Code Details</DialogTitle>
                      <DialogDescription>Claim Code: {item.code}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="flex justify-center p-4 bg-muted rounded-lg">
                        <img
                          src={item.qrUrl || "/placeholder.svg"}
                          alt={`QR Code ${item.code}`}
                          className="w-64 h-64"
                        />
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Claim Code</p>
                        <div className="flex gap-2">
                          <code className="flex-1 p-2 bg-muted rounded text-xs font-mono break-all">{item.code}</code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyCode(item.code)}
                            className="bg-transparent"
                          >
                            Copy
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => handleDownloadQRCode(item.qrUrl, item.code)}
                        >
                          Download
                        </Button>
                        <Button className="flex-1 bg-primary hover:bg-primary/90">Print</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

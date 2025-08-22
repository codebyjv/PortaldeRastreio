'use client'

import React, { useState } from 'react'
import { Star, MessageCircle, Send, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Alert, AlertDescription } from './ui/alert'

interface FeedbackFormProps {
  orderNumber: string
}

export function FeedbackForm({ orderNumber }: FeedbackFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      alert('Por favor, selecione uma avaliação')
      return
    }

    setIsSubmitting(true)
    
    // Simular envio do feedback
    setTimeout(() => {
      setIsSubmitted(true)
      setIsSubmitting(false)
    }, 1500)
  }

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Obrigado pelo seu feedback!
          </h3>
          <p className="text-gray-600">
            Sua avaliação é muito importante para nós. Utilizaremos seu feedback para melhorar nossos serviços.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Avaliação do Serviço
        </CardTitle>
        <CardDescription>
          Sua opinião é importante! Compartilhe sua experiência conosco (opcional)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Stars */}
          <div>
            <Label className="text-base font-medium">Como você avalia o nosso serviço?</Label>
            <div className="flex items-center space-x-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-3 text-sm text-gray-600">
                  {rating === 1 && 'Muito Insatisfeito'}
                  {rating === 2 && 'Insatisfeito'}
                  {rating === 3 && 'Neutro'}
                  {rating === 4 && 'Satisfeito'}
                  {rating === 5 && 'Muito Satisfeito'}
                </span>
              )}
            </div>
          </div>

          {/* Feedback Text */}
          <div>
            <Label htmlFor="feedback">Comentários (opcional)</Label>
            <Textarea
              id="feedback"
              placeholder="Compartilhe sua experiência, sugestões ou comentários sobre o pedido..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email para contato (opcional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-1">
              Caso precise de uma resposta ao seu feedback
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting || rating === 0}
              className="flex items-center"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
            </Button>
          </div>
        </form>

        <Alert className="mt-4">
          <AlertDescription className="text-sm">
            <strong>Pedido:</strong> {orderNumber} - Seus dados serão tratados conforme nossa política de privacidade
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
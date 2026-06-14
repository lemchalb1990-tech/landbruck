'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1600&q=80',
    tag: 'Temporada de siembra',
    title: 'Semillas de alta\ncalidad genética',
    subtitle: 'Variedades seleccionadas para el clima chileno. Mayor rendimiento en cada cosecha.',
    cta: 'Explorar semillas',
    href: '/productos?categoria=semillas',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1600&q=80',
    tag: 'Para tu campo',
    title: 'Insumos agrícolas\npara profesionales',
    subtitle: 'Fertilizantes, pesticidas y herramientas para maximizar tu producción agrícola.',
    cta: 'Ver insumos',
    href: '/productos?categoria=insumos',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600&q=80',
    tag: 'Huerto en casa',
    title: 'Todo para tu\nhuerto y jardín',
    subtitle: 'Desde semillas de tomates hasta plantas aromáticas. Cultiva tu propio alimento.',
    cta: 'Ver productos',
    href: '/productos',
  },
]

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  const goTo = useCallback((index: number) => {
    if (animating) return
    setAnimating(true)
    setCurrent(index)
    setTimeout(() => setAnimating(false), 600)
  }, [animating])

  const prev = () => goTo((current - 1 + slides.length) % slides.length)
  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo])

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  const slide = slides[current]

  return (
    <section className="relative h-[580px] md:h-[640px] overflow-hidden bg-gray-900">
      {/* Imágenes */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <Image
            src={s.image}
            alt={s.title}
            fill
            className="object-cover"
            priority={i === 0}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </div>
      ))}

      {/* Contenido */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 md:px-10 w-full">
          <div className="max-w-xl">
            <span className="inline-block bg-brand-500 text-white text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
              {slide.tag}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5 whitespace-pre-line">
              {slide.title}
            </h1>
            <p className="text-gray-200 text-lg mb-8 leading-relaxed">
              {slide.subtitle}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={slide.href}
                className="inline-flex items-center bg-brand-600 hover:bg-brand-500 text-white font-semibold px-7 py-3.5 rounded-full transition-colors shadow-lg"
              >
                {slide.cta}
              </Link>
              <Link
                href="/productos"
                className="inline-flex items-center bg-white/15 hover:bg-white/25 text-white font-semibold px-7 py-3.5 rounded-full backdrop-blur-sm transition-colors border border-white/30"
              >
                Ver catálogo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Flechas */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full p-2.5 transition-colors border border-white/30"
        aria-label="Anterior"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full p-2.5 transition-colors border border-white/30"
        aria-label="Siguiente"
      >
        <ChevronRight size={22} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current ? 'bg-white w-7 h-2.5' : 'bg-white/50 hover:bg-white/75 w-2.5 h-2.5'
            }`}
            aria-label={`Ir a slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Contador */}
      <div className="absolute bottom-6 right-6 text-white/60 text-sm font-medium">
        {current + 1} / {slides.length}
      </div>
    </section>
  )
}

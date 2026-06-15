import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-brand-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-3">Landbruck</h3>
          <p className="text-sm text-gray-300">
            Semillas y productos agrícolas de calidad para tu huerto y jardín.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Navegación</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
            <li><Link href="/productos" className="hover:text-white transition-colors">Productos</Link></li>
            <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
            <li><Link href="/cuenta/pedidos" className="hover:text-white transition-colors">Mis pedidos</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Contacto</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>contacto@landbruck.cl</li>
            <li>Santiago, Chile</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-700 text-center py-4 text-xs text-gray-400">
        © {new Date().getFullYear()} Landbruck. Todos los derechos reservados.
      </div>
    </footer>
  )
}

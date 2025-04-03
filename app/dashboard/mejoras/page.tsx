'use client';

import React from 'react';
import { Home, ShieldCheck, Zap, Users, Lock, Server, Database, Code, Clock } from 'lucide-react';

const Button = ({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${className}`} {...props}>
    {children}
  </button>
);

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white shadow-lg rounded-lg p-4">{children}</div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-row items-center space-x-3 mb-2">{children}</div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold text-gray-800">{children}</h3>
);

const CardContent = ({ children }: { children: React.ReactNode }) => (
  <p className="text-gray-600">{children}</p>
);

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <main className="p-6">
        <section className="mb-10 mt-10 text-center">
          <h2 className="text-3xl font-semibold text-gray-800">Bienvenido a la Nueva Intranet de Avimex</h2>
          <p className="text-gray-600 mt-2">Descubre las mejoras de velocidad y seguridad con nuestra transición de ASP a Node.js.</p>
        </section>
        
        <div className="grid grid-cols-1 md:grid-cols-3 mt-8 gap-6">
          <Card>
            <CardHeader>
              <Zap className="text-green-600" size={28} />
              <CardTitle>Rendimiento Mejorado</CardTitle>
            </CardHeader>
            <CardContent>
              La reinfraestructura de ASP a Node.js ha permitido una carga más rápida y eficiente.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <ShieldCheck className="text-blue-600" size={28} />
              <CardTitle>Seguridad Reforzada</CardTitle>
            </CardHeader>
            <CardContent>
              Con nuevas medidas de cifrado y autenticación avanzada, tus datos están más seguros que nunca.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Users className="text-yellow-600" size={28} />
              <CardTitle>Interfaz Optimizada</CardTitle>
            </CardHeader>
            <CardContent>
              Una experiencia de usuario más intuitiva y accesible.
            </CardContent>
          </Card>
        </div>

        {/* Security Enhancements */}
        <section className="mt-12 text-center">
          <h3 className="text-2xl font-semibold text-gray-800">Medidas de Seguridad Adicionales</h3>
          <p className="text-gray-600 mt-2">Implementamos protección contra vulnerabilidades comunes y optimización del servidor.</p>
        </section>
        <div className="grid grid-cols-1 md:grid-cols-2 mt-6 gap-6">
          <Card>
            <CardHeader>
              <Lock className="text-red-600" size={28} />
              <CardTitle>Prevención de Ataques</CardTitle>
            </CardHeader>
            <CardContent>
              Protección contra inyección SQL y Cross-Site Scripting (XSS) en todos los formularios.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Server className="text-purple-600" size={28} />
              <CardTitle>Optimización del Servidor</CardTitle>
            </CardHeader>
            <CardContent>
              Servidores basados en tecnología Node.js para soporte de múltiples usuarios simultáneos con mayor eficiencia.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Database className="text-indigo-600" size={28} />
              <CardTitle>Base de Datos Eficiente</CardTitle>
            </CardHeader>
            <CardContent>
              Implementación de bases de datos optimizadas para reducir tiempos de respuesta y mejorar la escalabilidad.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Code className="text-teal-600" size={28} />
              <CardTitle>Desarrollo Moderno</CardTitle>
            </CardHeader>
            <CardContent>
              Uso de tecnologías actuales como TypeScript y Express para un código más robusto y mantenible a largo plazo.
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
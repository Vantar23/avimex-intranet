# Intranet Avimex

Proyecto de intranet para Avimex basado en Next.js y TypeScript que genera automáticamente páginas, formularios y grids a partir de definiciones JSON.

## Tabla de Contenidos

* [Descripción](#descripción)
* [Características](#características)
* [Tecnologías](#tecnologías)
* [Estructura del Proyecto](#estructura-del-proyecto)
* [Instalación](#instalación)
* [Configuración](#configuración)
* [Uso](#uso)

  * [Modo Desarrollo](#modo-desarrollo)
  * [Build y Producción](#build-y-producción)
* [Componentes Principales](#componentes-principales)

  * [DynamicPage](#dynamicpage)
  * [GridBuilder](#gridbuilder)
  * [FormBuilder](#formbuilder)
  * [SearchBar](#searchbar)
* [Seguridad](#seguridad)
* [Contribuciones](#contribuciones)
* [Licencia](#licencia)

## Descripción

Intranet Avimex es una plataforma web interna para la administración y monitoreo de datos corporativos. Utiliza Next.js 14+ en conjunto con definiciones JSON para generar dinámicamente:

* Páginas completas con componentes personalizados.
* Formularios de alta, edición y eliminación de registros.
* Grillas de datos con filtros acumulables y exportación.

El objetivo es reducir el tiempo de desarrollo y facilitar la incorporación de nuevos módulos sin tocar código.

## Características

* Generación automática de páginas y formularios desde JSON.
* GridBuilder con filtros acumulables (texto, select y rango de fechas).
* DynamicForm para validaciones avanzadas y carga de archivos.
* Búsqueda global y por columna con `SearchBar`.
* API Proxy con protección contra XSS y SQL Injection.
* Autenticación basada en tokens (JWT).
* Soporte para sesiones y manejo de errores.

## Tecnologías

* **Next.js 14+** con App Router.
* **React** y **TypeScript**.
* **Axios** para consumo de API.
* **Framer Motion** para animaciones.
* **Heroicons** y **React Icons**.
* **js-cookie** para manejo de cookies.
* **MySQL** / SQL Server en backend (API externa).

## Estructura del Proyecto

```
├── app
│   ├── [[...slug]]
│   │   └── page.tsx        # DynamicPage
│   └── superintendente
│       └── page.tsx        # Ejemplos de rutas estáticas
├── components
│   ├── GridBuilder.tsx     # Componente principal de grids
│   ├── FormBuilder.tsx     # DynamicForm
│   └── ui
│       ├── SearchBar.tsx
│       ├── GridBuilder
│       │   ├── FilterPanel.tsx
│       │   ├── Pagination.tsx
│       │   ├── RowDetailsModal.tsx
│       │   └── ExportButton.tsx
├── public                   # Archivos estáticos
├── styles                   # Estilos globales
├── .env.local               # Variables de entorno
├── next.config.js
└── package.json
```

## Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/tu-usuario/intranet-avimex.git
   cd intranet-avimex
   ```
2. Instala dependencias:

   ```bash
   npm install
   ```

## Configuración

Renombra el archivo `.env.example` a `.env.local` y ajusta las variables:

```env
NEXT_PUBLIC_API_URL=https://api.avimexintranet.com
JWT_SECRET=tu_secreto_jwt
```

## Uso

### Modo Desarrollo

```bash
npm run dev
```

Visita `http://localhost:3000`.

### Build y Producción

```bash
npm run build
npm start
```

## Componentes Principales

### DynamicPage

Carga la configuración de la página desde la API con base en la ruta (`slug`), y renderiza la colección de componentes definidos en JSON.

### GridBuilder

Genera tablas con:

* Filtros acumulables (texto, select, fechas).
* Paginación.
* Exportación a Excel.
* Modales dinámicos para CRUD.

### FormBuilder

Formulario dinámico con validaciones (`required`, `pattern`, anidado) y soporte para carga de archivos.

### SearchBar

Barra de búsqueda global y por columna, produce chips acumulables con formato `Columna: Valor`.

## Seguridad

* Sanitización de inputs en cliente y servidor.
* Protección contra XSS y SQL Injection.
* Autenticación JWT.
* Manejo de errores con notificaciones en UI.

## Contribuciones

¡Bienvenidas! Por favor abre un issue o pull request para mejoras o correcciones.

## Licencia

Este proyecto está bajo la licencia MIT. Ajusta según tus necesidades.

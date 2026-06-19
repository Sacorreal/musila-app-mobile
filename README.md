# 🎯 Objetivo del proyecto

Musila es una aplicación para la gestión de canciones inéditas, donde los autores publican sus canciones y los interpretes solicitan el uso comercial de estas, cuenta con funcionalidades como:

- Transmisión de música por streaming.
- Agregar canciones a listado de favoritos.
- Crear y administrar playlists.
- Invitar a otros usuarios para administrar las playlists.
- Solicitar el uso de las canciones por medio de acuerdos comerciales.
- Documentacion de API [API DOCS](https://musila-api-development.up.railway.app/api)

# 📖 Guía de Arquitectura: Convención de Sufijos y Capas

Esta guía establece los estándares de nomenclatura y responsabilidad para Músila. El objetivo es distinguir visualmente de forma inmediata dónde se ejecuta el código (Servidor vs. Navegador) y qué herramientas tiene permitidas cada capa.

## 🏗️ Resumen de la Arquitectura (BFF Pattern)

Implementamos un modelo **Backend For Frontend (BFF)** utilizando Next.js App Router. Esto nos permite delegar la seguridad al servidor y la interactividad al cliente.

| Sufijo        | Entorno         | Responsabilidad                                             | Directiva      |
| :------------ | :-------------- | :---------------------------------------------------------- | :------------- |
| `.actions.ts` | 🏠 **Servidor** | Mutaciones, Cookies `httpOnly`, Secretos, Puente a Backend. | `'use server'` |
| `.hooks.ts`   | 🌐 **Cliente**  | Estado de UI, Cache y Orquestación (React Query).           | `'use client'` |
| `.client.ts`  | 🌐 **Cliente**  | Lógica de navegador pura (Uploads, LocalStorage, Axios).    | N/A            |
| `.schema.ts`  | 🔄 **Ambos**    | Definiciones de Zod y Contratos de datos.                   | N/A            |

---

## 📂 Definición Detallada de Capas

### 1. Capa de Acciones (`*.actions.ts`)

Son **Server Actions**. Representan la lógica de negocio protegida que el usuario no puede interceptar en el navegador.

- **Entorno:** Node.js.
- **Permitido:** Uso de `next/headers` (`cookies()`), variables de entorno privadas, llamadas a NestJS.
- **Ejemplo:** `auth.actions.ts`

### 2. Capa de Hooks (`*.hooks.ts`)

Son el motor de la experiencia de usuario. Envuelven la lógica asíncrona en **React Query**.

- **Entorno:** Navegador.
- **Permitido:** `useMutation`, `useQuery`, estados de React.
- **Ejemplo:** `use-login.hooks.ts`
  - _Función:_ Llamar a una `.action.ts` y gestionar el estado `isPending`.

### 3. Capa de Cliente (`*.client.ts`)

Funciones de utilidad que requieren APIs del navegador que el servidor no posee.

- **Entorno:** Navegador.
- **Permitido:** `File`, `Blob`, `FormData` de cliente, progreso de Axios (`onUploadProgress`).
- **Ejemplo:** `storage.client.ts`
  - _Nota:_ Se usa para subir archivos pesados directamente a **Digital Ocean Spaces** sin saturar el servidor de Next.js.

### 4. Capa de Validación (`*.schema.ts`)

La "Fuente de la Verdad". Define el contrato de los datos.

- **Entorno:** Agnóstico (se importa en cualquier lugar).
- **Ejemplo:** `track.schema.ts`
  - _Uso:_ El cliente lo usa para validar el formulario; el servidor lo usa para validar el payload recibido.

---

## 📐 Estructura de Carpetas (Domain-Driven)

Para escalar, agrupamos por **Dominio**, no por tipo de archivo:

```text
src/domains/tracks/
├── components/          # React Components (UI)
├── hooks/               # use-create-track.hooks.ts
├── services/
│   ├── tracks.actions.ts# Comunicación con NestJS ('use server')
│   └── storage.client.ts# Subida directa a Spaces (Browser logic)
├── validations/         # track.schema.ts
└── types/               # track.types.ts
```

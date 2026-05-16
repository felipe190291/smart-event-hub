# 🎟️ Mis Eventos - Frontend

Una plataforma de última generación para la gestión de eventos, diseñada con una estética premium, arquitectura robusta y capacidades de **Inteligencia Artificial** integradas.

## ✨ Características Principales

- **🤖 AI Admin Assistant:** Chatbot integrado en el panel de administración que permite consultar métricas y gestionar datos mediante lenguaje natural.
- **🎨 AI Poster Generation:** Integración con Google Imagen para generar posters únicos para eventos basados en su descripción.
- **🔐 Seguridad Robusta:** Sistema de autenticación con JWT y **Silent Refresh Token** automático mediante interceptores de Axios.
- **⚡ Optimización de Búsqueda:** Implementación de `useDebounce` para reducir la carga del servidor durante filtrados.
- **📱 Responsive & Dark Mode:** Diseño adaptable a cualquier dispositivo con soporte nativo para modo oscuro.
- **🧩 Componentes Modulares:** Paginación, Skeletons y Modales reutilizables para una experiencia consistente.

---

## 🚀 Inicio Rápido

### Requisitos previos
- **Node.js**: v20.x o superior
- **Docker & Docker Compose**: (Para despliegue en contenedores)

### Instalación Local
```bash
# 1. Clonar e instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Iniciar modo desarrollo
npm run dev
```

---

## 🐳 Despliegue con Docker

El proyecto incluye una configuración de producción optimizada usando **Nginx** como servidor web.

### 1. Variables de Entorno en Docker
Asegúrate de que tu archivo `.env` contenga la URL correcta para que el contenedor pueda comunicarse con el backend:
```env
VITE_API_URL=http://tu-servidor:8000/api/v1
```

### 2. Ejecución
```bash
# Construir e iniciar contenedores
docker compose up --build -d
```
La aplicación estará disponible en `http://localhost:8080`.

---

## 🛠 Stack Tecnológico

| Tecnología | Propósito |
|------------|-----------|
| **React 19** | Biblioteca de UI de última generación |
| **Vite 8** | Bundler ultra rápido para desarrollo y build |
| **Tailwind CSS 4** | Framework de estilos utilitarios |
| **Zustand** | Gestión de estado global simplificada |
| **Vitest** | Suite de pruebas unitarias y de componentes |
| **Lucide React** | Set de iconos |
| **Framer Motion** | Animaciones fluidas y micro-interacciones |

---

## 📂 Estructura de Capas

- `src/api/`: Cliente Axios configurado con Singleton y lógica de reintento.
- `src/hooks/`: Hooks personalizados como `useDebounce` para optimización.
- `src/components/ui/`: Biblioteca de componentes atómicos de alta calidad.
- `src/utils/`: Utilidades como el `error-handler` centralizado para notificaciones tipo Sileo.

---

## 🧪 Testing

Para asegurar la calidad del código, el proyecto cuenta con una suite de tests:
```bash
# Ejecutar tests una vez
npm run test

# Abrir interfaz visual de Vitest
npm run test:ui
```

---
© 2026 **Mis Eventos**. Proyecto desarrollado con enfoque en UX Superior y Escalabilidad.

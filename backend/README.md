# SistemaPOS - Backend

Backend para el Sistema de Punto de Venta desarrollado con Node.js, Express y PostgreSQL.

## 🚀 Características

- API RESTful
- Autenticación JWT
- Validación de datos
- Logging con Winston
- Manejo de errores centralizado
- Variables de entorno
- Pruebas unitarias
- Documentación con Swagger (próximamente)

## 📋 Requisitos Previos

- Node.js 16+
- npm 8+
- PostgreSQL 13+
- Git

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/sistema-pos.git
   cd sistema-pos/backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   - Copiar el archivo `.env.example` a `.env`
   - Configurar las variables según tu entorno

4. **Iniciar la base de datos**
   - Asegúrate de tener PostgreSQL en ejecución
   - Crea una base de datos llamada `sistema_pos`

5. **Ejecutar migraciones (si aplica)**
   ```bash
   npm run migrate
   ```

6. **Iniciar el servidor**
   - Modo desarrollo (con recarga en caliente):
     ```bash
     npm run dev
     ```
   - Modo producción:
     ```bash
     npm start
     ```

## 🧪 Ejecutar pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch
```

## 🛠️ Comandos Útiles

- `npm start` - Inicia el servidor en producción
- `npm run dev` - Inicia el servidor en desarrollo con nodemon
- `npm test` - Ejecuta las pruebas
- `npm run lint` - Ejecuta ESLint
- `npm run lint:fix` - Corrige problemas de formato
- `npm run migrate` - Ejecuta migraciones de base de datos
- `npm run seed` - Ejecuta los seeders

## 📚 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/         # Configuraciones
│   ├── controllers/     # Controladores
│   ├── middlewares/     # Middlewares personalizados
│   ├── models/          # Modelos de base de datos
│   ├── routes/          # Rutas de la API
│   ├── utils/           # Utilidades
│   └── server.js        # Punto de entrada
├── tests/              # Pruebas
├── .env.example        # Variables de entorno de ejemplo
└── package.json        # Dependencias y scripts
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

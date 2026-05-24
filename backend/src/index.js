require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const watchlistRoutes = require('./routes/watchlist');
const progressRoutes = require('./routes/progress');
const recommendationsRoutes = require('./routes/recommendations');
const proxyRoutes = require('./routes/proxy');

const app = express();
const PORT = process.env.PORT || 4000;

// ========================================
// CONFIGURACIÓN CORS CORREGIDA
// ========================================

// Obtener orígenes permitidos desde variables de entorno
// Formato: "https://frontend.com,http://localhost:3000,https://otro.com"
const allowedOriginsFromEnv = process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '';

// Dividir la cadena en array y limpiar espacios
const allowedOrigins = allowedOriginsFromEnv
  .split(',')
  .map(origin => origin.trim())
  .filter(origin => origin.length > 0);

// Orígenes por defecto para desarrollo local
const defaultOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:4000',
  'http://127.0.0.1:4000'
];

// Función para verificar si un origen está permitido
const isOriginAllowed = (origin) => {
  // Si no hay origen (peticiones server-to-server, Postman, etc.)
  if (!origin) return true;
  
  // Si se configuraron orígenes en variables de entorno, usarlos
  if (allowedOrigins.length > 0) {
    return allowedOrigins.includes(origin);
  }
  
  // Si no hay variables de entorno, usar los orígenes por defecto (solo desarrollo local)
  return defaultOrigins.includes(origin);
};

// Aplicar middleware CORS
app.use(cors({
  origin: function(origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS bloqueado para origen: ${origin}`);
      callback(new Error(`CORS not allowed for origin ${origin}`), false);
    }
  },
  credentials: true, // Permitir cookies/autenticación
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 horas en caché para preflight requests
}));

// Middleware adicional para logging de CORS (opcional, útil para debugging)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  next();
});

// ========================================
// MIDDLEWARES ESTÁNDAR
// ========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ========================================
// RUTAS DE LA API
// ========================================

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/proxy', proxyRoutes);

// ========================================
// ENDPOINTS DE UTILIDAD
// ========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    cors: {
      allowedOrigins: allowedOrigins.length > 0 ? allowedOrigins : defaultOrigins,
      mode: allowedOrigins.length > 0 ? 'production' : 'development'
    }
  });
});

// Endpoint para verificar configuración CORS (útil para debugging)
app.get('/api/cors-check', (req, res) => {
  res.json({
    message: 'CORS is configured correctly',
    yourOrigin: req.headers.origin || 'No origin header',
    allowedOrigins: allowedOrigins.length > 0 ? allowedOrigins : defaultOrigins,
    timestamp: new Date().toISOString()
  });
});

// ========================================
// MANEJO DE ERRORES
// ========================================

// 404 handler para rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error handler general
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);
  
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  
  res.status(status).json({
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path
  });
});

// ========================================
// INICIAR SERVIDOR
// ========================================

app.listen(PORT, () => {
  console.log(`\n🚀 OmniStream API running on http://localhost:${PORT}`);
  console.log(`📡 CORS Mode: ${allowedOrigins.length > 0 ? 'Production' : 'Development'}`);
  if (allowedOrigins.length > 0) {
    console.log(`✅ Allowed origins: ${allowedOrigins.join(', ')}`);
  } else {
    console.log(`✅ Allowed origins (dev): ${defaultOrigins.join(', ')}`);
  }
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health\n`);
});
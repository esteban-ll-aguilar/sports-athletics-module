# Configuración de Auto-Escalamiento y Balanceo de Carga

## 🚀 Cambios Implementados

### 1. **Balanceador de Carga NGINX**
- **Algoritmo**: `least_conn` (conexiones al servidor con menos carga)
- **3 Backends**: api-1, api-2, api-3
- **Failover automático**: Retry en caso de fallo (hasta 3 intentos)
- **Health checks**: Endpoint `/health` para monitoreo
- **Keepalive**: 32 conexiones persistentes para mejor rendimiento

### 2. **Escalamiento Horizontal de la API**
Se pasó de **1 instancia** a **3 instancias** de FastAPI:
- `api-1` (fastapi-app-1)
- `api-2` (fastapi-app-2)
- `api-3` (fastapi-app-3)

### 3. **Optimización del Pool de Conexiones**

#### **Antes**:
```yaml
DATABASE_POOL_SIZE: 30
DATABASE_MAX_OVERFLOW: 20
Total por instancia: 50 conexiones
Total sistema: 50 conexiones (1 instancia)
```

#### **Ahora**:
```yaml
DATABASE_POOL_SIZE: 15
DATABASE_MAX_OVERFLOW: 10
Total por instancia: 25 conexiones
Total sistema: 75 conexiones (3 instancias)
```

**Ventajas**:
- ✅ **50% más capacidad total** (50 → 75 conexiones)
- ✅ **Mejor distribución de carga** entre instancias
- ✅ **Menor presión por instancia** (50 → 25 conexiones)
- ✅ **Timeout aumentado** (30s → 45s) para operaciones pesadas
- ✅ **Failover**: Si una instancia falla, las otras dos continúan

### 4. **Optimización de PostgreSQL**
```yaml
max_connections: 200        # Aumentado de 100 (default)
shared_buffers: 256MB       # Cache mejorado
effective_cache_size: 1GB   # Estimación de cache disponible
work_mem: 16MB              # Memoria por operación
maintenance_work_mem: 128MB # Para VACUUM, CREATE INDEX, etc.
```

### 5. **Optimización de Redis**
```yaml
maxmemory: 256mb
maxmemory-policy: allkeys-lru  # Evicción LRU para cache
```

### 6. **Red Docker Dedicada**
- Red `app-network` tipo bridge
- Aislamiento y mejor rendimiento de comunicación inter-servicios

## 📊 Análisis de Errores Corregidos

### **Problema Principal**:
```
QueuePool limit of size 30 overflow 20 reached, connection timed out, timeout 30.00
```

### **Causas Identificadas**:
1. ❌ Una sola instancia API no podía manejar la carga
2. ❌ Pool de conexiones insuficiente bajo stress
3. ❌ Timeout muy corto (30s)
4. ❌ PostgreSQL con límite default de 100 conexiones
5. ❌ Sin balanceo de carga ni redundancia

### **Errores que se resolverán**:
- ✅ 69× `POST /api/v1/tests/auth/register` - 500 Error → **Distribuido en 3 instancias**
- ✅ Pool exhausted → **75 conexiones totales + timeout 45s**
- ✅ Remote disconnections → **Keepalive y retry automático**
- ✅ 500 Errors masivos → **Failover entre instancias**
- ✅ Login failures (Status 0, 500) → **Conexiones más estables**

## 🔧 Comandos para Desplegar

### Limpiar contenedores anteriores:
```powershell
docker-compose down -v
```

### Construir y levantar nueva arquitectura:
```powershell
docker-compose build
docker-compose up -d
```

### Verificar estado:
```powershell
docker-compose ps
```

### Ver logs en tiempo real:
```powershell
# Todos los servicios
docker-compose logs -f

# Solo API
docker-compose logs -f api-1 api-2 api-3

# Solo NGINX
docker-compose logs -f nginx
```

### Monitorear conexiones de PostgreSQL:
```powershell
docker exec -it postgres-db psql -U postgres -d BaseDeDatos -c "SELECT count(*) FROM pg_stat_activity;"
```

### Ver estadísticas de NGINX:
```powershell
curl http://localhost:8080/nginx_status
```

## 📈 Métricas Esperadas

### **Capacidad de Carga**:
| Métrica | Antes | Ahora | Mejora |
|---------|-------|-------|--------|
| Instancias API | 1 | 3 | +200% |
| Conexiones DB | 50 | 75 | +50% |
| Timeout DB | 30s | 45s | +50% |
| Max Connections PG | 100 | 200 | +100% |
| Failover | ❌ | ✅ | Alta disponibilidad |

### **RPS (Requests Per Second) estimado**:
- **Antes**: ~100-150 RPS
- **Ahora**: ~300-500 RPS
- **Pico**: ~600 RPS con burst

## 🔍 Troubleshooting

### Si siguen apareciendo errores de pool:

#### 1. **Aumentar instancias de API** (escalar a 5 instancias):
```yaml
api-4:
  ...
api-5:
  ...
```

Ajustar nginx.conf:
```nginx
server api-4:8080 max_fails=3 fail_timeout=30s;
server api-5:8080 max_fails=3 fail_timeout=30s;
```

#### 2. **Reducir pool por instancia**:
```yaml
DATABASE_POOL_SIZE: 10
DATABASE_MAX_OVERFLOW: 8
# Total: 5 instancias × 18 = 90 conexiones
```

#### 3. **Aumentar recursos de PostgreSQL**:
```yaml
postgres:
  ...
  deploy:
    resources:
      limits:
        cpus: '2.0'
        memory: 2G
```

#### 4. **Verificar queries lentos**:
```sql
-- Queries más lentos
SELECT query, calls, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

#### 5. **Activar logging de conexiones**:
```python
# En database.py, temporalmente:
echo=True  # Ver todas las queries SQL
```

## ⚠️ Consideraciones

### **Recursos necesarios**:
- **CPU**: ~3-4 cores (1 por instancia API + NGINX + DBs)
- **RAM**: ~6-8 GB
  - 3× FastAPI: ~1.5 GB
  - PostgreSQL: ~2 GB
  - MariaDB: ~1 GB
  - Redis: ~256 MB
  - NGINX: ~50 MB

### **Escalamiento futuro**:
Si la carga sigue creciendo, considerar:
1. **PostgreSQL replica (Read replicas)**
2. **PgBouncer** (Connection pooler externo)
3. **Caché agresivo en Redis**
4. **Auto-scaling con Kubernetes**
5. **CDN para assets estáticos**

## 🎯 Próximos Pasos

1. ✅ Desplegar nueva arquitectura
2. 📊 Ejecutar stress tests nuevamente
3. 📈 Monitorear métricas (Prometheus + Grafana recomendado)
4. 🔧 Ajustar pools según resultados
5. 🚀 Considerar implementación en producción

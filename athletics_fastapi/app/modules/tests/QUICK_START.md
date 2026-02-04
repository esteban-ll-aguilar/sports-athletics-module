# 🚀 Quick Start Guide - Test Module

## ⚡ Start in 3 Minutes

### 1. Enable Test Routes
```bash
# Edit athletics_fastapi/.env
ENABLE_TEST_ROUTES=true
```

### 2. Start Application
```bash
cd athletics_fastapi
python run.py
```

Expected output:
```
⚠️  TEST ROUTES ENABLED - NO RATE LIMITING ON /api/v1/tests/* ⚠️
```

### 3. Test with curl (or Postman)

#### Register Active User (Multi-Role)
```bash
curl -X POST http://localhost:8080/api/v1/tests/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "athlete@test.com",
    "password": "Pass123!",
    "username": "test_athlete",
    "first_name": "Test",
    "last_name": "Athlete",
    "tipo_identificacion": "CEDULA",
    "numero_identificacion": "1234567890",
    "roles": ["ATLETA", "ENTRENADOR"],
    "is_active": true
  }'
```

#### Login (No Email Verification Needed)
```bash
curl -X POST http://localhost:8080/api/v1/tests/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "athlete@test.com",
    "password": "Pass123!"
  }'
```

Save the `access_token` from response!

#### Create Athlete Profile
```bash
curl -X POST http://localhost:8080/api/v1/tests/atleta/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "peso": 70.5,
    "altura": 1.75,
    "fecha_nacimiento": "2000-01-01",
    "genero": "M",
    "categoria": "Senior"
  }'
```

## 🧪 Run Tests

```bash
# All tests
pytest

# Specific module
pytest tests/modules/atleta/ -v

# With coverage
pytest --cov=app --cov-report=html
```

## 📖 Full Documentation

- **Complete Guide**: [README.md](README.md)
- **Implementation Summary**: [RESUMEN_IMPLEMENTACION.md](RESUMEN_IMPLEMENTACION.md)

## 🎯 Key Features

✅ **No Rate Limiting** - Test without restrictions  
✅ **Active by Default** - No email verification needed  
✅ **Multi-Role Support** - One user, multiple roles  
✅ **Same Logic** - Uses production services/repositories  

## ⚠️ Security

**NEVER enable in production!**
```env
# Production
ENABLE_TEST_ROUTES=false
```

---

That's it! You're ready to test! 🎉

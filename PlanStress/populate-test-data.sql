-- ============================================================================
-- Script: populate-test-data.sql
-- Descripción: Genera datos de prueba para testing de volumen
-- Uso: mysql -u root -p deportes_db < populate-test-data.sql
-- ============================================================================

USE deportes_db;

SET @start_time = NOW();

-- ============================================================================
-- 1. LIMPIAR DATOS EXISTENTES (CUIDADO: Esto borra todo)
-- ============================================================================

-- Desactivar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Opcional: Descomentar si quieres limpiar antes
-- TRUNCATE TABLE asistencias;
-- TRUNCATE TABLE inscripciones;
-- TRUNCATE TABLE resultados;
-- TRUNCATE TABLE entrenamientos;
-- TRUNCATE TABLE atletas;
-- TRUNCATE TABLE competencias;

SET FOREIGN_KEY_CHECKS = 1;

SELECT '✅ Tablas limpiadas (si estaban descomentadas)' as Status;

-- ============================================================================
-- 2. GENERAR ATLETAS (5000 registros)
-- ============================================================================

SELECT '📝 Generando 5000 atletas...' as Status;

DROP PROCEDURE IF EXISTS generate_atletas;

DELIMITER //
CREATE PROCEDURE generate_atletas()
BEGIN
  DECLARE i INT DEFAULT 1;
  DECLARE batch_size INT DEFAULT 100;
  DECLARE current_batch INT DEFAULT 0;
  
  WHILE i <= 5000 DO
    INSERT INTO atletas (
      nombre, 
      apellido,
      email, 
      edad, 
      genero,
      peso,
      altura,
      external_id, 
      created_at,
      updated_at
    )
    VALUES (
      CONCAT('Atleta', LPAD(i, 5, '0')),
      CONCAT('Apellido', LPAD(i, 5, '0')),
      CONCAT('atleta', i, '@test.com'),
      FLOOR(15 + RAND() * 25), -- Edad entre 15 y 40
      IF(RAND() > 0.5, 'M', 'F'),
      ROUND(50 + RAND() * 50, 2), -- Peso entre 50 y 100 kg
      ROUND(150 + RAND() * 50, 2), -- Altura entre 150 y 200 cm
      UUID(),
      NOW(),
      NOW()
    );
    
    SET i = i + 1;
    SET current_batch = current_batch + 1;
    
    -- Commit cada 100 registros para mejor performance
    IF current_batch >= batch_size THEN
      COMMIT;
      SET current_batch = 0;
      SELECT CONCAT('  → ', i, ' atletas creados...') as Progress;
    END IF;
  END WHILE;
  
  COMMIT;
END//
DELIMITER ;

CALL generate_atletas();
DROP PROCEDURE generate_atletas;

SELECT CONCAT('✅ ', COUNT(*), ' atletas creados') as Status FROM atletas;

-- ============================================================================
-- 3. GENERAR ENTRENAMIENTOS (10000 registros)
-- ============================================================================

SELECT '📝 Generando 10000 entrenamientos...' as Status;

DROP PROCEDURE IF EXISTS generate_entrenamientos;

DELIMITER //
CREATE PROCEDURE generate_entrenamientos()
BEGIN
  DECLARE i INT DEFAULT 1;
  DECLARE batch_size INT DEFAULT 100;
  DECLARE current_batch INT DEFAULT 0;
  
  WHILE i <= 10000 DO
    INSERT INTO entrenamientos (
      nombre,
      descripcion,
      fecha,
      hora_inicio,
      hora_fin,
      capacidad_maxima,
      tipo,
      external_id,
      created_at,
      updated_at
    )
    VALUES (
      CONCAT('Entrenamiento #', LPAD(i, 5, '0')),
      CONCAT('Descripción detallada del entrenamiento número ', i),
      DATE_ADD('2024-01-01', INTERVAL FLOOR(RAND() * 365) DAY),
      ADDTIME('08:00:00', SEC_TO_TIME(FLOOR(RAND() * 43200))), -- Entre 08:00 y 20:00
      ADDTIME('09:00:00', SEC_TO_TIME(FLOOR(RAND() * 43200))),
      FLOOR(10 + RAND() * 40), -- Capacidad entre 10 y 50
      ELT(FLOOR(1 + RAND() * 4), 'Técnico', 'Físico', 'Táctico', 'Mixto'),
      UUID(),
      NOW(),
      NOW()
    );
    
    SET i = i + 1;
    SET current_batch = current_batch + 1;
    
    IF current_batch >= batch_size THEN
      COMMIT;
      SET current_batch = 0;
      SELECT CONCAT('  → ', i, ' entrenamientos creados...') as Progress;
    END IF;
  END WHILE;
  
  COMMIT;
END//
DELIMITER ;

CALL generate_entrenamientos();
DROP PROCEDURE generate_entrenamientos;

SELECT CONCAT('✅ ', COUNT(*), ' entrenamientos creados') as Status FROM entrenamientos;

-- ============================================================================
-- 4. GENERAR COMPETENCIAS (1000 registros)
-- ============================================================================

SELECT '📝 Generando 1000 competencias...' as Status;

DROP PROCEDURE IF EXISTS generate_competencias;

DELIMITER //
CREATE PROCEDURE generate_competencias()
BEGIN
  DECLARE i INT DEFAULT 1;
  
  WHILE i <= 1000 DO
    INSERT INTO competencias (
      nombre,
      descripcion,
      fecha_inicio,
      fecha_fin,
      lugar,
      tipo,
      categoria,
      external_id,
      created_at,
      updated_at
    )
    VALUES (
      CONCAT('Competencia ', LPAD(i, 4, '0')),
      CONCAT('Descripción de la competencia número ', i),
      DATE_ADD('2024-06-01', INTERVAL FLOOR(RAND() * 180) DAY),
      DATE_ADD('2024-06-01', INTERVAL FLOOR(RAND() * 180) + 1 DAY),
      ELT(FLOOR(1 + RAND() * 5), 'Estadio Municipal', 'Polideportivo Central', 
          'Cancha Techada', 'Campo Deportivo', 'Gimnasio Principal'),
      ELT(FLOOR(1 + RAND() * 3), 'Local', 'Regional', 'Nacional'),
      ELT(FLOOR(1 + RAND() * 4), 'Sub-15', 'Sub-18', 'Senior', 'Máster'),
      UUID(),
      NOW(),
      NOW()
    );
    
    SET i = i + 1;
    
    IF i % 100 = 0 THEN
      COMMIT;
      SELECT CONCAT('  → ', i, ' competencias creadas...') as Progress;
    END IF;
  END WHILE;
  
  COMMIT;
END//
DELIMITER ;

CALL generate_competencias();
DROP PROCEDURE generate_competencias;

SELECT CONCAT('✅ ', COUNT(*), ' competencias creadas') as Status FROM competencias;

-- ============================================================================
-- 5. GENERAR INSCRIPCIONES (Relacionar atletas con entrenamientos)
-- ============================================================================

SELECT '📝 Generando inscripciones...' as Status;

-- Inscribir aleatoriamente atletas en entrenamientos
INSERT INTO inscripciones (atleta_id, entrenamiento_id, fecha_inscripcion, estado, external_id, created_at)
SELECT 
  a.id as atleta_id,
  e.id as entrenamiento_id,
  DATE_SUB(e.fecha, INTERVAL FLOOR(1 + RAND() * 30) DAY) as fecha_inscripcion,
  ELT(FLOOR(1 + RAND() * 3), 'confirmada', 'pendiente', 'cancelada') as estado,
  UUID(),
  NOW()
FROM atletas a
CROSS JOIN entrenamientos e
WHERE RAND() < 0.05 -- 5% de probabilidad de inscripción
LIMIT 20000;

SELECT CONCAT('✅ ', COUNT(*), ' inscripciones creadas') as Status FROM inscripciones;

-- ============================================================================
-- 6. GENERAR HISTORIAL MÉDICO
-- ============================================================================

SELECT '📝 Generando historiales médicos...' as Status;

INSERT INTO historial_medico (
  atleta_id, 
  tipo_sangre, 
  alergias, 
  condiciones_medicas,
  contacto_emergencia,
  telefono_emergencia,
  external_id,
  created_at
)
SELECT 
  id,
  ELT(FLOOR(1 + RAND() * 8), 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
  IF(RAND() > 0.7, 'Ninguna', CONCAT('Alergia a ', ELT(FLOOR(1 + RAND() * 5), 'polen', 'medicamentos', 'alimentos', 'polvo', 'picaduras'))),
  IF(RAND() > 0.8, 'Ninguna', CONCAT('Condición: ', ELT(FLOOR(1 + RAND() * 4), 'Asma leve', 'Diabetes tipo 1', 'Hipertensión', 'Ninguna'))),
  CONCAT('Contacto Emergencia ', FLOOR(1 + RAND() * 1000)),
  CONCAT('+593-', FLOOR(100000000 + RAND() * 900000000)),
  UUID(),
  NOW()
FROM atletas
WHERE RAND() < 0.8; -- 80% de atletas tienen historial médico

SELECT CONCAT('✅ ', COUNT(*), ' historiales médicos creados') as Status FROM historial_medico;

-- ============================================================================
-- 7. RESUMEN FINAL
-- ============================================================================

SELECT '═══════════════════════════════════════════════════════════' as '';
SELECT '                    RESUMEN DE DATOS GENERADOS              ' as '';
SELECT '═══════════════════════════════════════════════════════════' as '';

SELECT 
  'Atletas' as Tabla, 
  COUNT(*) as Total,
  CONCAT(ROUND(COUNT(*) * 100 / 5000, 1), '%') as Completado
FROM atletas
UNION ALL
SELECT 
  'Entrenamientos', 
  COUNT(*),
  CONCAT(ROUND(COUNT(*) * 100 / 10000, 1), '%')
FROM entrenamientos
UNION ALL
SELECT 
  'Competencias', 
  COUNT(*),
  CONCAT(ROUND(COUNT(*) * 100 / 1000, 1), '%')
FROM competencias
UNION ALL
SELECT 
  'Inscripciones', 
  COUNT(*),
  'Variable'
FROM inscripciones
UNION ALL
SELECT 
  'Historiales Médicos', 
  COUNT(*),
  'Variable'
FROM historial_medico;

SELECT '═══════════════════════════════════════════════════════════' as '';

-- Calcular tiempo de ejecución
SELECT CONCAT(
  '⏱️  Tiempo de ejecución: ', 
  TIMESTAMPDIFF(SECOND, @start_time, NOW()), 
  ' segundos'
) as Status;

SELECT '✅ ¡Datos de prueba generados exitosamente!' as '';
SELECT '⚠️  Recuerda: Estos son datos de PRUEBA, no de producción' as '';

-- ============================================================================
-- 8. QUERIES ÚTILES PARA VERIFICAR
-- ============================================================================

-- Verificar distribución de edades
-- SELECT edad, COUNT(*) as cantidad FROM atletas GROUP BY edad ORDER BY edad;

-- Verificar entrenamientos por mes
-- SELECT DATE_FORMAT(fecha, '%Y-%m') as mes, COUNT(*) as cantidad 
-- FROM entrenamientos GROUP BY mes ORDER BY mes;

-- Verificar inscripciones por estado
-- SELECT estado, COUNT(*) as cantidad FROM inscripciones GROUP BY estado;

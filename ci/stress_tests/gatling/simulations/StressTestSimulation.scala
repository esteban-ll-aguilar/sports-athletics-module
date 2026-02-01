package athletics

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

class StressTestSimulation extends Simulation {

  // Configuración HTTP
  val httpProtocol = http
    .baseUrl("http://host.docker.internal:8080")
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")
    .userAgentHeader("Gatling/Athletics-StressTest")

  // Escenario de prueba de estrés
  val stressTestScenario = scenario("Stress Test - 1000 Users")
    .exec(
      http("POST Login")
        .post("/api/auth/login")
        .body(StringBody("""{"email":"test@example.com","password":"password123"}""")).asJson
        .check(status.in(200, 201, 401))
    )
    .pause(500 milliseconds)
    .exec(
      http("GET Entrenadores")
        .get("/api/entrenadores")
        .check(status.is(200))
    )

  // Configuración de usuarios concurrentes - Incremento progresivo
  setUp(
    stressTestScenario.inject(
      // Fase 1: Calentamiento
      rampUsers(100) during (10 seconds),
      // Fase 2: Carga normal
      constantUsersPerSec(50) during (30 seconds),
      // Fase 3: Incremento de estrés
      rampUsersPerSec(50) to (200) during (60 seconds),
      // Fase 4: Pico máximo
      constantUsersPerSec(200) during (30 seconds),
      // Fase 5: Sobrecarga extrema
      rampUsersPerSec(200) to (1000) during (60 seconds)
    )
  ).protocols(httpProtocol)
   .maxDuration(5 minutes)
   .assertions(
     global.responseTime.max.lt(5000),
     global.successfulRequests.percent.gt(70)
   )
}

package athletics

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

class LoadTestSimulation extends Simulation {

  // Configuración HTTP
  val httpProtocol = http
    .baseUrl("http://host.docker.internal:8080")
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")
    .userAgentHeader("Gatling/Athletics-LoadTest")

  // Escenario de prueba de carga
  val loadTestScenario = scenario("Load Test - 50 Users")
    .exec(
      http("GET Entrenadores")
        .get("/api/entrenadores")
        .check(status.is(200))
    )
    .pause(1)
    .exec(
      http("GET Inscripciones")
        .get("/api/inscripciones")
        .check(status.is(200))
    )

  // Configuración de usuarios concurrentes
  setUp(
    loadTestScenario.inject(
      rampUsers(50) during (10 seconds)
    )
  ).protocols(httpProtocol)
}

import jenkins.model.*
import hudson.model.*
import org.jenkinsci.plugins.workflow.job.WorkflowJob
import org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition
import org.jenkinsci.plugins.scriptsecurity.scripts.ScriptApproval

println "=========================================="
println "Creating Athletics Pipeline CI/CD"
println "=========================================="

def jenkins = Jenkins.instance

// Verificar si el job ya existe
def jobName = "athletics-pipeline"
def existingJob = jenkins.getItem(jobName)

if (existingJob != null) {
    println "Pipeline '${jobName}' already exists. Deleting and recreating..."
    existingJob.delete()
    jenkins.reload()
}

try {
    // Crear el Pipeline Job
    def job = jenkins.createProject(WorkflowJob, jobName)
    
    // Configurar descripción
    job.setDescription("Athletics Module - CI/CD Pipeline\n\nAutomated pipeline for testing, analysis and deployment.")
    
    // Leer el Jenkinsfile desde el workspace montado
    def jenkinsfilePath = "/workspace/ci/jenkins/Jenkinsfile"
    def jenkinsfileContent = new File(jenkinsfilePath).text
    
    println "Jenkinsfile size: ${jenkinsfileContent.length()} characters"
    
    // Configurar Pipeline Script directamente con sandbox habilitado
    def flowDefinition = new CpsFlowDefinition(jenkinsfileContent, true)
    job.setDefinition(flowDefinition)
    
    // Guardar configuración
    job.save()
    
    jenkins.reload()
    
    println "SUCCESS: Pipeline '${jobName}' created!"
    println "Access at: http://localhost:8081/job/${jobName}/"
    println "Jenkinsfile loaded from: ${jenkinsfilePath}"
    
} catch (Exception e) {
    println "ERROR creating pipeline: ${e.message}"
    e.printStackTrace()
}

println "=========================================="
println "Initialization completed"
println "=========================================="

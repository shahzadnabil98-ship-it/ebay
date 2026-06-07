pipeline {
    agent any

    environment {
        REGISTRY_USER = 'nabilshahzad98' 
        IMAGE_NAME    = 'haushalts-frontend'
        IMAGE_TAG     = "v1.0.${BUILD_NUMBER}"
    }

    stages {
        stage('1. Code von GitHub holen') {
            steps {
                deleteDir()
                checkout scm
            }
        }

        stage('2. Docker Image bauen & pushen') {
            steps {
                sh "docker build -t ${REGISTRY_USER}/${IMAGE_NAME}:${IMAGE_TAG} ./frontend"
            }
        }

        stage('3. In Kubernetes (Minikube) bereitstellen') {
            steps {
                // Wir gehen in den frisch heruntergeladenen Ordner und wenden alle YAMLs an
                // Das erstellt die Datenbank, das Backend und das Frontend vollautomatisch!
                sh "kubectl apply -f ./kubernetes/"
                
                // Danach updaten wir das Image auf die brandneue Version
                sh "kubectl set image deployment/frontend-deployment frontend=${REGISTRY_USER}/${IMAGE_NAME}:${IMAGE_TAG} || true"
                sh "kubectl rollout restart deployment/frontend-deployment || true"
            }
        }
    }
}

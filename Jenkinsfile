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
                // Wir wenden gezielt nur die drei echten Kubernetes-Dateien an!
                sh "kubectl apply -f frontend-deployment.yaml || true"
                sh "kubectl apply -f backend-deployment.yaml || true"
                sh "kubectl apply -f database-deployment.yaml || true"
                
                // Danach updaten wir das Image im laufenden Betrieb
                sh "kubectl set image deployment/frontend-deployment frontend=${REGISTRY_USER}/${IMAGE_NAME}:${IMAGE_TAG} || true"
                sh "kubectl rollout restart deployment/frontend-deployment || true"
            }
        }
    }
}

pipeline {
    agent any

    environment {
        REGISTRY_USER = 'nabilshahzad98' // <-- Stelle sicher, dass hier dein echter User steht
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
                // Hinweis: Falls du das Pushen zu Docker Hub vorhin deaktiviert hattest, 
                // baut er das Image jetzt zumindest lokal auf dem Server, was für Minikube reicht!
            }
        }

        stage('3. In Kubernetes (Minikube) aktualisieren') {
            steps {
                // KORREKTUR: Wir sagen Kubernetes, es soll das neue Image laden
                // Ersetze 'frontend-deployment' und 'frontend' durch die echten Namen aus deiner Kubernetes-YAML, falls sie anders heißen!
                sh "kubectl set image deployment/frontend-deployment frontend=${REGISTRY_USER}/${IMAGE_NAME}:${IMAGE_TAG} --record || kubectl apply -f kubernetes/"
                
                // Wir erzwingen einen sauberen Neustart der Pods mit dem neuesten Image
                sh "kubectl rollout restart deployment/frontend-deployment"
            }
        }
    }
}

pipeline {
    agent any

    environment {
        REGISTRY_USER = 'DEIN_DOCKERHUB_USER' 
        IMAGE_NAME    = 'haushalts-frontend'
        IMAGE_TAG     = "v1.0.${BUILD_NUMBER}"
    }

    stages {
        stage('1. Code von GitHub holen') {
            steps {
                deleteDir()
                sh "git clone https://github.com ."
            }
        }

        stage('2. Docker Image bauen & pushen') {
            steps {
                sh "docker build -t ${REGISTRY_USER}/${IMAGE_NAME}:${IMAGE_TAG} ./frontend"
                echo "Image ${REGISTRY_USER}/${IMAGE_NAME}:${IMAGE_TAG} erfolgreich gebaut!"
            }
        }

        stage('3. In Kubernetes aktualisieren') {
            steps {
                echo "Bereit für Kubernetes!"
            }
        }
    }
}

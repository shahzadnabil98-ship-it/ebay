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
                checkout scm // Nutzt die URL aus der Jenkins-UI
            }
        }
        stage('2. Docker Image bauen') {
            steps {
                sh "docker build -t ${REGISTRY_USER}/${IMAGE_NAME}:${IMAGE_TAG} ./frontend"
            }
        }
    }
}

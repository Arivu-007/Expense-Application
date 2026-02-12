pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 10, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    environment {
        NODE_VERSION = '18'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Checked out from ${env.GIT_URL ?: 'SCM'}"
            }
        }

        stage('Install') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm ci'
            }
        }

        stage('Validate') {
            steps {
                echo 'Running validation...'
                sh 'npm run validate'
            }
        }

        stage('Docker Build') {
            when {
                expression { return isUnix() }
            }
            steps {
                echo 'Building Docker image...'
                sh 'docker build -t expense-application:${BUILD_NUMBER} .'
            }
        }
    }

    post {
        always {
            echo "Build ${currentBuild.result ?: 'SUCCESS'} - ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        }
        success {
            echo 'Pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed. Check the logs.'
        }
        cleanup {
            cleanWs(deleteDirs: true, patterns: [[pattern: 'node_modules', type: 'INCLUDE']])
        }
    }
}

pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 10, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    environment {
        NODE_VERSION = '18'
        PATH = "/opt/homebrew/bin:/usr/local/bin:${env.PATH}"
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
                sh '''
                    export PATH="/opt/homebrew/bin:$PATH"
                    which npm || echo "npm not found in PATH"
                    npm ci
                '''
            }
        }

        stage('Validate') {
            steps {
                echo 'Running validation...'
                sh '''
                    export PATH="/opt/homebrew/bin:$PATH"
                    npm run validate
                '''
            }
        }

        stage('Docker Build') {
            when {
                expression { return isUnix() }
            }
            steps {
                echo 'Building Docker image...'
                sh '''
                    export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
                    which docker || echo "Docker not found in PATH"
                    docker build -t expense-application:${BUILD_NUMBER} .
                '''
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

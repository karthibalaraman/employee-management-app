pipeline {

    agent any

    environment {

        DOCKERHUB_USER = "karthibalaraman"

        FRONTEND_IMAGE = "${DOCKERHUB_USER}/employee-frontend"

        BACKEND_IMAGE = "${DOCKERHUB_USER}/employee-backend"

    }

    stages {

        stage("Checkout") {

            steps {

                checkout scm

            }
        }

        stage("Backend Test") {

            steps {

                dir("backend") {

                    sh '''
                        npm install
                        node --check server.js
                    '''

                }

            }
        }

        stage("Build Frontend Image") {

            steps {

                sh '''
                    docker build \
                    -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} \
                    -t ${FRONTEND_IMAGE}:latest \
                    ./frontend
                '''

            }
        }

        stage("Build Backend Image") {

            steps {

                sh '''
                    docker build \
                    -t ${BACKEND_IMAGE}:${BUILD_NUMBER} \
                    -t ${BACKEND_IMAGE}:latest \
                    ./backend
                '''

            }
        }

        stage("Login to Docker Hub") {

            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: "dockerhub-credentials",
                        usernameVariable: "DOCKER_USERNAME",
                        passwordVariable: "DOCKER_PASSWORD"
                    )
                ]) {

                    sh '''
                        echo "$DOCKER_PASSWORD" | \
                        docker login \
                        -u "$DOCKER_USERNAME" \
                        --password-stdin
                    '''

                }

            }
        }

        stage("Push Images") {

            steps {

                sh '''
                    docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}
                    docker push ${FRONTEND_IMAGE}:latest

                    docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}
                    docker push ${BACKEND_IMAGE}:latest
                '''

            }
        }

        stage("Deploy to Docker Swarm") {

            steps {

                sh '''
                    docker stack deploy \
                    --with-registry-auth \
                    -c docker-stack.yml \
                    employee
                '''

            }

        }

        stage("Verify Deployment") {

            steps {

                sh '''
                    echo "Checking services..."

                    docker stack services employee

                    echo "Checking tasks..."

                    docker stack ps employee
                '''

            }

        }

    }

    post {

        success {

            echo "Deployment completed successfully."

        }

        failure {

            echo "Deployment failed. Check Jenkins console output."

        }

    }

}

pipeline {
  agent {
    kubernetes {
      yaml """
kind: Pod
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              - key: app
                operator: In
                values:
                  - devops
  serviceAccountName: jenkins-admin
  tolerations:
    - effect: NoSchedule
      key: app
      operator: Equal
      value: devops
  containers:
  - name: kubectl
    image: alpine/k8s:1.34.5
    command:
    - cat
    args:
    tty: true
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
    command:
    - sleep
    args:
    - 9999999
    volumeMounts:
      - name: jenkins-docker-cfg
        mountPath: /kaniko/.docker
  volumes:
  - name: jenkins-docker-cfg
    projected:
      sources:
      - secret:
          name: docker-credentials
          items:
            - key: .dockerconfigjson
              path: config.json
"""
    }
  }

  environment {
    REGISTRY = 'harbor.redrive.com.br/marketing/redpower-lp'
    NAMESPACE = 'marketing'
    DEPLOYMENT_NAME = 'redpower-lp'
  }

  options {
    timeout(time: 15, unit: 'MINUTES')
    disableConcurrentBuilds()
  }

  stages {
    stage('Create Docker Image') {
      when {
        anyOf {
          branch 'main'
          expression {
            return !!env.TAG_NAME?.trim()
          }
        }
      }
      steps {
        script {
          env.SHORT_COMMIT = env.GIT_COMMIT?.take(7) ?: 'unknown'
          env.IMAGE_TAG = env.TAG_NAME?.trim() ?: env.SHORT_COMMIT
        }
        container('kaniko') {
          script {
            def destinations = ["--destination ${env.REGISTRY}:${env.SHORT_COMMIT}"]

            if (env.TAG_NAME?.trim()) {
              destinations.add("--destination ${env.REGISTRY}:${env.TAG_NAME}")
            }

            sh "/kaniko/executor --context . ${destinations.join(' ')}"
          }
        }
      }
    }

    stage('Deploy') {
      when {
        anyOf {
          branch 'main'
          expression {
            return !!env.TAG_NAME?.trim()
          }
        }
      }
      steps {
        container('kubectl') {
          sh """
            kubectl set image deployment/${env.DEPLOYMENT_NAME} \
              ${env.DEPLOYMENT_NAME}=${env.REGISTRY}:${env.IMAGE_TAG} \
              -n ${env.NAMESPACE}
          """
          sh "kubectl rollout status deployment/${env.DEPLOYMENT_NAME} -n ${env.NAMESPACE} --timeout=120s"
          echo "Deployed ${env.REGISTRY}:${env.IMAGE_TAG} to ${env.NAMESPACE}"
        }
      }
    }
  }

  post {
    failure {
      echo "Pipeline failed on branch ${env.BRANCH_NAME}"
    }
    success {
      echo "Pipeline completed successfully on ${env.BRANCH_NAME}"
    }
  }
}

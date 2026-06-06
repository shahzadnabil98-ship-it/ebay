# End-to-End DevOps & Observability Plattform: Restkiste Application

Ein produktionsbereites Cloud- und DevOps-Projekt, das die automatisierte Bereitstellung von Infrastruktur, Konfigurationsmanagement, Container-Orchestrierung und Full-Stack-Observability auf AWS demonstriert.

Die Kernanwendung (**Restkiste**) ist innerhalb eines Kubernetes-Clusters bereitgestellt und wird mit dem Goldstandard der DevOps-Überwachung überwacht: Prometheus, Grafana und Grafana Loki.

---

##  Architektur-Übersicht

Die Infrastruktur folgt einem hochstrukturierten, modernen DevOps-Lebenszyklus:
1. **Infrastructure as Code (IaC):** Die AWS EC2-Instanz und die Netzwerk-Sicherheitsgruppen (Security Groups) werden dynamisch über **Terraform** bereitgestellt.
2. **Konfigurationsmanagement:** **Ansible** automatisiert die Systemkonfiguration, das OS-Hardening und die Installation der grundlegenden Runtimes (Docker/Kubernetes).
3. **Orchestrierung:** Die Multi-Tier-Anwendung (Frontend, Backend, Datenbank) läuft isoliert innerhalb eines **Minikube (Kubernetes)** Clusters.
4. **CI/CD Pipeline:** Automatisierte Build- und Deployment-Pipelines gewährleisten eine schnelle und zuverlässige Softwarebereitstellung.
5. **Full-Stack Observability:** Metrik-Erfassung via **Prometheus** und Log-Aggregation via **Grafana Loki**, zentralisiert in interaktiven **Grafana**-Dashboards.

---

##  Repository-Struktur

```text
├── .github/workflows/
│   └── cicd-pipeline.yaml     # Automatisierte Deployment-Workflows (CI/CD)
├── terraform/
│   └── main.tf                # Bereitstellung der AWS Cloud-Architektur
├── ansible/
│   ├── playbook.yml           # Automatische Installation von Systempaketen, Docker & K8s
│   └── inventory.yml          # Dynamisches Server-Routing zur Elastic IP
├── kubernetes/
│   ├── frontend-deployment.yaml
│   ├── backend-deployment.yaml
│   └── database-deployment.yaml
├── backend/
│   ├── server.js              # Node.js Backend-Logik
│   ├── package.json
│   └── Dockerfile             # Multi-Stage Docker-Build für das Backend
├── frontend/
│   ├── index.html             # Anwendungs-Benutzeroberfläche (UI)
│   ├── nginx.conf             # Eigene Reverse-Proxy & Webserver-Konfiguration
│   └── Dockerfile             # Leichtgewichtiges, Nginx-basiertes Produktions-Image
└── README.md                  # System-Dokumentation
```

---

##  Observability & Monitoring in der Praxis

Um eine vollständige Sichtbarkeit des gesamten Ökosystems zu erreichen, wurde der Monitoring-Stack über **Helm-Charts** tief in das Cluster integriert:

*   **Prometheus:** Erfasst Echtzeit-Performance-Metriken (CPU, Arbeitsspeicher, Festplatten-I/O) von den Cluster-Ressourcen und Worker-Nodes.
*   **Grafana Loki & Promtail:** Schickt Echtzeit-Log-Streams der Container direkt an Grafana, was tiefgreifendes Debugging ohne manuellen Terminal-Zugriff ermöglicht.
*   **Grafana:** Zentralisiert Logs und Metriken in ansprechenden, handlungsorientierten Dashboards.

### Produktions-Dashboards

####  Infrastruktur & Kubernetes Kern-Metriken (Prometheus)
*Hier visualisiert Grafana den aktiven Arbeitsspeicher-Verbrauch, die CPU-Verteilung und den Netzwerk-Durchsatz über alle Cluster-Knoten hinweg.*
![Kubernetes Core Metrics](https://githubusercontent.com[DEIN_GITHUB_USERNAME]/[DEIN_REPOSITORY_NAME]/main/images/prometheus-dashboard.png) *(Ersetze dies durch deinen Grafana-Screenshot)*

####  Zentralisierte Log-Verwaltung & Diagnose-Stream (Grafana Loki)
*Mithilfe der semantischen Abfragen von Loki werden Anwendungs-Fehlercodes isoliert und direkt über die Grafana Explore-UI analysiert.*
![Grafana Loki Log Streams](https://githubusercontent.com[DEIN_GITHUB_USERNAME]/[DEIN_REPOSITORY_NAME]/main/images/loki-dashboard.png) *(Ersetze dies durch deinen Loki/Explore-Screenshot)*

---

##  Deployment & Installations-Leitfaden

### 1. Bereitstellung der Cloud-Infrastruktur
```bash
cd terraform
terraform init
terraform apply -auto-approve
```

### 2. Ausführung der Konfigurations-Pipelines
```bash
cd ../ansible
ansible-playbook -i inventory.yml playbook.yml
```

### 3. Orchestrierung der Kubernetes-Workloads
```bash
cd ../kubernetes
kubectl apply -f database-deployment.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
```

---

##  Gelernte Lektionen & Technische Erfolge
*   **Tiefgreifendes System-Troubleshooting:** Beim Verknüpfen der Datenquellen traten Blockaden bei der clusterinternen Kommunikation zwischen verschiedenen Namespaces auf. Gelöst wurde dies durch den gezielten Einsatz von **internem Cluster-IP-Routing** für die Prometheus-Endpunkte (`http://[Cluster-IP]:80`), anstatt sich nur auf Standard-DNS-Auflösungen zu verlassen.
*   **Selbstheilende Cluster:** Die Lebenszyklen von Kubernetes-Containern wurden hautnah beobachtet – die automatische Statuswiederherstellung und aktive Selbstheilung von Containern nach Cluster-Ausfällen wurden erfolgreich verifiziert.
*   **Architektonische Abwägungen:** Migration von einer flachen Docker-Laufzeitumgebung zu einer skalierbaren Kubernetes-Struktur, um den Umgang mit Helm-Deployments und professionellen Cluster-Operationen zu meistern.

###  Project Focus Notice 
Since this repository serves strictly as a **DevOps, CI/CD, and Infrastructure portfolio**, the focus is 100% placed on automation, cloud architecture, orchestration, and monitoring. The frontend (HTML/CSS/JS) is designed purely as a functional demo to visualize real-time data flow through the entire pipeline. Design aesthetics were intentionally kept minimal to prioritize core engineering and systems operations.

### Lessons Learned & Technical Achievements
*   **Deep System Troubleshooting:** Resolved cluster-internal communication blockages between namespaces by implementing targeted internal Cluster-IP routing for Prometheus endpoints (`http://[Cluster-IP]:80`) instead of relying solely on default DNS resolution.
*   **Self-Healing Clusters:** Gained hands-on experience with Kubernetes container lifecycles, successfully verifying automatic state recovery and active self-healing capabilities after simulated cluster disruptions.
*   **Architectural Trade-offs:** Managed the migration from a flat Docker runtime environment to a scalable Kubernetes structure, strengthening practical skills in Helm deployments and professional cluster operations.






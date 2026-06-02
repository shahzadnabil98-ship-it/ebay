FROM nginx:alpine

# Kopiert die Webseiten-Dateien
COPY . /usr/share/nginx/html

# Kopiert die Nginx-Konfiguration in den richtigen Systemordner
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

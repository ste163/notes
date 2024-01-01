FROM couchdb:3.3.2

# Copy the setup-cors.sh script into the Docker image
COPY setup-cors.sh /opt/couchdb/setup-cors.sh

# Change the permissions of the setup-cors.sh script to make it executable
RUN chmod +x /opt/couchdb/setup-cors.sh

# Override the entrypoint command to run the setup-cors.sh script before the standard command
ENTRYPOINT ["/bin/sh", "-c", "/opt/couchdb/setup-cors.sh"]
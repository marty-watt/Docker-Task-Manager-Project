
##	Uses nginx web server to serve static files
##	Copies HTML/CSS/JS files into the container
##	Exposes port 80 for web traffic

# Use nginx to serve static files
FROM nginx:alpine

# Copy our static files to nginx
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Nginx starts automatically with this image
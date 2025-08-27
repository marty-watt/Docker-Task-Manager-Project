# Docker Task Manager

A full-stack task management application demonstrating Docker containerization and microservices architecture.

## Features

- Add, complete, and delete tasks
- Persistent data storage with MongoDB
- Fully containerized with Docker
- RESTful API backend
- Responsive web interface

## Architecture

- **Frontend**: HTML/CSS/JavaScript served by Nginx container
- **Backend**: Node.js/Express API container
- **Database**: MongoDB container
- **Networking**: Containers communicate via Docker network
- **Storage**: Persistent volumes for database data

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB
- **Containerization**: Docker, Docker Compose
- **Web Server**: Nginx

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/marty-watt/Docker-Task-Manager-Project.git
   cd task-manager-docker
   ```

2. Start all containers:
   ```bash
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3001

4. Stop the application:
   ```bash
   docker-compose down
   ```

## Project Structure

```
task-manager-docker/
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── Dockerfile
├── backend/
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## API Endpoints

- `GET /api/tasks` - Retrieve all tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id/toggle` - Toggle task completion
- `DELETE /api/tasks/:id` - Delete a task

## Docker Commands

```bash
# Start all services
docker-compose up -d

# View running containers
docker ps

# View logs
docker-compose logs -f

# Rebuild after code changes
docker-compose up --build

# Stop all services
docker-compose down

# Remove volumes (deletes data)
docker-compose down -v
```

## Development

To modify the application:

1. Make changes to the source code
2. Rebuild containers:
   ```bash
   docker-compose up --build
   ```

## Features Demonstrated

- Multi-container Docker application
- Container networking and communication
- Data persistence with volumes
- Environment configuration
- RESTful API design
- Responsive web design
- CRUD operations

## License

MIT License - feel free to use this project for learning purposes.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

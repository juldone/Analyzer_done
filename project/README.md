# OSINT Image Metadata Analyzer

A full-stack web application for analyzing and extracting metadata from images, built with React, Node.js, and PostgreSQL.

## Features

- User authentication with email verification and 2FA support
- Secure image upload with drag-and-drop functionality
- Comprehensive metadata extraction (EXIF, GPS, camera details)
- Organized display of metadata by category
- Search and filter through upload history
- Modern, responsive design optimized for all devices

## Prerequisites

- Docker and Docker Compose
- AWS EC2 instance (for deployment)

## Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd osint-metadata-analyzer
```

2. Create a `.env` file:
```
NODE_ENV=development
PORT=5000
JWT_SECRET=your_jwt_secret_key
POSTGRES_PASSWORD=your_postgres_password
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

3. Start the development environment:
```bash
docker-compose up --build
```

The application will be available at `http://localhost:5000`.

## Production Deployment (EC2)

1. Connect to your EC2 instance:
```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

2. Install Docker and Docker Compose:
```bash
sudo yum update -y
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

3. Create project directory:
```bash
mkdir osint-app
cd osint-app
```

4. Copy project files to EC2:
```bash
scp -i your-key.pem -r ./* ec2-user@your-ec2-ip:~/osint-app/
```

5. Create `.env` file with production values:
```
NODE_ENV=production
PORT=5000
JWT_SECRET=your_production_jwt_secret_key
POSTGRES_PASSWORD=your_secure_postgres_password
EMAIL_SERVICE=gmail
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASS=your-production-app-password
EC2_PUBLIC_IP=your-ec2-public-ip
```

6. Build and start the containers:
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

The application will be accessible at `http://your-ec2-public-ip`.

## Project Structure

```
.
├── src/                  # Frosudo usermod -aG docker ec2-user
ntend React application
│   ├── components/       # Reusable React components
│   ├── context/         # React context providers
│   ├── pages/           # Page components
│   └── main.tsx         # Application entry point
├── server/              # Backend Node.js application
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   └── index.js         # Server entry point
├── docker-compose.yml        # Development Docker configuration
├── docker-compose.prod.yml   # Production Docker configuration
├── Dockerfile.prod           # Production Docker build
└── nginx.conf               # Nginx configuration
```

## Available Scripts

- `npm run dev` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm run server` - Start backend server
- `npm run dev:server` - Start backend server with hot reload

## Docker Commands

### Development
```bash
# Start development environment
docker-compose up --build

# Stop containers
docker-compose down
```

### Production
```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop containers
docker-compose -f docker-compose.prod.yml down
```

## Maintenance

### Database Backup
```bash
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres osint_metadata > backup.sql
```

### Database Restore
```bash
cat backup.sql | docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres osint_metadata
```

### View Container Status
```bash
docker-compose -f docker-compose.prod.yml ps
```

## Security Notes

1. This setup uses HTTP only. For production, consider:
   - Adding SSL/TLS with Let's Encrypt
   - Using a domain name
   - Implementing rate limiting
   - Setting up AWS WAF

2. Database security:
   - Change default postgres password
   - Regular backups
   - Restrict database access

3. Application security:
   - Use strong JWT secrets
   - Implement rate limiting
   - Regular security updates

## License

This project is licensed under the MIT License.
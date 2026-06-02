# Deployment Guide

## Prerequisites
- Python 3.8+
- Git account on GitHub
- Heroku account (for Heroku deployment)
- OR AWS/DigitalOcean account (for other platforms)

## Local Deployment

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/HospitalNav.git
cd HospitalNav
```

### 2. Setup Environment
```bash
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 5. Run Application
```bash
python backend/app.py
```

Access the application at `http://localhost:5000`

---

## Heroku Deployment

### 1. Install Heroku CLI
Download from https://devcenter.heroku.com/articles/heroku-cli

### 2. Login to Heroku
```bash
heroku login
```

### 3. Create Heroku App
```bash
heroku create your-app-name
```

### 4. Set Environment Variables
```bash
heroku config:set FLASK_ENV=production
heroku config:set SECRET_KEY=your-secret-key-here
```

### 5. Deploy
```bash
git push heroku main
```

### 6. View Logs
```bash
heroku logs --tail
```

---

## AWS Elastic Beanstalk Deployment

### 1. Install AWS CLI and EB CLI
```bash
pip install awsebcli
```

### 2. Initialize Elastic Beanstalk
```bash
eb init -p python-3.9 hospital-nav
```

### 3. Create Environment
```bash
eb create hospital-nav-env
```

### 4. Set Environment Variables
```bash
eb setenv FLASK_ENV=production SECRET_KEY=your-secret-key
```

### 5. Deploy
```bash
eb deploy
```

---

## DigitalOcean App Platform Deployment

### 1. Push code to GitHub

### 2. Connect GitHub to DigitalOcean

### 3. Create App from GitHub repository

### 4. Configure:
   - Set environment variables in DigitalOcean dashboard
   - Ensure `Procfile` is configured correctly

### 5. Deploy and monitor from DigitalOcean console

---

## Environment Variables

See `.env.example` for all required variables:
- `FLASK_ENV`: Set to `production`
- `SECRET_KEY`: Strong random key for session management
- `CORS_ORIGINS`: Allowed frontend origins

---

## Post-Deployment

1. **Verify Application**: Test all features
2. **Monitor Logs**: Check for errors
3. **Setup Monitoring**: Enable application insights
4. **Configure Domain**: Point custom domain to deployment
5. **Enable HTTPS**: Use SSL/TLS certificates

---

## Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### Backend Not Responding
- Check if backend is running
- Verify environment variables
- Check API endpoint in frontend configuration

### Frontend Not Loading
- Verify frontend files are in correct directory
- Check browser console for errors
- Ensure CORS is properly configured

---

## Support

For issues or questions, open an issue on GitHub or contact the maintainers.

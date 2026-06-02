# 🚑 HospitalNav - Smart Hospital Navigation

A smart hospital navigation application using Flask backend and interactive mapping frontend. Find the nearest hospital, compare options, and get emergency routing - all in one place!

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.8+-green.svg)

## ✨ Features

- 🏥 **Hospital Discovery** - Find hospitals near you using GPS
- 🔍 **Advanced Search** - Filter by speciality (Eye Care, Cardiology, Oncology)
- 📋 **Type Filtering** - Government vs Private hospitals
- 🚨 **Emergency Routing** - Quick emergency navigation
- ⭐ **Favorites System** - Save your preferred hospitals
- 📊 **Hospital Comparison** - Compare multiple hospitals side-by-side
- 📜 **Search History** - Track your previous searches
- 🗺️ **Interactive Mapping** - OpenStreetMap integration with Leaflet.js
- ⚙️ **User Settings** - Sound alerts, traffic info, voice guidance
- 💾 **Local Storage** - No account needed, data stays on your device

## 🛠️ Tech Stack

- **Backend**: Python Flask with Flask-CORS
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Mapping**: Leaflet.js + OpenStreetMap
- **Data Source**: Overpass API (OpenStreetMap data)
- **Hosting**: Heroku-ready (Procfile included)

## 📋 Prerequisites

- Python 3.8 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for API calls

## ⚙️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/HospitalNav.git
cd HospitalNav
```

### 2. Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Setup Environment Variables
```bash
cp .env.example .env
# Edit .env with your configuration (optional for local development)
```

## 🚀 Running the Application

### Start the Backend
```bash
python backend/app.py
```

The backend will run on `http://localhost:5000`

### Access the Frontend

**Option 1:** Open in browser directly
```bash
# Navigate to: file:///path/to/HospitalNav/frontend/index.html
```

**Option 2:** Serve through backend
```bash
# Visit: http://localhost:5000 (if configured to serve static files)
```

## 📱 Usage

1. **Grant Location Permission** - Allow browser to access your GPS location
2. **Search by GPS** - Click "📍 Use GPS" to find nearby hospitals
3. **Search by Filters** - Select speciality and hospital type, then click "🔍 Search"
4. **Add to Favorites** - Click ⭐ on any hospital to save it
5. **Emergency Mode** - Click "🚨 Emergency" for quick routing
6. **Compare Hospitals** - Select multiple hospitals and view comparison

## 📚 API Endpoints

- `GET /` - Health check
- `POST /search` - Search hospitals by coordinates
- `POST /emergency` - Get emergency routing
- `GET /hospital/:id` - Get hospital details

*Full API documentation coming soon*

## 🌐 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on:
- Local deployment
- Heroku deployment
- AWS Elastic Beanstalk deployment
- DigitalOcean deployment
- Custom domain setup

Quick Heroku deployment:
```bash
heroku login
heroku create your-app-name
git push heroku main
```

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Reporting bugs
- Suggesting features
- Submitting code changes
- Development setup

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

**Backend won't start:**
```bash
# Check if port 5000 is already in use
netstat -ano | findstr :5000
# Kill the process and try again
```

**Frontend can't find backend:**
- Ensure backend is running on localhost:5000
- Check browser console for CORS errors
- Verify `.env` configuration

**Hospitals not showing:**
- Check internet connection
- Verify GPS is enabled
- Try a different location
- Check browser console for API errors

## 📧 Support & Contact

- Open an issue on GitHub for bugs
- Discussions for feature requests
- Email: support@hospitalnav.local

## 🗺️ Data Sources

- Hospital data: [Overpass API](https://overpass-api.de/) (OpenStreetMap)
- Map tiles: [OpenStreetMap Contributors](https://www.openstreetmap.org/)
- Geocoding: Browser Geolocation API

## 🎯 Future Roadmap

- [ ] Real-time bed availability
- [ ] Doctor ratings and reviews
- [ ] Appointment booking
- [ ] Insurance verification
- [ ] Multilingual support
- [ ] Mobile app (React Native/Flutter)
- [ ] Hospital crowding heatmap

## 📊 Status

- ✅ Core features complete
- ✅ Frontend-Backend integration
- ✅ GPS functionality
- ✅ Favorites system
- 🔄 Testing & optimization in progress
- 🔄 Deployment to production

---

**Made with ❤️ for better healthcare accessibility**

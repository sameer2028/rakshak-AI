const fs = require('fs');
const path = require('path');

const locales = ['en', 'hi', 'bn', 'mr', 'te', 'ta', 'gu', 'ur', 'kn', 'or', 'ml', 'pa', 'as'];

const baseTranslations = {
  "app_title": "Rakshak AI",
  "welcome": "Welcome to Rakshak AI",
  "dashboard": "Dashboard",
  "citizen_shield": "Citizen Shield",
  "scam_detection": "Scam Detection",
  "fraud_network": "Fraud Network",
  "crime_heatmap": "Crime Heatmap",
  "counterfeit": "Counterfeit Detection",
  "logout": "Logout",
  "login": "Login",
  "select_language": "Select Language",
  "analyze": "Analyze",
  "report_scam": "Report Scam",
  "risk_score": "Risk Score",
  "safe": "SAFE",
  "suspicious": "SUSPICIOUS",
  "scam": "SCAM"
};

const dir = path.join(__dirname, 'src', 'locales');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

locales.forEach(lang => {
  const filePath = path.join(dir, `${lang}.json`);
  // For this prototype, we'll just write the base keys. 
  // A real implementation would translate these values into the target language.
  fs.writeFileSync(filePath, JSON.stringify(baseTranslations, null, 2));
});

console.log('Locale files generated.');

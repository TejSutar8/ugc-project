# 🚀 Quick Setup Script
# Run this script to set up the project quickly

Write-Host "🎨 UGC Image Generator - Quick Setup" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Check Node.js installation
Write-Host "📦 Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "client") -or -not (Test-Path "server")) {
    Write-Host "❌ Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "`n📥 Installing dependencies...`n" -ForegroundColor Yellow

# Install server dependencies
Write-Host "Installing server dependencies..." -ForegroundColor Cyan
Set-Location server
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Server dependency installation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Server dependencies installed`n" -ForegroundColor Green

# Install client dependencies
Write-Host "Installing client dependencies..." -ForegroundColor Cyan
Set-Location ../client
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Client dependency installation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Client dependencies installed`n" -ForegroundColor Green

# Return to root
Set-Location ..

# Check if .env files exist
Write-Host "🔑 Checking environment files...`n" -ForegroundColor Yellow

$clientEnvExists = Test-Path "client/.env"
$serverEnvExists = Test-Path "server/.env"

if (-not $clientEnvExists) {
    Write-Host "⚠️  client/.env not found!" -ForegroundColor Yellow
    if (Test-Path "client/.env.example") {
        Copy-Item "client/.env.example" "client/.env"
        Write-Host "✅ Created client/.env from .env.example" -ForegroundColor Green
        Write-Host "⚠️  Please edit client/.env and add your Clerk key" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ client/.env exists" -ForegroundColor Green
}

if (-not $serverEnvExists) {
    Write-Host "⚠️  server/.env not found!" -ForegroundColor Yellow
    if (Test-Path "server/.env.example") {
        Copy-Item "server/.env.example" "server/.env"
        Write-Host "✅ Created server/.env from .env.example" -ForegroundColor Green
        Write-Host "⚠️  Please edit server/.env and add your API keys" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ server/.env exists" -ForegroundColor Green
}

Write-Host "`n🗄️  Database setup..." -ForegroundColor Yellow
Write-Host "Would you like to set up the database now? (y/n)" -ForegroundColor Cyan
$setupDb = Read-Host

if ($setupDb -eq 'y' -or $setupDb -eq 'Y') {
    Set-Location server
    
    Write-Host "`nRunning Prisma migrations..." -ForegroundColor Cyan
    npx prisma migrate dev --name init
    
    Write-Host "`nGenerating Prisma client..." -ForegroundColor Cyan
    npx prisma generate
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database setup complete!`n" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Database setup had issues. Check your DATABASE_URL in server/.env`n" -ForegroundColor Yellow
    }
    
    Set-Location ..
} else {
    Write-Host "⚠️  Skipping database setup. Run manually later with:" -ForegroundColor Yellow
    Write-Host "   cd server && npx prisma migrate dev && npx prisma generate`n" -ForegroundColor Gray
}

Write-Host "`n✅ Setup Complete!`n" -ForegroundColor Green
Write-Host "====================================`n" -ForegroundColor Cyan

Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Edit environment files with your API keys:" -ForegroundColor White
Write-Host "   - client/.env (add Clerk key)" -ForegroundColor Gray
Write-Host "   - server/.env (add all API keys)`n" -ForegroundColor Gray

Write-Host "2. Start the development servers:" -ForegroundColor White
Write-Host "   Terminal 1: cd server && npm run server" -ForegroundColor Gray
Write-Host "   Terminal 2: cd client && npm run dev`n" -ForegroundColor Gray

Write-Host "3. Open your browser:" -ForegroundColor White
Write-Host "   http://localhost:5173`n" -ForegroundColor Gray

Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "   - README.md - Quick overview" -ForegroundColor Gray
Write-Host "   - MVP.md - Complete documentation" -ForegroundColor Gray
Write-Host "   - TESTING.md - Testing checklist`n" -ForegroundColor Gray

Write-Host "🎉 Happy coding!" -ForegroundColor Green

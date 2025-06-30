Write-Host "Starting IndieMentor AI Application..." -ForegroundColor Green
Write-Host ""

Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
Set-Location mentor_agent
python -m pip install -r requirements.txt
Set-Location ..

Write-Host "Installing Node dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "Starting the application..." -ForegroundColor Green
Write-Host "Frontend will run on: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend will run on: http://localhost:8001" -ForegroundColor Cyan
Write-Host ""

npm run start

#!/bin/bash

echo "Starting IndieMentor AI Application..."
echo ""

echo "Installing Python dependencies..."
cd mentor_agent
pip install -r requirements.txt
cd ..

echo "Installing Node dependencies..."
npm install

echo ""
echo "Starting the application..."
echo "Frontend will run on: http://localhost:5173"
echo "Backend will run on: http://localhost:8001"
echo ""

npm run start

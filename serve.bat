@echo off
echo ========================================
echo   Wizard Game - Local Dev Server
echo ========================================
echo.
echo   Counter Matrix:     http://localhost:8000/frontend/counters.html
echo   Spell Combinations: http://localhost:8000/frontend/combinations.html
echo   Progression Tree:   http://localhost:8000/frontend/progression.html
echo   Game Prototype:     http://localhost:8000/frontend/index.html
echo.
echo   Press Ctrl+C to stop.
echo.
python -m http.server 8000

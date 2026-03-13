@echo off
echo Starting E-commerce Application...

echo.
echo Starting Backend (Spring Boot)...
start "Backend - Spring Boot" cmd /k "cd glasses-store && mvnw spring-boot:run"

echo.
echo Starting Frontend (React)...
start "Frontend - React" cmd /k "cd ecommerce-react && npm run dev"

echo.
echo Both services are starting up!
echo - Backend will be available at: http://localhost:8080
echo - Frontend will be available at: http://localhost:3001
echo - Swagger UI will be available at: http://localhost:8080/swagger-ui/index.html
echo.
echo Close this window to keep application running.
pause

# EcoRoute 50% Backend Milestone Verification Script

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " ECO ROUTE BACKEND API VERIFICATION SUITE" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080"

# Helper for formatted reporting
function Test-ApiEndpoint {
    param(
        [string]$TestName,
        [string]$Method,
        [string]$Uri,
        [hashtable]$Headers,
        [string]$Body,
        [int]$ExpectedStatusCode
    )

    Write-Host -NoNewline "[TEST] $TestName ... "
    try {
        $params = @{
            Method = $Method
            Uri = $Uri
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        if ($Headers) { $params.Headers = $Headers }
        if ($Body) { $params.Body = $Body }

        $response = Invoke-WebRequest @params
        $status = [int]$response.StatusCode
        if ($status -eq $ExpectedStatusCode) {
            Write-Host "PASSED ($status)" -ForegroundColor Green
            return $response.Content | ConvertFrom-Json
        } else {
            Write-Host "FAILED (Expected $ExpectedStatusCode, Got $status)" -ForegroundColor Red
            return $null
        }
    } catch {
        $exc = $_.Exception.Response
        if ($exc) {
            $status = [int]$exc.StatusCode
            if ($status -eq $ExpectedStatusCode) {
                Write-Host "PASSED ($status Expected Exception)" -ForegroundColor Green
                $reader = New-Object System.IO.StreamReader($exc.GetResponseStream())
                return $reader.ReadToEnd() | ConvertFrom-Json
            } else {
                Write-Host "FAILED (Expected $ExpectedStatusCode, Got ${status}: $($_.Exception.Message))" -ForegroundColor Red
                return $null
            }
        } else {
            Write-Host "FAILED ($($_.Exception.Message))" -ForegroundColor Red
            return $null
        }
    }
}

# Wait for Tomcat server readiness
Write-Host "Waiting for Tomcat server to listen on port 8080..." -ForegroundColor Yellow
for ($i=1; $i -le 15; $i++) {
    try {
        $tcp = New-Object Net.Sockets.TcpClient
        $tcp.Connect("localhost", 8080)
        $tcp.Close()
        Write-Host "Server is UP and READY!" -ForegroundColor Green
        break
    } catch {
        Start-Sleep -Seconds 1
    }
}

Write-Host "`n--- 1. AUTHENTICATION APIs ---" -ForegroundColor Yellow

$testId = Get-Date -Format "yyyyMMddHHmmss"
$testEmail = "ashish_$testId@gmail.com"

# Test 1.1: Register User Success
$regBody = @{
    name = "Ashish"
    email = $testEmail
    password = "Ashish@123"
    confirmPassword = "Ashish@123"
} | ConvertTo-Json

$regRes = Test-ApiEndpoint -TestName "POST /api/auth/register (Success)" -Method "POST" -Uri "$baseUrl/api/auth/register" -Body $regBody -ExpectedStatusCode 201

# Test 1.2: Register User Duplicate Email
Test-ApiEndpoint -TestName "POST /api/auth/register (Duplicate Email 409)" -Method "POST" -Uri "$baseUrl/api/auth/register" -Body $regBody -ExpectedStatusCode 409

# Test 1.3: Register User Weak Password
$weakPassBody = @{
    name = "Weak"
    email = "weak_$testId@gmail.com"
    password = "123"
    confirmPassword = "123"
} | ConvertTo-Json
Test-ApiEndpoint -TestName "POST /api/auth/register (Weak Password 400)" -Method "POST" -Uri "$baseUrl/api/auth/register" -Body $weakPassBody -ExpectedStatusCode 400

# Test 1.4: Login Success
$loginBody = @{
    email = $testEmail
    password = "Ashish@123"
} | ConvertTo-Json

$loginRes = Test-ApiEndpoint -TestName "POST /api/auth/login (Success)" -Method "POST" -Uri "$baseUrl/api/auth/login" -Body $loginBody -ExpectedStatusCode 200

$jwtToken = $loginRes.token
Write-Host "Obtained JWT Token: $($jwtToken.Substring(0, 20))..." -ForegroundColor Cyan

# Test 1.5: Login Wrong Password
$badLoginBody = @{
    email = "ashish@gmail.com"
    password = "WrongPassword@123"
} | ConvertTo-Json
Test-ApiEndpoint -TestName "POST /api/auth/login (Wrong Password 401)" -Method "POST" -Uri "$baseUrl/api/auth/login" -Body $badLoginBody -ExpectedStatusCode 401

$authHeader = @{ "Authorization" = "Bearer $jwtToken" }

Write-Host "`n--- 2. PROFILE APIs ---" -ForegroundColor Yellow

# Test 2.1: Create First-Time Profile
$profileCreateBody = @{
    name = "Ashish"
    age = 24
    medicalInformation = "Asthma / AQI Sensitivity"
    vehicleType = "EV"
} | ConvertTo-Json

Test-ApiEndpoint -TestName "POST /api/profile (First-Time Create)" -Method "POST" -Uri "$baseUrl/api/profile" -Headers $authHeader -Body $profileCreateBody -ExpectedStatusCode 201

# Test 2.2: Get Profile
$profileRes = Test-ApiEndpoint -TestName "GET /api/profile (Fetch Profile)" -Method "GET" -Uri "$baseUrl/api/profile" -Headers $authHeader -ExpectedStatusCode 200

# Test 2.3: Update Profile
$profileUpdateBody = @{
    name = "Ashish Kumar"
    age = 25
    medicalInformation = "Mild Asthma"
    vehicleType = "CAR"
} | ConvertTo-Json
Test-ApiEndpoint -TestName "PUT /api/profile (Update Profile)" -Method "PUT" -Uri "$baseUrl/api/profile" -Headers $authHeader -Body $profileUpdateBody -ExpectedStatusCode 200

Write-Host "`n--- 3. DASHBOARD API ---" -ForegroundColor Yellow
$dashRes = Test-ApiEndpoint -TestName "GET /api/dashboard (User Dashboard)" -Method "GET" -Uri "$baseUrl/api/dashboard" -Headers $authHeader -ExpectedStatusCode 200

Write-Host "`n--- 4. JOURNEY APIs ---" -ForegroundColor Yellow

# Test 4.1: Create Journey
$journeyCreateBody = @{
    source = "Bhubaneswar"
    destination = "Puri"
    travelType = "FAMILY"
    vehicleType = "CAR"
    routePreferences = @("FASTEST", "SAFEST", "HEALTHIEST")
    requiredFacilities = @("EV_CHARGING", "HOSPITAL", "RESTAURANT")
} | ConvertTo-Json

$journeyRes = Test-ApiEndpoint -TestName "POST /api/journeys (Create Journey)" -Method "POST" -Uri "$baseUrl/api/journeys" -Headers $authHeader -Body $journeyCreateBody -ExpectedStatusCode 201
$journeyId = $journeyRes.data.id

# Test 4.2: Get All Journeys
Test-ApiEndpoint -TestName "GET /api/journeys (List User Journeys)" -Method "GET" -Uri "$baseUrl/api/journeys" -Headers $authHeader -ExpectedStatusCode 200

# Test 4.3: Get Journey By ID
Test-ApiEndpoint -TestName "GET /api/journeys/$journeyId (Get Specific Journey)" -Method "GET" -Uri "$baseUrl/api/journeys/$journeyId" -Headers $authHeader -ExpectedStatusCode 200

# Test 4.4: Update Journey
$journeyUpdateBody = @{
    source = "Bhubaneswar"
    destination = "Cuttack"
    travelType = "SOLO"
    vehicleType = "BIKE"
    routePreferences = @("SHORTEST", "HEALTHIEST")
    requiredFacilities = @("FUEL_STATION", "GARAGE")
} | ConvertTo-Json
Test-ApiEndpoint -TestName "PUT /api/journeys/$journeyId (Update Journey)" -Method "PUT" -Uri "$baseUrl/api/journeys/$journeyId" -Headers $authHeader -Body $journeyUpdateBody -ExpectedStatusCode 200

Write-Host "`n--- 5. GIS, WEATHER & ENVIRONMENTAL APIs ---" -ForegroundColor Yellow

# Test 5.1: Geocoding Location
Test-ApiEndpoint -TestName "GET /api/location/geocode (Bhubaneswar)" -Method "GET" -Uri "$baseUrl/api/location/geocode?query=Bhubaneswar" -ExpectedStatusCode 200

# Test 5.2: OpenRouteService / OSRM Route Calculation
$routeBody = @{
    sourceLat = 20.2961
    sourceLng = 85.8245
    destLat = 19.8135
    destLng = 85.8312
    profile = "driving-car"
} | ConvertTo-Json
$routeRes = Test-ApiEndpoint -TestName "POST /api/routes/search (Route Distance & Geometry)" -Method "POST" -Uri "$baseUrl/api/routes/search" -Body $routeBody -ExpectedStatusCode 200

# Test 5.3: Live Weather Service
Test-ApiEndpoint -TestName "GET /api/weather (Live Weather Info)" -Method "GET" -Uri "$baseUrl/api/weather?lat=20.2961&lon=85.8245" -ExpectedStatusCode 200

# Test 5.4: Live Air Quality Service
Test-ApiEndpoint -TestName "GET /api/air-quality (Live Air Quality / AQI)" -Method "GET" -Uri "$baseUrl/api/air-quality?lat=20.2961&lon=85.8245" -ExpectedStatusCode 200

# Test 5.5: Nearby Facilities Service
Test-ApiEndpoint -TestName "GET /api/facilities (Nearby EV Chargers / Hospitals)" -Method "GET" -Uri "$baseUrl/api/facilities?lat=20.2961&lon=85.8245&type=EV_CHARGING&radius=5.0" -ExpectedStatusCode 200

# Test 5.6: Route Environmental Data Aggregation
$analyzeBody = @{
    sourceLat = 20.2961
    sourceLng = 85.8245
    destLat = 19.8135
    destLng = 85.8312
    requiredFacilities = @("HOSPITAL", "EV_CHARGING")
} | ConvertTo-Json
Test-ApiEndpoint -TestName "POST /api/routes/analyze (Route Aggregation Foundation)" -Method "POST" -Uri "$baseUrl/api/routes/analyze" -Body $analyzeBody -ExpectedStatusCode 200

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " ECO ROUTE BACKEND TEST SUITE COMPLETED SUCCESSFULLY!" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Create test directory structure
New-Item -Path "tests" -ItemType Directory -Force | Out-Null
New-Item -Path "tests/unit" -ItemType Directory -Force | Out-Null
New-Item -Path "tests/unit/hooks" -ItemType Directory -Force | Out-Null
New-Item -Path "tests/unit/services" -ItemType Directory -Force | Out-Null
New-Item -Path "tests/unit/components" -ItemType Directory -Force | Out-Null
New-Item -Path "tests/integration" -ItemType Directory -Force | Out-Null
New-Item -Path "tests/api" -ItemType Directory -Force | Out-Null
New-Item -Path "tests/e2e" -ItemType Directory -Force | Out-Null
New-Item -Path "tests/utils" -ItemType Directory -Force | Out-Null

Write-Host "✅ Test directories created successfully" -ForegroundColor Green

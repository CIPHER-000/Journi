# Migrate existing tests to new structure
Write-Host "🔄 Migrating tests to new structure..." -ForegroundColor Cyan

# Move hook tests
Write-Host "  → Moving hook tests..." -ForegroundColor Gray
Move-Item -Path "src/hooks/useJobProgress.test.ts" -Destination "tests/unit/hooks/useJobProgress.unit.test.ts" -Force -ErrorAction SilentlyContinue
Move-Item -Path "src/hooks/useActiveJourney.test.ts" -Destination "tests/unit/hooks/useActiveJourney.unit.test.ts" -Force -ErrorAction SilentlyContinue

# Move service tests
Write-Host "  → Moving service tests..." -ForegroundColor Gray
Move-Item -Path "src/services/agentService.test.ts" -Destination "tests/unit/services/agentService.unit.test.ts" -Force -ErrorAction SilentlyContinue

# Move component tests
Write-Host "  → Moving component tests..." -ForegroundColor Gray
Move-Item -Path "src/components/ui/button.test.tsx" -Destination "tests/unit/components/button.unit.test.tsx" -Force -ErrorAction SilentlyContinue
Move-Item -Path "src/components/ui/input.test.tsx" -Destination "tests/unit/components/input.unit.test.tsx" -Force -ErrorAction SilentlyContinue
Move-Item -Path "src/components/ui/card.test.tsx" -Destination "tests/unit/components/card.unit.test.tsx" -Force -ErrorAction SilentlyContinue
Move-Item -Path "src/components/ui/badge.test.tsx" -Destination "tests/unit/components/badge.unit.test.tsx" -Force -ErrorAction SilentlyContinue
Move-Item -Path "src/components/ui/progress.test.tsx" -Destination "tests/unit/components/progress.unit.test.tsx" -Force -ErrorAction SilentlyContinue
Move-Item -Path "src/components/ui/PrimaryButton.test.tsx" -Destination "tests/unit/components/PrimaryButton.unit.test.tsx" -Force -ErrorAction SilentlyContinue
Move-Item -Path "src/components/FileUpload.test.tsx" -Destination "tests/unit/components/FileUpload.unit.test.tsx" -Force -ErrorAction SilentlyContinue

Write-Host "✅ Tests migrated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 New structure:" -ForegroundColor Yellow
Write-Host "  tests/" -ForegroundColor White
Write-Host "    ├── unit/" -ForegroundColor White
Write-Host "    │   ├── hooks/" -ForegroundColor White
Write-Host "    │   ├── services/" -ForegroundColor White
Write-Host "    │   └── components/" -ForegroundColor White
Write-Host "    ├── integration/" -ForegroundColor White
Write-Host "    ├── api/" -ForegroundColor White
Write-Host "    ├── e2e/" -ForegroundColor White
Write-Host "    └── utils/" -ForegroundColor White

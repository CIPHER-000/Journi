$env:VITE_TEST_ENV = "staging"
$env:TEST_ENV = "staging"
npm test -- tests/api/backend.api.test.ts --run

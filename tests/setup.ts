import '@testing-library/jest-dom/vitest'

// Mock env vars used in tests
process.env.ASAAS_API_KEY = 'test-asaas-key'
process.env.ASAAS_ENVIRONMENT = 'sandbox'
process.env.ASAAS_BALAIO_WALLET_ID = '00000000-0000-0000-0000-000000000001'
process.env.ASAAS_SPLIT_ENABLED = 'true'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'

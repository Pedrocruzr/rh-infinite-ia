#!/bin/bash
set -e

echo "Setting SUPABASE_SECRET_KEY..."
npx --no-install vercel env add SUPABASE_SECRET_KEY production --value "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZndoY2RjZHFtcGZnd3BqY2x0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTgwNDE3MiwiZXhwIjoyMDk1MzgwMTcyfQ.5qF1_YfG0tsN6ccJ0nw86tNnWguyng-vjCk95REHV3c" --yes --force --non-interactive

echo "Setting SUPABASE_SERVICE_ROLE_KEY..."
npx --no-install vercel env add SUPABASE_SERVICE_ROLE_KEY production --value "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZndoY2RjZHFtcGZnd3BqY2x0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTgwNDE3MiwiZXhwIjoyMDk1MzgwMTcyfQ.5qF1_YfG0tsN6ccJ0nw86tNnWguyng-vjCk95REHV3c" --yes --force --non-interactive

echo "Setting NEXT_PUBLIC_SITE_URL..."
npx --no-install vercel env add NEXT_PUBLIC_SITE_URL production --value "https://entrar.stackercompany.com.br" --yes --force --non-interactive

echo "Setting NEXT_PUBLIC_BILLING_SUCCESS_URL..."
npx --no-install vercel env add NEXT_PUBLIC_BILLING_SUCCESS_URL production --value "https://entrar.stackercompany.com.br/app/configuracoes/assinatura" --yes --force --non-interactive

echo "Setting NEXT_PUBLIC_BILLING_CANCEL_URL..."
npx --no-install vercel env add NEXT_PUBLIC_BILLING_CANCEL_URL production --value "https://entrar.stackercompany.com.br/app/configuracoes/assinatura" --yes --force --non-interactive

echo "All environment variables successfully updated on Vercel!"

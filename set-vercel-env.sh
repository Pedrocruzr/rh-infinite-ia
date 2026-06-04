#!/bin/bash
set -e

echo "Setting NEXT_PUBLIC_SUPABASE_URL..."
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production --value "https://ngfwhcdcdqmpfgwpjclt.supabase.co" --yes --force

echo "Setting NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY..."
npx vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY production --value "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZndoY2RjZHFtcGZnd3BqY2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDQxNzIsImV4cCI6MjA5NTM4MDE3Mn0.umvD9eRrVrPDyCOlwtmqYt3kEhQR7hgBPAjzr4_1WbI" --yes --force

echo "Setting SUPABASE_SECRET_KEY..."
npx vercel env add SUPABASE_SECRET_KEY production --value "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZndoY2RjZHFtcGZnd3BqY2x0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTgwNDE3MiwiZXhwIjoyMDk1MzgwMTcyfQ.5qF1_YfG0tsN6ccJ0nw86tNnWguyng-vjCk95REHV3c" --yes --force

echo "Setting SUPABASE_SERVICE_ROLE_KEY..."
npx vercel env add SUPABASE_SERVICE_ROLE_KEY production --value "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZndoY2RjZHFtcGZnd3BqY2x0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTgwNDE3MiwiZXhwIjoyMDk1MzgwMTcyfQ.5qF1_YfG0tsN6ccJ0nw86tNnWguyng-vjCk95REHV3c" --yes --force

echo "Setting NEXT_PUBLIC_SITE_URL..."
npx vercel env add NEXT_PUBLIC_SITE_URL production --value "https://entrar.stackercompany.com.br" --yes --force

echo "Setting NEXT_PUBLIC_BILLING_SUCCESS_URL..."
npx vercel env add NEXT_PUBLIC_BILLING_SUCCESS_URL production --value "https://entrar.stackercompany.com.br/app/configuracoes/assinatura" --yes --force

echo "Setting NEXT_PUBLIC_BILLING_CANCEL_URL..."
npx vercel env add NEXT_PUBLIC_BILLING_CANCEL_URL production --value "https://entrar.stackercompany.com.br/app/configuracoes/assinatura" --yes --force

echo "All environment variables successfully updated on Vercel!"

@echo off
echo ================================================
echo  Acalanto Tours — Git setup e push para GitHub
echo ================================================
echo.

cd /d "%~dp0"

REM 1. Remove stale lock files
echo Removendo lock files...
del /f /q ".git\index.lock" 2>nul
del /f /q ".git\HEAD.lock" 2>nul

REM 2. Stage all files
echo Adicionando arquivos...
git add .

REM 3. Commit
echo Commitando...
git commit -m "feat: full site — layout, home, tours, booking widget, admin panel, SEO"

REM 4. Create GitHub repo (gh CLI required) OR set remote manually
REM Se tiver o GitHub CLI instalado, descomente as linhas abaixo:
REM gh repo create bloodyu2/acalanto-tours --public --source=. --remote=origin --push

REM Se nao tiver o GitHub CLI, adicione o remote manualmente:
REM git remote add origin https://github.com/bloodyu2/acalanto-tours.git

REM 5. Push
echo Fazendo push...
git push -u origin main 2>nul || git push -u origin master

echo.
echo ================================================
echo  PRONTO! Agora configure o Vercel:
echo  1. Acesse vercel.com/new
echo  2. Importe github.com/bloodyu2/acalanto-tours
echo  3. Adicione as env vars abaixo no Vercel:
echo.
echo  NEXT_PUBLIC_SUPABASE_URL=https://hnsbstmzbidfehvycptl.supabase.co
echo  NEXT_PUBLIC_SUPABASE_ANON_KEY=(copie do Supabase Dashboard)
echo  SUPABASE_SERVICE_ROLE_KEY=(copie do Supabase Dashboard - Settings > API)
echo  NEXT_PUBLIC_WHATSAPP_NUMBER=(numero confirmar com Gustavo)
echo  NEXT_PUBLIC_SITE_URL=https://acalantotours.com.br
echo  NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
echo ================================================
pause

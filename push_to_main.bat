@echo off
git config core.pager cat
git checkout main
git pull origin main
git push origin main
echo Operacion completada exitosamente

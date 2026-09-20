@echo off
echo Activating virtual environment...
call .\.venv\Scripts\activate.bat
echo Running build.py...
python build.py
echo Build finished!
pause


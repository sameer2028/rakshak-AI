import subprocess
import sys
from pathlib import Path

def main():
    print("Running the comprehensive Rakshak AI database seeder...")
    
    # Path to the actual mega-seeder in the backend/scripts directory
    backend_dir = Path(__file__).parent / "backend"
    
    try:
        # Run the seeder using the python interpreter in the current environment
        subprocess.run(
            [sys.executable, "-m", "scripts.seed_db"],
            cwd=str(backend_dir),
            check=True
        )
    except subprocess.CalledProcessError as e:
        print(f"Failed to seed database. Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
# run 
# python seed_db.py
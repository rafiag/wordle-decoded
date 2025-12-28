import kagglehub
import shutil
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup paths
BASE_DIR = Path(__file__).parent
RAW_DATA_DIR = BASE_DIR / "data" / "raw"
RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)

def download_and_move(dataset_name, target_folder_name):
    print(f"Downloading {dataset_name}...")
    try:
        # Download (caches by default)
        path = kagglehub.dataset_download(dataset_name)
        print(f"Downloaded to cache: {path}")

        # Target directory
        target_dir = RAW_DATA_DIR / target_folder_name
        if target_dir.exists():
            shutil.rmtree(target_dir) # Clean existing
        target_dir.mkdir(exist_ok=True)

        # Copy files
        src_path = Path(path)
        for item in src_path.iterdir():
            if item.is_file():
                shutil.copy2(item, target_dir / item.name)
                print(f"Copied {item.name} to {target_dir}")
        
        print(f"Successfully set up {dataset_name}")
        
    except Exception as e:
        print(f"Error downloading {dataset_name}: {e}")

if __name__ == "__main__":
    # Download Wordle Tweets
    download_and_move("benhamner/wordle-tweets", "tweet_data")
    
    # Download Wordle Games
    download_and_move("scarcalvetsis/wordle-games", "game_data")
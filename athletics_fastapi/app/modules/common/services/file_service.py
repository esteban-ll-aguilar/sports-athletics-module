import os
import shutil
from fastapi import UploadFile
from pathlib import Path
import uuid

class FileService:
    def __init__(self, base_dir: str = "data"):
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    async def save_profile_picture(self, file: UploadFile, sub_dir: str = "profile_pictures") -> str:
        """
        Saves an uploaded file to the specified subdirectory.
        Returns the relative path to the saved file (e.g. data/profile_pictures/filename.ext).
        """
        # Create directory if it doesn't exist
        target_dir = self.base_dir / sub_dir
        target_dir.mkdir(parents=True, exist_ok=True)

        # Generate unique filename to prevent collisions and caching issues
        ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        unique_name = f"{uuid.uuid4()}.{ext}"
        target_path = target_dir / unique_name

        # Save file
        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Return path relative to app root (assuming data is at root)
        # We return "data/profile_pictures/filename.ext"
        return str(Path(self.base_dir.name) / sub_dir / unique_name).replace("\\", "/")

    def delete_file(self, file_path: str):
        """
        Deletes a file if it exists.
        file_path: Relative path (e.g. data/profile_pictures/filename.ext)
        """
        if not file_path:
            return
            
        try:
            # Construct full path. Assuming file_path starts with "data/"
            # and self.base_dir is "data". 
            # If line starts with "data/", we can just use it if we are at root.
            # But let's be safe.
            
            full_path = Path(file_path)
            if full_path.exists():
                os.remove(full_path)
        except Exception as e:
            print(f"Error deleting file {file_path}: {e}")

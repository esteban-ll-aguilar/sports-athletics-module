import os
import pytest
from pathlib import Path
from unittest.mock import patch
from app.core.utils.file_handler import delete_file, FileHandlerError

@pytest.mark.asyncio
async def test_delete_file_success(tmp_path):
    # Setup: Create a temporary file
    temp_file = tmp_path / "test_delete.txt"
    temp_file.write_text("dummy content")
    file_path = str(temp_file)
    
    assert os.path.exists(file_path)
    
    # Execute
    result = await delete_file(file_path)
    
    # Assert
    assert result is True
    assert not os.path.exists(file_path)

@pytest.mark.asyncio
async def test_delete_file_not_exists():
    # Execute with non-existent file
    result = await delete_file("non_existent_file.txt")
    
    # Assert
    assert result is False

@pytest.mark.asyncio
async def test_delete_file_error_handling():
    # Mock os.path.exists to return True but os.remove to raise an exception
    with patch("os.path.exists", return_value=True), \
         patch("os.remove", side_effect=OSError("Permission denied")):
        
        # Execute and Assert
        with pytest.raises(FileHandlerError) as excinfo:
            await delete_file("some_file.txt")
        
        assert "Error al eliminar archivo" in str(excinfo.value)

# Interact with the opperating system e.g file paths
import os
# Provides access to system specific parameters and functions
import sys
import pytest
# Adds the parent directory of the current file to the python module search path
# This allows importing modules from the parent directory
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

# Import S3 configuration and utility functions
from s3config import test_s3_connection, upload_file_to_s3, S3_BUCKET_NAME

# Function to test S3 connection and file upload
@pytest.mark.integration  
@pytest.mark.slow
def main():
    """
    Test S3 connection and file upload functionality
    """

    # Testing S3 connection
    print("Testing S3 connection")
    if not test_s3_connection():
        print("S3 connection test failed. Exiting.")
        return
    
    # Test on creatingand uploading a sample file to S3
    print("Testing creating and uploading a sample file to S3")
    test_file_path = "test_upload.txt"

    # Create a sample file
    with open(test_file_path, "w") as f:
        f.write("This is a test file for S3 upload.\n")
    
    # Upload the sample file to S3
    s3_url = upload_file_to_s3(test_file_path, "test_upload.txt")

    if s3_url:
        print(f"Upload successful")
        print(f"File URL: {s3_url}")
    else:
        print("File upload failed.")

    # Clean up the local test file
    if os.path.exists(test_file_path):
        os.remove(test_file_path)

# Run main() only if this file is executed directly
# but not if it's imported as a module
if __name__ == "__main__":
    main()
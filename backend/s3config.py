# Import boto3 library to interact with AWS S3
import boto3
# Import ClientError to handle exceptions
from botocore.exceptions import ClientError
# Import os to access environment variables
import os
# Import load_dotenv to load environment variables from a .env file
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Retrieve AWS credentials and bucket name from environment variables
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_REGION = os.getenv('AWS_REGION', 'eu-north-1')
S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME')

# Verify that all necessary environment variables are set
if not all([AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME]):
    raise ValueError("Missing one or more required environment variables: "
                     "AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME"
    )

# Create an S3 client using the provided credentials and region
s3_cient = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

# Function to upload a file to the specified S3 bucket
def upload_file_to_s3(file_path, object_name=None):
    """
    Upload a file to an S3 bucket
    
    args:
        file_path (str): Path to the file to upload
        object_name (str): S3 object name. If not specified, file_path will be used

    returns:
        str: S3 URL of uploaded file, or none if upload has failed
    """

    # If S3 object_name was not specified, use the basename of file_path
    if object_name is None:
        object_name = os.path.basename(file_path)

    try:
        # Upload the file
        s3_cient.upload_file(file_path, S3_BUCKET_NAME, object_name)
        
        # Generate the S3 URL
        s3_url = f"https://{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{object_name}"
        
        # Return the S3 URL of the uploaded file
        return s3_url
    
    # Handle ClientError exceptions during upload
    except ClientError as e:
        # Print the error and return None if upload fails
        print(f"Error uploading file to S3: {e}")
        return None
    
    # Handle case where the file does not exist
    except FileNotFoundError:
        # Print error message with file path and return None
        print(f"The file {file_path} was not found.")
        return None
    
# Function to delete a file from the specified S3 bucket
def delete_file_from_S3(object_name):
    """
    Delete a file from S3 bucket
    
    args:
        object_name (str): S3 object name to delete

    returns:
        bool: True if file was deleted, False otherwise
    """
    try:
        # Delete the file
        s3_cient.delete_object(Bucket=S3_BUCKET_NAME, Key=object_name)
        
        # Return message and true if deletion was successful
        print("File deleted successfully: " + object_name)
        return True
    
    # Handle ClientError exceptions during deletion
    except ClientError as e:
        # Print the error and return false if deletion fails
        print(f"Error deleting file from S3: {e}")
        return False



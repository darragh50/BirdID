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


    


import os
from dotenv import load_dotenv
import logging

def load_environment_variables():
    """Load environment variables from a .env file in the same directory."""
    # Configure logging
    logging.basicConfig(level=logging.INFO)

    try:
        # Load the .env file from the current directory
        if not load_dotenv(override=True):
            raise FileNotFoundError(".env file not found in the current directory.")
        logging.info("Loaded environment variables from .env file")
    except FileNotFoundError as e:
        logging.error(str(e))
        return {}

    # Return the environment variables as a dictionary
    return {
        'openai_api_key': os.getenv('OPENAI_API_KEY'),
        'pinecone_key': os.getenv('PINECONE_API_KEY'),
        'pinecone_index': os.getenv('PINECONE_INDEX_NAME'),
    }

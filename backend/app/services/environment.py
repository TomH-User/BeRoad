import os
import json
from pinecone_integration import initialize_pinecone, query_pinecone_index, store_vectors_in_pinecone
from process_data import process_json_data
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


if __name__ == "__main__":
    # Load environment variables
    env_variables = load_environment_variables()

    # Initialize Pinecone
    pinecone_index = initialize_pinecone(env_variables['pinecone_key'], env_variables['pinecone_index'])

    # Load JSON input from a file named user1.json
    json_path = os.getcwd()+"\\backend\\app\\services\\user1.json"
    with open(json_path, 'r') as file:
        json_input = json.load(file)

    # Process the JSON input
    vector_object = process_json_data(json_input, env_variables)

    # Store Data in Pinecone Index
    store_vectors_in_pinecone(pinecone_index, vector_object)
    print("JSON data processed and stored.")

    # Retrieve Data from Pinecone Index
    best_matches = query_pinecone_index(pinecone_index, vector_object, top_k=3)
    print("Best matches retrieved:\n"+best_matches)
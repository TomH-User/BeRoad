import os
import json
from environment import load_environment_variables
from pinecone_integration import initialize_pinecone, query_pinecone_index, store_vectors_in_pinecone
from process_data import process_json_data

# Load environment variables
env_variables = load_environment_variables()

# Initialize Pinecone
pinecone_index = initialize_pinecone(env_variables['pinecone_key'], env_variables['pinecone_index'])

# Load JSON input from a file named user1.json
json_path = os.getcwd()+"\\backend\\app\\services\\user3.json"
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
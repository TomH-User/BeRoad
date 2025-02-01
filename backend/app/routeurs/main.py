from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List

from services.environment import load_environment_variables
from services.pinecone_integration import initialize_pinecone, query_pinecone_index, store_vectors_in_pinecone
from services.process_data import process_json_data

app = FastAPI()

env_variables = load_environment_variables()
pinecone_index = initialize_pinecone(env_variables['pinecone_key'], env_variables['pinecone_index'])

class JSONInput(BaseModel):
    data: Dict[str, Any]

class QueryResponse(BaseModel):
    matches: List[Dict[str, Any]]

@app.post("/store-vector")
async def store_vector(json_input: JSONInput):
    try:
        # Process the JSON input to a vector
        vector_object = process_json_data(json_input.data, env_variables)
        
        # Store the vector in Pinecone
        store_vectors_in_pinecone(pinecone_index, vector_object)
        
        return {"message": "JSON data processed and stored."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query-vector", response_model=QueryResponse)
async def query_vector(json_input: JSONInput):
    try:
        # Process the JSON input to a vector
        vector_object = process_json_data(json_input.data, env_variables)
        
        # Query the Pinecone index
        best_matches = query_pinecone_index(pinecone_index, vector_object, top_k=3)
        
        return {"matches": best_matches}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 

@app.get("/")
async def root():
    return {"message": "Pinecone FastAPI Integration"}
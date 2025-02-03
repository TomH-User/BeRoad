from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List

from services.environment import load_environment_variables
from services.pinecone_integration import initialize_pinecone, query_pinecone_index, store_vectors_in_pinecone
from services.process_data import process_json_data
from services.calculate_distances import compute_distance

app = FastAPI()

env_variables = load_environment_variables()
pinecone_index = initialize_pinecone(env_variables['pinecone_key'], env_variables['pinecone_index'])

class JSONInput(BaseModel):
    data: Dict[str, Any]

class QueryResponse(BaseModel):
    matches: List[Dict[str, Any]]

class DistanceInput(BaseModel):
    lat1: float
    lon1: float
    lat2: float
    lon2: float

@app.post("/store-vector")
async def store_vector(json_input: JSONInput):
    try:
        vector_object = process_json_data(json_input.data, env_variables)
        store_vectors_in_pinecone(pinecone_index, vector_object)
        return {"message": "JSON data processed and stored."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query-vector", response_model=QueryResponse)
async def query_vector(json_input: JSONInput):
    try:
        vector_object = process_json_data(json_input.data, env_variables)
        best_matches = query_pinecone_index(pinecone_index, vector_object, top_k=3)
        return {"matches": best_matches}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 

@app.post("/compute-distance")
async def compute_distance_endpoint(input_data: DistanceInput):
    try:
        distance = compute_distance(input_data.lat1, input_data.lon1, input_data.lat2, input_data.lon2)
        return {"distance_km": distance}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Pinecone FastAPI Integration"}
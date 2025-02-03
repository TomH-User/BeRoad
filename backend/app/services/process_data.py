from openai_integration import get_embedding, summarize_text
from text_processing import chunk_text

def process_json_data(json_data, env_variables):
    """Process data from JSON input."""
    # Example of processing and embedding data from JSON
    vectors = []
    combined_text = " ".join([
        json_data['pseudo'],
        json_data['email'],
        json_data['motoModel'],
        " ".join(json_data['drivingType']),
        " ".join(json_data['preferredBikeType']),
        " ".join(json_data['communityExperiences'])
    ])
    
    text_chunks = chunk_text(combined_text, max_tokens=8191)
    
    for i, chunk in enumerate(text_chunks):
        summary = summarize_text(chunk, api_key=env_variables['openai_api_key'])
        vector = get_embedding(chunk, api_key=env_variables['openai_api_key'])
        vectors.append({
            "id": json_data['email'],
            "values": vector,
            "metadata": {
                "summary": summary
            }
        })
    return vectors
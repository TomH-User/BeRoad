from pinecone import Pinecone

def initialize_pinecone(api_key, index_name):
    """Initialize a Pinecone instance."""
    pc = Pinecone(api_key=api_key)
    index = pc.Index(index_name)
    return index

def store_vectors_in_pinecone(index, vectors):
    """Store vectors in the Pinecone index."""
    index.upsert(vectors=vectors, namespace="personna")

def query_pinecone_index(index, query_vector, top_k):
    """Query the Pinecone index."""
    response = index.query(
        namespace="personna",
        vector=query_vector,
        top_k=top_k,
        include_values=False,
        include_metadata=True
    )
    return response['matches']
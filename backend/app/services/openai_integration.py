import openai

def get_embedding(text, model="text-embedding-3-large", api_key=None):
    """Get text embedding."""
    openai.api_key = api_key
    response = openai.embeddings.create(
        model=model,
        input=text,
        encoding_format="float"
    )
    return response.data[0].embedding

def summarize_text(text, model="gpt-4o", api_key=None):
    """Summarize the given text."""
    openai.api_key = api_key
    try:
        response = openai.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": f"Make a profile description out of the following informations. Ignore given links. You have 512 max length. :\n\n{text}"}],
            max_tokens=512,
            temperature=0.4
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Summary error: {str(e)}"
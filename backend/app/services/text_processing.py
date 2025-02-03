def chunk_text(text, max_tokens=8191):
    """Chunk text into manageable pieces."""
    words = text.split()
    chunks, current_chunk, current_length = [], [], 0

    for word in words:
        word_length = len(word) + 1  # Account for space
        if current_length + word_length <= max_tokens:
            current_chunk.append(word)
            current_length += word_length
        else:
            chunks.append(" ".join(current_chunk))
            current_chunk, current_length = [word], word_length

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks
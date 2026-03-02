from services.embeddings import add_documents, search, documents, load_notebook
from services.llm import generate_response
from services.extractor import extract_pdf_text, extract_url_text

def chunk_text(text, size=500):
    chunks = []
    for i in range(0, len(text), size):
        chunks.append(text[i:i+size])
    return chunks

def process_pdf(file, notebook_id):
    load_notebook(notebook_id)
    text = extract_pdf_text(file)
    chunks = chunk_text(text)
    add_documents(notebook_id, chunks)

def process_url(url, notebook_id):
    load_notebook(notebook_id)
    text = extract_url_text(url)
    chunks = chunk_text(text)
    add_documents(notebook_id, chunks)

def ask_question(question, notebook_id):
    context = search(notebook_id, question)
    prompt = f"""
    Use the context below to answer clearly:

    {context}

    Question:
    {question}
    """
    return generate_response(prompt)

def generate_podcast_from_sources(notebook_id, duration="short"):
    from services.embeddings import get_all_documents

    docs = get_all_documents(notebook_id)

    if not docs:
        return "No documents uploaded in this notebook."

    # 🔥 Scale number of chunks by duration
    if duration == "short":
        max_chunks = 6
        length_instruction = "3-5 minute episode (~600 words)"
    elif duration == "long":
        max_chunks = 15
        length_instruction = "15-20 minute deep dive (~1800 words)"
    else:
        max_chunks = 10
        length_instruction = "8-10 minute detailed episode (~1200 words)"

    total_docs = len(docs)

    # 🔥 Representative sampling across entire notebook
    if total_docs <= max_chunks:
        selected_docs = docs
    else:
        step = max(1, total_docs // max_chunks)
        selected_docs = [docs[i] for i in range(0, total_docs, step)][:max_chunks]

    context = "\n\n".join(selected_docs)

    prompt = f"""
    You are creating a highly engaging podcast episode.

    Length: {length_instruction}

    Style rules:
    - Conversational and natural
    - No stage directions
    - No character names
    - No bullet points
    - No reading punctuation aloud
    - No meta text like "Host:" or "Speaker:"
    - No special symbols

    Opening:
    Start with: "Hey everyone, welcome back to the Deep Dive."
    Immediately introduce the main theme clearly.

    Tone:
    - Curious
    - Energetic
    - Story-driven
    - Use contractions naturally
    - Smooth transitions between ideas

    Use ONLY the provided content.
    Do not hallucinate.

    Content:
    {context}

    Generate only the spoken script.
    """

    return generate_response(prompt)

import json

def generate_slides_from_sources(notebook_id):
    from services.embeddings import get_all_documents

    docs = get_all_documents(notebook_id)

    if not docs:
        return None

    total_docs = len(docs)

    # 🔥 Scale slide count based on notebook size
    if total_docs < 8:
        max_chunks = total_docs
        slide_count = 4
    elif total_docs < 20:
        max_chunks = 10
        slide_count = 6
    else:
        max_chunks = 15
        slide_count = 8

    # Representative sampling
    if total_docs <= max_chunks:
        selected_docs = docs
    else:
        step = max(1, total_docs // max_chunks)
        selected_docs = [docs[i] for i in range(0, total_docs, step)][:max_chunks]

    context = "\n\n".join(selected_docs)

    prompt = f"""
    Create a professional slide deck based ONLY on the content below.

    Requirements:
    - Total slides: {slide_count}
    - First slide: Presentation title slide
    - Remaining slides: Logical progression of key themes
    - Each slide must contain:
        - A short slide title
        - 4-6 concise bullet points
    - Bullet points must be short and presentation-friendly
    - No speaker notes
    - No storytelling tone
    - No conversational language
    - No hallucination

    IMPORTANT:
    Return output strictly as valid JSON.
    Do NOT include any text before or after the JSON.

    Required JSON format:

    {{
        "title": "Main Presentation Title",
        "slides": [
            {{
                "title": "Slide Title",
                "points": ["Point 1", "Point 2", "Point 3"]
            }}
        ]
    }}

    Content:
    {context}
    """

    response = generate_response(prompt)

    try:
        structured_data = json.loads(response)
        return structured_data
    except json.JSONDecodeError:
        # Fallback safety: return minimal structure
        return {
            "title": "Presentation",
            "slides": [
                {
                    "title": "Content Overview",
                    "points": ["Unable to parse structured slide data."]
                }
            ]
        }
    
    
'''
def generate_podcast_from_sources(notebook_id, duration="short"):
    load_notebook(notebook_id)

    docs = search(
        notebook_id,
        "Summarize key themes and important ideas from all documents",
        k=20
    )

    if not docs:
        return "No documents uploaded in this notebook."

    context = "\n\n".join(docs)

    if duration == "short":
        length_instruction = "3-5 minute episode (~600 words)"
    elif duration == "long":
        length_instruction = "15-20 minute deep dive (~2000 words)"
    else:
        length_instruction = "8-10 minute detailed episode (~1200 words)"

    prompt = f"""
    You are creating a highly engaging podcast episode.

    Length: {length_instruction}

    Style rules:
    - Conversational and natural
    - No stage directions
    - No character names
    - No bullet points
    - No reading punctuation aloud
    - No meta text like "Host:" or "Speaker:"
    - No special symbols

    Guidelines:
    Opening: Start with a high-energy welcome: "Hey everyone, welcome back to the Deep Dive." Immediately introduce the topic based on the source material.
    Conversational Tone: Use informal language, contractions, and colloquialisms ("You know" "I mean" "Right" "Exactly").
    
    Tone:
    - Curious
    - Energetic
    - Story-driven
    - Use contractions naturally
    - Smooth transitions between ideas

    Use ONLY the provided content.
    Do not hallucinate.

    Content:
    {context}

    Generate only the spoken script.
    """

    return generate_response(prompt)
'''
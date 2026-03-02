import json
from groq import Groq
from config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)

def generate_response(prompt: str):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are an expert educator and podcast host."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
    )
    return response.choices[0].message.content

def generate_podcast(topic):
    prompt = f"""
    Create an engaging podcast script with two speakers.
    Topic: {topic}
    Make it conversational and interactive.
    """
    return generate_response(prompt)

def generate_slides_content(topic: str):
    prompt = f"""
    Generate 6 presentation slides on: {topic}

    Return ONLY valid JSON in this format:
    [
      {{
        "title": "Slide Title",
        "points": ["Point 1", "Point 2", "Point 3"]
      }}
    ]
    """

    response = client.chat.completions.create(
        model="llama3-70b-8192",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
    )

    content = response.choices[0].message.content

    return json.loads(content)
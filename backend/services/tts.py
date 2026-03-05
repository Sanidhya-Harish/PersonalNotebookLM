from elevenlabs.client import ElevenLabs
from config import ELEVENLABS_API_KEY

client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

import os

async def text_to_audio(script: str, notebook_id: str):

    script = script.replace(". ", ".\n\n")
    script = script.replace("? ", "?\n\n")

    audio_stream = client.text_to_speech.convert(
        voice_id="EXAVITQu4vr4xnSDxMaL",
        model_id="eleven_multilingual_v2",
        text=script
    )

    os.makedirs("storage", exist_ok=True)

    # One file per notebook
    filename = f"{notebook_id}_podcast.mp3"
    output_path = os.path.join("storage", filename)

    with open(output_path, "wb") as f:
        for chunk in audio_stream:
            f.write(chunk)

    return f"storage/{filename}"
'''
async def text_to_audio(script: str):

    script = script.replace(". ", ".\n\n")
    script = script.replace("? ", "?\n\n")

    audio_stream = client.text_to_speech.convert(
        voice_id="EXAVITQu4vr4xnSDxMaL",
        model_id="eleven_multilingual_v2",
        text=script
    )

    output_file = "podcast.mp3"

    with open(output_file, "wb") as f:
        for chunk in audio_stream:
            f.write(chunk)

    return output_file
'''

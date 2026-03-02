import edge_tts
import asyncio

async def text_to_audio(text):
    # Add prosody styling here
    #text = f"<prosody rate='0.95' pitch='+2%'>{text}</prosody>"
    text = f"<speak><prosody rate='0.95' pitch='+2%'>{text}</prosody></speak>"
    communicate = edge_tts.Communicate(text, "en-US-AriaNeural", rate="+0%")
    file_path = "podcast.mp3"
    await communicate.save(file_path)
    return file_path
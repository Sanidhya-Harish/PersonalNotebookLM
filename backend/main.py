from fastapi import FastAPI, UploadFile, File
from services.rag import process_pdf, process_url, ask_question, generate_podcast_from_sources, generate_slides_from_sources
from services.llm import generate_podcast
from services.tts import text_to_audio
from services.llm import generate_slides_content
from services.slides import create_slides
from fastapi import Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi import HTTPException
from fastapi.staticfiles import StaticFiles

#STORAGE
import os
import shutil
STORAGE_PATH = "storage"
os.makedirs(STORAGE_PATH, exist_ok=True)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    #allow_origins=["http://localhost:3000"],
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve storage folder publicly
app.mount("/storage", StaticFiles(directory="storage"), name="storage")

@app.get("/")
def home():
    return {"message": "AI Podcast App Running 🚀"}

@app.post("/upload-pdf/")
async def upload_pdf(
    file: UploadFile = File(...),
    notebook_id: str = Query(...)
):
    notebook_path = os.path.join(STORAGE_PATH, notebook_id)

    if not os.path.exists(notebook_path):
        raise HTTPException(status_code=404, detail="Notebook not found")

    file_path = os.path.join(notebook_path, file.filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    process_pdf(file_path, notebook_id)

    return {"message": f"File uploaded to {notebook_id}"}

@app.post("/upload-url/")
async def upload_url(
    url: str,
    notebook_id: str = Query(...)
):
    process_url(url, notebook_id)
    return {"message": f"URL processed in notebook {notebook_id}"}

class AskRequest(BaseModel):
    question: str

@app.post("/ask/")
async def ask(
    request: AskRequest,
    notebook_id: str = Query(...)
):
    answer = ask_question(request.question, notebook_id)
    return {"answer": answer}

@app.post("/podcast/")
async def podcast(
    notebook_id: str = Query(...),
    duration: str = Query("short", enum=["short", "medium", "long"])
):
    script = generate_podcast_from_sources(notebook_id, duration)
    script = script.replace(". ", ".\n\n")
    script = script.replace(":", "")

    try:
        audio = await text_to_audio(script, notebook_id)
    except Exception as e:
        return {
            "notebook": notebook_id,
            "duration": duration,
            "script": script,
            "audio_file": None,
            "warning": "Audio generation failed (quota exceeded)"
        }

    return {
        "notebook": notebook_id,
        "duration": duration,
        "script": script,
        "audio_file": audio
    }

@app.post("/generate-slides/")
async def generate_slides(notebook_id: str = Query(...)):

    slide_data = generate_slides_from_sources(notebook_id)

    if not slide_data:
        return {"error": "No documents found in this notebook."}

    # Pass correct arguments to create_slides
    file_path = create_slides(notebook_id, slide_data["slides"])

    return {
        "notebook": notebook_id,
        "file": file_path
    }

@app.post("/notebook/")
async def create_notebook(name: str):
    path = os.path.join(STORAGE_PATH, name)

    if os.path.exists(path):
        raise HTTPException(status_code=400, detail="Notebook exists")

    os.makedirs(path)

    return {"message": "Notebook created"}

@app.get("/notebooks/")
async def list_notebooks():
    notebooks = [
        name for name in os.listdir(STORAGE_PATH)
        if os.path.isdir(os.path.join(STORAGE_PATH, name))
    ]
    return {"notebooks": notebooks}

@app.get("/sources/")
async def get_sources(notebook_id: str = Query(...)):
    notebook_path = os.path.join(STORAGE_PATH, notebook_id)

    if not os.path.exists(notebook_path):
        raise HTTPException(status_code=404, detail="Notebook not found")

    files = [
        f for f in os.listdir(notebook_path)
        if os.path.isfile(os.path.join(notebook_path, f))
    ]
    return {"sources": files}

@app.delete("/source/")
async def delete_source(
    notebook_id: str = Query(...),
    filename: str = Query(...)
):
    file_path = os.path.join(STORAGE_PATH, notebook_id, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    os.remove(file_path)

    return {"message": "Source deleted"}

@app.delete("/notebook/")
async def delete_notebook(notebook_id: str = Query(...)):
    notebook_path = os.path.join(STORAGE_PATH, notebook_id)

    if not os.path.exists(notebook_path):
        raise HTTPException(status_code=404, detail="Notebook not found")

    # 1️⃣ Delete notebook folder (sources)
    shutil.rmtree(notebook_path)

    # 2️⃣ Delete podcast file if exists
    podcast_file = os.path.join("storage", f"{notebook_id}_podcast.mp3")
    if os.path.exists(podcast_file):
        os.remove(podcast_file)

    # 3️⃣ Delete slides file if exists
    slides_file = os.path.join("storage", f"{notebook_id}_slides.pptx")
    if os.path.exists(slides_file):
        os.remove(slides_file)

    return {"message": "Notebook and all associated files deleted"}
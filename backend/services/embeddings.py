import os
import faiss
import numpy as np
import pickle
from sentence_transformers import SentenceTransformer

# Load embedding model once
model = SentenceTransformer("all-MiniLM-L6-v2")

BASE_PATH = "notebooks"

current_notebook_id = None
index = None
documents = []

def _get_notebook_path(notebook_id):
    return os.path.join(BASE_PATH, notebook_id)

def _get_index_path(notebook_id):
    return os.path.join(_get_notebook_path(notebook_id), "index.faiss")

def _get_docs_path(notebook_id):
    return os.path.join(_get_notebook_path(notebook_id), "documents.pkl")

def load_notebook(notebook_id):
    global current_notebook_id, index, documents

    if current_notebook_id == notebook_id:
        return  # Already loaded

    notebook_path = _get_notebook_path(notebook_id)
    os.makedirs(notebook_path, exist_ok=True)

    index_path = _get_index_path(notebook_id)
    docs_path = _get_docs_path(notebook_id)

    dimension = model.get_sentence_embedding_dimension()

    if os.path.exists(index_path):
        index = faiss.read_index(index_path)
    else:
        index = faiss.IndexFlatL2(dimension)

    if os.path.exists(docs_path):
        with open(docs_path, "rb") as f:
            documents = pickle.load(f)
    else:
        documents = []

    current_notebook_id = notebook_id

def _save_notebook(notebook_id):
    faiss.write_index(index, _get_index_path(notebook_id))
    with open(_get_docs_path(notebook_id), "wb") as f:
        pickle.dump(documents, f)

def add_documents(notebook_id, text_chunks):
    global documents, index

    load_notebook(notebook_id)

    embeddings = model.encode(text_chunks)
    embeddings = np.array(embeddings).astype("float32")

    if len(embeddings.shape) == 1:
        embeddings = embeddings.reshape(1, -1)

    index.add(embeddings)
    documents.extend(text_chunks)

    _save_notebook(notebook_id)

def search(notebook_id, query, k=5):
    load_notebook(notebook_id)

    if not documents:
        return []

    query_embedding = model.encode([query])
    query_embedding = np.array(query_embedding).astype("float32")

    D, I = index.search(query_embedding, k)
    return [documents[i] for i in I[0] if i < len(documents)]

#added
def get_all_documents(notebook_id):
    load_notebook(notebook_id)
    return documents
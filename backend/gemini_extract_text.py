import PIL.Image
from google import genai
from dotenv import load_dotenv
import os

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def extract_text(image_path):
    # 1. Setup the Client
    client = genai.Client(api_key=GEMINI_API_KEY)

    # 2. Load the image
    img = PIL.Image.open(image_path)

    # 3. Define the prompt
    prompt = "Extract the full list of ingredients from this product label. Format it as a clean, comma-separated list."

    # 4. Generate the content
    response = client.models.generate_content(
        model='gemini-2.0-flash',  # You can also use 'gemini-1.5-pro'
        contents=[prompt, img]
    )

    # 5. Output the result
    return response.text.lower().strip().split(",")
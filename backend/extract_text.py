import pytesseract
from spellchecker import SpellChecker
from PIL import Image
import re
import cv2
import numpy as np
import os

def get_ingredients(text):
    result_set = set()
    for filename in os.listdir('./ingredients'):
        with open(f"./ingredients/{filename}", 'r') as f:
            # Strip whitespace and lowercase every word
            ingredient_set = {line.strip().lower() for line in f if line.strip()}
        for word in text.split():
            if word.lower() in ingredient_set:
                result_set.add(word.lower())
    return list(result_set)

def preprocess_for_ocr(image_path):
    # Load image in grayscale
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    
    # 1. Rescale: Tesseract works best with text height of ~30 pixels
    img = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    
    # 2. Binarization: Convert to pure black and white (Otsu's Thresholding)
    _, img = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # 3. Denoising: Remove small salt-and-pepper dots
    kernel = np.ones((1, 1), np.uint8)
    img = cv2.dilate(img, kernel, iterations=1)
    img = cv2.erode(img, kernel, iterations=1)

    # Convert to PIL object for pytesseract
    img = Image.fromarray(img, mode='L')
    
    return img

def strip_hallucinations(text):
    # Remove strings of 3+ repeating non-alphanumeric chars (e.g., ....... or mmmmm)
    text = re.sub(r'([^a-zA-Z0-9\s])\1{2,}', '', text)
    
    # Remove "floating" single characters that aren't 'a' or 'i'
    # This kills things like " m " or " l " left by bullet points
    text = re.sub(r'\b(?![aiAI]\b)[a-zA-Z]\b', '', text)
    
    # Remove any word that contains a mix of letters and numbers (hallucination logic)
    # UNLESS it looks like a percentage (e.g., 30%)
    words = text.split()
    clean_words = [w for w in words if not (any(c.isdigit() for c in w) and any(c.isalpha() for c in w) and '%' not in w)]
    
    return " ".join(clean_words)

def extract_text(image_path):
    # Path for tesseract executable, may need to be updated based on your system configuration
    pytesseract.pytesseract.tesseract_cmd = "/usr/local/bin/tesseract"
    image = preprocess_for_ocr(image_path)
    text = pytesseract.image_to_string(image)

    # Use pyspellchecker to correct misspelled words in the extracted text
    spell = SpellChecker(distance=1)
    spell.word_frequency.load_text_file('./ingredients/ingredient_dictionary.txt')

    # 5. Strip hallucinations and correct spelling
    text = strip_hallucinations(text)
    words = text.split()
    misspelled = spell.unknown(words)
    corrected_text = []
    for word in words:
       word = word.strip()
       if word in misspelled:
           # Get the one most likely correction
           corrected_word = spell.correction(word)
           if (corrected_word is None):
               corrected_text.append("")
           else:
               corrected_text.append(corrected_word)
       else:
             corrected_text.append(word)
    text = " ".join(corrected_text)
    return text
    #return(get_ingredients(text))

# Testing the function with an example image
# extract_text("./image.cfm.jpeg")




# Custom dicitionary to potentially improve OCR accuracy for specific words (like ingredients)
#custom_config = f'--user-words "{word_list_path}"'
# #text = pytesseract.image_to_string(image, config=custom_config)
import pytesseract
from PIL import Image

def extract_text(image_path):
    #Path for tesseract executable, may need to be updated based on your system configuration
    pytesseract.pytesseract.tesseract_cmd = "/usr/local/bin/tesseract"
    image = Image.open(image_path)
    word_list_path = "ingredientwordlist.txt"  # Path to your custom word list

    # Custom dicitionary to potentially improve OCR accuracy for specific words (like ingredients)
    #custom_config = f'--user-words "{word_list_path}"'
    # #text = pytesseract.image_to_string(image, config=custom_config)
    text = pytesseract.image_to_string(image)
    print(text)
    return(text)
# Testing the function with an example image
# extract_text("./image.cfm.jpeg")
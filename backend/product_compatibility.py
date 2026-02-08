import gemini_extract_text


# Takes in an image path, extracts the ingredients using Gemini, and returns a set of ingredients
def extract_ingredients(image_path):
    ingredients = gemini_extract_text.extract_text(image_path)
    return calculate_compatibility(ingredients)

# Takes a list of ingredients and calculates a dictionary of compatibility scores
def calculate_compatibility(ingredients):
    # Calculate compatibility as the percentage of shared ingredients
    bad_ingredients = set()
    with open('./ingredients/drying_skin.txt', 'r') as file:
        content = file.read()
        bad_ingredients.update(content.splitlines())
    with open('./ingredients/pore_clogging.txt', 'r') as file:
        content = file.read()
        bad_ingredients.update(content.lower().splitlines())
    bad_ingredient_count = 0
    print(ingredients)
    for ingredient in ingredients:
        if any(bad_ingredient.strip().lower() in ingredient.strip().lower() for bad_ingredient in bad_ingredients):
            bad_ingredient_count += 1
    compatibility_score = 100 * (1 - bad_ingredient_count / len(ingredients))
    return compatibility_score
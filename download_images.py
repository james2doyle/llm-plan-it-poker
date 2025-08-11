import json
import requests
import os

# Load the JSON data
with open("cards.json", "r") as file:
    cards = json.load(file)

# Create a directory to store the images
if not os.path.exists("images"):
    os.makedirs("images")

# Download each image
for card in cards:
    image_url = card["image_url"]
    image_name = str.format("{}.png", card["name"][0])
    image_path = os.path.join("images", image_name)

    # Download the image
    response = requests.get(image_url)
    if response.status_code == 200:
        with open(image_path, "wb") as image_file:
            image_file.write(response.content)
        print(f"Downloaded {image_name}")
    else:
        print(f"Failed to download {image_name}")

print("Download complete.")

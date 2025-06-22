from flask import request, jsonify
from src.services.s3_service import upload_image_to_s3

def handle_image_upload():
    if 'image' not in request.files:
        return jsonify({'error': 'No image part in the request'}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        image_url = upload_image_to_s3(file)
        return jsonify({'image_url': image_url}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
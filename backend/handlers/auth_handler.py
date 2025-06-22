from flask import request, jsonify
from src.services.cognito_service import CognitoService

cognito_service = CognitoService()

def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    try:
        tokens = cognito_service.login(username, password)
        return jsonify(tokens), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401

def logout():
    data = request.json
    access_token = data.get('access_token')
    
    if not access_token:
        return jsonify({"error": "Access token is required"}), 400

    try:
        cognito_service.logout(access_token)
        return jsonify({"message": "Logged out successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401
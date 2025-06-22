# AWS Backend Project

This project is a backend application built with Python and Flask that handles user authentication using AWS Cognito and image uploads to AWS S3.

## Project Structure

```
aws-backend
├── src
│   ├── app.py                # Entry point of the application
│   ├── auth
│   │   └── cognito_auth.py   # Functions for AWS Cognito authentication
│   ├── handlers
│   │   ├── image_handler.py   # Handles image uploads from the frontend
│   │   └── auth_handler.py    # Manages authentication-related requests
│   ├── services
│   │   ├── s3_service.py      # Interacts with AWS S3 for image uploads
│   │   └── cognito_service.py  # Interacts with AWS Cognito for user management
│   └── utils
│       └── config.py         # Configuration settings for the application
├── requirements.txt           # Lists project dependencies
├── Dockerfile                 # Instructions for building the Docker image
└── README.md                  # Documentation for the project
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd aws-backend
   ```

2. **Install dependencies:**
   It is recommended to use a virtual environment. You can create one using:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
   Then install the required packages:
   ```
   pip install -r requirements.txt
   ```

3. **Configure AWS Credentials:**
   Update the `src/utils/config.py` file with your AWS credentials and region settings.

4. **Run the application:**
   You can run the application using:
   ```
   python src/app.py
   ```

## Usage

- The application provides endpoints for user authentication and image uploads.
- Refer to the individual handler files for specific endpoint details and usage instructions.

## Docker

To build and run the application using Docker, execute the following commands:

1. **Build the Docker image:**
   ```
   docker build -t aws-backend .
   ```

2. **Run the Docker container:**
   ```
   docker run -p 5000:5000 aws-backend
   ```

## Contributing

Feel free to submit issues or pull requests for any improvements or bug fixes.

## License

This project is licensed under the MIT License.
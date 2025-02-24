S.V. Aravind Eye Hospital Web Application
This project is a web application for S.V. Aravind Eye Hospital. It allows users to register, log in, and upload various documents and photos related to patient care. The application also supports downloading uploaded files as a ZIP archive.

Table of Contents
Features
Project Structure
Installation
Usage
Dependencies
License
Features
User Registration and Login
Upload and manage patient-related documents and photos
Download uploaded files as a ZIP archive
Camera integration for capturing photos
IndexedDB for local file storage
PocketBase integration for backend data management


## Project Explanation

This web application is designed to streamline the management of patient-related documents and photos at S.V. Aravind Eye Hospital. By providing a user-friendly interface, it allows hospital staff to efficiently handle patient information, ensuring that all necessary documents and images are securely stored and easily accessible. The integration with PocketBase for backend data management and IndexedDB for local storage ensures that the application is both robust and reliable. Additionally, the camera integration feature allows for real-time photo capture, further enhancing the application's utility in a clinical setting.

## Project Structure

The project is organized into the following directories and files:

- `src/`: Contains the source code for the web application.
    - `components/`: Reusable React components.
    - `pages/`: Different pages of the application.
    - `services/`: Services for handling API calls and other business logic.
    - `styles/`: CSS and styling files.
- `public/`: Static files such as images and the HTML template.
- `package.json`: Lists the project dependencies and scripts.
- `README.md`: Project documentation.

## Installation

To install and set up the project, follow these steps:

1. Clone the repository:
     ```sh
     git clone https://github.com/yourusername/aravind-eye-hospital-webapp.git
     ```
2. Navigate to the project directory:
     ```sh
     cd aravind-eye-hospital-webapp
     ```
3. Install the dependencies:
     ```sh
     npm install
     ```

## Usage

To start the development server, run:
```sh
npm start
```
This will launch the application in your default web browser. You can now interact with the application and test its features.

To build the project for production, run:
```sh
npm run build
```
This will create an optimized build of the application in the `build/` directory.

## Dependencies

The project relies on the following major dependencies:

- React: A JavaScript library for building user interfaces.
- PocketBase: A backend service for data management.
- IndexedDB: A low-level API for client-side storage of significant amounts of structured data.
- Other dependencies are listed in the `package.json` file.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
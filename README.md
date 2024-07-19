# Dayboard Hub

MondoDB UN: willnock
MongoDB Password: ux7rr3SYGwTXrobV

JWT Token for wnock (as of 17 july 2024): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2OTFlYTQ3OGJiM2EwNzRiZjM0MjNjYSIsImlhdCI6MTcyMTI1MzU3NywiZXhwIjoxNzIzODQ1NTc3fQ.pLlwno3AIlzp0y5J9o-HpW7xdT0XLExzeWHMhN5mYO0

Current github branch: revert-to-7a27f64195ba5db584831f84a244333370edea15

## Overview
Dayboard Hub is a comprehensive web application designed for yacht management, repair, and maintenance. The application allows users to manage various forms, documents, and equipment details related to yacht operations. Users can add items, fill out forms, view completed forms, and attach relevant documents to each item.

## Features
- User Authentication (Login/Logout)
- Dashboard displaying items with details
- Add new items with various categories and sub-categories
- Attach documents to items
- Fill out and submit forms
- View submitted forms

## Technologies Used
- React.js for frontend
- Node.js with Express.js for backend
- MongoDB for database
- Axios for API requests
- Multer for file uploads
- react-signature-canvas for capturing signatures

## Project Structure
dayboard_hub_new/
├── backend/
│ ├── controllers/
│ │ ├── formController.js
│ │ ├── itemController.js
│ │ ├── userController.js
│ ├── models/
│ │ ├── formDataModel.js
│ │ ├── formDefinitionModel.js
│ │ ├── itemModel.js
│ │ ├── userModel.js
│ ├── routes/
│ │ ├── formRoutes.js
│ │ ├── itemRoutes.js
│ │ ├── userRoutes.js
│ ├── app.js
│ ├── db.js
│ ├── middleware/
│ │ ├── authMiddleware.js
│ │ ├── errorMiddleware.js
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ ├── DashboardComponent.js
│ │ │ ├── LoginComponent.js
│ │ │ ├── NavbarComponent.js
│ │ │ ├── ProfileComponent.js
│ │ │ ├── RegisterComponent.js
│ │ ├── forms/
│ │ │ ├── DrillFireFormComponent.js
│ │ │ ├── ViewFormComponent.js
│ │ │ ├── forms.css
│ │ ├── App.js
│ │ ├── index.js
│ │ ├── styles.css


## Setup Instructions

### Backend Setup
1. Navigate to the `backend` directory:
    ```sh
    cd backend
    ```
2. Install dependencies:
    ```sh
    npm install
    ```
3. Create a `.env` file in the `backend` directory with the following content:
    ```env
    MONGO_URI=<your_mongodb_connection_string>
    JWT_SECRET=<your_jwt_secret>
    ```
4. Start the backend server:
    ```sh
    npm start
    ```

### Frontend Setup
1. Navigate to the `frontend` directory:
    ```sh
    cd frontend
    ```
2. Install dependencies:
    ```sh
    npm install
    ```
3. Start the frontend development server:
    ```sh
    npm start
    ```

## Steps in the Project

1. **Initial Setup and Authentication:**
    - Set up the project structure.
    - Implement user authentication (login and logout).

2. **Dashboard:**
    - Create a dashboard to display items.
    - Implement the ability to add new items with categories, sub-categories, due dates, attachments, and completion dates.
    - Display items in a table with alternating row colors and appropriate column headers.

3. **Form Handling:**
    - Implement form submission for 'Form or Checklist' items.
    - Capture and display signatures.
    - Save form data and metadata (date, time, and user) on submission.

4. **Viewing Submitted Forms:**
    - Implement the ability to view submitted forms in a read-only format.
    - Update the dashboard to indicate forms that have been completed.
    - Allow user to download the completed form as a PDF.

5. **Testing and Debugging:**
    - Test the application for any bugs or issues.
    - Implement debugging logs and error handling.

6. **UI Enhancements:**
    - Improve the UI for better usability and aesthetics.
    - Ensure the application is responsive and user-friendly.

## Current Status
As of the latest update:
- User authentication and dashboard functionalities are in place.
- Form submission for 'Drill - Fire' is implemented, including capturing signatures.
- Debugging is being implemented to resolve issues related to form submissions and attachments.

## Future Steps
- Implement remaining forms and their handling.
- Further enhance UI and UX based on user feedback.
- Conduct thorough testing and debugging to ensure stability.

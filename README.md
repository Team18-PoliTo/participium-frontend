# Participium Frontend

This is the frontend application for the Participium platform, a civic engagement system that allows citizens to report issues and track their resolution.

## Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)

## Installation

To install all the required dependencies, run:

```bash
npm install
```

## Running the Application

To start the development server, run:

```bash
npm run dev
```

The application will be available at the local address shown in your terminal (typically `http://localhost:5173`).

## Testing

This project uses Vitest for unit and component testing.

To run tests:

```bash
npm test
```

## Backend Dependency

This frontend application is designed to work in conjunction with the **participium-backend** project. Make sure the backend server is running before using this application to ensure full functionality.

## Technologies Used

- React
- React Router
- Bootstrap
- Leaflet (for map functionality)
- Vite (build tool)
- Vitest (testing framework)

## Features

- User authentication (Citizens and Employees)
- Interactive map for report creation
- Photo upload functionality
- Admin dashboard for internal users
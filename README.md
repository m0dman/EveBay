# EveBay

EveBay is a web application that displays currently open contracts for the Lux Mundi corporation in Eve Online. This allows corporation members to view contract details without being logged into the game.

## Project Structure

The solution consists of two main parts:
- `EveBay.API`: A .NET 8 Web API backend
- `evebay-client`: An Angular frontend application

## Prerequisites

- .NET 8 SDK
- Node.js (LTS version)
- Angular CLI
- Eve Online ESI API access

## Getting Started

### Backend Setup

1. Navigate to the API project:
```bash
cd EveBay.API
```

2. Restore dependencies:
```bash
dotnet restore
```

3. Run the API:
```bash
dotnet run
```

The API will be available at `https://localhost:7001` and `http://localhost:5001`

### Frontend Setup

1. Navigate to the Angular project:
```bash
cd evebay-client
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
ng serve
```

The frontend will be available at `http://localhost:4200`

## Features

- View all open contracts for Lux Mundi corporation
- Filter and search contracts
- View detailed contract information
- Real-time updates

## Development

This project uses:
- .NET 8 for the backend API
- Angular 17 for the frontend
- SCSS for styling
- TypeScript for type safety 
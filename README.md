# EveBay

EveBay is a web application designed to help EVE Online players manage and view their corporation contracts. It provides a user-friendly interface to display contract details, including item names, quantities, and financial information.

## Features

- **Contract Management**: View and manage corporation contracts, including details like type, status, title, and financial information (price, reward, collateral, buyout).
- **Item Details**: Display contract items with their names, quantities, and other attributes.
- **Responsive UI**: Built with Angular and Material Design for a modern, responsive user experience.

## Project Structure

- **Frontend (`evebay-client/`)**: Angular application providing the user interface.
- **Backend (`EveBay.API/`)**: .NET Core API handling contract data and EVE Online integration.

## Getting Started

### Prerequisites

- Node.js and npm (for the frontend)
- .NET Core SDK (for the backend)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/m0dman/EveBay.git
   cd EveBay
   ```

2. **Frontend Setup:**
   ```sh
   cd evebay-client
   npm install
   ng serve
   ```

3. **Backend Setup:**
   ```sh
   cd EveBay.API
   dotnet restore
   dotnet run
   ```

## Usage

- Open your browser and navigate to `http://localhost:4200` to access the frontend.
- The backend API will be available at `http://localhost:5000` (or the configured port).

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
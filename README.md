# Google Sheet Clone

A feature-rich web application that mimics Google Sheets with a focus on mathematical functions, data quality operations, and an intuitive spreadsheet interface.

**Live Demo**: [https://google-sheet-8.onrender.com](https://google-sheet-8.onrender.com)  
**Repository**: [https://github.com/ujjwalkumar72353/google-sheet](https://github.com/ujjwalkumar72353/google-sheet)

## 📋 Features Implementation Status

### Core Spreadsheet Interface
- [x] Google Sheets-like UI layout (toolbar, formula bar, cell grid)
- [x] Cell selection and editing capabilities
- [x] Basic cell formatting (bold, italics, font size, color)
- [x] Row and column operations (add, delete, resize)
- [x] Drag functionality for cell content and selections
- [x] Cell dependencies management

### Mathematical Functions
- [x] SUM: Calculate the sum of a range of cells
- [x] AVERAGE: Calculate the average of a range of cells
- [x] MAX: Find the maximum value in a range
- [x] MIN: Find the minimum value in a range
- [x] COUNT: Count numerical values in a range

### Data Quality Functions
- [x] TRIM: Remove leading and trailing whitespace
- [x] UPPER: Convert text to uppercase
- [x] LOWER: Convert text to lowercase
- [x] REMOVE_DUPLICATES: Remove duplicate rows from a range
- [x] FIND_AND_REPLACE: Find and replace text within a selected range

### Data Entry and Validation
- [x] Support for multiple data types (numbers, text, dates)
- [x] Basic data validation

### Bonus Features in Progress
- [x] Cell referencing (relative and absolute)
- [x] Save/load spreadsheet functionality
- [x] Data visualization (charts, graphs)

## 🛠️ Technical Architecture

### Data Structures Used

1. **Grid Matrix**: 
   - 2D array structure to represent the spreadsheet grid
   - Each cell is an object containing value, formatting, and formula properties
   - Time Complexity: O(1) for cell access, O(n²) for full grid operations
   - Space Complexity: O(n²) where n is the grid dimension

2. **Formula Parser**:
   - Recursive descent parser for evaluating cell formulas
   - Abstract Syntax Tree (AST) for representing formula expressions
   - Time Complexity: O(n) where n is the formula length
   - Space Complexity: O(n) for the AST structure

3. **Dependency Graph**:
   - Directed graph structure to track cell dependencies
   - Adjacency list implementation for efficient updates
   - Used for propagating changes when dependent cells are modified
   - Time Complexity: O(V+E) for updates (V=vertices, E=edges)
   - Space Complexity: O(V+E)

4. **Cell Selection Data Structure**:
   - Range object with start and end coordinates
   - Used for operations on multiple cells
   - Time Complexity: O(1) for range operations
   - Space Complexity: O(1)

### Tech Stack & Rationale

#### Frontend
- **React.js**: Used for its component-based architecture, virtual DOM for efficient updates, and robust ecosystem. Perfect for a cell-grid system that requires frequent re-rendering.
- **Redux**: State management to maintain spreadsheet data and cell dependencies across the application.
- **CSS Grid/Flexbox**: Used for precise layout of the spreadsheet grid and responsive design.
- **MathJS**: Library for evaluating mathematical expressions in formulas.

#### Backend
- **Node.js**: JavaScript runtime for building the server-side application.
- **Express.js**: Web framework for handling HTTP requests, middleware, and routing.
- **MongoDB**: NoSQL database for storing spreadsheet data, chosen for its flexibility with document structure.
- **Mongoose**: ODM for MongoDB to define schemas, models, and handle database operations.

#### Performance Optimizations
- Cell rendering virtualization (only visible cells are rendered)
- Memoization of expensive calculations
- Batch updates for formula recalculations
- Debounced input handling

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (local installation or Atlas connection)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/ujjwalkumar72353/google-sheet.git
   cd google-sheet
   ```

2. Install dependencies
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. Configure environment variables
   Create a `.env` file in the root directory:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   NODE_ENV=development
   ```

4. Start the development server
   ```bash
   # Run both frontend and backend
   npm run dev
   
   # Or run separately
   npm run server  # Backend only
   npm run client  # Frontend only
   ```

5. Open your browser and navigate to `http://localhost:3000`

## 🧪 Testing the Application

### Mathematical Functions
1. Select a range of cells containing numbers
2. In a new cell, type a formula (e.g., `=SUM(A1:A5)`)
3. Press Enter to see the result

### Data Quality Functions
1. Enter text in a cell (e.g., "  Example Text  ")
2. In another cell, use a function (e.g., `=TRIM(A1)`)
3. Press Enter to see the result

### Cell Operations
- Select cells by clicking or dragging
- Format cells using the toolbar options
- Resize rows/columns by dragging their borders
- Add/delete rows or columns using the context menu

## 📊 Implementation Details

### Formula Processing Workflow
1. User enters a formula in a cell
2. Formula parser tokenizes and validates the input
3. AST is constructed from tokens
4. Dependency graph is updated
5. Formula is evaluated and result displayed
6. Cell listeners are set up for dependent cells

### Cell Dependency Management
- Cells store references to dependent cells
- When a cell's value changes, all dependent cells are recalculated
- Circular references are detected and prevented

### Data Validation
- Type checking for numerical operations
- Input sanitization for text functions
- Error handling for invalid formulas or references

## 🔜 Future Enhancements

1. **Advanced Formula Support**
   - Logical functions (IF, AND, OR)
   - Lookup functions (VLOOKUP, HLOOKUP)
   - Date and time functions

2. **Collaborative Editing**
   - Real-time updates using WebSockets
   - User presence indicators
   - Conflict resolution

3. **Data Visualization**
   - Interactive charts (bar, line, pie)
   - Conditional formatting
   - Sparklines in cells

4. **Performance Optimizations**
   - Worker threads for formula calculations
   - Improved cell virtualization
   - Optimized dependency tracking

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Created by [Ujjwal Kumar](https://github.com/ujjwalkumar72353)

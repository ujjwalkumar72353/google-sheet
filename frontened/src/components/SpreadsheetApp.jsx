
/* eslint-disable no-unused-vars */

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaSave, FaUpload, FaBold, FaItalic, FaFont, FaPalette, FaPlus, FaMinus, FaSort, FaSearch, FaChartBar } from 'react-icons/fa';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend, LineElement, PointElement, ArcElement } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import './SpreadsheetApp.css';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement
);

const API_BASE_URL = 'http://localhost:9000/api/sheets';

const SpreadsheetApp = () => {
  // State variables
  const [data, setData] = useState([]);
  const [selectedCell, setSelectedCell] = useState({ row: null, col: null });
  const [formulaInput, setFormulaInput] = useState('');
  const [sheetName, setSheetName] = useState('Untitled Spreadsheet');
  const [isDragging, setIsDragging] = useState(false);
  const [isFilling, setIsFilling] = useState(false);
  const [dragStart, setDragStart] = useState({ row: null, col: null });
  const [selection, setSelection] = useState({ start: null, end: null });
  const [cellStyles, setCellStyles] = useState({});
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [savedSheets, setSavedSheets] = useState([]);
  const [columnWidths, setColumnWidths] = useState({});
  const [rowHeights, setRowHeights] = useState({});
  const [activeFunction, setActiveFunction] = useState(null);
  const [fontSize, setFontSize] = useState('14px');
  const [fontColor, setFontColor] = useState('#000000');
  const [chartType, setChartType] = useState('bar');
  const [chartData, setChartData] = useState(null);
  const [chartOpen, setChartOpen] = useState(false);
  const [dependencyGraph, setDependencyGraph] = useState({});
  const [validationRules, setValidationRules] = useState({});
  const gridRef = useRef(null);

  const ROWS = 50;
  const COLS = 26; // A to Z

  
  useEffect(() => {
    const initialData = Array(ROWS).fill().map(() => Array(COLS).fill(''));
    setData(initialData);
    fetchSavedSheets();
  }, []);

  
  const fetchSavedSheets = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setSavedSheets(response.data);
    } catch (error) {
      console.error('Error fetching sheets:', error);
    }
  };

  
  const getColumnHeader = (index) => {
    return String.fromCharCode(65 + index);
  };

  
  const handleCellClick = (row, col) => {
    setSelectedCell({ row, col });
    const cellValue = getCellValue(row, col);
    const cellFormula = getCellFormula(row, col);
    setFormulaInput(cellFormula || cellValue);
    setSelection({ start: { row, col }, end: { row, col } });
  };

  
  const getCellValue = (row, col) => {
    const cellContent = data[row][col];
    if (String(cellContent).startsWith('=')) {
      return evaluateFormula(cellContent, row, col);
    }
    return cellContent;
  };

  
  const getCellFormula = (row, col) => {
    const cellContent = data[row][col];
    if (String(cellContent).startsWith('=')) {
      return cellContent;
    }
    return '';
  };

  
  const handleFormulaChange = (e) => {
    setFormulaInput(e.target.value);
  };

  
  const applyFormula = () => {
    if (selectedCell.row === null) return;
    const newData = [...data];
    newData[selectedCell.row][selectedCell.col] = formulaInput;
    setData(newData);
    updateDependencies(selectedCell.row, selectedCell.col, formulaInput);
    reevaluateDependentCells(selectedCell.row, selectedCell.col);
  };

  
  const handleFormulaKeyPress = (e) => {
    if (e.key === 'Enter') {
      applyFormula();
    }
  };

  
  const handleCellEdit = (e, row, col) => {
    const newValue = e.target.value;
    const cellKey = `${row}-${col}`;
    const rule = validationRules[cellKey];
    
    
    if (rule && !validateCell(newValue, rule)) {
      
      alert(`Invalid ${rule} value!`);
      return;
    }
    
    const newData = [...data];
    newData[row][col] = newValue;
    setData(newData);
    setFormulaInput(newValue);
    updateDependencies(row, col, newValue);
    reevaluateDependentCells(row, col);
  };

  
  const validateCell = (value, rule) => {
    switch (rule) {
      case 'number':
        return !isNaN(parseFloat(value)) && isFinite(value);
      case 'text':
        return typeof value === 'string';
      case 'date':
        return !isNaN(Date.parse(value));
      default:
        return true;
    }
  };
  
  const setValidationRule = (rule) => {
    const { startRow, endRow, startCol, endCol } = getSelectionRange();
    const newValidationRules = { ...validationRules };
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        newValidationRules[`${row}-${col}`] = rule;
      }
    }
    setValidationRules(newValidationRules);
  };
  
  
const handleMouseDown = (row, col) => {
  setIsDragging(true);
  setDragStart({ row, col });
  setSelection({ start: { row, col }, end: { row, col } });
};


const handleMouseOver = (row, col) => {
  if (isDragging) {
    setSelection({ start: dragStart, end: { row, col } });
  }
};


const handleMouseUp = () => {
  setIsDragging(false);
};
 
const handleFillHandleMouseDown = (row, col) => {
  setIsFilling(true);
  setDragStart({ row, col });
};


const handleFillMouseMove = (row, col) => {
  if (isFilling) {
    const { row: startRow, col: startCol } = dragStart;
    const newData = [...data];
    const sourceValue = newData[startRow][startCol];
    for (let r = Math.min(startRow, row); r <= Math.max(startRow, row); r++) {
      for (let c = Math.min(startCol, col); c <= Math.max(startCol, col); c++) {
        newData[r][c] = sourceValue;
      }
    }
    setData(newData);
  }
};


const handleFillMouseUp = () => {
  setIsFilling(false);
};


const handleCellDragStart = (e, row, col) => {
  const cellValue = getCellValue(row, col);
  e.dataTransfer.setData('text/plain', cellValue);
  e.dataTransfer.setData('application/json', JSON.stringify({ row, col }));
  e.target.classList.add('dragging'); 
};


const handleCellDragOver = (e) => {
  e.preventDefault(); 
};


const handleCellDrop = (e, row, col) => {
  e.preventDefault();
  const sourceData = JSON.parse(e.dataTransfer.getData('application/json'));
  const sourceRow = sourceData.row;
  const sourceCol = sourceData.col;
  const cellValue = e.dataTransfer.getData('text/plain');

  const newData = [...data];
  newData[row][col] = cellValue;
  newData[sourceRow][sourceCol] = '';

  setData(newData);

 
  e.target.classList.remove('dragging');
};
  
  const getSelectionRange = () => {
    if (!selection.start || !selection.end) return { startRow: 0, endRow: 0, startCol: 0, endCol: 0 };
    const startRow = Math.min(selection.start.row, selection.end.row);
    const endRow = Math.max(selection.start.row, selection.end.row);
    const startCol = Math.min(selection.start.col, selection.end.col);
    const endCol = Math.max(selection.start.col, selection.end.col);
    return { startRow, endRow, startCol, endCol };
  };


  const isCellSelected = (row, col) => {
    if (!selection.start || !selection.end) return false;
    const { startRow, endRow, startCol, endCol } = getSelectionRange();
    return row >= startRow && row <= endRow && col >= startCol && col <= endCol;
  };

 
  const applyBold = () => {
    applyStyleToSelection('fontWeight', 'bold');
  };

  const applyItalic = () => {
    applyStyleToSelection('fontStyle', 'italic');
  };

  const applyFontSize = () => {
    applyStyleToSelection('fontSize', fontSize);
  };

  const applyFontColor = () => {
    applyStyleToSelection('color', fontColor);
  };

  const applyStyleToSelection = (styleProperty, styleValue) => {
    const { startRow, endRow, startCol, endCol } = getSelectionRange();
    const newStyles = { ...cellStyles };
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const cellId = `${row}-${col}`;
        newStyles[cellId] = { ...(newStyles[cellId] || {}), [styleProperty]: styleValue };
      }
    }
    setCellStyles(newStyles);
  };

  
const getCellStyle = (row, col) => {
  const cellId = `${row}-${col}`;
  const baseStyle = cellStyles[cellId] || {};
  
 
  if (validationRules[cellId]) {
    return {
      ...baseStyle,
      borderBottom: '2px solid green', 
    };
  }
  
  return baseStyle;
};
  

 
  const sumFunction = (range) => {
    let sum = 0;
    const { startRow, endRow, startCol, endCol } = range;
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const value = parseFloat(getCellValue(row, col));
        if (!isNaN(value)) {
          sum += value;
        }
      }
    }
    return sum;
  };

  const averageFunction = (range) => {
    let sum = 0;
    let count = 0;
    const { startRow, endRow, startCol, endCol } = range;
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const value = parseFloat(getCellValue(row, col));
        if (!isNaN(value)) {
          sum += value;
          count++;
        }
      }
    }
    return count > 0 ? sum / count : 0;
  };

  const maxFunction = (range) => {
    let max = Number.NEGATIVE_INFINITY;
    const { startRow, endRow, startCol, endCol } = range;
    let found = false;
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const value = parseFloat(getCellValue(row, col));
        if (!isNaN(value)) {
          max = Math.max(max, value);
          found = true;
        }
      }
    }
    return found ? max : 0;
  };

  const minFunction = (range) => {
    let min = Number.POSITIVE_INFINITY;
    const { startRow, endRow, startCol, endCol } = range;
    let found = false;
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const value = parseFloat(getCellValue(row, col));
        if (!isNaN(value)) {
          min = Math.min(min, value);
          found = true;
        }
      }
    }
    return found ? min : 0;
  };

  const countFunction = (range) => {
    let count = 0;
    const { startRow, endRow, startCol, endCol } = range;
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const value = parseFloat(getCellValue(row, col));
        if (!isNaN(value)) {
          count++;
        }
      }
    }
    return count;
  };

  const productFunction = (range) => {
    let product = 1;
    const { startRow, endRow, startCol, endCol } = range;
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const value = parseFloat(getCellValue(row, col));
        if (!isNaN(value)) {
          product *= value;
        }
      }
    }
    return product;
  };

  const trimFunction = (cellRef) => {
    const { row, col } = cellRef;
    const cellValue = getCellValue(row, col);
    return String(cellValue).trim();
  };

  const upperFunction = (cellRef) => {
    const { row, col } = cellRef;
    const cellValue = getCellValue(row, col);
    return String(cellValue).toUpperCase();
  };

  const lowerFunction = (cellRef) => {
    const { row, col } = cellRef;
    const cellValue = getCellValue(row, col);
    return String(cellValue).toLowerCase();
  };

  const removeDuplicates = () => {
    const range = getSelectionRange();
    if (!range || range.startRow === undefined) {
      console.log("No valid selection made!");
      return;
    }
    const { startRow, endRow, startCol, endCol } = range;
    const newData = data.map(row => [...row]);
    const seenRows = new Set();
    const uniqueRows = [];
    for (let row = startRow; row <= endRow; row++) {
      const rowKey = newData[row]
        .slice(startCol, endCol + 1)
        .map(cell => String(cell).trim().toLowerCase())
        .join("|");
      if (!seenRows.has(rowKey)) {
        seenRows.add(rowKey);
        uniqueRows.push(newData[row]);
      }
    }
    let rowIdx = startRow;
    uniqueRows.forEach(row => {
      newData[rowIdx] = row;
      rowIdx++;
    });
    for (; rowIdx <= endRow; rowIdx++) {
      newData[rowIdx] = Array(COLS).fill("");
    }
    setData(newData);
  };

  const findAndReplace = () => {
    if (!findText) return;
    const { startRow, endRow, startCol, endCol } = getSelectionRange();
    const newData = [...data];
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const cellValue = String(getCellValue(row, col));
        if (cellValue.includes(findText)) {
          newData[row][col] = cellValue.replaceAll(findText, replaceText);
        }
      }
    }
    setData(newData);
    setFindReplaceOpen(false);
    setFindText('');
    setReplaceText('');
  };

  
  const evaluateFormula = (formula, row, col) => {
    if (!formula || !formula.startsWith('=')) return formula;
    try {
      const expression = formula.substring(1).trim().toUpperCase();
      if (expression.startsWith('SUM(') && expression.endsWith(')')) {
        const range = parseRange(expression.substring(4, expression.length - 1));
        return sumFunction(range);
      }
      if (expression.startsWith('AVERAGE(') && expression.endsWith(')')) {
        const range = parseRange(expression.substring(8, expression.length - 1));
        return averageFunction(range);
      }
      if (expression.startsWith('MAX(') && expression.endsWith(')')) {
        const range = parseRange(expression.substring(4, expression.length - 1));
        return maxFunction(range);
      }
      if (expression.startsWith('MIN(') && expression.endsWith(')')) {
        const range = parseRange(expression.substring(4, expression.length - 1));
        return minFunction(range);
      }
      if (expression.startsWith('COUNT(') && expression.endsWith(')')) {
        const range = parseRange(expression.substring(6, expression.length - 1));
        return countFunction(range);
      }
      if (expression.startsWith('PRODUCT(') && expression.endsWith(')')) {
        const range = parseRange(expression.substring(8, expression.length - 1));
        return productFunction(range);
      }
      
      if (expression.startsWith('TRIM(') && expression.endsWith(')')) {
        const cellRef = parseCellReference(expression.substring(5, expression.length - 1));
        return trimFunction(cellRef);
      }
      if (expression.startsWith('UPPER(') && expression.endsWith(')')) {
        const cellRef = parseCellReference(expression.substring(6, expression.length - 1));
        return upperFunction(cellRef);
      }
      if (expression.startsWith('LOWER(') && expression.endsWith(')')) {
        const cellRef = parseCellReference(expression.substring(6, expression.length - 1));
        return lowerFunction(cellRef);
      }
      return '#ERROR!';
    } catch (error) {
      return '#ERROR!';
    }
  };
    const parseCellReference = (ref) => {
    try {
      
      ref = ref.toUpperCase().replace(/\$/g, '');
      
     
      const match = ref.match(/([A-Z]+)(\d+)/);
      if (!match) {
        return null;
      }
      
      const colStr = match[1];
      const rowStr = match[2];
      
     
      let colNum = 0;
      for (let i = 0; i < colStr.length; i++) {
        colNum = colNum * 26 + (colStr.charCodeAt(i) - 64);
      }
      colNum--; 
      
     
      const rowNum = parseInt(rowStr) - 1;
      
     
      if (colNum < 0 || colNum >= COLS || rowNum < 0 || rowNum >= ROWS) {
        console.warn(`Cell reference out of bounds: ${ref}`);
        return null;
      }
      
      return { row: rowNum, col: colNum };
    } catch (error) {
      console.error(`Error parsing cell reference ${ref}:`, error);
      return null;
    }
  };


  const parseRange = (rangeStr) => {
    const [start, end] = rangeStr.split(':');
    const startRef = parseCellReference(start);
    const endRef = parseCellReference(end);
    return { startRow: startRef.row, endRow: endRef.row, startCol: startRef.col, endCol: endRef.col };
  };

 
  const updateDependencies = (row, col, formula) => {
    const newGraph = { ...dependencyGraph };
    const cellKey = `${row}-${col}`;

   
    Object.keys(newGraph).forEach((key) => {
      newGraph[key] = newGraph[key].filter((dep) => dep !== cellKey);
    });

   
    if (formula.startsWith('=')) {
      const referencedCells = formula.match(/[A-Z]+\d+/g) || [];
      referencedCells.forEach((ref) => {
        const [refCol, refRow] = parseCellReference(ref);
        const refKey = `${refRow}-${refCol}`;
        if (!newGraph[refKey]) newGraph[refKey] = [];
        newGraph[refKey].push(cellKey);
      });
    }

    setDependencyGraph(newGraph);
  };

  
  const reevaluateDependentCells = (row, col) => {
    const cellKey = `${row}-${col}`;
    const dependentCells = dependencyGraph[cellKey] || [];
    dependentCells.forEach((dep) => {
      const [depRow, depCol] = dep.split('-').map(Number);
      const formula = data[depRow][depCol];
      if (formula.startsWith('=')) {
        const newValue = evaluateFormula(formula, depRow, depCol);
        const newData = [...data];
        newData[depRow][depCol] = newValue;
        setData(newData);
      }
    });
  };

 


  
  const saveSheet = async () => {
    try {
      await axios.post(API_BASE_URL, {
        name: sheetName,
        data: data,
        styles: cellStyles,
        columnWidths,
        rowHeights,
        validationRules,
      });
      alert('Sheet saved successfully!');
      fetchSavedSheets();
    } catch (error) {
      console.error('Error saving sheet:', error);
      alert('Failed to save sheet.');
    }
  };
  
  const loadSheet = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      setData(response.data.data);
      setCellStyles(response.data.styles || {});
      setColumnWidths(response.data.columnWidths || {});
      setRowHeights(response.data.rowHeights || {});
      setSheetName(response.data.name);
      setValidationRules(response.data.validationRules || {}); // Add this line
    } catch (error) {
      console.error('Error loading sheet:', error);
      alert('Failed to load sheet.');
    }
  };

  
  const addRow = () => {
    const { startRow } = getSelectionRange();
    const newData = [...data];
    newData.splice(startRow + 1, 0, Array(COLS).fill(''));
    newData.pop();
    setData(newData);
  };

  
  const deleteRow = () => {
    const { startRow } = getSelectionRange();
    const newData = [...data];
    newData.splice(startRow, 1);
    newData.push(Array(COLS).fill(''));
    setData(newData);
  };

  
  const addColumn = () => {
    const { startCol } = getSelectionRange();
    const newData = data.map(row => {
      const newRow = [...row];
      newRow.splice(startCol + 1, 0, '');
      newRow.pop();
      return newRow;
    });
    setData(newData);
  };

  
  const deleteColumn = () => {
    const { startCol } = getSelectionRange();
    const newData = data.map(row => {
      const newRow = [...row];
      newRow.splice(startCol, 1);
      newRow.push('');
      return newRow;
    });
    setData(newData);
  };

 
  const handleRowResize = (row, newHeight) => {
  setRowHeights(prevHeights => ({
    ...prevHeights,
    [row]: newHeight
  }));
};

const handleColumnResize = (col, newWidth) => {
  setColumnWidths((prevWidths) => ({
    ...prevWidths,
    [col]: newWidth,
  }));
};

  

  
  const applyFunction = (funcName) => {
    const { startRow, endRow, startCol, endCol } = getSelectionRange();
  
   
      const startCell = getColumnHeader(startCol) + (startRow + 1);
      const endCell = getColumnHeader(endCol) + (endRow + 1);
      const formulaText = `=${funcName}(${startCell}:${endCell})`;
      setFormulaInput(formulaText);
    
  
    setActiveFunction(funcName);
  };
  
  
  const applyDataQualityFunction = (funcName) => {
    if (selectedCell.row === null) return;
    const cellRef = getColumnHeader(selectedCell.col) + (selectedCell.row + 1);
    const formulaText = `=${funcName}(${cellRef})`;
    setFormulaInput(formulaText);
    setActiveFunction(funcName);
  };

 
  const generateChartData = () => {
    const { startRow, endRow, startCol, endCol } = getSelectionRange();
    const labels = [];
    const values = [];
    for (let row = startRow; row <= endRow; row++) {
      labels.push(`Row ${row + 1}`);
      let rowSum = 0;
      for (let col = startCol; col <= endCol; col++) {
        const value = parseFloat(getCellValue(row, col));
        if (!isNaN(value)) {
          rowSum += value;
        }
      }
      values.push(rowSum);
    }
    return {
      labels,
      datasets: [{
        label: 'Data',
        data: values,
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1
      }]
    };
  };

  
  const openChartModal = () => {
    const chartData = generateChartData();
    setChartData(chartData);
    setChartOpen(true);
  };

 
  const closeChartModal = () => {
    setChartOpen(false);
  };

  return (
    <div className="spreadsheet-app">
      <div className="toolbar">
       
       <div className="validation-actions">
  <button onClick={() => setValidationRule('number')}>Validate as Number</button>
  <button onClick={() => setValidationRule('text')}>Validate as Text</button>
  <button onClick={() => setValidationRule('date')}>Validate as Date</button>
</div>
        <div className="sheet-title">
          <input type="text" value={sheetName} onChange={(e) => setSheetName(e.target.value)} className="sheet-name-input" />
        </div>
        <div className="toolbar-actions">
          <button onClick={saveSheet} title="Save Sheet">
            <FaSave />
          </button>
          <select onChange={(e) => e.target.value && loadSheet(e.target.value)} value="" className="load-select">
            <option value="">Load Sheet</option>
            {savedSheets?.map?.(sheet => (
              <option key={sheet._id} value={sheet._id}>{sheet.name}</option>
            )) ?? <option disabled>No sheets available</option>}
          </select>
          <span className="separator">|</span>
          <button onClick={applyBold} title="Bold">
            <FaBold />
          </button>
          <button onClick={applyItalic} title="Italic">
            <FaItalic />
          </button>
          <span className="separator">|</span>
          <div className="font-size-selector">
            <label>Font Size:</label>
            <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
              <option value="12px">12px</option>
              <option value="14px">14px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
              <option value="20px">20px</option>
            </select>
            <button onClick={applyFontSize}>Apply</button>
          </div>
          <div className="font-color-selector">
            <label>Font Color:</label>
            <input type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} />
            <button onClick={applyFontColor}>Apply</button>
          </div>
          <span className="separator">|</span>
          <button onClick={addRow} title="Add Row">
            <FaPlus /> Row
          </button>
          <button onClick={deleteRow} title="Delete Row">
            <FaMinus /> Row
          </button>
          <button onClick={addColumn} title="Add Column">
            <FaPlus /> Col
          </button>
          <button onClick={deleteColumn} title="Delete Column">
            <FaMinus /> Col
          </button>
          <span className="separator">|</span>
          <div className="math-functions">
            <button onClick={() => applyFunction('SUM')} className={activeFunction === 'SUM' ? 'active' : ''}>
              SUM
            </button>
            <button onClick={() => applyFunction('AVERAGE')} className={activeFunction === 'AVERAGE' ? 'active' : ''}>
              AVERAGE
            </button>
            <button onClick={() => applyFunction('MAX')} className={activeFunction === 'MAX' ? 'active' : ''}>
              MAX
            </button>
            <button onClick={() => applyFunction('MIN')} className={activeFunction === 'MIN' ? 'active' : ''}>
              MIN
            </button>
            <button onClick={() => applyFunction('COUNT')} className={activeFunction === 'COUNT' ? 'active' : ''}>
              COUNT
            </button>
            <button onClick={() => applyFunction('PRODUCT')} className={activeFunction === 'PRODUCT' ? 'active' : ''}>
              PRODUCT
            </button>
            
          </div>
          <span className="separator">|</span>
          <div className="data-quality-functions">
            <button onClick={() => applyDataQualityFunction('TRIM')} className={activeFunction === 'TRIM' ? 'active' : ''}>
              TRIM
            </button>
            <button onClick={() => applyDataQualityFunction('UPPER')} className={activeFunction === 'UPPER' ? 'active' : ''}>
              UPPER
            </button>
            <button onClick={() => applyDataQualityFunction('LOWER')} className={activeFunction === 'LOWER' ? 'active' : ''}>
              LOWER
            </button>
            <button onClick={removeDuplicates}>
              REMOVE_DUPLICATES
            </button>
            <button onClick={() => setFindReplaceOpen(true)}>
              <FaSearch /> FIND_REPLACE
            </button>
          </div>
          <span className="separator">|</span>
          <div className="chart-functions">
            <button onClick={openChartModal} title="Create Chart">
              <FaChartBar /> Create Chart
            </button>
          </div>
        </div>
      </div>
      <div className="formula-bar">
        <div className="cell-address">
          {selectedCell.row !== null && `${getColumnHeader(selectedCell.col)}${selectedCell.row + 1}`}
        </div>
        <span className="formula-prefix">=</span>
        <input type="text" value={formulaInput} onChange={handleFormulaChange} onKeyPress={handleFormulaKeyPress} className="formula-input" />
        <button onClick={applyFormula} className="apply-formula">
          Apply
        </button>
      </div>
      <div className="spreadsheet-grid" ref={gridRef} onMouseUp={handleMouseUp}>
      <div className="column-headers">
  <div className="corner-cell"></div>
  {Array(COLS).fill().map((_, col) => (
    <div
      key={col}
      className="column-header"
      style={{ width: columnWidths[col] || 100 }} 
    >
      {getColumnHeader(col)}
      <div
        className="column-resize-handle"
        onMouseDown={(e) => {
          e.stopPropagation(); 
          e.preventDefault(); 
          const startX = e.clientX;
          const startWidth = columnWidths[col] || 100;
          const handleMouseMove = (moveEvent) => {
            const delta = moveEvent.clientX - startX;
            handleColumnResize(col, Math.max(50, startWidth + delta));
          };
          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
      ></div>
    </div>
  ))}
</div>
        <div className="grid-body">
  {data.map((row, rowIndex) => (
    <div
      key={rowIndex}
      className="grid-row"
      style={{ height: rowHeights[rowIndex] || 24 }} 
    >
      <div className="row-header" style={{ height: rowHeights[rowIndex] || 24 }}>
        {rowIndex + 1}
        <div
          className="row-resize-handle"
          onMouseDown={(e) => {
            e.stopPropagation();
            const startY = e.clientY;
            const startHeight = rowHeights[rowIndex] || 24;
            const handleMouseMove = (moveEvent) => {
              const delta = moveEvent.clientY - startY;
              handleRowResize(rowIndex, Math.max(18, startHeight + delta));
            };
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        ></div>
      </div>
      {row.map((cell, colIndex) => (
  <div
    key={colIndex}
    className={`grid-cell ${isCellSelected(rowIndex, colIndex) ? 'selected' : ''} ${
      selectedCell.row === rowIndex && selectedCell.col === colIndex ? 'active' : ''
    }`}
    onClick={() => handleCellClick(rowIndex, colIndex)}
    onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
    onMouseOver={() => handleMouseOver(rowIndex, colIndex)}
    onDragStart={(e) => handleCellDragStart(e, rowIndex, colIndex)}
    onDragOver={handleCellDragOver}
    onDrop={(e) => handleCellDrop(e, rowIndex, colIndex)}
    style={{
      ...getCellStyle(rowIndex, colIndex),
      width: columnWidths[colIndex] || 100, 
      height: rowHeights[rowIndex] || 24, 
    }}
    draggable
  >
    <input
      type="text"
      value={String(getCellValue(rowIndex, colIndex))}
      onChange={(e) => handleCellEdit(e, rowIndex, colIndex)}
      style={getCellStyle(rowIndex, colIndex)}
      className="cell-input"
    />
    {selectedCell.row === rowIndex && selectedCell.col === colIndex && (
      <div
        className="fill-handle"
        onMouseDown={() => handleFillHandleMouseDown(rowIndex, colIndex)}
        onMouseMove={() => handleFillMouseMove(rowIndex, colIndex)}
        onMouseUp={handleFillMouseUp}
      ></div>
    )}
  </div>
))}
    </div>
  ))}
</div>
      </div>
      {findReplaceOpen && (
        <div className="find-replace-modal">
          <h3>Find and Replace</h3>
          <div className="find-replace-inputs">
            <div>
              <label>Find:</label>
              <input type="text" value={findText} onChange={(e) => setFindText(e.target.value)} />
            </div>
            <div>
              <label>Replace:</label>
              <input type="text" value={replaceText} onChange={(e) => setReplaceText(e.target.value)} />
            </div>
          </div>
          <div className="find-replace-actions">
            <button onClick={findAndReplace}>Replace All</button>
            <button onClick={() => setFindReplaceOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
      {chartOpen && (
        <div className="chart-modal">
          <h3>Chart</h3>
          <div className="chart-type-selector">
            <label>Chart Type:</label>
            <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="pie">Pie Chart</option>
            </select>
          </div>
          <div className="chart-container">
            {chartType === 'bar' && <Bar data={chartData} />}
            {chartType === 'line' && <Line data={chartData} />}
            {chartType === 'pie' && <Pie data={chartData} />}
          </div>
          <div className="chart-actions">
            <button onClick={closeChartModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpreadsheetApp; 
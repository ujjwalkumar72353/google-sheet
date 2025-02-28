import { create } from "zustand";

export const useStore = create((set) => ({
  hotInstance: null,
  setHotInstance: (hot) => set({ hotInstance: hot }),

  evaluateFunction: (type) => {
    const { hotInstance } = useStore.getState();
    if (!hotInstance) return;

    const selected = hotInstance.getSelected();
    if (!selected) return alert("Select a range!");

    const [rowStart, colStart, rowEnd, colEnd] = selected[0];
    let values = [];

    for (let r = rowStart; r <= rowEnd; r++) {
      for (let c = colStart; c <= colEnd; c++) {
        const cellValue = parseFloat(hotInstance.getDataAtCell(r, c));
        if (!isNaN(cellValue)) values.push(cellValue);
      }
    }

    let result = 0;
    switch (type) {
      case "SUM":
        result = values.reduce((a, b) => a + b, 0);
        break;
      case "AVERAGE":
        result = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        break;
      case "MAX":
        result = Math.max(...values);
        break;
      case "MIN":
        result = Math.min(...values);
        break;
      case "COUNT":
        result = values.length;
        break;
      default:
        return;
    }

    alert(`${type}: ${result}`);
  },

  formatText: (type) => {
    const { hotInstance } = useStore.getState();
    if (!hotInstance) return;

    const selected = hotInstance.getSelected();
    if (!selected) return alert("Select a range!");

    const [row, col] = selected[0];
    let value = hotInstance.getDataAtCell(row, col) || "";

    switch (type) {
      case "TRIM":
        value = value.trim();
        break;
      case "UPPER":
        value = value.toUpperCase();
        break;
      case "LOWER":
        value = value.toLowerCase();
        break;
      default:
        return;
    }

    hotInstance.setDataAtCell(row, col, value);
  },

  findAndReplace: (findText, replaceText) => {
    const { hotInstance } = useStore.getState();
    if (!hotInstance) return;

    hotInstance.getData().forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell && typeof cell === "string" && cell.includes(findText)) {
          hotInstance.setDataAtCell(rowIndex, colIndex, cell.replace(findText, replaceText));
        }
      });
    });
  },

  removeDuplicates: () => {
    const { hotInstance } = useStore.getState();
    if (!hotInstance) return;

    const data = hotInstance.getData();
    const uniqueData = [...new Set(data.map(row => JSON.stringify(row)))].map(row => JSON.parse(row));

    hotInstance.loadData(uniqueData);
  }
}));

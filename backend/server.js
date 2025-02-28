const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 9000;




app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


mongoose.connect(process.env.MONGODB_URI )
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));




const sheetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'Untitled Spreadsheet'
  },
  data: {
    type: [[mongoose.Schema.Types.Mixed]],
    required: true
  },
  styles: {
    type: Map,
    of: Map,
    default: {}
  },
  columnWidths: {
    type: Map,
    of: Number,
    default: {}
  },
  rowHeights: {
    type: Map,
    of: Number,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Sheet = mongoose.model('Sheet', sheetSchema);


app.get('/api/sheets', async (req, res) => {
  try {
    const sheets = await Sheet.find({}, 'name createdAt updatedAt');
    res.json(sheets);
  } catch (error) {
    console.error('Error fetching sheets:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/api/sheets/:id', async (req, res) => {
  try {
    const sheet = await Sheet.findById(req.params.id);
    if (!sheet) {
      return res.status(404).json({ message: 'Sheet not found' });
    }
    res.json(sheet);
  } catch (error) {
    console.error('Error fetching sheet:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/api/sheets', async (req, res) => {
  try {
    const { name, data, styles, columnWidths, rowHeights } = req.body;
    
    const newSheet = new Sheet({
      name,
      data,
      styles,
      columnWidths,
      rowHeights
    });
    
    const savedSheet = await newSheet.save();
    res.status(201).json(savedSheet);
  } catch (error) {
    console.error('Error creating sheet:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.put('/api/sheets/:id', async (req, res) => {
  try {
    const { name, data, styles, columnWidths, rowHeights } = req.body;
    
    const updatedSheet = await Sheet.findByIdAndUpdate(
      req.params.id,
      {
        name,
        data,
        styles,
        columnWidths,
        rowHeights,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!updatedSheet) {
      return res.status(404).json({ message: 'Sheet not found' });
    }
    
    res.json(updatedSheet);
  } catch (error) {
    console.error('Error updating sheet:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.delete('/api/sheets/:id', async (req, res) => {
  try {
    const deletedSheet = await Sheet.findByIdAndDelete(req.params.id);
    
    if (!deletedSheet) {
      return res.status(404).json({ message: 'Sheet not found' });
    }
    
    res.json({ message: 'Sheet deleted successfully' });
  } catch (error) {
    console.error('Error deleting sheet:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});


app.listen(PORT, () => {
  console.log(`Server running on port ${9000}`);
});
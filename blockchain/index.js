const express = require('express');
const Web3 = require('web3').default;
const cors = require('cors');
require("dotenv").config()
const { PinataSDK } = require("pinata-web3")
const multer = require('multer');
const fs = require("fs")

const app = express();
app.use(cors());
app.use(express.json());

const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.GATEWAY_URL
})

// Connect to Polygon node Infura
const web3 = new Web3('https://polygon-amoy.infura.io/v3/ff501c3063244b08b92df7162c094209');
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = require('./DrugUseReportingABI.json'); // Updated ABI
const contract = new web3.eth.Contract(contractABI, contractAddress);

const privateKey = process.env.WALLET_PRIVATEKEY;
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads'); // Store files in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Rename file with timestamp
    }
});

// Initialize multer upload
const uploadMiddleware = multer({ storage: storage });

app.get('/', (req, res) => {
    res.send("Hello World")
});

// API to upload report
app.post('/upload-report', async (req, res) => {
    const { textData } = req.body;
    try {
        const gasPrice = await web3.eth.getGasPrice();
        await contract.methods.addReport(textData).send({ from: account.address, gas: 500000, gasPrice: gasPrice });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/upload-link-and-report', async (req, res) => {
    const { textData, url } = req.body;
    try {
        const gasPrice = await web3.eth.getGasPrice();
        await contract.methods.addReport(textData, url).send({ from: account.address, gas: 500000, gasPrice: gasPrice });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/upload-image-and-report', uploadMiddleware.single('image'), async (req, res) => {
    try {
        const { textData } = req.body;
        const file = req.file; // Access the uploaded file

        if (!file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        // Upload the file to Pinata
        // Generate a random 6-character string
        const randomSuffix = crypto.randomUUID().toString('hex'); // Generates 6 characters

        // Create a new filename with the format: originalname_random6characters
        const newFileName = `${file.originalname.split('.')[0]}_${randomSuffix}.${file.originalname.split('.').pop()}`;

        // Read the file content
        const fileContent = fs.readFileSync(file.path);

        // Create a new Blob and File object with the modified filename
        const blob = new Blob([fileContent]);
        const pinataFile = new File([blob], newFileName, { type: file.mimetype });

        // Upload the file to Pinata
        const pinataResponse = await pinata.upload.file(pinataFile);

        // Get the complete URL of the uploaded image
        const imageUrl = `https://${process.env.GATEWAY_URL}/ipfs/${pinataResponse.IpfsHash}`;

        // Add the report to the smart contract
        const gasPrice = await web3.eth.getGasPrice();

        await contract.methods.addReport(textData, imageUrl).send({
            from: account.address,
            gas: 500000,
            gasPrice: gasPrice
        });

        // Clean up the temporary file
        fs.unlinkSync(file.path);

        res.status(200).json({ success: true, message: 'Report and image uploaded successfully', imageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/reports', async (req, res) => {
    try {
        // Verify ownership
        const owner = await getOwner();
        if (owner.toLowerCase() !== config.OWNER_ADDRESS.toLowerCase()) {
            return res.status(403).json({ error: 'Unauthorized: Not the contract owner' });
        }

        // Call getReports() function
        const reports = await drugUseContract.methods.getReports().call();
        
        // Transform the reports into a more readable format
        const formattedReports = reports.map(report => ({
            textData: report.textData,
            ipfsHash: report.ipfsHash
        }));

        res.json(formattedReports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

// Start server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
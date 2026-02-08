// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract DrugUseReporting {
    struct Report {
        string textData;
        string ipfsHash; // Will be empty string when not provided
    }
    
    address public owner;
    Report[] public reports;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract's owner can perform this action.");
        _;
    }

    constructor() {
        owner = msg.sender;
    }
    
    function addReport(string calldata _textData, string calldata _ipfsHash) external onlyOwner {
        reports.push(Report({
            textData: _textData,
            ipfsHash: _ipfsHash
        }));
    }
    
    // Add an overloaded function that only takes textData
    function addReport(string calldata _textData) external onlyOwner {
        reports.push(Report({
            textData: _textData,
            ipfsHash: ""
        }));
    }

    function getReport(uint256 index) public view returns (string memory, string memory) {
        require(index < reports.length, "Report does not exist.");
        return (reports[index].textData, reports[index].ipfsHash);
    }
    
    function getReportCount() external view onlyOwner returns (uint256) {
        return reports.length;
    }
    
    function getReports() external view onlyOwner returns (Report[] memory) {
        return reports;
    }

    // Helper function to check if ipfsHash exists remains unchanged
    function hasIpfsHash(uint256 index) public view returns (bool) {
        require(index < reports.length, "Report does not exist.");
        return bytes(reports[index].ipfsHash).length > 0;
    }
}
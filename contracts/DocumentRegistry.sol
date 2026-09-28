// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DocumentRegistry
 * @dev Secure Digital Document Management System (DMS) Smart Contract
 * Ministry of Home Affairs (MHA) & National Crime Records Bureau (NCRB)
 * SIH Problem Statement 26190 - Blockchain & Cybersecurity
 * 
 * Provides an immutable cryptographic chain of custody ledger for legal evidence,
 * case dockets, FIR records, forensic reports, and judicial exhibits.
 */
contract DocumentRegistry {
    struct Record {
        string docId;
        string sha256Hash;
        address uploadedBy;
        uint256 timestamp;
        bool isRevoked;
    }

    // Mapping from Document ID to its on-chain Record
    mapping(string => Record) private records;

    // Events for real-time auditability and block explorer indexing
    event DocumentAnchored(string indexed docId, string sha256Hash, address indexed uploader, uint256 timestamp);
    event DocumentRevoked(string indexed docId, address indexed revoker, uint256 timestamp, string reason);

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only registry authority can execute this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Anchors a new document's SHA-256 hash to the immutable blockchain ledger.
     * @param _docId Unique identifier for the case document.
     * @param _sha256Hash 64-character hexadecimal SHA-256 digest of the encrypted payload.
     */
    function anchorDocument(string memory _docId, string memory _sha256Hash) public {
        require(bytes(records[_docId].docId).length == 0, "Document already registered on-chain");
        require(bytes(_sha256Hash).length == 64, "Invalid SHA-256 hash length");

        records[_docId] = Record({
            docId: _docId,
            sha256Hash: _sha256Hash,
            uploadedBy: msg.sender,
            timestamp: block.timestamp,
            isRevoked: false
        });

        emit DocumentAnchored(_docId, _sha256Hash, msg.sender, block.timestamp);
    }

    /**
     * @notice Verifies the integrity of a registered document against the immutable ledger.
     * @param _docId Unique identifier for the case document.
     * @return sha256Hash Anchored cryptographic hash.
     * @return timestamp Block timestamp when the document was anchored.
     * @return isRevoked Whether document has been revoked or quarantined.
     */
    function verifyDocument(string memory _docId) public view returns (
        string memory sha256Hash, 
        uint256 timestamp, 
        bool isRevoked
    ) {
        Record memory rec = records[_docId];
        require(bytes(rec.docId).length > 0, "Document record not found on blockchain");
        return (rec.sha256Hash, rec.timestamp, rec.isRevoked);
    }

    /**
     * @notice Marks a document as revoked/quarantined in case of judicial strike-down or evidence contamination.
     * @param _docId Unique identifier for the case document.
     * @param _reason Justification for revocation.
     */
    function revokeDocument(string memory _docId, string memory _reason) public {
        Record storage rec = records[_docId];
        require(bytes(rec.docId).length > 0, "Document record not found");
        require(msg.sender == rec.uploadedBy || msg.sender == owner, "Unauthorized to revoke this document");
        rec.isRevoked = true;
        emit DocumentRevoked(_docId, msg.sender, block.timestamp, _reason);
    }
}

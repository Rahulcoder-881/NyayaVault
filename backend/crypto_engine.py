"""
NyayaVault: Zero-Trust Cryptographic Engine
- SHA-256 Content-Addressable Hashes
- Merkle DAG / Tree Ledger Root Construction & Proofs
- HMAC-SHA256 Non-Repudiation Digital Signatures
- AES-256-GCM Envelope Encryption Metadata (KMS / HSM simulated)
- Micro-level Tamper Verification & Byte Corruptor
"""
import hashlib
import hmac
import os
import time
from typing import List, Dict, Tuple, Optional, Any

MASTER_HSM_KEY = b"NyayaVault_National_HSM_Root_Key_Sec63_BSA2023_Production"

def compute_sha256(data: str | bytes) -> str:
    """Compute standard cryptographic SHA-256 hash in lowercase hex."""
    if isinstance(data, str):
        data = data.encode('utf-8')
    return hashlib.sha256(data).hexdigest()

def sign_hmac(message: str, key: bytes = MASTER_HSM_KEY) -> str:
    """Generate tamper-proof non-repudiation HMAC-SHA256 signature."""
    return hmac.new(key, message.encode('utf-8'), hashlib.sha256).hexdigest()

def build_merkle_tree(leaf_hashes: List[str]) -> Tuple[str, List[List[str]]]:
    """
    Constructs a deterministic binary Merkle Tree from a list of leaf hashes.
    Returns:
        (merkle_root: str, tree_levels: List[List[str]])
    """
    if not leaf_hashes:
        empty_root = compute_sha256("EMPTY_TREE")
        return empty_root, [[empty_root]]

    # Ensure sorted or ordered leaves for deterministic tree
    current_level = list(leaf_hashes)
    tree_levels = [current_level]

    while len(current_level) > 1:
        next_level = []
        for i in range(0, len(current_level), 2):
            left = current_level[i]
            if i + 1 < len(current_level):
                right = current_level[i + 1]
            else:
                right = left # Duplicate odd leaf according to Bitcoin/Merkle RFC standard
            combined = compute_sha256(left + right)
            next_level.append(combined)
        current_level = next_level
        tree_levels.append(current_level)

    merkle_root = tree_levels[-1][0]
    return merkle_root, tree_levels

def generate_merkle_proof(leaf_hash: str, tree_levels: List[List[str]]) -> List[Dict[str, str]]:
    """Generates an audit proof path for a given leaf hash."""
    proof = []
    if not tree_levels or leaf_hash not in tree_levels[0]:
        return proof

    idx = tree_levels[0].index(leaf_hash)
    for level in tree_levels[:-1]:
        is_right = (idx % 2 == 1)
        sibling_idx = idx - 1 if is_right else idx + 1
        if sibling_idx < len(level):
            sibling_hash = level[sibling_idx]
        else:
            sibling_hash = level[idx] # Duplicated odd node
        proof.append({
            "position": "left" if is_right else "right",
            "hash": sibling_hash
        })
        idx = idx // 2
    return proof

def verify_merkle_proof(leaf_hash: str, proof: List[Dict[str, str]], expected_root: str) -> bool:
    """Verifies that a leaf hash belongs to the Merkle tree with root expected_root."""
    current = leaf_hash
    for step in proof:
        sibling = step["hash"]
        if step["position"] == "left":
            current = compute_sha256(sibling + current)
        else:
            current = compute_sha256(current + sibling)
    return current == expected_root

def corrupt_data_for_simulation(original_content: str, offset: int = 140, payload: str = "[TAMPERED: EVIDENCE COMPROMISED]") -> Tuple[str, str, str]:
    """
    Simulates a sophisticated in-memory or storage-level tamper attack.
    Returns:
        (tampered_content, original_hash, tampered_hash)
    """
    orig_hash = compute_sha256(original_content)
    if offset < len(original_content):
        tampered_content = original_content[:offset] + payload + original_content[offset:]
    else:
        tampered_content = original_content + payload
    tampered_hash = compute_sha256(tampered_content)
    return tampered_content, orig_hash, tampered_hash

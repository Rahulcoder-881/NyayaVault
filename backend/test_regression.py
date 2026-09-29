"""
NyayaVault Backend Regression Test Suite
Validates crypto engine, Merkle DAG, BSA 2023 cert engine, and AI engine.
Runs with standard python unittest without external dependencies.
"""
import unittest
from crypto_engine import (
    compute_sha256,
    sign_hmac,
    build_merkle_tree,
    generate_merkle_proof,
    verify_merkle_proof,
    corrupt_data_for_simulation,
    MASTER_HSM_KEY
)
from bsa_cert_engine import generate_bsa_section63_certificate
from ai_engine import detect_witness_contradictions, reconstruct_case_timeline
from mock_data import get_initial_mock_state

class TestNyayaVaultBackend(unittest.TestCase):

    def test_sha256_computation(self):
        text = "NyayaVault Zero-Trust Legal Custody 2026"
        digest1 = compute_sha256(text)
        digest2 = compute_sha256(text)
        self.assertEqual(len(digest1), 64)
        self.assertEqual(digest1, digest2)
        digest_corrupt = compute_sha256(text + "!")
        self.assertNotEqual(digest1, digest_corrupt)

    def test_hmac_signing(self):
        msg = "DOC-STG1-001:FIPS-180-4"
        sig = sign_hmac(msg, key=MASTER_HSM_KEY)
        self.assertEqual(len(sig), 64)

    def test_merkle_tree_and_proofs(self):
        leaves = [compute_sha256(f"doc-{i}") for i in range(8)]
        root, tree_levels = build_merkle_tree(leaves)
        self.assertEqual(len(root), 64)

        for leaf in leaves:
            proof = generate_merkle_proof(leaf, tree_levels)
            is_valid = verify_merkle_proof(leaf, proof, root)
            self.assertTrue(is_valid, f"Merkle proof for leaf {leaf[:8]} must be valid")

        tampered_leaf = compute_sha256("tampered-data")
        proof0 = generate_merkle_proof(leaves[0], tree_levels)
        is_invalid = verify_merkle_proof(tampered_leaf, proof0, root)
        self.assertFalse(is_invalid, "Tampered leaf must fail Merkle verification")

    def test_bit_corruption_simulation(self):
        original = "Original Uncorrupted Police FIR Statement"
        corrupted, orig_hash, tampered_hash = corrupt_data_for_simulation(original, offset=4)
        self.assertNotEqual(original, corrupted)
        self.assertNotEqual(orig_hash, tampered_hash)

    def test_bsa_section63_certificate(self):
        case_data, docs, _ = get_initial_mock_state()
        cert = generate_bsa_section63_certificate(
            case_record=case_data,
            documents=docs,
            officer_name="Insp. R.K. Varma",
            designation="Investigating Officer",
            badge_id="DL-POL-8832"
        )
        self.assertIn("certificate_id", cert)
        self.assertTrue(cert["certificate_id"].startswith("BSA-63-"))
        self.assertIn("digital_signature", cert)
        self.assertGreater(len(cert["documents_certified"]), 0)

    def test_ai_engine(self):
        case_data, docs, _ = get_initial_mock_state()
        contradictions = detect_witness_contradictions(docs)
        self.assertIsInstance(contradictions, list)
        self.assertGreater(len(contradictions), 0)

        timeline = reconstruct_case_timeline(docs)
        self.assertIsInstance(timeline, list)
        self.assertGreater(len(timeline), 0)

if __name__ == "__main__":
    unittest.main()

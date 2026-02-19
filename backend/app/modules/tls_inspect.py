"""
TLS Certificate Inspection — single HTTPS handshake to extract certificate metadata.
No port scanning. Only connects to port 443.
"""

from __future__ import annotations

import asyncio
import ssl
import socket
from typing import Optional
from datetime import datetime

from cryptography import x509
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa, ec, dsa, ed25519, ed448

from app.models import CertificateInfo


def _get_key_info(cert: x509.Certificate) -> tuple[Optional[str], Optional[int]]:
    """Extract public key algorithm name and key length."""
    pub = cert.public_key()
    if isinstance(pub, rsa.RSAPublicKey):
        return "RSA", pub.key_size
    elif isinstance(pub, ec.EllipticCurvePublicKey):
        return f"ECDSA ({pub.curve.name})", pub.key_size
    elif isinstance(pub, dsa.DSAPublicKey):
        return "DSA", pub.key_size
    elif isinstance(pub, (ed25519.Ed25519PublicKey,)):
        return "Ed25519", 256
    elif isinstance(pub, (ed448.Ed448PublicKey,)):
        return "Ed448", 448
    return "Unknown", None


def _extract_san(cert: x509.Certificate) -> list[str]:
    """Extract Subject Alternative Names."""
    try:
        ext = cert.extensions.get_extension_for_class(x509.SubjectAlternativeName)
        return ext.value.get_values_for_type(x509.DNSName)
    except x509.ExtensionNotFound:
        return []


def _sync_tls_inspect(domain: str) -> CertificateInfo:
    """Synchronous TLS handshake — will be run in thread executor."""
    context = ssl.create_default_context()

    with socket.create_connection((domain, 443), timeout=8) as sock:
        with context.wrap_socket(sock, server_hostname=domain) as ssock:
            tls_version = ssock.version()
            cipher = ssock.cipher()
            cipher_suite = cipher[0] if cipher else None

            # Get the full certificate chain (DER)
            der_cert = ssock.getpeercert(binary_form=True)
            peer_cert = x509.load_der_x509_certificate(der_cert)

            # Chain subjects
            chain_info = []
            # We only get the leaf cert from the socket; extract chain from ssl
            der_chain = ssock.getpeercert(binary_form=True)
            if der_chain:
                leaf = x509.load_der_x509_certificate(der_chain)
                chain_info.append(leaf.subject.rfc4514_string())

                # Try getting issuer info
                chain_info.append(leaf.issuer.rfc4514_string())

            algo, key_len = _get_key_info(peer_cert)
            san = _extract_san(peer_cert)

            return CertificateInfo(
                issuer=peer_cert.issuer.rfc4514_string(),
                subject=peer_cert.subject.rfc4514_string(),
                serial_number=format(peer_cert.serial_number, "X"),
                not_before=peer_cert.not_valid_before_utc.isoformat(),
                not_after=peer_cert.not_valid_after_utc.isoformat(),
                san_entries=san,
                tls_version=tls_version,
                cipher_suite=cipher_suite,
                public_key_algorithm=algo,
                key_length=key_len,
                certificate_chain=chain_info,
            )


async def inspect_tls(domain: str) -> CertificateInfo:
    """Async wrapper — runs the blocking TLS handshake in a thread pool."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _sync_tls_inspect, domain)

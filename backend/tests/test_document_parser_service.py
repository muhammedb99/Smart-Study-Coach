import io
import pytest
from unittest.mock import patch, MagicMock

from app.services.document_parser_service import extract_text_from_document


# --------------------------------------------------
# TXT
# --------------------------------------------------

def test_extract_text_from_txt():
    content = "שלום עולם".encode("utf-8")

    text = extract_text_from_document(content, "file.txt")

    assert "שלום עולם" in text


# --------------------------------------------------
# PDF (Mock)
# --------------------------------------------------

def test_extract_text_from_pdf():
    fake_page = MagicMock()
    fake_page.extract_text.return_value = "טקסט מה-PDF"

    fake_pdf = MagicMock()
    fake_pdf._enter_.return_value.pages = [fake_page]

    with patch("app.services.document_parser_service.pdfplumber.open", return_value=fake_pdf):
        text = extract_text_from_document(b"fake-bytes", "file.pdf")

        assert "טקסט מה-PDF" in text


# --------------------------------------------------
# DOCX (Mock)
# --------------------------------------------------

def test_extract_text_from_docx():
    fake_paragraph = MagicMock()
    fake_paragraph.text = "טקסט מ-DOCX"

    fake_doc = MagicMock()
    fake_doc.paragraphs = [fake_paragraph]

    with patch("app.services.document_parser_service.Document", return_value=fake_doc):
        text = extract_text_from_document(b"fake-bytes", "file.docx")

        assert "טקסט מ-DOCX" in text


# --------------------------------------------------
# Unsupported file type
# --------------------------------------------------

def test_extract_text_from_unsupported_type():
    with pytest.raises(ValueError):
        extract_text_from_document(b"data", "file.xlsx")
"""
Parallel of tests/test_to_review_page.spec.ts

Full submission workflow ending at the review/submit page.
"""

import os
import pytest
import re

from playwright.sync_api import expect, Page
from datetime import datetime

BASE_URL = "http://localhost/bcrhp"
TESTS_DIR = os.path.dirname(__file__)

RUN_TIME = datetime.now().strftime("%Y%m%d_%H%M%S")


def test_to_review_page(page: Page):
    user_type = os.environ.get("USER_TYPE", "IDIR")
    auth_username = None
    auth_password = None
    if user_type == "IDIR":
        auth_username = os.environ.get("IDIR_USERNAME")
        auth_password = os.environ.get("IDIR_PASSWORD")
    elif user_type == "BCEID":
        auth_username = os.environ.get("BCEID_USERNAME")
        auth_password = os.environ.get("BCEID_PASSWORD")

    if not auth_username or not auth_password:
        raise RuntimeError("Missing IDIR_USERNAME / IDIR_PASSWORD env vars")

    # --- LOGIN ---
    page.goto(f"{BASE_URL}/")
    page.get_by_role("link", name="Search Sites").click()
    page.get_by_role("link", name="Login").click()
    page.wait_for_timeout(1000)

    if user_type == "IDIR":
        page.get_by_role("link", name="IDIR").click()
        page.locator("#user").fill(auth_username)
        page.get_by_role("textbox", name="Password").click()
        page.get_by_role("textbox", name="Password").fill(auth_password)
        page.get_by_role("button", name="Continue").click()

    if user_type == "BCEID":
        page.get_by_role("link", name="BCeID").click()
        page.locator("#user").click()
        page.locator("#user").fill(auth_username)
        page.get_by_role("textbox", name="Password").click()
        page.get_by_role("textbox", name="Password").fill(auth_password)
        page.get_by_role("button", name="Continue").click()

    # --- 1 START SUBMISSION ---
    page.wait_for_timeout(5000)
    page.goto(f"{BASE_URL}/plugins/workflow-list")
    page.get_by_role("link", name="Submit a new Heritage Property").click()
    page.get_by_role("button", name="Next").first.click()

    # --- 2 SITE LOCATION ---
    page.wait_for_timeout(1000)
    page.locator("#street_address").is_visible(timeout=3000)
    page.locator("#street_address").click()
    page.locator("#street_address").fill("street address")
    page.get_by_role("textbox", name="City").click()
    page.get_by_role("textbox", name="City").fill("city")
    page.get_by_role("textbox", name="Postal Code").click()
    page.get_by_role("textbox", name="Postal Code").fill("T5T 5T5")
    page.get_by_role("textbox", name="Locality").click()
    page.get_by_role("textbox", name="Locality").fill("locality")
    page.locator("#location_description .ql-editor").first.click()
    page.locator("#location_description .ql-editor").first.fill("location description")
    page.get_by_role("button", name="+ Add Address").click()
    page.get_by_role("button", name="+ Add PID").click()
    page.wait_for_timeout(1000)
    page.get_by_role("textbox", name="Enter number").click()
    page.get_by_role("textbox", name="Enter number").fill("026488248")
    page.wait_for_timeout(1000)
    page.get_by_role("button", name="Get Boundary").click()
    page.wait_for_timeout(4000)
    page.get_by_role("button", name="Save").click()
    page.get_by_role("button", name="Next").first.click()

    # --- 3 SPATIAL LOCATION ---
    page.get_by_role("button", name="Next").first.click()

    # --- 4 SITE NAMES ---
    page.locator('form[name="commonNameForm"] #name').click()
    page.locator('form[name="commonNameForm"] #name').fill(
        f"Ferginzey Residence {RUN_TIME}"
    )
    page.locator('form[name="otherNameForm"] #name').click()
    page.locator('form[name="otherNameForm"] #name').fill("other names")
    page.get_by_role("button", name="+ Add").click()
    page.get_by_role("button", name="Next").nth(1).click()

    # --- 5 OFFICIAL RECOGNITION DETAILS ---
    page.locator("#designation_or_protection_start_date").click()
    page.locator('td[aria-label="27"]:not(.p-datepicker-other-month)').click()
    page.locator("#legislative_act").click()
    page.get_by_text("Municipal, Community Charter").click()
    page.locator("#reference_number").click()
    page.locator("#reference_number").fill("bylaw 123")
    page.get_by_role("button", name="+ Add Protection Event").click()
    page.get_by_role("button", name="Next").first.click()

    # --- 6 STATEMENT OF SIGNIFICANCE ---
    page.locator(
        "#physical_description > .p-editor > .p-editor-content > .ql-editor"
    ).click()
    page.locator(
        "#physical_description > .p-editor > .p-editor-content > .ql-editor"
    ).fill("statement of significance")
    page.locator("#heritage_value > .p-editor > .p-editor-content > .ql-editor").click()
    page.locator("#heritage_value > .p-editor > .p-editor-content > .ql-editor").fill(
        "heritage value"
    )
    page.locator(
        "#defining_elements > .p-editor > .p-editor-content > .ql-editor"
    ).click()
    page.locator(
        "#defining_elements > .p-editor > .p-editor-content > .ql-editor"
    ).fill("character defining elements")
    page.locator("#document_location").click()
    page.locator("#document_location").fill("Somewhere around here...")
    page.get_by_role("button", name="Next").first.click()

    # --- 7 IMAGES (image 1) ---
    page.set_input_files(
        'div[data-node-alias="site_images"] input[type="file"]',
        os.path.join(TESTS_DIR, "..", "..", "tests", "house.jpg"),
    )
    remove_image_btn = page.get_by_role("button", name="Remove / Change Image")
    expect(remove_image_btn).to_be_visible(timeout=15000)

    page.get_by_text("Select an option").first.click()
    page.get_by_text("Contemporary", exact=True).click()
    page.get_by_label("Site Images").get_by_text("Select an option").click()
    page.locator(".p-tree-node-toggle-button").first.click()
    page.get_by_text("Aerial view").click()
    page.locator(
        "#image_description > .p-editor > .p-editor-content > .ql-editor"
    ).click()
    page.locator(
        "#image_description > .p-editor > .p-editor-content > .ql-editor"
    ).fill("This is a test.")
    page.get_by_role("button", name=" Save").click()

    # page.locator("#image_type").get_by_text("Select an option").click()
    # page.locator("div").filter(has_text="Contemporary").click()
    # page.locator("#image_view").get_by_text("Select an option").click()
    # page.locator("div").filter(has_text="Exterior").click()
    # page.locator(
    #     "#image_description > .p-editor > .p-editor-content > .ql-editor"
    # ).click()
    # page.locator(
    #     "#image_description > .p-editor > .p-editor-content > .ql-editor"
    # ).fill("image description")
    # page.get_by_role("textbox", name="E.g. Entrance").click()
    # page.get_by_role("textbox", name="E.g. Entrance").fill("image features")
    # page.get_by_role("textbox", name="Photographer").click()
    # page.get_by_role("textbox", name="Photographer").fill("photographer")
    # page.get_by_role("textbox", name="Copyright").click()
    # page.get_by_role("textbox", name="Copyright").fill("copyright")
    # page.get_by_role("button", name=" Save").click()
    page.wait_for_timeout(2000)

    # --- 7 IMAGES (image 2) ---
    page.set_input_files(
        'div[data-node-alias="site_images"] input[type="file"]',
        os.path.join(TESTS_DIR, "..", "..", "tests", "east_side.jpg"),
    )
    page.get_by_text("Select an option").first.click()
    page.get_by_text("Historical", exact=True).click()
    page.get_by_label("Site Images").get_by_text("Select an option").click()
    page.locator(".p-tree-node-toggle-button").first.click()
    page.get_by_text("Interior").click()
    page.locator(
        "#image_description > .p-editor > .p-editor-content > .ql-editor"
    ).click()
    page.locator(
        "#image_description > .p-editor > .p-editor-content > .ql-editor"
    ).fill("This is a test too!.")

    # page.locator("#image_type").get_by_text("Select an option").click()
    # page.locator("div").filter(has_text="Historical").click()
    # page.locator("#image_view").get_by_text("Select an option").click()
    # page.locator("div").filter(has_text="Interior").click()
    # page.locator(
    #     "#image_description > .p-editor > .p-editor-content > .ql-editor"
    # ).click()
    # page.locator(
    #     "#image_description > .p-editor > .p-editor-content > .ql-editor"
    # ).fill("image description 2")
    # page.get_by_role("textbox", name="E.g. Entrance").click()
    # page.get_by_role("textbox", name="E.g. Entrance").fill("image features 2")
    # page.get_by_role("textbox", name="Photographer").click()
    # page.get_by_role("textbox", name="Photographer").fill("photographer 2")
    # page.get_by_role("textbox", name="Copyright").click()
    # page.get_by_role("textbox", name="Copyright").fill("copyright 2")
    page.get_by_role("button", name=" Save").click()
    page.wait_for_timeout(2000)
    page.get_by_role("button", name="Next").first.click()

    # --- 8 SITE CLASSIFICATION ---
    page.locator("#contributing_resource_count").click()
    page.locator("#contributing_resource_count").fill("2")
    page.get_by_text("Select an option").nth(2).click()
    page.locator("div").filter(has_text=re.compile(r"^Building$")).click()
    page.get_by_label("Heritage Class", exact=True).get_by_text(
        "Select an option"
    ).click()
    page.locator("div").filter(has_text=re.compile(r"^Private$")).click()
    page.get_by_role("button", name="+ Add Heritage Class").click()

    page.locator("#contributing_resource_count").click()
    page.locator("#contributing_resource_count").fill("2")

    page.get_by_text("Select an option").nth(2).click()
    page.locator("div").filter(has_text=re.compile(r"^Structure$")).click()
    page.get_by_label("Heritage Class", exact=True).get_by_text(
        "Select an option"
    ).click()
    page.get_by_text("Private", exact=True).click()
    page.get_by_role("button", name="+ Add Heritage Class").click()
    page.get_by_text("Select an option").nth(4).click()
    page.locator(
        "li:nth-child(12) > .p-tree-node-content > .p-tree-node-toggle-button"
    ).click()
    page.locator("div").filter(has_text=re.compile(r"^Single Dwelling$")).click()
    page.get_by_label("Heritage Function").get_by_text("Select an option").click()
    page.locator("div").filter(has_text=re.compile(r"^Current$")).click()
    page.locator("div").filter(has_text=re.compile(r"^Historic$")).click()
    page.get_by_role("textbox").click()
    page.get_by_text("+ Add FunctionFunctions (0)No").click()
    page.get_by_role("button", name="+ Add Function").click()
    page.locator(
        "#heritageThemeFieldset_content > .p-fieldset-content-wrapper > .p-fieldset-content > .mb-2 > .p-inputtext-fluid > .widget > .p-treeselect > .p-treeselect-label-container > .p-treeselect-label"
    ).click()
    page.get_by_text("Expressing Intellectual and").click()
    page.get_by_text("Developing Economies").click()
    page.get_by_text("Building Social and Community").click()
    page.get_by_role("button", name="Next").nth(1).click()

    # page.locator("#heritage_category").get_by_text("Select an option").click()
    # page.locator("div").filter(has_text="Archaeological Site / Remains").click()
    # page.locator("#ownership").get_by_text("Select an option").click()
    # page.locator("div").filter(has_text="Not-for-profit").click()
    # page.get_by_role("button", name="+ Add Heritage Class").click()
    # page.locator("#functional_category").get_by_text("Select an option").click()
    # page.locator("div").filter(has_text="Commerce / Commercial Services").click()
    # page.locator("#functional_state").get_by_role("button").click()
    # page.get_by_text("Current").click()
    # page.get_by_role("button", name="+ Add Function").click()
    # page.get_by_label("Heritage Theme").get_by_text("Select an option").click()
    # page.get_by_text("Building Social and Community").click()
    # page.get_by_label("Building Social and Community").get_by_role("button").filter(
    #     has_text=""
    # ).click()
    # page.locator("div").filter(has_text="Education and Social Well-Being").click()
    # page.locator(".bcgov-vertical-steps").click()
    # page.get_by_role("button", name="Next").first.click()

    # --- 9 SITE DETAILS ---
    page.get_by_role("region", name="Chronology").get_by_role("button").click()

    page.get_by_text("Construction", exact=True).click()
    page.locator("#start_year").click()
    page.wait_for_timeout(250)
    page.get_by_text("2020", exact=True).click()
    page.locator("#end_year").click()
    page.wait_for_timeout(250)
    page.get_by_text("2023").click()
    checkbox = page.get_by_role("checkbox")
    try:
        checkbox.check()
    except Exception:
        pass

    if not checkbox.is_checked():
        checkbox.check()
    page.get_by_role("textbox", name="Provide explanation of").click()
    page.get_by_role("textbox", name="Provide explanation of").fill(
        "Super deluxe build"
    )
    page.wait_for_timeout(1000)
    page.get_by_role("button", name="+ Add Chronology").click()
    page.locator(
        ".flex > .widget > .p-treeselect > .p-treeselect-label-container > .p-treeselect-label"
    ).click()
    page.locator("div").filter(has_text=re.compile(r"^Significant$")).click()
    page.locator("#start_year").click()
    page.wait_for_timeout(250)
    page.get_by_text("2025").click()
    page.locator("#end_year").click()
    page.wait_for_timeout(250)
    page.get_by_text("2025").click()
    page.get_by_role("textbox", name="Provide explanation of").click()
    page.get_by_role("textbox", name="Provide explanation of").fill("Final renovations")
    page.wait_for_timeout(1000)
    page.get_by_role("button", name="+ Add Chronology").click()
    page.pause()
    page.locator("#construction_actor").click()
    page.locator("#construction_actor").fill("Ferguson, Brett")
    page.get_by_text("Select the type", exact=True).click()
    page.get_by_text("Architect / Designer").click()
    page.locator("#construction_actor_notes").click()
    page.locator("#construction_actor_notes").fill("Designed with some help")
    page.get_by_role("button", name="+ Add Architect/Builder").click()
    page.locator("#construction_actor").click()
    page.locator("#construction_actor").fill("Ferginzey, Brett")
    page.get_by_text("Select the type", exact=True).click()
    page.locator("div").filter(has_text=re.compile(r"^Builder$")).click()
    page.locator("#construction_actor_notes").click()
    page.locator("#construction_actor_notes").fill("GC, crew")
    page.get_by_role("button", name="+ Add Architect/Builder").click()
    page.locator(
        "#relatedURLsFieldset_content > div > div > div > div > .widget > .p-treeselect > .p-treeselect-label-container > .p-treeselect-label"
    ).click()
    page.get_by_text("Provincial Website").click()
    # page.locator("#pv_id_32_0_list").get_by_role("textbox").click()
    # page.locator("#pv_id_32_0_list").get_by_role("textbox").press("Escape")
    page.get_by_role("textbox", name="Enter URL Label...").click()
    page.get_by_role("textbox", name="Enter URL Label...").fill("QED Systems Inc.")
    page.get_by_placeholder("Enter URL...").click()
    page.get_by_placeholder("Enter URL...").fill("https://qedsystems.ca")
    page.get_by_role("button", name="+ Add URL").click()
    page.get_by_role("button", name="Next").first.click()

    # page.locator("div").filter(has_text="Construction").click()
    # page.get_by_role("combobox", name="Start Year").click()
    # page.get_by_text("2020", exact=True).click()
    # page.get_by_role("combobox", name="End Year").click()
    # page.get_by_text("2025").click()
    # page.get_by_role("textbox", name="Provide explanation of").click()
    # page.get_by_role("textbox", name="Provide explanation of").fill("chronology notes")
    # page.get_by_role("button", name="+ Add Chronology").click()
    # page.locator("#construction_actor").click()
    # page.locator("#construction_actor").fill("Bob")
    # page.get_by_text("Select the type", exact=True).click()
    # page.get_by_text("Builder", exact=True).click()
    # page.locator("#construction_actor_notes").click()
    # page.locator("#construction_actor_notes").fill("Builders Notes")
    # page.get_by_role("button", name="+ Add Architect/Builder").click()
    # page.locator(
    #     "#external_url_type > .p-treeselect-label-container > .p-treeselect-label"
    # ).click()
    # page.get_by_text("Other Website").click()
    # page.get_by_role("textbox", name="Enter URL Label...").click()
    # page.get_by_role("textbox", name="Enter URL Label...").fill("URL label")
    # page.get_by_placeholder("Enter URL...").click()
    # page.get_by_placeholder("Enter URL...").fill("www.google.com")
    # page.get_by_role("button", name="+ Add URL").click()

    # --- 10 SUPPORTING DOCUMENTS ---
    page.set_input_files(
        'div[data-node-alias="site_document"] input[type="file"]',
        os.path.join(TESTS_DIR, "..", "..", "tests", "test_doc.pdf"),
    )
    page.wait_for_timeout(2000)
    # page.locator("#0a23003a-ada6-4745-8f88-6719680b4100").click()
    page.get_by_role("radio", name="Document").click()
    # page.locator('div[data-node-alias="document_type"]').get_by_label(
    #     "Document"
    # ).click()
    page.locator("#document_description").click()
    page.locator("#document_description").fill("document description")
    add_button = page.get_by_role("button", name="+ Add")
    add_button.click()
    page.locator("#submissionNotes > .p-editor-content > .ql-editor").click()
    page.locator("#submissionNotes > .p-editor-content > .ql-editor").fill(
        "Submission Notes"
    )
    page.get_by_role("button", name="Next").first.click()
    page.pause()

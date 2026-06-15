from playwright.sync_api import sync_playwright
import time

def run_cuj(page):
    page.goto("http://localhost:5173")
    page.wait_for_timeout(3000)

    # Go to Dashboard
    page.click("text=Dashboard")
    page.wait_for_timeout(2000)

    # Click people view
    page.click("text=People View")
    page.wait_for_timeout(2000)

    page.screenshot(path="/home/jules/verification/screenshots/verification-gantt-people.png")

if __name__ == "__main__":
    import os
    os.makedirs("/home/jules/verification/videos", exist_ok=True)
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={'width': 1600, 'height': 900}
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()

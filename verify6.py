from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:5173")
    page.wait_for_timeout(2000)

    # We need to add a leave for someone. The label in LeavesView is probably not "Start Date". Let's use inputs.
    page.click("text=Leaves & Holidays")
    page.wait_for_timeout(1000)
    page.click("text=Add Leave")
    page.wait_for_timeout(500)

    # Fill in leave details
    page.locator('select').nth(0).select_option(index=1) # member
    page.locator('input').nth(0).fill("2024-06-03") # start date
    page.locator('input').nth(1).fill("2024-06-06") # end date
    page.locator('input').nth(2).fill("Vacation") # reason
    page.get_by_role("button", name="Save").click()
    page.wait_for_timeout(1000)

    # Dashboard leaves test
    page.click("text=Dashboard")
    page.wait_for_timeout(1000)
    page.click("text=People View")
    page.wait_for_timeout(2000)

    page.screenshot(path="/home/jules/verification/screenshots/verification-gantt-leaves-fixed2.png")

if __name__ == "__main__":
    import os
    os.makedirs("/home/jules/verification/videos", exist_ok=True)
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={'width': 1280, 'height': 800}
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()

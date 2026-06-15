from playwright.sync_api import sync_playwright

def run_cuj(page):
    # Wait for alert and dismiss it
    page.on("dialog", lambda dialog: dialog.accept())

    page.goto("http://localhost:5173")
    page.wait_for_timeout(2000)

    # First add a member so DSU form isn't empty
    page.click("text=Members")
    page.wait_for_timeout(1000)
    page.click("text=Add Member")
    page.wait_for_timeout(500)
    page.locator('input').nth(0).fill("John Doe")
    page.locator('select').nth(0).select_option(index=1)
    page.get_by_role("button", name="Save").click()
    page.wait_for_timeout(1000)


    # DSU update testing
    page.click("text=DSU Board")
    page.wait_for_timeout(2000)

    # Try selecting elements in DSU
    page.locator('select').nth(0).select_option(index=1) # Who are you
    try:
      page.locator('select').nth(1).select_option(index=1) # Story
    except:
      pass
    page.locator('select').nth(2).select_option(index=2) # In Progress

    page.get_by_label("Target Completion Date").fill("2024-06-15")
    page.get_by_label("Status Update").fill("Started the work on frontend components.")

    page.get_by_role("button", name="Submit Update").click()
    page.wait_for_timeout(2000)

    # Stories grouping and dots and timeline test
    page.click("text=Stories")
    page.wait_for_timeout(2000)

    page.screenshot(path="/home/jules/verification/screenshots/verification-grouped-stories.png")

    try:
      page.get_by_role("button", name="Timeline").nth(0).click()
      page.wait_for_timeout(1000)
      page.screenshot(path="/home/jules/verification/screenshots/verification-timeline.png")
    except:
      pass

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

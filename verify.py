from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:5173")
    page.wait_for_timeout(2000)

    # Go to Projects first to add a project
    page.click("text=Projects")
    page.wait_for_timeout(1000)
    page.click("text=Add Project")
    page.wait_for_timeout(500)

    # the labels in the code are just <Label>Name</Label>, they don't have htmlFor, so get_by_label might not work. using locator by inputs relative to text or place.
    # since we just have grid inputs
    page.locator('input').nth(0).fill("Test Project")
    page.locator('input').nth(1).fill("2024-06-01")
    page.locator('input').nth(2).fill("2024-06-30")
    page.locator('input').nth(3).fill("Web")

    page.get_by_role("button", name="Save").click()
    page.wait_for_timeout(1000)

    # Go to Sprints
    page.click("text=Sprints")
    page.wait_for_timeout(1000)

    # Click Add Sprint
    page.click("text=Add Sprint")
    page.wait_for_timeout(500)

    page.locator('select').nth(0).select_option(index=1) # Project
    page.locator('input').nth(1).fill("2024-06-01")
    page.locator('input').nth(2).fill("2024-06-14")

    page.get_by_role("button", name="Save").click()
    page.wait_for_timeout(1000)

    # Go to Stories
    page.click("text=Stories")
    page.wait_for_timeout(1000)

    # Add a Story
    page.click("text=Add Story")
    page.wait_for_timeout(1000)

    # Fill Story Details
    page.locator('select').nth(0).select_option(index=1) # Sprint
    page.locator('input').nth(0).fill("ST-101")
    page.locator('input').nth(1).fill("Test Story")
    page.locator('input').nth(2).fill("2024-06-03")
    page.locator('input').nth(3).fill("2024-06-10")

    # Set Frontend Dev
    try:
      page.locator('select').nth(1).select_option(index=1)
    except:
      pass
    page.locator('input').nth(4).fill("2024-06-03")
    page.locator('input').nth(5).fill("2024-06-05")

    # Set Backend Dev
    try:
      page.locator('select').nth(2).select_option(index=2)
    except:
      pass
    page.locator('input').nth(6).fill("2024-06-04")
    page.locator('input').nth(7).fill("2024-06-07")

    page.screenshot(path="/home/jules/verification/screenshots/verification-story.png")

    page.get_by_role("button", name="Save").click()
    page.wait_for_timeout(1000)

    # Click edit button
    page.get_by_role("button", name="Edit").nth(0).click()
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/verification-story-edit.png")
    page.keyboard.press("Escape")
    page.wait_for_timeout(500)

    # Go to Dashboard (to view Gantt)
    page.click("text=Dashboard")
    page.wait_for_timeout(2000)
    page.screenshot(path="/home/jules/verification/screenshots/verification-gantt.png")

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

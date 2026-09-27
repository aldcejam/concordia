import sys
import time
from playwright.sync_api import sync_playwright

def run_tests():
    print("=" * 70)
    print("⚡ EMPIRICAL CHALLENGER: PLAYWRIGHT E2E INTERACTION STRESS SUITE")
    print("=" * 70)

    console_errors = []
    passed = 0
    failed = 0

    def test(name, fn):
        nonlocal passed, failed
        try:
            fn()
            passed += 1
            print(f"  ✓ {name}")
        except Exception as e:
            failed += 1
            print(f"  ✗ FAIL: {name}")
            print(f"    Error: {e}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        page = context.new_page()

        def on_console(msg):
            if msg.type == "error":
                console_errors.append(msg.text)
        page.on("console", on_console)
        page.on("pageerror", lambda err: console_errors.append(str(err)))

        print("\nLoading application at http://localhost:4173...")
        page.goto("http://localhost:4173")
        page.wait_for_selector('[data-node-id="1"]')
        print("Application loaded successfully.\n")

        def ensure_drawer_closed():
            try:
                if page.locator('div[role="dialog"]').count() > 0:
                    page.locator('button[aria-label="Fechar painel de detalhes"]').click()
                    time.sleep(0.15)
            except Exception:
                pass

        # ---------------------------------------------------------------------
        # 1. Dialog Accessibility & WAI-ARIA Attributes
        # ---------------------------------------------------------------------
        print("--- 1. Dialog Accessibility & WAI-ARIA Attributes ---")

        def test_dialog_attributes():
            ensure_drawer_closed()
            page.locator('[data-node-id="1"] button').click()
            page.wait_for_selector('div[role="dialog"]')

            dialog = page.locator('div[role="dialog"]')
            assert dialog.get_attribute("aria-modal") == "true", "Expected aria-modal='true'"
            assert dialog.get_attribute("aria-labelledby") == "stage-drawer-title", "Expected aria-labelledby='stage-drawer-title'"
            assert dialog.get_attribute("aria-describedby") == "stage-drawer-description", "Expected aria-describedby='stage-drawer-description'"

            title = page.locator('#stage-drawer-title')
            assert "Locação e Topografia" in title.inner_text(), "Title text mismatch"

            desc = page.locator('#stage-drawer-description')
            assert "Locação topográfica" in desc.inner_text(), "Description text mismatch"

            # Progressbar accessibility inside drawer
            progressbar = dialog.locator('div[role="progressbar"]')
            assert progressbar.count() == 1, "Expected progressbar element inside drawer"
            assert progressbar.get_attribute("aria-valuemin") == "0"
            assert progressbar.get_attribute("aria-valuemax") == "100"
            assert progressbar.get_attribute("aria-valuenow") == "100"

            # Body scroll lock
            body_overflow = page.evaluate("() => document.body.style.overflow")
            assert body_overflow == "hidden", f"Expected body overflow 'hidden', got '{body_overflow}'"

        test("Dialog has role='dialog', aria-modal='true', labels, progressbar a11y, and body scroll lock", test_dialog_attributes)

        def test_focus_management():
            time.sleep(0.1)
            active_label = page.evaluate("() => document.activeElement ? document.activeElement.getAttribute('aria-label') : null")
            assert active_label == "Fechar painel de detalhes", f"Expected focus on close button, got element with aria-label '{active_label}'"

        test("Focus is automatically shifted to close button on drawer open", test_focus_management)

        # ---------------------------------------------------------------------
        # 2. Triple Close Handling
        # ---------------------------------------------------------------------
        print("\n--- 2. Triple Close Handling ---")

        def test_close_button_x():
            close_btn = page.locator('button[aria-label="Fechar painel de detalhes"]')
            close_btn.click()
            time.sleep(0.2)
            assert page.locator('div[role="dialog"]').count() == 0, "Dialog should be unmounted after X click"

            body_overflow = page.evaluate("() => document.body.style.overflow")
            assert body_overflow == "", f"Expected body overflow restored to empty, got '{body_overflow}'"

            returned_aria = page.evaluate("() => document.activeElement ? document.activeElement.getAttribute('aria-label') : null")
            assert returned_aria and "Locação e Topografia" in returned_aria, f"Expected focus returned to node 1 button, got '{returned_aria}'"

        test("Close via X button unmounts drawer, restores scroll lock, and restores focus", test_close_button_x)

        def test_close_via_escape():
            page.locator('[data-node-id="1"] button').click()
            page.wait_for_selector('div[role="dialog"]')
            time.sleep(0.1)

            page.keyboard.press("Escape")
            time.sleep(0.2)
            assert page.locator('div[role="dialog"]').count() == 0, "Dialog should be unmounted after Escape key"

            returned_aria = page.evaluate("() => document.activeElement ? document.activeElement.getAttribute('aria-label') : null")
            assert returned_aria and "Locação e Topografia" in returned_aria, f"Expected focus returned to node 1 button, got '{returned_aria}'"

        test("Close via Escape key unmounts drawer and restores focus", test_close_via_escape)

        def test_click_inside_does_not_close():
            page.locator('[data-node-id="1"] button').click()
            page.wait_for_selector('div[role="dialog"]')

            page.locator('#stage-drawer-title').click()
            time.sleep(0.1)
            assert page.locator('div[role="dialog"]').count() == 1, "Dialog should remain open when clicking inside content"

        test("Click inside drawer content does NOT close drawer (propagation guard)", test_click_inside_does_not_close)

        def test_close_via_backdrop():
            page.mouse.click(50, 200)
            time.sleep(0.2)
            assert page.locator('div[role="dialog"]').count() == 0, "Dialog should be unmounted after clicking backdrop"

            returned_aria = page.evaluate("() => document.activeElement ? document.activeElement.getAttribute('aria-label') : null")
            assert returned_aria and "Locação e Topografia" in returned_aria, f"Expected focus returned to node 1 button, got '{returned_aria}'"

        test("Close via backdrop click outside drawer unmounts drawer and restores focus", test_close_via_backdrop)

        # ---------------------------------------------------------------------
        # 3. Measurement Controls & Executed Quantity Recalculation
        # ---------------------------------------------------------------------
        print("\n--- 3. Measurement Controls & Recalculation ---")

        def test_measurement_controls():
            ensure_drawer_closed()
            page.locator('[data-node-id="3"] button').click()
            page.wait_for_selector('div[role="dialog"]')

            # Node 3: budgetedQuantity = 50, progress = 65%
            # Initial recalculation: 50 * (65 / 100) = 32.5 m
            qty_span = page.locator('text=32.5 / 50 m')
            assert qty_span.count() == 1, "Expected initial recalculated quantity '32.5 / 50 m'"

            slider = page.locator('input[type="range"][aria-label="Ajustar percentual de medição física"]')
            assert slider.input_value() == "65", f"Expected slider initial value 65, got {slider.input_value()}"

            # Test +5% button
            page.locator('button:text-is("+5%")').click()
            assert slider.input_value() == "70", f"Expected slider 70 after +5%, got {slider.input_value()}"
            assert page.locator('text=35.0 / 50 m').count() == 1, "Expected '35.0 / 50 m'"

            # Test +10% button
            page.locator('button:text-is("+10%")').click()
            assert slider.input_value() == "80", f"Expected slider 80 after +10%, got {slider.input_value()}"
            assert page.locator('text=40.0 / 50 m').count() == 1, "Expected '40.0 / 50 m'"

            # Test 100% Concluir button
            page.locator('button:text-is("100% Concluir")').click()
            assert slider.input_value() == "100", f"Expected slider 100 after 100% Concluir, got {slider.input_value()}"
            assert page.locator('text=50.0 / 50 m').count() == 1, "Expected '50.0 / 50 m'"

            # Test +5% clamp at 100% (spam clicks)
            for _ in range(5):
                page.locator('button:text-is("+5%")').click()
            assert slider.input_value() == "100", f"Expected slider clamped at 100 after spamming +5%, got {slider.input_value()}"

            # Save measurement callback
            save_btn = page.locator('button:has-text("Salvar Medição")')
            save_btn.click()
            page.wait_for_selector('text=Medição de 100% salva com sucesso!')

            # Close drawer and check TimelinePage update
            page.locator('button[aria-label="Fechar painel de detalhes"]').click()
            time.sleep(0.2)

            node3_text = page.locator('[data-node-id="3"]').inner_text()
            assert "100%" in node3_text, f"Expected node 3 to reflect 100% completion in timeline, got '{node3_text}'"

        test("Slider, quick increment (+5%, +10%, 100%), quantity recalculation, and save callback", test_measurement_controls)

        def test_measurement_zero_and_precision():
            ensure_drawer_closed()
            # Open node 7 (Marco: budgetedQuantity = 1, executedQuantity = 0.43, unit = 'etapa')
            page.locator('[data-node-id="7"] button').click()
            page.wait_for_selector('div[role="dialog"]')

            slider = page.locator('input[type="range"][aria-label="Ajustar percentual de medição física"]')
            slider.focus()

            # Press 'Home' key to set range input to minimum (0%)
            page.keyboard.press("Home")
            time.sleep(0.15)
            assert slider.input_value() == "0", f"Expected slider value 0 after Home key, got {slider.input_value()}"

            # Recalculated should be 0.0 / 1 etapa
            assert page.locator('text=0.0 / 1 etapa').count() == 1, "Expected '0.0 / 1 etapa' when slider is at 0%"

            # Click +10% five times to reach 50%
            for _ in range(5):
                page.locator('button:text-is("+10%")').click()
            time.sleep(0.1)
            assert slider.input_value() == "50", f"Expected slider value 50, got {slider.input_value()}"
            assert page.locator('text=0.5 / 1 etapa').count() == 1, "Expected '0.5 / 1 etapa' when slider is at 50%"

            # Refocus slider and press 'End' key to jump to 100%
            slider.focus()
            page.keyboard.press("End")
            time.sleep(0.15)
            assert slider.input_value() == "100", f"Expected slider value 100 after End key, got {slider.input_value()}"
            assert page.locator('text=1.0 / 1 etapa').count() == 1, "Expected '1.0 / 1 etapa' when slider is at 100%"

            page.locator('button[aria-label="Fechar painel de detalhes"]').click()
            time.sleep(0.2)

        test("Measurement handles Home/End keyboard navigation, decimal precision, and 0% boundary safely", test_measurement_zero_and_precision)

        # ---------------------------------------------------------------------
        # 4. Impediment Reporting
        # ---------------------------------------------------------------------
        print("\n--- 4. Impediment Reporting Form & Callback ---")

        def test_impediment_reporting_clean():
            ensure_drawer_closed()
            # Node 2 has NO pre-existing impediment
            page.locator('[data-node-id="2"] button').click()
            page.wait_for_selector('div[role="dialog"]')

            # Click Reportar Impedimento / Atraso
            report_btn = page.locator('button:has-text("Reportar Impedimento / Atraso")')
            report_btn.click()

            # Verify expandable form
            page.wait_for_selector('#impediment-reason')
            textarea = page.locator('#impediment-reason')

            # Test all day selector buttons (+1d, +2d, +3d, +5d, +7d)
            for d in [1, 2, 3, 5, 7]:
                btn = page.locator(f'button:text-is("+{d}d")')
                assert btn.count() == 1, f"Missing +{d}d button"
                btn.click()
                assert "bg-warning" in (btn.get_attribute("class") or ""), f"+{d}d should be active"

            # Select +7d
            page.locator('button:text-is("+7d")').click()

            # Check submit button disabled initially when reason text is empty
            submit_btn = page.locator('button:has-text("Registrar e Notificar Gestão")')
            assert submit_btn.is_disabled(), "Submit button must be disabled when reason text is empty"

            # Check submit button disabled with whitespace only
            textarea.fill("   \n  \t  ")
            assert submit_btn.is_disabled(), "Submit button must be disabled with whitespace only"

            # Fill valid justification
            textarea.fill("Rompimento de tubulação adutora exigindo escavação emergencial")
            assert not submit_btn.is_disabled(), "Submit button must be enabled after entering reason"

            # Submit
            submit_btn.click()
            page.wait_for_selector('text=Impedimento (+7 dias) reportado com sucesso!')

            # Close drawer and verify TimelinePage state updated
            page.locator('button[aria-label="Fechar painel de detalhes"]').click()
            time.sleep(0.2)

            node2_text = page.locator('[data-node-id="2"]').inner_text()
            assert "+7 dias de atraso" in node2_text, f"Expected node 2 to show +7 dias de atraso, got '{node2_text}'"

        test("Expandable impediment form, day buttons (+1d to +7d), validation guard, and callback trigger", test_impediment_reporting_clean)

        def test_impediment_reporting_prepopulated():
            ensure_drawer_closed()
            # Node 4 has pre-existing impediment
            page.locator('[data-node-id="4"] button').click()
            page.wait_for_selector('div[role="dialog"]')

            # Delayed warning card is visible
            assert page.locator('text=Impedimento Crítico Registrado').count() == 1, "Expected delayed warning card"

            # Open form
            report_btn = page.locator('button:has-text("Reportar Impedimento / Atraso")')
            report_btn.click()

            page.wait_for_selector('#impediment-reason')
            textarea = page.locator('#impediment-reason')
            assert len(textarea.input_value()) > 0, "Expected pre-populated reason for node 4"

            # Clear reason and verify button becomes disabled
            textarea.fill("")
            submit_btn = page.locator('button:has-text("Registrar e Notificar Gestão")')
            assert submit_btn.is_disabled(), "Submit button should disable when clearing pre-populated text"

            # Cancel form
            page.locator('button:text-is("Cancelar")').click()
            time.sleep(0.1)
            assert page.locator('#impediment-reason').count() == 0, "Form should collapse on Cancel"

            page.locator('button[aria-label="Fechar painel de detalhes"]').click()
            time.sleep(0.2)

        test("Pre-populated impediment on node 4: clear disables submit, Cancel collapses form", test_impediment_reporting_prepopulated)

        # ---------------------------------------------------------------------
        # 5. Stage Acceleration ("Ponte Dourada")
        # ---------------------------------------------------------------------
        print("\n--- 5. Stage Acceleration (Ponte Dourada) ---")

        def test_stage_acceleration():
            ensure_drawer_closed()
            page.locator('[data-node-id="5"] button').click()
            page.wait_for_selector('div[role="dialog"]')

            assert page.locator('text=Oportunidade: Ponte Dourada').count() == 1, "Expected Ponte Dourada section"

            accel_btn = page.locator('button:has-text("Mobilizar Frente / Adiantar Etapa")')
            assert accel_btn.count() == 1, "Expected accelerate button"

            accel_btn.click()
            time.sleep(0.2)

            page.locator('button[aria-label="Fechar painel de detalhes"]').click()
            time.sleep(0.2)

            node5 = page.locator('[data-node-id="5"]')
            assert node5.get_attribute("data-status") == "in_progress", f"Expected node 5 data-status='in_progress', got {node5.get_attribute('data-status')}"
            assert "EM EXECUÇÃO" in node5.inner_text(), "Expected 'EM EXECUÇÃO' badge on node 5"
            assert "Mobilizado via Ponte Dourada" in node5.inner_text(), "Expected 'Mobilizado via Ponte Dourada' subtitle on node 5"

        test("Ponte Dourada action triggers callback, promotes status to in_progress, and updates badge", test_stage_acceleration)

        def test_accelerated_node_no_longer_shows_golden_card():
            ensure_drawer_closed()
            # Node 5 was accelerated in previous test, now in_progress
            page.locator('[data-node-id="5"] button').click()
            page.wait_for_selector('div[role="dialog"]')

            assert page.locator('text=Oportunidade: Ponte Dourada').count() == 0, "Accelerated node should not display Ponte Dourada card"

            page.locator('button[aria-label="Fechar painel de detalhes"]').click()
            time.sleep(0.2)

        test("Reopening accelerated node does NOT show Ponte Dourada action card", test_accelerated_node_no_longer_shows_golden_card)

        # ---------------------------------------------------------------------
        # 6. Smooth Scroll Floating Button & Sequential Node Switching
        # ---------------------------------------------------------------------
        print("\n--- 6. Smooth Scroll Floating Button & Sequential Node Switching ---")

        def test_floating_button():
            ensure_drawer_closed()
            float_btn = page.locator('button[aria-label="Centralizar na etapa em execução"]')
            assert float_btn.count() == 1, "Expected floating action button"
            float_btn.click()

        test("Floating smooth-scroll button executes without error", test_floating_button)

        def test_sequential_node_switching():
            ensure_drawer_closed()
            expected_nodes = [
                ("1", "01.01.001", "Locação e Topografia"),
                ("2", "01.02.003", "Escavação de Valas"),
                ("3", "02.01.015", "Tubulação PVC R DN 150mm"),
                ("4", "02.02.008", "Caixas de Boca de Lobo"),
                ("5", "03.01.002", "Chapisco Interno dos Muros"),
                ("6", "02.03.001", "Reaterro Compactado"),
                ("7", "02.00.000", "Marco: Liberação da Drenagem"),
            ]
            for node_id, eap, title in expected_nodes:
                page.locator(f'[data-node-id="{node_id}"] button').click()
                page.wait_for_selector('div[role="dialog"]')
                assert eap in page.locator('div[role="dialog"]').inner_text(), f"Expected EAP {eap}"
                assert title in page.locator('#stage-drawer-title').inner_text(), f"Expected title {title}"
                page.locator('button[aria-label="Fechar painel de detalhes"]').click()
                time.sleep(0.1)

        test("Sequential opening and closing of all 7 nodes reflects correct EAP and title without bleed", test_sequential_node_switching)

        # ---------------------------------------------------------------------
        # Console Error Check
        # ---------------------------------------------------------------------
        print("\n--- 7. Console Error & Exception Audit ---")
        def test_console_cleanliness():
            if console_errors:
                print("Console errors observed:")
                for err in console_errors:
                    print(f"  - {err}")
            assert len(console_errors) == 0, f"Expected 0 console errors, but got {len(console_errors)}"

        test("No unhandled console errors or exceptions during full interactive lifecycle", test_console_cleanliness)

        browser.close()

    print("\n" + "=" * 70)
    print(f"E2E RESULTS: {passed} passed, {failed} failed")
    print("=" * 70)
    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_tests()

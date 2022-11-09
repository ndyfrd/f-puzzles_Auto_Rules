// ==UserScript==
// @name		 Fpuzzles_Auto_Rules
// @namespace	 http://tampermonkey.net/
// @version		 1.0
// @description  Enables automatic generation of puzzle ruleset 
// @author		 Ennead
// @match		 https://*.f-puzzles.com/*
// @match		 https://f-puzzles.com/*
// @icon		 data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant		 none
// @run-at		 document-end
// ==/UserScript==



(function() {
	'use strict';

	const doShim = function() {

		let infoBox = popups['editinfo'];
		infoBox.h = 700;
		let bullets = [ ' \u{2022} ', ' \u{26AA} ', ' \u{25FB} ', ' \u{25FE} ',' \u{25C8} ', ' \u{27A4} ',
					    ' \u{2740} ', ' \u{2716} ', ' \u{2605} ', ' \u{21E8} ', ' \u{2665} ' ];
		let bullet = bullets[0];
		let rulesFmts = { header: false, bullets: false, lineBreaks: false };
		let mainBtnsY = canvas.height/2 + 290;
		let fmtBtnX = canvas.width/2 - infoBox.w/2 + buttonLH + 25;
		let fmtBtnY = canvas.height/2 + 235;
		let fmtBtns = { 	'AddHeader': 'H',
							'AddLineBreaks': ' \u{2B0D} ',
							'AddBullets':  '\u{250B} ',
							'ToggleBullets': ' \u{2022} '}

		for (let btn in fmtBtns) {
			buttons.push(new button(fmtBtnX, fmtBtnY, buttonLH, buttonLH, ['Edit Info'], btn, fmtBtns[btn]));
			fmtBtnX += buttonLH + 10;
		}

		buttons.push(new button(canvas.width/2 - 175, mainBtnsY, 280, buttonLH, ['Edit Info'], 'GenerateRules', 'Generate Rules'));


		let generateRuleset = function() {
			let autoRuleset = '';
			let ruleset = '';

			let head = (rulesFmts.bullets) ? bullet : '';
			head += 'Normal sudoku rules apply.';
			head += (rulesFmts.lineBreaks) ? '\n\n' : '\n';

			for (let constraint in rules) {
				let c = constraints[cID(constraint)];
				if ((Array.isArray(c) && c.length) || c === true) {
					if (rulesFmts.bullets) autoRuleset += bullet;
					autoRuleset += rules[constraint];
					autoRuleset += (rulesFmts.lineBreaks) ? '\n\n' : '\n';
				}
			}

			ruleset = (rulesFmts.header) ? head : '';
			document.getElementById('ruleset').value = ruleset + autoRuleset;
		}

		let prevTogglePopup = togglePopup;
		togglePopup = function(title) {

			const confirmButton = buttons.filter(b => b.id === 'ConfirmInfo')[0];
			confirmButton.x = canvas.width/2 + 175;
			confirmButton.y = mainBtnsY;

			const genRulesButton = buttons[buttons.findIndex(a => a.id === 'GenerateRules')];
			genRulesButton.click = function() { 
				if (genRulesButton.hovering())
					generateRuleset();
			}

			const headerButton = buttons[buttons.findIndex(a => a.id === 'AddHeader')];
			headerButton.click = function() { 
				if (headerButton.hovering()) {
					rulesFmts.header = (rulesFmts.header) ? false : true;
					generateRuleset();
				}
			}

			const bulletsButton = buttons[buttons.findIndex(a => a.id === 'AddBullets')];
			bulletsButton.click = function() { 
				if (bulletsButton.hovering()) {
					rulesFmts.bullets = (rulesFmts.bullets) ? false : true;
					generateRuleset();
				}
			}

			const lineBreaksButton = buttons[buttons.findIndex(a => a.id === 'AddLineBreaks')];
			lineBreaksButton.click = function() { 
				if (lineBreaksButton.hovering()) {
					rulesFmts.lineBreaks = (rulesFmts.lineBreaks) ? false : true;
					generateRuleset();
				}
			}

			const toggleBulletsButton = buttons[buttons.findIndex(a => a.id === 'ToggleBullets')];
			toggleBulletsButton.click = function() { 
				let currB = bullets.indexOf(bullet);
				if (toggleBulletsButton.hovering())
					bullet = (currB === bullets.length - 1) ? bullets[0] : bullets[currB + 1];
					toggleBulletsButton.title = bullet;
					generateRuleset();
			}

			rulesFmts = { header: false, bullets: false, lineBreaks: false };
			prevTogglePopup(title);
		}
	}

    if (window.grid) {
        doShim();
    } else {
        document.addEventListener('DOMContentLoaded', (event) => {
            doShim();
        });
    }
})();

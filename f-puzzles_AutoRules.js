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

    //-------------------------------------------------------------------//
    //                                                                   //
    //   				  User Editable Rules.                           //
    //                                                                   //
    //      Edit below to alter the wording of generated rules.          //
    //      Change the order to alter rule priority.                     //
    //                                                                   //
    //-------------------------------------------------------------------//

	const rules = {

		'Antiknight':        
			'Cells that are a chess knight\'s move apart must not contain the same digit.',

		'Antiking':          
			'Cells that are a chess king\'s move apart must not contain the same digit.',

		'Arrow':	     	   
			'Digits along an arrow must sum to that arrow\'s circled digit.',

		'Between Line':	   
			'Digits on lines connecting circles must lie between the circled digits numerically.',

		'Clone':	     	   	
			'Areas made up of grey cells containing circles are clones. Cloned areas must be identical.',

		'Diagonal +':        
			'Digits must not repeat on the positive diagonal.',

		'Diagonal -':        
			'Digits must not repeat on the negative diagonal.',

		'Difference':	
			'Digits separated by a white dot must be consecutive.',

		'Disjoint Groups':   
			'Cells in the same position relative to their 3x3 region must not contain the same digit.',

		'Even':			 
			'Cells with grey squares must contain even digits.',

		'Extra Region':	   
			'The connected grey cells are an extra region in which digits must not repeat.',

		'Killer Cage':	   
			'Digits in cages must not repeat and must sum to the small corner total, where given',

		'Little Killer Sum': 
			'Digits along an indicated diagonal must sum to the given total.',

		'Lockout': 
			'Digits along lines connecting diamonds must not be between or equal to the diamond digits.',

		'Maximum':
			'Cells with outward-facing arrows must contain lower digits than their orthogonal neighbours.',

		'Minimum':		   
			'Cells with inward-facing arrows must contain lower digits than their orthogonal neighbours.',

		'Nonconsecutive':   
			'Orthogonally adjacent cells must not contain consecutive digits.',

		'Odd':		       
			'Cells with grey circles must contain odd digits.',

		'Palindrome':	       
			'Grey lines are palindromes and must read the same from either direction.',

		'Ratio':
			'Digits separated by a black dot must be in a 2:1 ratio. Not all possible dots are given.',

		'Ratio-':			   
			'Digits separated by a black dot must be in a 2:1 ratio. All possible dots are given.',

		'Renban':        
			'Cells along a purple line contain a set of consecutive, non-repeating digits in any order.',

		'Sandwich Sum':
			'External clues sum the cells between 1 and 9 in their row/column.',

		'Sum Dot (Border)':
			'A digit in an orange sum dot is the sum of all cells the dot touches.',

		'Sum Dot (Intersection)':
			'A digit in an orange sum dot is the sum of all cells the dot touches.',

		'Thermometer':	   
			'Digits on a thermometer must strictly increase as they move away from the bulb.',

		'Quadruple':		   
			'Digits in clues at cell intersections must appear in the surrounding 4 cells.',

		'Whispers':        
			'Adjacent digits along green lines must differ by at least 5.',

		'XV':		           
			'Cells separated by an X or V must sum to 10 or 5 respectively. Not all XV clues are given.',

		'XV-':
			'Cells separated by an X or V must sum to 10 or 5 respectively. All XV clues are given.',

	};


    			//-------------------------------------//
    			//                                     //
    			//          End of user edits.         //
    			//                                     //
    			//-------------------------------------//






(function() {
	'use strict';

	const doShim = function() {

		let infoBox = popups['editinfo'];
		let bullets = [ ' \u{2022} ', ' \u{25E6} ', ' \u{25FB} ', ' \u{25FE} ',' \u{25C8} ', ' \u{27A4} ',
					    ' \u{2740} ', ' \u{2716} ', ' \u{2605} ', ' \u{21E8} ', ' \u{2665} ' ];
		let bullet = bullets[0];
		let rulesFmts = { header: false, bullets: false, lineBreaks: false };
		let fmtBtnX = canvas.width/2 - infoBox.w/2 + buttonLH + 25;
		let fmtBtnY = canvas.height/2 + 235;
		let fmtBtns = { 'AddHeader': 'H',
						'AddLineBreaks': ' \u{2B0D} ',
						'AddBullets':  '\u{22EE} ',
						'ToggleBullets': ' \u{2022} '}

		for (let btn in fmtBtns) {
			buttons.push(new button(fmtBtnX, fmtBtnY, buttonLH, buttonLH, ['Edit Info'], btn, fmtBtns[btn]));
			fmtBtnX += buttonLH + 10;
		}

		let generateRuleset = function() {
			let autoRuleset = '';
			let ruleset = '';

			let head = (rulesFmts.bullets) ? bullet : '';
			head += (getCells().some(a => a.region !== (Math.floor(a.i / regionH) * regionH) + Math.floor(a.j / regionW))) ? 'Irregular ' : 'Normal ';
			head += 'sudoku rules apply.';
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
			confirmButton.x = canvas.width/2 + 150;
			confirmButton.y = fmtBtnY;

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
					if (rulesFmts.bullets) generateRuleset();
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

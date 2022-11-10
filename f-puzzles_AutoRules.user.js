// ==UserScript==
// @name		 Fpuzzles_Auto_Rules
// @namespace	 http://tampermonkey.net/
// @version		 1.0
// @description  Adds automatic rule generation to 'Edit Info' popup 
// @author		 Ennead
// @match		 https://*.f-puzzles.com/*
// @match		 https://f-puzzles.com/*
// @icon		 data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant		 none
// @run-at		 document-end
// ==/UserScript==


    //-------------------------------------------------------------------//
    //                                                                   //
    //                    User Editable Rules.                           //
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

		'AntiPalindrome':          
			'Digits equidistant from the marked centerpoint of red lines sum to 10.',

		'Arrow':	     	   
			'Digits along an arrow must sum to that arrow\'s circled digit.',

		'Between Line':	   
			'Digits on lines connecting circles must lie between the circled digits numerically.',

		'Clock':	     	   	
			'Adjacent digits on yellow lines differ by either 2 or 7.',

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

		let bullets = [ ' \u{2022} ', ' \u{25E6} ', ' \u{25FB} ', ' \u{25FE} ',' \u{25C8} ', ' \u{27A4} ',
					    ' \u{2740} ', ' \u{2716} ', ' \u{2605} ', ' \u{21E8} ', ' \u{2665} ' ];
		let bullet = bullets[0];
		let ruleFmts = { 'header': false, 'para': false, 'bullets': false, 'lineBreaks': false };
		let savedFmts = {};
		let fmtBtnX = canvas.width/2 - popups['editinfo'].w/2 + buttonLH + 25;
		let fmtBtnY = canvas.height/2 + 235;
		let fmtBtns = {	'AddHeader': 'H',
		                'Paragraph': 'P',
						'AddLineBreaks': ' \u{2B0D} ',
						'AddBullets':  '\u{22EE} ',
						'ToggleBullets': ' \u{2022} ',
						'Delete': ' \u{2327} '}

		for (let btn in fmtBtns) {
			buttons.push(new button(fmtBtnX, fmtBtnY, buttonLH, buttonLH, ['Edit Info'], btn, fmtBtns[btn]));
			fmtBtnX += buttonLH + 10;
		}

		let generateRuleset = function() {
			let autoRuleset = '';
			let ruleset = '';
			let irregular = (getCells().some(a => a.region !== (Math.floor(a.i / regionH) * regionH) 
							 + Math.floor(a.j / regionW)));

			if (Object.keys(savedFmts).length) ruleFmts = savedFmts; 

			let head = (ruleFmts['bullets']) ? bullet : '';
			head +=  (irregular) ? ' Irregular ' : ' Normal ';
			head += 'sudoku rules apply.';
			head += (ruleFmts['lineBreaks']) ? '\n\n' : '\n';

			for (let constraint in rules) {
				let c = constraints[cID(constraint)];

				if ((Array.isArray(c) && c.length) || c === true) {
					if (ruleFmts['bullets'] && !ruleFmts['para']) 
						autoRuleset += bullet;
					autoRuleset += ' ' + rules[constraint];
					if (!ruleFmts['para'])
						autoRuleset += (ruleFmts['lineBreaks']) ? '\n\n' : '\n';
				}
			}

			ruleset = (ruleFmts['header']) ? head : '';
			document.getElementById('ruleset').value = ruleset + autoRuleset;
		}

		let doFmtButton = function(btn, fmt) {
			if (Object.keys(savedFmts).length) ruleFmts = savedFmts; 
			ruleFmts[fmt] = (ruleFmts[fmt]) ? false : true;
			generateRuleset();
		}

		let prevSetPuzzleInfo = setPuzzleInfo;
		setPuzzleInfo = function() {
			savedFmts = ruleFmts;
			prevSetPuzzleInfo();
		}

		let prevTogglePopup = togglePopup;
		togglePopup = function(title) {

			const confirmButton = buttons.filter(b => b.id === 'ConfirmInfo')[0];
			confirmButton.x = canvas.width/2 + 175;
			confirmButton.y = fmtBtnY;
			confirmButton.w = 220;

			const headerButton = buttons[buttons.findIndex(a => a.id === 'AddHeader')];
			headerButton.click = function() { 
				if (headerButton.hovering()) {
					doFmtButton(headerButton, 'header')
				}
			}

			const paraButton = buttons[buttons.findIndex(a => a.id === 'Paragraph')];
			paraButton.click = function() { 
				if (paraButton.hovering()) {
					ruleFmts['bullets'] = false;
					doFmtButton(paraButton, 'para');
					paraButton.title = (ruleFmts['para']) ? 'L' : 'P';
				}
			}

			const bulletsButton = buttons[buttons.findIndex(a => a.id === 'AddBullets')];
			bulletsButton.click = function() { 
				if (bulletsButton.hovering()) {
					ruleFmts['para'] = false;
					paraButton.title = (ruleFmts['para']) ? 'L' : 'P';
					doFmtButton(bulletsButton, 'bullets')
				}
			}

			const lineBreaksButton = buttons[buttons.findIndex(a => a.id === 'AddLineBreaks')];
			lineBreaksButton.click = function() { 
				if (lineBreaksButton.hovering()) {
					doFmtButton(lineBreaksButton, 'lineBreaks')
				}
			}

			const toggleBulletsButton = buttons[buttons.findIndex(a => a.id === 'ToggleBullets')];
			toggleBulletsButton.click = function() { 
				let currB = bullets.indexOf(bullet);
				if (toggleBulletsButton.hovering()) {
					if (Object.keys(savedFmts).length) ruleFmts = savedFmts; 
					bullet = (currB === bullets.length - 1) ? bullets[0] : bullets[currB + 1];
					toggleBulletsButton.title = bullet;
					if (ruleFmts['bullets']) generateRuleset();
				}
			}

			const deleteButton = buttons[buttons.findIndex(a => a.id === 'Delete')];
			deleteButton.click = function() { 
				if (deleteButton.hovering()) {
					document.getElementById('ruleset').value = '';
					ruleFmts = { 'header': false, 'para': false, 'bullets': false, 'lineBreaks': false };
					savedFmts = {};
					customRuleset = '';
					paraButton.title = 'P';
				}
			}

			ruleFmts = { 'header': false, 'para': false, 'bullets': false, 'lineBreaks': false };
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

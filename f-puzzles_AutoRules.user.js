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
			"Cells that are a chess knight's move apart must not contain the same digit.",

		'Antiking':          
			"Cells that are a chess king's move apart must not contain the same digit.",

		'AntiPalindrome':          
			"Digits equidistant from the marked centerpoint of red lines sum to 10.",

		'Arrow':	     	   
			"Digits along an arrow must sum to that arrow's circled digit.",

		'Between Line':	   
			"Digits on lines connecting circles must lie between the circled digits numerically.",

		'Clock':	     	   	
			"Adjacent digits on yellow lines differ by either 2 or 7.",

		'Clone':	     	   	
			"Areas made up of grey cells containing circles are clones. Cloned areas must be identical.",

		'Diagonal +':        
			"Digits must not repeat on the positive diagonal.",

		'Diagonal -':        
			"Digits must not repeat on the negative diagonal.",

		'Difference':	
			"Digits separated by a white dot must be consecutive.",

		'Disjoint Groups':   
			"Cells in the same position relative to their 3x3 region must not contain the same digit.",

		'Even':			 
			"Cells with grey squares must contain even digits.",

		'Extra Region':	   
			"The connected grey cells are an extra region in which digits must not repeat.",

		'Killer Cage':	   
			"Digits in cages must not repeat and must sum to the small corner total, where given",

		'Little Killer Sum': 
			"Digits along an indicated diagonal must sum to the given total.",

		'Lockout': 
			"Digits along lines connecting diamonds must not be between or equal to the diamond digits.",

		'Maximum':
			"Cells with outward-facing arrows must contain lower digits than their orthogonal neighbours.",

		'Minimum':		   
			"Cells with inward-facing arrows must contain lower digits than their orthogonal neighbours.",

		'Nonconsecutive':   
			"Orthogonally adjacent cells must not contain consecutive digits.",

		'Odd':		       
			"Cells with grey circles must contain odd digits.",

		'Palindrome':	       
			"Grey lines are palindromes and must read the same from either direction.",

		'Ratio':
			"Digits separated by a black dot must be in a 2:1 ratio. Not all possible dots are given.",

		'Ratio-':			   
			"Digits separated by a black dot must be in a 2:1 ratio. All possible dots are given.",

		'Renban':        
			"Cells along a purple line contain a set of consecutive, non-repeating digits in any order.",

		'Sandwich Sum':
			"External clues sum the cells between 1 and 9 in their row/column.",

		'Sum Dot (Border)':
			"A digit in an orange sum dot is the sum of all cells the dot touches.",

		'Sum Dot (Intersection)':
			"A digit in an orange sum dot is the sum of all cells the dot touches.",

		'Thermometer':	   
			"Digits on a thermometer must strictly increase as they move away from the bulb.",

		'Quadruple':		   
			"Digits in clues at cell intersections must appear in the surrounding 4 cells.",

		'Whispers':        
			"Adjacent digits along green lines must differ by at least 5.",

		'XV':		           
			"Cells separated by an X or V must sum to 10 or 5 respectively. Not all XV clues are given.",

		'XV-':
			"Cells separated by an X or V must sum to 10 or 5 respectively. All XV clues are given.",

	};


    			//-------------------------------------//
    			//                                     //
    			//          End of user edits.         //
    			//                                     //
    			//-------------------------------------//






(function() {
	'use strict';

	const doShim = function() {

		let ruleFmts = { 'Header': false, 'Paragraph': false, 'Bullets': false, 'LnBreaks': false };
		let savedFmts = {};
		let Bullets = [ ' \u{2022} ', ' \u{25E6} ', ' \u{25FB} ', ' \u{25FE} ',' \u{25C8} ', ' \u{27A4} ',
					    ' \u{2740} ', ' \u{2716} ', ' \u{2605} ', ' \u{21E8} ', ' \u{2665} ' ];
		let bullet = Bullets[0];
		let fmtBtnX = canvas.width/2 - popups['editinfo'].w/2 + buttonLH + 25;
		let fmtBtnY = canvas.height/2 + 235;
		let fmtBtns = { 	'Header': ['H'],
		                    'Paragraph': ['P', 'L'],
							'LnBreaks': [' \u{2261} '],
							'Bullets':  ['\u{22EE} '],
							'ToggleBullets': Bullets,
							'Delete': [' \u{2327} ']}

		for (let btn in fmtBtns) {
			buttons.push(new button(fmtBtnX, fmtBtnY, buttonLH, buttonLH, ['Edit Info'], btn, fmtBtns[btn][0]));
			fmtBtnX += buttonLH + 10;
		}

		let generateRuleset = function() {
			let ruleset = [];

			for (let constraint in rules) {
				let c = constraints[cID(constraint)];
				if ((Array.isArray(c) && c.length) || c === true)
					ruleset.push(rules[constraint]);
			}

			return ruleset;
		}

		let formatRules = function(ruleset) {

			let fmtRulesArr = [];
			let head = (getCells().some(a => a.region !== (Math.floor(a.i / regionH) * regionH) 
						+ Math.floor(a.j / regionW))) ? 'Normal irregular ' : 'Normal ';
			head += 'sudoku rules apply.\n';
			if (ruleFmts['Header']) fmtRulesArr.push(head);

			if (ruleFmts['Paragraph']) fmtRulesArr.push(ruleset.join(' '));
			else fmtRulesArr = fmtRulesArr.concat(ruleset.map((rule) => { return rule += '\n'; }));

			if (ruleFmts['Bullets']) 
				fmtRulesArr = fmtRulesArr.map((rule) => { return bullet + rule; });

			if (ruleFmts['LnBreaks']) fmtRulesArr = fmtRulesArr.map((rule) => { return rule + '\n'; });

			return fmtRulesArr.join('');
		}

		let doFmtButton = function(btn, ruleset, fmt) {
			if (btn.hovering()) {
				let titles = fmtBtns[fmt] 
				let currTitle = titles.indexOf(btn.title);

				if (Object.keys(savedFmts).length) ruleFmts = savedFmts; 

				if (fmt) ruleFmts[fmt] = (ruleFmts[fmt]) ? false : true;

				if  (titles.length - 1) {
					btn.title = (currTitle === titles.length - 1) ? titles[0] : titles[currTitle + 1];
					if (fmt === 'ToggleBullets') bullet = btn.title;
				}

				document.getElementById('ruleset').value = formatRules(ruleset);
			}
		}

		let prevSetPuzzleInfo = setPuzzleInfo;
		setPuzzleInfo = function() {
			savedFmts = ruleFmts;
			prevSetPuzzleInfo();
		}

		let prevTogglePopup = togglePopup;
		togglePopup = function(title) {

			const ruleset = generateRuleset();

			const confirmButton = buttons.filter(b => b.id === 'ConfirmInfo')[0];
			confirmButton.x = canvas.width/2 + 175;
			confirmButton.y = fmtBtnY;
			confirmButton.w = 220;

			const headerButton = buttons[buttons.findIndex(a => a.id === 'Header')];
			headerButton.click = () => doFmtButton(headerButton, ruleset, 'Header');

			const paraButton = buttons[buttons.findIndex(a => a.id === 'Paragraph')];
			paraButton.click = () => doFmtButton(paraButton, ruleset, 'Paragraph');

			const bulletsButton = buttons[buttons.findIndex(a => a.id === 'Bullets')];
			bulletsButton.click = () => doFmtButton(bulletsButton, ruleset, 'Bullets');

			const lineBreaksButton = buttons[buttons.findIndex(a => a.id === 'LnBreaks')];
			lineBreaksButton.click = () => doFmtButton(lineBreaksButton, ruleset, 'LnBreaks');

			const toggleBulletsButton = buttons[buttons.findIndex(a => a.id === 'ToggleBullets')];
			toggleBulletsButton.click = () => doFmtButton(toggleBulletsButton, ruleset, 'ToggleBullets');

			const deleteButton = buttons[buttons.findIndex(a => a.id === 'Delete')];
			deleteButton.click = function() { 
				if (deleteButton.hovering()) {
					document.getElementById('ruleset').value = '';
					ruleFmts = { 'Header': false, 'Paragraph': false, 'Bullets': false, 'LnBreaks': false };
					savedFmts = {};
					customRuleset = '';
					paraButton.title = 'P';
				}
			}

			ruleFmts = { 'Header': false, 'Paragraph': false, 'Bullets': false, 'LnBreaks': false };
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

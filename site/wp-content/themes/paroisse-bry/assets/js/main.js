/**
 * Paroisse de Bry — comportements du site (sans dépendance).
 * Tout fonctionne aussi sans JavaScript : ces scripts n'ajoutent que du confort.
 */
( function () {
	'use strict';

	var doc = document;

	/* Menu mobile ---------------------------------------------------------- */
	var bouton = doc.querySelector( '[data-pb-menu]' );
	var nav = doc.getElementById( 'pb-navigation' );
	if ( bouton && nav ) {
		var fermer = function ( rendreFocus ) {
			nav.classList.remove( 'is-open' );
			bouton.setAttribute( 'aria-expanded', 'false' );
			if ( rendreFocus ) {
				bouton.focus();
			}
		};
		bouton.addEventListener( 'click', function () {
			var ouvert = bouton.getAttribute( 'aria-expanded' ) === 'true';
			if ( ouvert ) {
				fermer( false );
			} else {
				nav.classList.add( 'is-open' );
				bouton.setAttribute( 'aria-expanded', 'true' );
				var premier = nav.querySelector( 'a' );
				if ( premier ) {
					premier.focus();
				}
			}
		} );
		doc.addEventListener( 'keydown', function ( e ) {
			if ( e.key === 'Escape' && nav.classList.contains( 'is-open' ) ) {
				fermer( true );
			}
		} );
		var mq = window.matchMedia( '(min-width: 1100px)' );
		var surChangement = function () {
			if ( mq.matches ) {
				fermer( false );
			}
		};
		if ( mq.addEventListener ) {
			mq.addEventListener( 'change', surChangement );
		}
	}

	/* Carte OpenStreetMap : chargée seulement après un clic ------------------ */
	doc.addEventListener( 'click', function ( e ) {
		var declencheur = e.target.closest ? e.target.closest( '[data-pb-carte-afficher]' ) : null;
		if ( ! declencheur ) {
			return;
		}
		var carte = declencheur.closest( '[data-pb-carte]' );
		if ( ! carte || carte.classList.contains( 'is-chargee' ) ) {
			return;
		}
		var iframe = doc.createElement( 'iframe' );
		iframe.src = carte.getAttribute( 'data-pb-carte' );
		iframe.title = 'Carte OpenStreetMap : église et relais paroissial';
		iframe.loading = 'lazy';
		iframe.referrerPolicy = 'no-referrer';
		carte.appendChild( iframe );
		carte.classList.add( 'is-chargee' );
		iframe.setAttribute( 'tabindex', '0' );
		iframe.focus();
	} );

	/* Diorama : bascule « jour » / « nuit » --------------------------------- */
	doc.querySelectorAll( '.pb-diorama-bascule' ).forEach( function ( bloc ) {
		var jour = bloc.querySelector( ':scope > .pb-diorama-jour' );
		var nuit = bloc.querySelector( ':scope > .pb-diorama-nuit' );
		if ( ! jour || ! nuit ) {
			return;
		}
		var barre = doc.createElement( 'div' );
		barre.className = 'pb-bascule';
		barre.setAttribute( 'role', 'group' );
		barre.setAttribute( 'aria-label', 'Aspect du Diorama' );
		[ [ 'jour', 'Jour', '☀' ], [ 'nuit', 'Nuit', '☾' ] ].forEach( function ( def ) {
			var b = doc.createElement( 'button' );
			b.type = 'button';
			b.innerHTML = '<span aria-hidden="true">' + def[ 2 ] + '</span> ' + def[ 1 ];
			b.setAttribute( 'aria-pressed', def[ 0 ] === 'jour' ? 'true' : 'false' );
			b.addEventListener( 'click', function () {
				bloc.classList.toggle( 'is-nuit', def[ 0 ] === 'nuit' );
				barre.querySelectorAll( 'button' ).forEach( function ( autre ) {
					autre.setAttribute( 'aria-pressed', autre === b ? 'true' : 'false' );
				} );
			} );
			barre.appendChild( b );
		} );
		bloc.parentNode.insertBefore( barre, bloc );
		bloc.classList.add( 'is-pret' );
		bloc.setAttribute( 'aria-live', 'polite' );
	} );

	/* Tableaux d'horaires : libellés de colonnes pour l'affichage mobile ------ */
	doc.querySelectorAll( '.is-style-pb-horaires' ).forEach( function ( figure ) {
		var table = figure.querySelector( 'table' );
		if ( ! table || ! table.tHead ) {
			return;
		}
		var entetes = Array.prototype.map.call( table.tHead.rows[ 0 ].cells, function ( th ) {
			return th.textContent.trim();
		} );
		Array.prototype.forEach.call( table.tBodies, function ( tbody ) {
			Array.prototype.forEach.call( tbody.rows, function ( tr ) {
				Array.prototype.forEach.call( tr.cells, function ( td, i ) {
					if ( entetes[ i ] ) {
						td.setAttribute( 'data-label', entetes[ i ] );
					}
					var texte = td.textContent.trim();
					if ( texte === '—' || texte === '-' || texte === '' ) {
						td.classList.add( 'is-vide' );
					}
				} );
			} );
		} );
		figure.classList.add( 'is-empile' );
	} );

	/* Fiches dépliables : ouverture depuis un lien (#bapteme…) --------------- */
	var ouvrirDepuisAncre = function () {
		if ( ! location.hash || location.hash.length < 2 ) {
			return;
		}
		var cible;
		try {
			cible = doc.getElementById( decodeURIComponent( location.hash.slice( 1 ) ) );
		} catch ( err ) {
			return;
		}
		if ( cible && cible.tagName === 'DETAILS' ) {
			cible.open = true;
			var resume = cible.querySelector( 'summary' );
			window.requestAnimationFrame( function () {
				cible.scrollIntoView( { block: 'start' } );
				if ( resume ) {
					resume.focus( { preventScroll: true } );
				}
			} );
		}
	};
	ouvrirDepuisAncre();
	window.addEventListener( 'hashchange', ouvrirDepuisAncre );
}() );

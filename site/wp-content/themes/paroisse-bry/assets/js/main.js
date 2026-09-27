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

	/* Vidéo YouTube : chargée seulement après un clic ------------------------ */
	doc.addEventListener( 'click', function ( e ) {
		var declencheur = e.target.closest ? e.target.closest( '[data-pb-video-lancer]' ) : null;
		if ( ! declencheur ) {
			return;
		}
		var video = declencheur.closest( '[data-pb-video]' );
		if ( ! video || video.classList.contains( 'is-chargee' ) ) {
			return;
		}
		var iframe = doc.createElement( 'iframe' );
		iframe.src = video.getAttribute( 'data-pb-video' );
		iframe.title = video.getAttribute( 'data-pb-video-titre' ) || 'Vidéo';
		iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
		iframe.allowFullscreen = true;
		iframe.referrerPolicy = 'strict-origin-when-cross-origin';
		video.querySelector( '.pb-video__cadre' ).appendChild( iframe );
		video.classList.add( 'is-chargee' );
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

	/* Carrousel « À la une » --------------------------------------------------- */
	doc.querySelectorAll( '[data-pb-carrousel]' ).forEach( function ( car ) {
		var diapos = Array.prototype.slice.call( car.querySelectorAll( '.pb-diapo' ) );
		var commandes = car.querySelector( '.pb-carrousel__commandes' );
		if ( diapos.length < 2 || ! commandes ) {
			return;
		}
		var points = Array.prototype.slice.call( car.querySelectorAll( '[data-pb-aller]' ) );
		var piste = car.querySelector( '.pb-carrousel__piste' );
		var boutonPause = car.querySelector( '[data-pb-pause]' );
		var duree = parseInt( car.getAttribute( 'data-duree' ), 10 ) || 6500;
		var reduit = window.matchMedia && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
		var actuel = 0;
		var minuteur = null;
		var enPause = reduit; // Pas de défilement automatique si le visiteur l'a demandé.
		var survol = false;

		car.style.setProperty( '--pb-duree', duree + 'ms' );
		commandes.hidden = false;
		car.classList.add( 'is-pret' );

		var majAccessibilite = function () {
			diapos.forEach( function ( d, i ) {
				var actif = i === actuel;
				d.classList.toggle( 'is-active', actif );
				d.setAttribute( 'aria-hidden', actif ? 'false' : 'true' );
				d.querySelectorAll( 'a' ).forEach( function ( a ) {
					if ( actif ) {
						a.removeAttribute( 'tabindex' );
					} else {
						a.setAttribute( 'tabindex', '-1' );
					}
				} );
			} );
			points.forEach( function ( p, i ) {
				p.classList.toggle( 'is-active', i === actuel );
				if ( i === actuel ) {
					p.setAttribute( 'aria-current', 'true' );
				} else {
					p.removeAttribute( 'aria-current' );
				}
			} );
		};

		var relancerJauge = function () {
			var jauge = points[ actuel ] && points[ actuel ].querySelector( '.pb-carrousel__jauge' );
			if ( jauge ) {
				jauge.style.animation = 'none';
				void jauge.offsetWidth; // Redémarre l'animation CSS.
				jauge.style.animation = '';
			}
		};

		var arreter = function () {
			window.clearTimeout( minuteur );
			minuteur = null;
		};

		var programmer = function () {
			arreter();
			if ( enPause || survol || doc.hidden ) {
				return;
			}
			minuteur = window.setTimeout( function () {
				aller( actuel + 1, false );
			}, duree );
		};

		var aller = function ( i, parUtilisateur ) {
			actuel = ( i + diapos.length ) % diapos.length;
			majAccessibilite();
			relancerJauge();
			piste.setAttribute( 'aria-live', parUtilisateur || enPause ? 'polite' : 'off' );
			programmer();
		};

		var basculerPause = function ( valeur ) {
			enPause = typeof valeur === 'boolean' ? valeur : ! enPause;
			car.classList.toggle( 'is-en-pause', enPause );
			boutonPause.setAttribute( 'aria-pressed', enPause ? 'true' : 'false' );
			boutonPause.querySelector( '.screen-reader-text' ).textContent = enPause ? 'Relancer le défilement' : 'Mettre en pause le défilement';
			piste.setAttribute( 'aria-live', enPause ? 'polite' : 'off' );
			relancerJauge();
			programmer();
		};

		car.querySelector( '[data-pb-precedent]' ).addEventListener( 'click', function () {
			aller( actuel - 1, true );
		} );
		car.querySelector( '[data-pb-suivant]' ).addEventListener( 'click', function () {
			aller( actuel + 1, true );
		} );
		points.forEach( function ( p ) {
			p.addEventListener( 'click', function () {
				aller( parseInt( p.getAttribute( 'data-pb-aller' ), 10 ), true );
			} );
		} );
		boutonPause.addEventListener( 'click', function () {
			basculerPause();
		} );

		// Pause pendant le survol et quand le clavier est dans le carrousel.
		car.addEventListener( 'mouseenter', function () {
			survol = true;
			car.classList.add( 'is-survole' );
			arreter();
		} );
		car.addEventListener( 'mouseleave', function () {
			survol = false;
			car.classList.remove( 'is-survole' );
			relancerJauge();
			programmer();
		} );
		car.addEventListener( 'focusin', function () {
			survol = true;
			car.classList.add( 'is-survole' );
			arreter();
		} );
		car.addEventListener( 'focusout', function ( e ) {
			if ( ! car.contains( e.relatedTarget ) ) {
				survol = false;
				car.classList.remove( 'is-survole' );
				relancerJauge();
				programmer();
			}
		} );
		car.addEventListener( 'keydown', function ( e ) {
			if ( e.key === 'ArrowRight' ) {
				e.preventDefault();
				aller( actuel + 1, true );
			} else if ( e.key === 'ArrowLeft' ) {
				e.preventDefault();
				aller( actuel - 1, true );
			}
		} );

		// Glisser du doigt (ou de la souris) pour changer d'actualité.
		var departX = null;
		var departY = null;
		var glisse = false;
		piste.addEventListener( 'pointerdown', function ( e ) {
			departX = e.clientX;
			departY = e.clientY;
			glisse = false;
		} );
		piste.addEventListener( 'pointerup', function ( e ) {
			if ( departX === null ) {
				return;
			}
			var dx = e.clientX - departX;
			var dy = e.clientY - departY;
			if ( Math.abs( dx ) > 45 && Math.abs( dx ) > Math.abs( dy ) ) {
				glisse = true;
				aller( dx < 0 ? actuel + 1 : actuel - 1, true );
			}
			departX = null;
		} );
		// Un glissement ne doit pas ouvrir l'article.
		piste.addEventListener( 'click', function ( e ) {
			if ( glisse ) {
				e.preventDefault();
				glisse = false;
			}
		}, true );
		piste.addEventListener( 'dragstart', function ( e ) {
			e.preventDefault();
		} );

		doc.addEventListener( 'visibilitychange', function () {
			if ( doc.hidden ) {
				arreter();
			} else {
				relancerJauge();
				programmer();
			}
		} );

		basculerPause( enPause );
		aller( 0, false );
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

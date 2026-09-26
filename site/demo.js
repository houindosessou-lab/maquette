/* Démonstration statique : le formulaire et la recherche nécessitent WordPress. */
( function () {
	'use strict';
	var p = new URLSearchParams( location.search );
	var objet = p.get( 'objet' );
	var select = document.getElementById( 'pb_objet' );
	if ( objet && select ) {
		Array.prototype.forEach.call( select.options, function ( o ) { if ( o.text === objet ) { o.selected = true; } } );
	}
	var avertir = function ( e, cible, texte ) {
		e.preventDefault();
		var ancien = cible.querySelector( '.pb-demo-note' );
		if ( ancien ) { ancien.remove(); }
		var n = document.createElement( 'p' );
		n.className = 'pb-demo-note';
		n.setAttribute( 'role', 'status' );
		n.textContent = texte;
		n.style.cssText = 'margin:0 0 1rem;padding:.8rem 1rem;border-radius:6px;background:#F4EAD3;color:#6E4A12;font-weight:600;font-size:.9375rem;';
		cible.insertBefore( n, cible.firstChild );
	};
	document.querySelectorAll( '.pb-form form' ).forEach( function ( f ) {
		f.addEventListener( 'submit', function ( e ) {
			avertir( e, f, 'Démonstration : le formulaire est désactivé ici. Sur le site en ligne, le message arrivera directement au secrétariat (info@paroisse-bry.fr).' );
		} );
	} );
	document.querySelectorAll( 'form.pb-recherche' ).forEach( function ( f ) {
		f.addEventListener( 'submit', function ( e ) {
			avertir( e, f.parentNode, 'Démonstration : la recherche fonctionnera sur le site en ligne.' );
		} );
	} );
}() );
